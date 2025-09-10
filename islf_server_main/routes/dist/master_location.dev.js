"use strict";

var express = require('express');

var pool = require('../db');

var _require = require('../log'),
    logMasterEvent = _require.logMasterEvent;

var router = express.Router();

function getUsernameFromToken(req) {
  if (!req.user) {
    console.log('No user in request');
    return 'system';
  } // Debug: log what's in the user object


  console.log('User object from JWT:', req.user);
  var username = req.user.name || req.user.username || req.user.email || 'system';
  console.log('Extracted username:', username);
  return username;
} // Get all master locations


router.get('/', function _callee(req, res) {
  var _req$query, companyCode, branchCode, departmentCode, query, params, paramIndex, result;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$query = req.query, companyCode = _req$query.companyCode, branchCode = _req$query.branchCode, departmentCode = _req$query.departmentCode;
          query = "\n      SELECT *\n      FROM master_location\n      WHERE 1=1\n    ";
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

          query += " ORDER BY code ASC";
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
          console.error('Error fetching master locations:', _context.t0);
          res.status(500).json({
            error: 'Failed to fetch master locations'
          });

        case 17:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 13]]);
}); // Create master location

router.post('/', function _callee2(req, res) {
  var _req$body, type, code, name, country, state, city, gst_state_code, pin_code, active, company_code, branch_code, department_code, result;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body = req.body, type = _req$body.type, code = _req$body.code, name = _req$body.name, country = _req$body.country, state = _req$body.state, city = _req$body.city, gst_state_code = _req$body.gst_state_code, pin_code = _req$body.pin_code, active = _req$body.active, company_code = _req$body.company_code, branch_code = _req$body.branch_code, department_code = _req$body.department_code;
          _context2.prev = 1;
          _context2.next = 4;
          return regeneratorRuntime.awrap(pool.query('INSERT INTO master_location (type, code, name, country, state, city, gst_state_code, pin_code, active,company_code,branch_code,department_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10,$11,$12) RETURNING *', [type, code, name, country, state, city, gst_state_code, pin_code, active, company_code, branch_code, department_code]));

        case 4:
          result = _context2.sent;
          _context2.next = 7;
          return regeneratorRuntime.awrap(logMasterEvent({
            username: getUsernameFromToken(req),
            action: 'CREATE',
            masterType: 'Master Location',
            recordId: code,
            details: "New MasterLocation \"".concat(code, "\" has been created successfully.")
          }));

        case 7:
          res.status(201).json(result.rows[0]);
          _context2.next = 13;
          break;

        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](1);

          // Handle specific database constraint errors
          if (_context2.t0.code === '23505' && _context2.t0.constraint === 'master_location_code_key') {
            res.status(400).json({
              error: 'Duplicate code',
              detail: "Location code \"".concat(code, "\" already exists. Please use a different code."),
              code: code
            });
          } else if (_context2.t0.code === '23505') {
            res.status(400).json({
              error: 'Duplicate entry',
              detail: "A location with this information already exists.",
              code: code
            });
          } else {
            res.status(500).json({
              error: 'Failed to create master location'
            });
          }

        case 13:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[1, 10]]);
}); // Update master location

