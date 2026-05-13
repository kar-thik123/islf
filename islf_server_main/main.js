// Load environment variables first, before any other imports
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { authenticateToken } = require('./middleware/auth');
// Enhanced audit logging with field-level change tracking
const enhancedAuditLogMiddleware = require('./middleware/enhancedAuditLogMiddleware');
// Phase A — RBAC Observation Mode (logs would-deny outcomes, never blocks)
const rbacObserver = require('./middleware/rbacObserver');
// Phase C — RBAC Enforcer (returns 403 on denied actions, applied per route)
const { requirePermission } = require('./middleware/rbacEnforcer');
// Phase G — Ownership Guard (record-level access control on top of RBAC)
const { requireOwnership } = require('./middleware/ownershipGuard');
// Phase I — Ownership Stamper (auto-sets created_by/updated_by on mutating requests)
const ownershipStamper = require('./middleware/ownershipStamper');
// Phase J — Token Revocation (SHA-256 blacklist for revoked JWTs)
const { ensureRevokedTokensTable } = require('./utils/tokenRevocation');
// Phase M2 — Context Guard (restricts CRUD based on assigned context)
const { requireContext } = require('./middleware/contextGuard');

const app = express();
const PORT = process.env.PORT || 3001;

// Phase F — Restricted CORS (D13 closure).
// Allowed origins: comma-separated list in CORS_ORIGIN env var.
// Falls back to localhost:4200 for local development.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4200')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no Origin header (server-to-server, Postman, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        console.warn(`[CORS] Blocked request from origin: ${origin}`);
        return callback(new Error(`CORS policy: origin '${origin}' is not allowed`), false);
    },
    credentials: true,
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Debug middleware to log all requests (must be above auth for troubleshooting)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Apply authentication middleware to all routes after body parsers
app.use(authenticateToken);

// Apply enhanced audit logging middleware after authentication
// This captures field-level changes and generates business-friendly summaries
app.use(enhancedAuditLogMiddleware);

// Phase A — RBAC Observation: runs after auth + audit, NEVER blocks requests.
// Remove the next line to instantly disable the observer (rollback).
app.use(rbacObserver);

// Phase I — Ownership Stamper: auto-stamps created_by/updated_by on all mutating requests.
// POST → sets created_by + updated_by = req.user.username
// PUT/PATCH → strips created_by (immutability), sets updated_by = req.user.username
// Rollback: remove this line. No data change required.
app.use(ownershipStamper);

//  auth and password    routers

const authRouter = require('./routes/auth');
const publicRouter = require('./routes/public');
const passwordRouter = require('./routes/password');

app.use('/api/auth', authRouter);
app.use('/api/public', publicRouter);
app.use('/api/password', passwordRouter);

// logs routes — Phase C enforced (Batch 1)
// Rollback: remove requirePermission(...) argument from each app.use() call below.
const logsRouter = require('./routes/logs');
app.use('/api/logs',       requirePermission('Logs', 'System Logs'), logsRouter);

// Enhanced audit logs routes — Phase C enforced (Batch 1)
const auditLogsRouter = require('./routes/audit_logs');
app.use('/api/audit_logs', requirePermission('Logs', 'Auth Logs'),   auditLogsRouter);

// --- Settings sub-modules — Phase E enforced ---
const numberSeriesRouter = require('./routes/number_series');
app.use('/api/number_series',   requirePermission('Settings', 'No. Series'),          numberSeriesRouter);
const numberRelationRouter = require('./routes/number_relation');
app.use('/api/number_relation', requirePermission('Settings', 'No. Series Relation'), numberRelationRouter);
const departmentRouter = require('./routes/department');
app.use('/api/department', requirePermission([
  { module: 'Settings', subModule: 'Company Mgmt' },
  { module: 'Operations', subModule: 'Enquiry', action: 'read' },
  { module: 'Operations', subModule: 'Booking', action: 'read' },
  { module: 'Setup', subModule: 'User Mgmt', action: 'read' }
]), departmentRouter);

const serviceTypesRouter = require('./routes/service_types');
app.use('/api/service_types', requirePermission([
  { module: 'Settings', subModule: 'Company Mgmt' },
  { module: 'Operations', subModule: 'Enquiry', action: 'read' },
  { module: 'Operations', subModule: 'Booking', action: 'read' }
]), serviceTypesRouter);

const companyRouter = require('./routes/company');
app.use('/api/company', requirePermission([
  { module: 'Settings', subModule: 'Company Mgmt' },
  { module: 'Setup', subModule: 'User Mgmt', action: 'read' },
  { module: 'Operations', subModule: 'Enquiry', action: 'read' },
  { module: 'Operations', subModule: 'Booking', action: 'read' }
]), companyRouter);

const branchRouter = require('./routes/branch');
app.use('/api/branch', requirePermission([
  { module: 'Settings', subModule: 'Company Mgmt' },
  { module: 'Setup', subModule: 'User Mgmt', action: 'read' },
  { module: 'Operations', subModule: 'Enquiry', action: 'read' },
  { module: 'Operations', subModule: 'Booking', action: 'read' }
]), branchRouter);

