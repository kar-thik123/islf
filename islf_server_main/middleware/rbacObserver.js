/**
 * RBAC OBSERVER MIDDLEWARE — Phase A (Observation Mode)
 *
 * PURPOSE
 * -------
 * Logs what RBAC enforcement WOULD do for every authenticated request,
 * without blocking anything. Used to validate that the permission table
 * is complete and correct before Phase C enforcement is enabled.
 *
 * GUARANTEES
 * ----------
 * - NEVER returns 403 or any error response
 * - NEVER modifies req, res, or the JWT
 * - NEVER touches any existing route handler
 * - ALWAYS calls next() immediately — DB write is fire-and-forget
 * - NEVER crashes the request on its own errors
 * - NEVER logs passwords, tokens, or secrets
 *
 * PERFORMANCE
 * -----------
 * - next() is called synchronously before any async DB work begins
 * - Uses the shared connection pool (no new connections opened)
 * - All DB writes are non-blocking (fire-and-forget via setImmediate)
 *
 * ROLLBACK
 * --------
 * Remove the two lines added to main.js:
 *   const rbacObserver = require('./middleware/rbacObserver');
 *   app.use(rbacObserver);
 * Restart the server. This file can be left in place safely.
 */

'use strict';

const pool = require('../db');

// ---------------------------------------------------------------------------
// Route → (module_name, sub_module_name) mapping
// Derived from seed_admin.js module definitions and main.js route registrations.
// module_name and sub_module_name match the values in role_module_permissions.
// ---------------------------------------------------------------------------
const ROUTE_MAP = {
  // Settings module
  '/api/user':              { module: 'Settings',      sub: 'User Mgmt' },
  '/api/authorization':     { module: 'Settings',      sub: 'Authorization' },
  '/api/settings':          { module: 'Settings',      sub: 'IT Setup' },
  '/api/company':           { module: 'Settings',      sub: 'Company Mgmt' },
  '/api/branch':            { module: 'Settings',      sub: 'Company Mgmt' },
  '/api/department':        { module: 'Settings',      sub: 'Company Mgmt' },
  '/api/number_series':     { module: 'Settings',      sub: 'No. Series' },
  '/api/number_relation':   { module: 'Settings',      sub: 'No. Series Relation' },
  '/api/mapping':           { module: 'Settings',      sub: 'No. Series Mapping' },
  '/api/service_types':     { module: 'Settings',      sub: 'Company Mgmt' },

  // Logs module
  '/api/logs':              { module: 'Logs',          sub: 'System Logs' },
  '/api/audit_logs':        { module: 'Logs',          sub: 'Auth Logs' },

  // Masters module
  '/api/customer':          { module: 'Masters',       sub: 'Customer' },
  '/api/vendor':            { module: 'Masters',       sub: 'Vendor' },
  '/api/master_location':   { module: 'Masters',       sub: 'Location' },
  '/api/master_vessel':     { module: 'Masters',       sub: 'Vessel' },
  '/api/master_airline':    { module: 'Masters',       sub: 'Airline' },
  '/api/master_uom':        { module: 'Masters',       sub: 'Unit of Measure' },
  '/api/master_item':       { module: 'Masters',       sub: 'Master Item' },
  '/api/basis':             { module: 'Masters',       sub: 'Basis' },
  '/api/currency_code':     { module: 'Masters',       sub: 'Currency Code' },
  '/api/container_code':    { module: 'Masters',       sub: 'Container' },
  '/api/gst_setup':         { module: 'Masters',       sub: 'GST Setup' },
  '/api/tariff':            { module: 'Masters',       sub: 'Local Tariff' },
  '/api/source':            { module: 'Masters',       sub: 'Sourcing' },
  '/api/service_area':      { module: 'Masters',       sub: 'Service Area' },
  '/api/source_sales':      { module: 'Masters',       sub: 'Source Sales' },
  '/api/account_details':   { module: 'Masters',       sub: 'Customer' },
  '/api/entity_documents':  { module: 'Masters',       sub: 'Customer' },
  '/api/incharge':          { module: 'Masters',       sub: 'Customer' },

  // Master Types module
  '/api/master_code':       { module: 'Master Types',  sub: 'User Status' },
  '/api/master_type':       { module: 'Master Types',  sub: 'User Status' },

  // Operations module
  '/api/enquiry':           { module: 'Operations',    sub: 'Enquiry' },
  '/api/booking':           { module: 'Operations',    sub: 'Booking' },
};

// Public endpoints — never reached authenticated (whitelisted in authenticateToken)
// Listed here only for documentation; the middleware skips unauthenticated requests.
const PUBLIC_PREFIXES = new Set([
  '/api/auth',
  '/api/password',
  '/api/public',
]);

// ---------------------------------------------------------------------------
// HTTP method → RBAC action type mapping
// ---------------------------------------------------------------------------
function resolveActionType(method) {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'READ';
    case 'POST':
    case 'PUT':
    case 'PATCH':
      return 'WRITE';
    case 'DELETE':
      return 'DELETE';
    default:
      return 'UNKNOWN';
  }
}

