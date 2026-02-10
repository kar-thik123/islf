const pool = require('./db');

async function logAuthEvent({ username, action, details }) {
  // Legacy: Automatic middleware now handles this
}

async function logMasterEvent({ username, action, masterType, recordId, details }) {
  // Legacy: Automatic middleware now handles this
}

async function logSetupEvent({ username, action, setupType, entityCode, details }) {
  // Legacy: Automatic middleware now handles this
}

module.exports = {
  logAuthEvent,
  logMasterEvent,
  logSetupEvent
};