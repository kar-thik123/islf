const pool = require('./db');

async function logAuthEvent({ username, action, details }) {
  await pool.query(
    'INSERT INTO auth_logs (username, action, details) VALUES ($1, $2, $3)',
    [username, action, details]
  );
}

async function logMasterEvent({ username, action, masterType, recordId, recordName, details }) {
  await pool.query(
    'INSERT INTO master_logs (username, action, master_type, record_id, record_name, details) VALUES ($1, $2, $3, $4, $5, $6)',
    [username, action, masterType, recordId, recordName, details]
  );
}

async function logSetupEvent({ username, action, setupType, entityType, entityCode, entityName, details }) {
  await pool.query(
    'INSERT INTO setup_logs (username, action, setup_type, entity_type, entity_code, entity_name, details) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [username, action, setupType, entityType, entityCode, entityName, details]
  );
}

module.exports = { 
  logAuthEvent, 
  logMasterEvent, 
  logSetupEvent 
}; 