const settingsRouter = require('./routes/settings');
// Phase C enforced (Batch 1) — only admin may read or write IT Setup configuration.
app.use('/api/settings', requirePermission([
  { module: 'Settings', subModule: 'IT Setup' },
  { module: 'Settings', subModule: 'Carriage Direction', action: 'read' },
  { module: 'Operations', subModule: 'Enquiry', action: 'read' },
  { module: 'Operations', subModule: 'Booking', action: 'read' }
]), settingsRouter);
const { userRouter, selfProfileRouter } = require('./routes/user');

// Phase N2: Allow self-profile access before applying strict RBAC/Ownership
app.use('/api/user/me', selfProfileRouter);

// Phase D: RBAC — only Settings/User Mgmt role may access user routes.
// Phase G: Ownership — non-admin users may only read/edit their own profile (self-only mode).
// Rollback Phase G: remove the requireOwnership(...) argument below.
app.use('/api/user',
  requirePermission('Settings', 'User Mgmt'),
  requireOwnership({ selfOnly: true, adminBypass: true }),
  userRouter
);

const authorizationRouter = require('./routes/authorization');
// Phase C enforced (Batch 1) — only admin may read or write role permissions.
app.use('/api/authorization',  requirePermission('Settings', 'Authorization'),  authorizationRouter);


//masters routes

// --- Masters: Master Types module — Phase D enforced (Batch 2) ---
const masterCodeRouter = require('./routes/master_code');
app.use('/api/master_code', requirePermission([
  { module: 'Master Types', subModule: 'User Status' },
  { module: 'Operations', subModule: 'Enquiry', action: 'read' },
  { module: 'Setup', subModule: 'User Mgmt', action: 'read' },
  { module: 'Settings', subModule: 'Company Mgmt', action: 'read' }
]),  masterCodeRouter);

const masterTypeRouter = require('./routes/master_type');
app.use('/api/master_type', requirePermission([
  { module: 'Master Types', subModule: 'User Status' },
  { module: 'Operations', subModule: 'Enquiry', action: 'read' },
  { module: 'Setup', subModule: 'User Mgmt', action: 'read' },
  { module: 'Settings', subModule: 'Company Mgmt', action: 'read' }
]),  masterTypeRouter);

// --- Masters module — Phase D enforced (Batch 2) ---
const masterLocationRouter = require('./routes/master_location');
app.use('/api/master_location', requirePermission([
  { module: 'Masters', subModule: 'Location' },
  { module: 'Operations', subModule: 'Enquiry', action: 'read' },
  { module: 'Operations', subModule: 'Booking', action: 'read' },
  { module: 'Masters', subModule: 'Local Tariff', action: 'read' }
]),       masterLocationRouter);

const masterUOMRoutes = require('./routes/master_uom');
app.use('/api/master_uom',      requirePermission('Masters', 'Unit of Measure'), masterUOMRoutes);

const masteItemRouter = require('./routes/master_item');
app.use('/api/master_item',     requirePermission('Masters', 'Master Item'),     masteItemRouter);

const masterVesselRouter = require('./routes/master_vessel');
app.use('/api/master_vessel',   requirePermission('Masters', 'Vessel'),          masterVesselRouter);

const masterAirlineRouter = require('./routes/master_airline');
app.use('/api/master_airline',  requirePermission('Masters', 'Airline'),         masterAirlineRouter);

const mappingRouter = require('./routes/mapping');
app.use('/api/mapping', requirePermission([
  { module: 'Settings', subModule: 'No. Series Mapping' },
  { module: 'Operations', subModule: 'Enquiry', action: 'read' },
  { module: 'Operations', subModule: 'Booking', action: 'read' },
  { module: 'Setup', subModule: 'User Mgmt', action: 'read' }
]), mappingRouter);

// Add customer route
// Phase H Batch 2: Ownership — only creator or admin may mutate a customer record.
// Rollback: remove requireOwnership(...) line.
const customerRouter = require('./routes/customer');
app.use('/api/customer',
  requirePermission([
    { module: 'Masters', subModule: 'Customer' },
    { module: 'Operations', subModule: 'Enquiry', action: 'read' },
    { module: 'Operations', subModule: 'Booking', action: 'read' }
  ]),
  requireContext(),
  requireOwnership({ table: 'customer', ownerField: 'created_by', ownerType: 'username', adminBypass: true }),
  customerRouter
);

// Add entity documents route (linked to Customer master)
try {
  const entityDocumentsRouter = require('./routes/entity_documents');
  app.use('/api/entity_documents', requirePermission([
    { module: 'Masters', subModule: 'Customer' },
    { module: 'Operations', subModule: 'Enquiry', action: 'read' },
    { module: 'Operations', subModule: 'Booking', action: 'read' }
  ]),    entityDocumentsRouter);
  console.log('Entity documents route registered successfully');
} catch (error) {
  console.error('Error loading entity documents route:', error);
}

