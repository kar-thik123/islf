// Load environment variables first, before any other imports
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Apply authentication middleware to all routes
app.use(authenticateToken);

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

//  auth and password    routers

const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);
const passwordRouter = require('./routes/password');
app.use('/api/password', passwordRouter);

// logs routes

const logsRouter = require('./routes/logs');
app.use('/api/logs', logsRouter);

//settings routes

const numberSeriesRouter = require('./routes/number_series');
app.use('/api/number_series', numberSeriesRouter);
const numberRelationRouter = require('./routes/number_relation');
app.use('/api/number_relation', numberRelationRouter);
const departmentRouter = require('./routes/department');
app.use('/api/department', departmentRouter);
const serviceTypesRouter = require('./routes/service_types');
app.use('/api/service_types', serviceTypesRouter); // Fixed: was /api/service-types
const companyRouter = require('./routes/company');
app.use('/api/company', companyRouter);
const branchRouter = require('./routes/branch');
app.use('/api/branch', branchRouter);
const settingsRouter = require('./routes/settings');
app.use('/api/settings', settingsRouter);
const userRouter = require('./routes/user');
app.use('/api/user', userRouter);

//masters routes

const masterCodeRouter = require('./routes/master_code');
app.use('/api/master_code', masterCodeRouter);

const masterTypeRouter = require('./routes/master_type');
app.use('/api/master_type', masterTypeRouter);

const masterLocationRouter = require('./routes/master_location');
app.use('/api/master_location', masterLocationRouter);

const masterUOMRoutes = require('./routes/master_uom');
app.use('/api/master_uom', masterUOMRoutes);

const masteItemRouter =require('./routes/master_item');
app.use('/api/master_item', masteItemRouter);

const masterVesselRouter = require('./routes/master_vessel');
app.use('/api/master_vessel', masterVesselRouter);

const mappingRouter = require('./routes/mapping');
app.use('/api/mapping', mappingRouter);

// Add customer route
const customerRouter = require('./routes/customer');
app.use('/api/customer', customerRouter);

// Add entity documents route
try {
  const entityDocumentsRouter = require('./routes/entity_documents');
  app.use('/api/entity_documents', entityDocumentsRouter);
  console.log('Entity documents route registered successfully');
} catch (error) {
  console.error('Error loading entity documents route:', error);
}

const vendorRouter = require('./routes/vendor');
app.use('/api/vendor', vendorRouter);

const currencyCodeRouter = require('./routes/currency_code');
app.use('/api/currency_code', currencyCodeRouter);

const containerCodeRouter = require('./routes/container_code');
app.use('/api/container_code', containerCodeRouter);

const basisRouter = require('./routes/basis');
app.use('/api/basis', basisRouter);

const gstSetupRouter = require('./routes/gst_setup');
app.use('/api/gst_setup', gstSetupRouter);

const tariffRouter = require('./routes/tariff');
app.use('/api/tariff', tariffRouter);

// Add account details route
const accountDetailsRoutes = require('./routes/account_details');
app.use('/api/account_details', accountDetailsRoutes);

// Add this line with other route imports
const inchargeRouter = require('./routes/incharge');
app.use('/api/incharge', inchargeRouter);

// DB connection check
const pool = require('./db');
pool.connect()
  .then(client => {
    return client.query('SELECT NOW()')
      .then(res => {
        console.log('Database connected:', res.rows[0].now);
        client.release();
      })
      .catch(err => {
        client.release();
        console.error('Database connection error:', err.stack);
      });
  })
  .catch(err => {
    console.error('Database connection error:', err.stack);
  });

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
}); 
    console.log(`Server accessible via Hamachi at: http://25.5.93.125:${PORT}`);
