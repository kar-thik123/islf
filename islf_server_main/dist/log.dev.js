"use strict";

var pool = require('./db');

function logAuthEvent(_ref) {
  var username, action, details;
  return regeneratorRuntime.async(function logAuthEvent$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          username = _ref.username, action = _ref.action, details = _ref.details;
          _context.next = 3;
          return regeneratorRuntime.awrap(pool.query('INSERT INTO auth_logs (username, action, details) VALUES ($1, $2, $3)', [username, action, details]));

        case 3:
        case "end":
          return _context.stop();
      }
    }
  });
}

function logMasterEvent(_ref2) {
  var username, action, masterType, recordId, details;
  return regeneratorRuntime.async(function logMasterEvent$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          username = _ref2.username, action = _ref2.action, masterType = _ref2.masterType, recordId = _ref2.recordId, details = _ref2.details;
          _context2.next = 3;
          return regeneratorRuntime.awrap(pool.query('INSERT INTO master_logs (username, action, master_type, record_id, details) VALUES ($1, $2, $3, $4, $5)', [username, action, masterType, recordId, details]));

        case 3:
        case "end":
          return _context2.stop();
      }
    }
  });
}

function logSetupEvent(_ref3) {
  var username, action, setupType, entityType, entityCode, details;
  return regeneratorRuntime.async(function logSetupEvent$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          username = _ref3.username, action = _ref3.action, setupType = _ref3.setupType, entityType = _ref3.entityType, entityCode = _ref3.entityCode, details = _ref3.details;
          _context3.next = 3;
          return regeneratorRuntime.awrap(pool.query('INSERT INTO setup_logs (username, action, setup_type, entity_type, entity_code, details) VALUES ($1, $2, $3, $4, $5, $6)', [username, action, setupType, entityType, entityCode, details]));

        case 3:
        case "end":
          return _context3.stop();
      }
    }
  });
}

module.exports = {
  logAuthEvent: logAuthEvent,
  logMasterEvent: logMasterEvent,
  logSetupEvent: logSetupEvent
};