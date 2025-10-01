const pool = require('./db');

async function logAuthEvent({ username, action, details }) {
  await pool.query(
    'INSERT INTO auth_logs (username, action, details) VALUES ($1, $2, $3)',
    [username, action, details]
  );
}

async function logMasterEvent({ username, action, masterType, recordId, details }) {
  await pool.query(
    'INSERT INTO master_logs (username, action, master_type, record_id, details) VALUES ($1, $2, $3, $4, $5)',
    [username, action, masterType, recordId, details]
  );
}

async function logSetupEvent({ username, action, setupType, entityCode, details }) {
  // console.log(`log setup Event values UN: ${username},Acti: ${action}, setupType: ${setupType}, entityCode: ${entityCode} , details: ${details} ` );
  await pool.query(   
    'INSERT INTO setup_logs (username, action, setup_type, entity_code, details) VALUES ($1, $2, $3, $4, $5)',
    [username, action, setupType, entityCode, details]
  );
}

module.exports = { 
  logAuthEvent, 
  logMasterEvent, 
  logSetupEvent 
}; 