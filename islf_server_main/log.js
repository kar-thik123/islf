const pool = require('./db');

async function logAuthEvent({ username, action, details }) {
  await pool.query(
    'INSERT INTO auth_logs (username, action, details) VALUES ($1, $2, $3)',
    [username, action, details]
  );
}

module.exports = { logAuthEvent }; 