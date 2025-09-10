"use strict";

var express = require('express');

var pool = require('../db');

var router = express.Router();

var _require = require('../log'),
    logMasterEvent = _require.logMasterEvent;

function getUsernameFromToken(req) {
  if (!req.user) {
    console.log('No user in request');
    return 'system';
  } // Debug: log what's in the user object


  console.log('User object from JWT:', req.user);
  var username = req.user.name || req.user.username || req.user.email || 'system';
  console.log('Extracted username:', username);
  return username;
} // Get all master types


router.get('/', function _callee(req, res) {
  var _req$query, companyCode, branchCode, departmentCode, query, params, paramIndex, result;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$query = req.query, companyCode = _req$query.companyCode, branchCode = _req$query.branchCode, departmentCode = _req$query.departmentCode;
          query = "\n      SELECT *\n      FROM master_type\n      WHERE 1=1\n    ";
          params = [];
          paramIndex = 1; // Hierarchical filtering

          if (companyCode) {
            query += " AND company_code = $".concat(paramIndex);
            params.push(companyCode);
            paramIndex++;

            if (branchCode) {
              query += " AND branch_code = $".concat(paramIndex);
              params.push(branchCode);
              paramIndex++;

              if (departmentCode) {
                query += " AND department_code = $".concat(paramIndex);
                params.push(departmentCode);
                paramIndex++;
              }
            }
          }

          query += " ORDER BY key ASC";
          _context.next = 9;
          return regeneratorRuntime.awrap(pool.query(query, params));

        case 9:
          result = _context.sent;
          res.json(result.rows);
          _context.next = 17;
          break;

        case 13:
          _context.prev = 13;
          _context.t0 = _context["catch"](0);
          console.error("Error fetching master types:", _context.t0);
          res.status(500).json({
            error: 'Failed to fetch master types'
          });

        case 17:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 13]]);
}); // Get master type by id

router.get('/:id', function _callee2(req, res) {
  var result;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM master_type WHERE id = $1', [req.params.id]));

        case 3:
          result = _context2.sent;

          if (!(result.rows.length === 0)) {
            _context2.next = 6;
            break;
          }

          return _context2.abrupt("return", res.status(404).json({
            error: 'Not found'
          }));

        case 6:
          res.json(result.rows[0]);
          _context2.next = 12;
          break;

        case 9:
          _context2.prev = 9;
          _context2.t0 = _context2["catch"](0);
          res.status(500).json({
            error: 'Failed to fetch master type'
          });

        case 12:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 9]]);
}); // Create master type

router.post('/', function _callee3(req, res) {
  var _req$body, key, value, description, status, company_code, branch_code, department_code, result;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _req$body = req.body, key = _req$body.key, value = _req$body.value, description = _req$body.description, status = _req$body.status, company_code = _req$body.company_code, branch_code = _req$body.branch_code, department_code = _req$body.department_code;
          _context3.prev = 1;
          _context3.next = 4;
          return regeneratorRuntime.awrap(pool.query('INSERT INTO master_type (key, value, description, status,company_code,branch_code,department_code) VALUES ($1, $2, $3, $4,$5,$6,$7) RETURNING *', [key, value, description, status, company_code, branch_code, department_code]));

        case 4:
          result = _context3.sent;
          _context3.next = 7;
          return regeneratorRuntime.awrap(logMasterEvent({
            username: getUsernameFromToken(req),
            action: 'CREATE',
            masterType: 'Master Type',
            recordId: key,
            details: "New MasterType \"".concat(key, "\" has been created successfully.")
          }));

        case 7:
          res.status(201).json(result.rows[0]);
          _context3.next = 13;
          break;

        case 10:
          _context3.prev = 10;
          _context3.t0 = _context3["catch"](1);
          res.status(500).json({
            error: 'Failed to create master type'
          });

        case 13:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 10]]);
}); // Update master type

router.put('/:id', function _callee4(req, res) {
  var _req$body2, value, description, status, oldResult, id, result, changedFields, fieldsToCheck, normalize, field, newValueRaw, oldValueRaw, newValue, oldValue, valuesAreEqual, details;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _req$body2 = req.body, value = _req$body2.value, description = _req$body2.description, status = _req$body2.status;
          _context4.prev = 1;
          _context4.next = 4;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM master_type WHERE id = $1', [req.params.id]));

        case 4:
          oldResult = _context4.sent;

          if (!(oldResult.rows.length === 0)) {
            _context4.next = 7;
            break;
          }

          return _context4.abrupt("return", res.status(404).json({
            error: 'Not found'
          }));

        case 7:
          id = oldResult.rows[0].id;
          _context4.next = 10;
          return regeneratorRuntime.awrap(pool.query('UPDATE master_type SET value = $1, description = $2, status = $3 WHERE id = $4 RETURNING *', [value, description, status, req.params.id]));

        case 10:
          result = _context4.sent;

          if (!(result.rows.length === 0)) {
            _context4.next = 13;
            break;
          }

          return _context4.abrupt("return", res.status(404).json({
            error: 'Not found'
          }));

        case 13:
          changedFields = [];
          fieldsToCheck = {
            value: value,
            description: description,
            status: status
          };

          normalize = function normalize(value) {
            if (value === null || value === undefined) return '';
            if (value instanceof Date) return value.toISOString().split('T')[0];
            if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value;
            return value.toString().trim();
          };

          for (field in fieldsToCheck) {
            newValueRaw = fieldsToCheck[field];
            oldValueRaw = oldResult.rows[0][field];
            newValue = normalize(newValueRaw);
            oldValue = normalize(oldValueRaw);
            valuesAreEqual = newValue === oldValue;

            if (!valuesAreEqual) {
              changedFields.push("Field \"".concat(field, "\" changed from \"").concat(oldValue, "\" to \"").concat(newValue, "\"."));
            }
          }

          details = changedFields.length > 0 ? "Changes detected in the\n" + changedFields.join('\n') : 'No actual changes detected.'; // Log the setup event

          _context4.next = 20;
          return regeneratorRuntime.awrap(logMasterEvent({
            username: getUsernameFromToken(req),
            action: 'UPDATE',
            masterType: 'Master Type',
            recordId: key,
            details: details
          }));

        case 20:
          res.json(result.rows[0]);
          _context4.next = 27;
          break;

        case 23:
          _context4.prev = 23;
          _context4.t0 = _context4["catch"](1);
          console.error(_context4.t0);
          res.status(500).json({
            error: 'Failed to update master type'
          });

        case 27:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[1, 23]]);
}); // Delete master type

router["delete"]('/:id', function _callee5(req, res) {
  var result;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(pool.query('DELETE FROM master_type WHERE id = $1 RETURNING *', [req.params.id]));

        case 3:
          result = _context5.sent;

          if (!(result.rows.length === 0)) {
            _context5.next = 6;
            break;
          }

          return _context5.abrupt("return", res.status(404).json({
            error: 'Master type not found'
          }));

        case 6:
          _context5.next = 8;
          return regeneratorRuntime.awrap(logMasterEvent({
            username: getUsernameFromToken(req),
            action: 'DELETE',
            masterType: 'Master Type',
            recordId: req.params.id,
            details: "Master type with ID ".concat(req.params.id, " has been deleted.")
          }));

        case 8:
          res.json({
            success: true
          });
          _context5.next = 15;
          break;

        case 11:
          _context5.prev = 11;
          _context5.t0 = _context5["catch"](0);
          console.error('Error deleting master type:', _context5.t0);
          res.status(500).json({
            error: 'Failed to delete master type'
          });

        case 15:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 11]]);
});
module.exports = router;