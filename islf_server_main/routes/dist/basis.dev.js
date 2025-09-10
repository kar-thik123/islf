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
} // Get all basis codes with optional context filtering


router.get('/', function _callee(req, res) {
  var _req$query, companyCode, branchCode, departmentCode, query, params, paramIndex, result, _result;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$query = req.query, companyCode = _req$query.companyCode, branchCode = _req$query.branchCode, departmentCode = _req$query.departmentCode; // If context parameters are provided, filter by their context

          if (!(companyCode || branchCode || departmentCode)) {
            _context.next = 16;
            break;
          }

          query = "\n        SELECT *\n        FROM basis\n        WHERE 1=1\n      ";
          params = [];
          paramIndex = 1;

          if (companyCode) {
            query += " AND company_code = $".concat(paramIndex);
            params.push(companyCode);
            paramIndex++;
          }

          if (branchCode) {
            query += " AND branch_code = $".concat(paramIndex);
            params.push(branchCode);
            paramIndex++;
          }

          if (departmentCode) {
            query += " AND department_code = $".concat(paramIndex);
            params.push(departmentCode);
            paramIndex++;
          }

          query += " ORDER BY code ASC";
          _context.next = 12;
          return regeneratorRuntime.awrap(pool.query(query, params));

        case 12:
          result = _context.sent;
          res.json(result.rows);
          _context.next = 20;
          break;

        case 16:
          _context.next = 18;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM basis ORDER BY code ASC'));

        case 18:
          _result = _context.sent;
          res.json(_result.rows);

        case 20:
          _context.next = 26;
          break;

        case 22:
          _context.prev = 22;
          _context.t0 = _context["catch"](0);
          console.error('Error fetching basis codes:', _context.t0);
          res.status(500).json({
            error: 'Failed to fetch basis codes'
          });

        case 26:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 22]]);
}); // GET single basis code by code

router.get('/:code', function _callee2(req, res) {
  var result;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM basis WHERE code = $1', [req.params.code]));

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
            error: 'Failed to fetch basis code'
          });

        case 12:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 9]]);
}); // CREATE new basis code

router.post('/', function _callee3(req, res) {
  var _req$body, code, description, status, company_code, branch_code, department_code, result;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _req$body = req.body, code = _req$body.code, description = _req$body.description, status = _req$body.status, company_code = _req$body.company_code, branch_code = _req$body.branch_code, department_code = _req$body.department_code;
          _context3.prev = 1;
          _context3.next = 4;
          return regeneratorRuntime.awrap(pool.query("INSERT INTO basis (code, description, status, company_code, branch_code, department_code, created_at, updated_at)\n       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)\n       RETURNING *", [code, description, status || 'Active', company_code, branch_code, department_code]));

        case 4:
          result = _context3.sent;
          _context3.next = 7;
          return regeneratorRuntime.awrap(logMasterEvent({
            username: getUsernameFromToken(req),
            action: 'CREATE',
            masterType: 'Basis',
            recordId: code,
            details: "New Basis Code \"".concat(code, "\" has been created successfully.")
          }));

        case 7:
          res.status(201).json(result.rows[0]);
          _context3.next = 14;
          break;

        case 10:
          _context3.prev = 10;
          _context3.t0 = _context3["catch"](1);
          console.error('Error creating basis code:', _context3.t0);
          res.status(500).json({
            error: 'Failed to create basis code'
          });

        case 14:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 10]]);
}); // UPDATE basis code

router.put('/:code', function _callee4(req, res) {
  var _req$body2, description, status, oldResult, oldBasis, result, changedFields, fieldsToCheck, normalize, field, newValue, oldValue, valuesAreEqual, details;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _req$body2 = req.body, description = _req$body2.description, status = _req$body2.status;
          _context4.prev = 1;
          _context4.next = 4;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM basis WHERE code = $1', [req.params.code]));

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
          oldBasis = oldResult.rows[0];
          _context4.next = 10;
          return regeneratorRuntime.awrap(pool.query('UPDATE basis SET description = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE code = $3 RETURNING *', [description, status, req.params.code]));

        case 10:
          result = _context4.sent;
          changedFields = [];
          fieldsToCheck = {
            description: description,
            status: status
          };

          normalize = function normalize(value) {
            if (value === null || value === undefined) return '';
            return value.toString().trim();
          };

          for (field in fieldsToCheck) {
            newValue = normalize(fieldsToCheck[field]);
            oldValue = normalize(oldBasis[field]);
            valuesAreEqual = newValue === oldValue;

            if (!valuesAreEqual) {
              changedFields.push("Field \"".concat(field, "\" changed from \"").concat(oldValue, "\" to \"").concat(newValue, "\"."));
            }
          }

          details = changedFields.length > 0 ? "Changes detected in the\n" + changedFields.join('\n') : 'No actual changes detected.'; // Log the master event

          _context4.next = 18;
          return regeneratorRuntime.awrap(logMasterEvent({
            username: getUsernameFromToken(req),
            action: 'UPDATE',
            masterType: 'Basis',
            recordId: code,
            details: details
          }));

        case 18:
          if (!(result.rows.length === 0)) {
            _context4.next = 20;
            break;
          }

          return _context4.abrupt("return", res.status(404).json({
            error: 'Not found'
          }));

        case 20:
          res.json(result.rows[0]);
          _context4.next = 26;
          break;

        case 23:
          _context4.prev = 23;
          _context4.t0 = _context4["catch"](1);
          res.status(500).json({
            error: 'Failed to update basis code'
          });

        case 26:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[1, 23]]);
}); // DELETE basis code

router["delete"]('/:code', function _callee5(req, res) {
  var result;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(pool.query('DELETE FROM basis WHERE code = $1 RETURNING *', [req.params.code]));

        case 3:
          result = _context5.sent;

          if (!(result.rows.length === 0)) {
            _context5.next = 6;
            break;
          }

          return _context5.abrupt("return", res.status(404).json({
            error: 'Not found'
          }));

        case 6:
          _context5.next = 8;
          return regeneratorRuntime.awrap(logMasterEvent({
            username: getUsernameFromToken(req),
            action: 'DELETE',
            masterType: 'Basis',
            recordId: req.params.code,
            details: "Basis Code \"".concat(req.params.code, "\" has been deleted successfully.")
          }));

        case 8:
          res.json({
            success: true
          });
          _context5.next = 14;
          break;

        case 11:
          _context5.prev = 11;
          _context5.t0 = _context5["catch"](0);
          res.status(500).json({
            error: 'Failed to delete basis code'
          });

        case 14:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 11]]);
});
module.exports = router;