// Phase H Batch 2: Ownership on vendor.
const vendorRouter = require('./routes/vendor');
app.use('/api/vendor',
  requirePermission([
    { module: 'Masters', subModule: 'Vendor' },
    { module: 'Operations', subModule: 'Enquiry', action: 'read' },
    { module: 'Operations', subModule: 'Booking', action: 'read' },
    { module: 'Masters', subModule: 'Local Tariff', action: 'read' }
  ]),
  requireContext(),
  requireOwnership({ table: 'vendor', ownerField: 'created_by', ownerType: 'username', adminBypass: true }),
  vendorRouter
);

const currencyCodeRouter = require('./routes/currency_code');
app.use('/api/currency_code',   requirePermission('Masters', 'Currency Code'),   currencyCodeRouter);

const containerCodeRouter = require('./routes/container_code');
app.use('/api/container_code',  requirePermission('Masters', 'Container'),       containerCodeRouter);

const basisRouter = require('./routes/basis');
app.use('/api/basis',           requirePermission('Masters', 'Basis'),           basisRouter);

const gstSetupRouter = require('./routes/gst_setup');
app.use('/api/gst_setup',       requirePermission('Masters', 'GST Setup'),       gstSetupRouter);

const tariffRouter = require('./routes/tariff');
app.use('/api/tariff',          requirePermission('Masters', 'Local Tariff'),    tariffRouter);

const sourceRouter = require('./routes/source');
app.use('/api/source',          requirePermission('Masters', 'Sourcing'),        sourceRouter);

// Phase H Batch 2: Ownership on service_area.
const serviceAreaRouter = require('./routes/service_area');
app.use('/api/service_area',
  requirePermission('Masters', 'Service Area'),
  requireContext(),
  requireOwnership({ table: 'master_service_area', ownerField: 'created_by', ownerType: 'username', adminBypass: true }),
  serviceAreaRouter
);

// Phase H Batch 2: Ownership on source_sales.
const sourceSalesRouter = require('./routes/source_sales');
app.use('/api/source_sales',
  requirePermission('Masters', 'Source Sales'),
  requireContext(),
  requireOwnership({ table: 'master_source_sales', ownerField: 'created_by', ownerType: 'username', adminBypass: true }),
  sourceSalesRouter
);

// Add account details route (linked to Customer master)
// Phase G: Ownership — only the creator (or admin) may view/edit an account_details record.
// Rollback Phase G: remove requireOwnership(...) argument below.
const accountDetailsRoutes = require('./routes/account_details');
app.use('/api/account_details',
  requirePermission('Masters', 'Customer'),
  requireOwnership({ table: 'account_details', idParam: 'id', ownerField: 'created_by', ownerType: 'username', adminBypass: true }),
  accountDetailsRoutes
);

// --- Operations module — Phase D enforced + Phase H ownership ---
// Batch 1: Enquiry and Booking now require created_by ownership.
// Rollback: remove requireOwnership(...) line from each app.use() call.
const enquiryRouter = require('./routes/enquiry');
app.use('/api/enquiry',
  requirePermission('Operations', 'Enquiry'),
  requireContext(),
  requireOwnership({ table: 'enquiry', ownerField: 'created_by', ownerType: 'username', adminBypass: true }),
  enquiryRouter
);
const bookingRouter = require('./routes/booking');
app.use('/api/booking',
  requirePermission('Operations', 'Booking'),
  requireContext(),
  requireOwnership({ table: 'booking', ownerField: 'created_by', ownerType: 'username', adminBypass: true }),
  bookingRouter
);

const inchargeRouter = require('./routes/incharge');
app.use('/api/incharge',        requirePermission('Masters', 'Customer'),        inchargeRouter);

// DB connection check + Phase J table initialization
const pool = require('./db');
pool.connect()
  .then(client => {
    return client.query('SELECT NOW()')
      .then(res => {
        console.log('Database connected:', res.rows[0].now);
        client.release();
        // Phase J: create revoked_tokens table + index if not present
        return ensureRevokedTokensTable(pool);
      })
      .catch(err => {
        client.release();
        console.error('Database connection error:', err.stack);
      });
  })
  .catch(err => {
    console.error('Database connection error:', err.stack);
  });

// Express 5 defensive startup: app.listen() wraps the callback with once(),
// so EADDRINUSE calls the callback with err instead of throwing.
// We must check for the error argument explicitly.
const server = app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error(`[FATAL] Failed to bind port ${PORT}:`, err.message || err);
    process.exit(1);
  }
  console.log(`Server running on port ${PORT}`);
});
server.on('error', (err) => {
  console.error(`[FATAL] Server error:`, err.message || err);
  process.exit(1);
});
console.log(`Server accessible via Hamachi at: http://25.5.93.125:${PORT}`);