router.put('/:code', function _callee3(req, res) {
  var _req$body2, type, name, country, state, city, gst_state_code, pin_code, active, oldResult, oldLocation, result, changedFields, fieldsToCheck, normalize, field, newValue, oldValue, valuesAreEqual, details;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _req$body2 = req.body, type = _req$body2.type, name = _req$body2.name, country = _req$body2.country, state = _req$body2.state, city = _req$body2.city, gst_state_code = _req$body2.gst_state_code, pin_code = _req$body2.pin_code, active = _req$body2.active;
          _context3.prev = 1;
          _context3.next = 4;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM master_location WHERE code = $1', [req.params.code]));

        case 4:
          oldResult = _context3.sent;

          if (!(oldResult.rows.length === 0)) {
            _context3.next = 7;
            break;
          }

          return _context3.abrupt("return", res.status(404).json({
            error: 'Location not found'
          }));

        case 7:
          oldLocation = oldResult.rows[0];
          _context3.next = 10;
          return regeneratorRuntime.awrap(pool.query('UPDATE master_location SET type = $1, name = $2, country = $3, state = $4, city = $5, gst_state_code = $6, pin_code = $7, active = $8 WHERE code = $9 RETURNING *', [type, name, country, state, city, gst_state_code, pin_code, active, req.params.code]));

        case 10:
          result = _context3.sent;

          if (!(result.rows.length === 0)) {
            _context3.next = 13;
            break;
          }

          return _context3.abrupt("return", res.status(404).json({
            error: 'Location not found'
          }));

        case 13:
          changedFields = [];
          fieldsToCheck = {
            type: type,
            name: name,
            country: country,
            state: state,
            city: city,
            gst_state_code: gst_state_code,
            pin_code: pin_code,
            active: active
          };

          normalize = function normalize(value) {
            if (value === null || value === undefined) return '';
            return value.toString().trim();
          };

          for (field in fieldsToCheck) {
            newValue = normalize(fieldsToCheck[field]);
            oldValue = normalize(oldLocation[field]);
            valuesAreEqual = newValue === oldValue;

            if (!valuesAreEqual) {
              changedFields.push("Field \"".concat(field, "\" changed from \"").concat(oldValue, "\" to \"").concat(newValue, "\"."));
            }
          }

          details = changedFields.length > 0 ? "Changes detected in the\n" + changedFields.join('\n') : 'No actual changes detected.'; // Log the master event

          _context3.next = 20;
          return regeneratorRuntime.awrap(logMasterEvent({
            username: getUsernameFromToken(req),
            action: 'UPDATE',
            masterType: 'Master Location',
            recordId: code,
            details: details
          }));

        case 20:
          res.json(result.rows[0]);
          _context3.next = 26;
          break;

        case 23:
          _context3.prev = 23;
          _context3.t0 = _context3["catch"](1);

          // Handle specific database constraint errors
          if (_context3.t0.code === '23505' && _context3.t0.constraint === 'master_location_code_key') {
            res.status(400).json({
              error: 'Duplicate code',
              detail: "Location code \"".concat(req.params.code, "\" already exists. Please use a different code."),
              code: req.params.code
            });
          } else if (_context3.t0.code === '23505') {
            res.status(400).json({
              error: 'Duplicate entry',
              detail: "A location with this information already exists.",
              code: req.params.code
            });
          } else {
            res.status(500).json({
              error: 'Failed to update master location'
            });
          }

        case 26:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 23]]);
}); // Delete master location

router["delete"]('/:code', function _callee4(req, res) {
  var result;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _context4.next = 3;
          return regeneratorRuntime.awrap(pool.query('DELETE FROM master_location WHERE code = $1 RETURNING *', [req.params.code]));

        case 3:
          result = _context4.sent;

          if (!(result.rows.length === 0)) {
            _context4.next = 6;
            break;
          }

          return _context4.abrupt("return", res.status(404).json({
            error: 'Not found'
          }));

        case 6:
          _context4.next = 8;
          return regeneratorRuntime.awrap(logMasterEvent({
            username: getUsernameFromToken(req),
            action: 'DELETE',
            masterType: 'Master Location',
            recordId: result.rows[0].code,
            details: "MasterLocation \"".concat(result.rows[0].code, "\" has been deleted successfully.")
          }));

        case 8:
          res.json({
            success: true
          });
          _context4.next = 14;
          break;

        case 11:
          _context4.prev = 11;
          _context4.t0 = _context4["catch"](0);
          res.status(500).json({
            error: 'Failed to delete master location'
          });

        case 14:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 11]]);
});
module.exports = router;