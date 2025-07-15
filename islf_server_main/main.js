const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Import and use the auth and password    routers
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);
const passwordRouter = require('./routes/password');
app.use('/api/password', passwordRouter);
const logsRouter = require('./routes/logs');
app.use('/api/logs', logsRouter);
const numberSeriesRouter = require('./routes/number_series');
app.use('/api/number_series', numberSeriesRouter);
const numberRelationRouter = require('./routes/number_relation');
app.use('/api/number_relation', numberRelationRouter);
const departmentRouter = require('./routes/department');
app.use('/api/department', departmentRouter);
const companyRouter = require('./routes/company');
app.use('/api/company', companyRouter);
const branchRouter = require('./routes/branch');
app.use('/api/branch', branchRouter);
const settingsRouter = require('./routes/settings');
app.use('/api/settings', settingsRouter);
const userRouter = require('./routes/user');
app.use('/api/user', userRouter);

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 