// ---------------------------------------------------------------------------
// Derive module/sub from the request base URL
// ---------------------------------------------------------------------------
function resolveModuleInfo(req) {
  // req.baseUrl is set by Express when using app.use('/api/xxx', router)
  // e.g.  req.baseUrl = '/api/customer'
  const base = (req.baseUrl || '').split('?')[0].toLowerCase();

  if (ROUTE_MAP[base]) {
    return ROUTE_MAP[base];
  }

  // Try prefix match for deeply nested routes
  for (const prefix of Object.keys(ROUTE_MAP)) {
    if (base.startsWith(prefix)) {
      return ROUTE_MAP[prefix];
    }
  }

  return { module: 'UNKNOWN_MODULE', sub: 'UNKNOWN_MODULE' };
}

// ---------------------------------------------------------------------------
// Resolve user role — from token first, DB fallback if not in token
// This handles both old tokens (no role field) and future tokens (with role).
// ---------------------------------------------------------------------------
async function resolveUserRole(req) {
  // Future-proof: if role is embedded in the JWT, use it directly
  if (req.user && req.user.role) {
    return req.user.role;
  }

  // Fallback: query the users table by userId from the JWT
  if (req.user && req.user.userId) {
    try {
      const result = await pool.query(
        'SELECT role FROM users WHERE id = $1 LIMIT 1',
        [req.user.userId]
      );
      return result.rows[0]?.role || null;
    } catch {
      return null;
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Check role_module_permissions for this role + module + action
// Returns { permission_exists, would_deny }
// ---------------------------------------------------------------------------
async function checkPermission(role, moduleName, subModuleName, actionType) {
  if (!role || moduleName === 'UNKNOWN_MODULE') {
    // Cannot evaluate — no role or unknown module
    return { permission_exists: false, would_deny: true };
  }

  try {
    const result = await pool.query(
      `SELECT can_read, can_write, can_delete
       FROM role_module_permissions
       WHERE role_name = $1 AND module_name = $2 AND sub_module_name = $3
       LIMIT 1`,
      [role, moduleName, subModuleName]
    );

    if (result.rows.length === 0) {
      // No row at all → no permission defined → would deny
      return { permission_exists: false, would_deny: true };
    }

    const perm = result.rows[0];
    let allowed = false;

    if (actionType === 'READ')   allowed = perm.can_read;
    if (actionType === 'WRITE')  allowed = perm.can_write;
    if (actionType === 'DELETE') allowed = perm.can_delete;

    return { permission_exists: true, would_deny: !allowed };
  } catch {
    // DB error — treat as unknown, do not crash the request
    return { permission_exists: false, would_deny: false };
  }
}

// ---------------------------------------------------------------------------
// Write to rbac_observation_log (fire-and-forget, never throws)
// ---------------------------------------------------------------------------
async function writeObservationLog(entry) {
  try {
    await pool.query(
      `INSERT INTO rbac_observation_log
         (username, user_id, user_role, module_name, sub_module_name,
          action_type, permission_exists, would_deny, endpoint)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        entry.username,
        entry.user_id,
        entry.user_role,
        entry.module_name,
        entry.sub_module_name,
        entry.action_type,
        entry.permission_exists,
        entry.would_deny,
        entry.endpoint,
      ]
    );
  } catch (err) {
    // Log to console only — never propagate to the request
    console.warn('[RBAC Observer] Failed to write observation log:', err.message);
  }
}

// ---------------------------------------------------------------------------
// Main middleware function
// ---------------------------------------------------------------------------
function rbacObserver(req, res, next) {
  // ✅ ALWAYS call next() immediately — observation is non-blocking
  next();

  // Skip unauthenticated requests (public endpoints handled by authenticateToken)
  if (!req.user) return;

  // Skip internal/health paths
  const rawPath = (req.originalUrl || req.url || '').split('?')[0];
  for (const prefix of PUBLIC_PREFIXES) {
    if (rawPath.startsWith(prefix)) return;
  }

  // Fire-and-forget: defer all async work to after the response is on its way
  setImmediate(async () => {
    try {
      const { module: moduleName, sub: subModuleName } = resolveModuleInfo(req);
      const actionType   = resolveActionType(req.method);
      const userRole     = await resolveUserRole(req);
      const endpoint     = rawPath.substring(0, 500); // cap to column length

      const { permission_exists, would_deny } = await checkPermission(
        userRole, moduleName, subModuleName, actionType
      );

      await writeObservationLog({
        username:          req.user.username || null,
        user_id:           req.user.userId   || null,
        user_role:         userRole,
        module_name:       moduleName,
        sub_module_name:   subModuleName,
        action_type:       actionType,
        permission_exists,
        would_deny,
        endpoint,
      });
    } catch (err) {
      // Absolute safety net — the observer must never crash the process
      console.warn('[RBAC Observer] Unexpected error in fire-and-forget handler:', err.message);
    }
  });
}

module.exports = rbacObserver;
