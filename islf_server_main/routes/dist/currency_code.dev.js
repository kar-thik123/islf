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
} // GET all currency codes


router.get('/', function _callee(req, res) {
  var _req$query, companyCode, branchCode, departmentCode, query, params, paramIndex, result;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$query = req.query, companyCode = _req$query.companyCode, branchCode = _req$query.branchCode, departmentCode = _req$query.departmentCode;
          query = "\n      SELECT *\n      FROM currency_code\n      WHERE 1=1\n    ";
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
          _context.next = 11;
          return regeneratorRuntime.awrap(pool.query(query, params));

        case 11:
          result = _context.sent;
          res.json(result.rows);
          _context.next = 18;
          break;

        case 15:
          _context.prev = 15;
          _context.t0 = _context["catch"](0);
          res.status(500).json({
            error: 'Failed to fetch currency codes'
          });

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 15]]);
}); // GET single currency code by code

router.get('/:code', function _callee2(req, res) {
  var result;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM currency_code WHERE code = $1', [req.params.code]));

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
            error: 'Failed to fetch currency code'
          });

        case 12:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 9]]);
}); // CREATE new currency code

router.post('/', function _callee3(req, res) {
  var _req$body, code, description, status, company_code, branch_code, department_code, result;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _req$body = req.body, code = _req$body.code, description = _req$body.description, status = _req$body.status, company_code = _req$body.company_code, branch_code = _req$body.branch_code, department_code = _req$body.department_code;
          _context3.prev = 1;
          _context3.next = 4;
          return regeneratorRuntime.awrap(pool.query('INSERT INTO currency_code (code, description, status,company_code,branch_code,department_code) VALUES ($1, $2, $3,$4,$5,$6) RETURNING *', [code, description, status || 'Active', company_code, branch_code, department_code]));

        case 4:
          result = _context3.sent;
          _context3.next = 7;
          return regeneratorRuntime.awrap(logMasterEvent({
            username: getUsernameFromToken(req),
            action: 'CREATE',
            masterType: 'Currency Code',
            recordId: code,
            details: "New Currency Code \"".concat(code, "\" has been created successfully.")
          }));

        case 7:
          res.status(201).json(result.rows[0]);
          _context3.next = 13;
          break;

        case 10:
          _context3.prev = 10;
          _context3.t0 = _context3["catch"](1);
          res.status(500).json({
            error: 'Failed to create currency code'
          });

        case 13:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 10]]);
}); // UPDATE currency code

router.put('/:code', function _callee4(req, res) {
  var _req$body2, description, status, oldResult, oldCurrency, result, changedFields, fieldsToCheck, normalize, field, newValue, oldValue, valuesAreEqual, details;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _req$body2 = req.body, description = _req$body2.description, status = _req$body2.status;
          _context4.prev = 1;
          _context4.next = 4;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM currency_code WHERE code = $1', [req.params.code]));

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
          oldCurrency = oldResult.rows[0];
          _context4.next = 10;
          return regeneratorRuntime.awrap(pool.query('UPDATE currency_code SET description = $1, status = $2 WHERE code = $3 RETURNING *', [description, status, req.params.code]));

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
            description: description,
            status: status
          };

          normalize = function normalize(value) {
            if (value === null || value === undefined) return '';
            return value.toString().trim();
          };

          for (field in fieldsToCheck) {
            newValue = normalize(fieldsToCheck[field]);
            oldValue = normalize(oldCurrency[field]);
            valuesAreEqual = newValue === oldValue;

            if (!valuesAreEqual) {
              changedFields.push("Field \"".concat(field, "\" changed from \"").concat(oldValue, "\" to \"").concat(newValue, "\"."));
            }
          }

          details = changedFields.length > 0 ? "Changes detected in the\n" + changedFields.join('\n') : 'No actual changes detected.'; // Log the master event

          _context4.next = 20;
          return regeneratorRuntime.awrap(logMasterEvent({
            username: getUsernameFromToken(req),
            action: 'UPDATE',
            masterType: 'Currency Code',
            recordId: code,
            details: details
          }));

        case 20:
          res.json(result.rows[0]);
          _context4.next = 26;
          break;

        case 23:
          _context4.prev = 23;
          _context4.t0 = _context4["catch"](1);
          res.status(500).json({
            error: 'Failed to update currency code'
          });

        case 26:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[1, 23]]);
}); // DELETE currency code

router["delete"]('/:code', function _callee5(req, res) {
  var result;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(pool.query('DELETE FROM currency_code WHERE code = $1 RETURNING *', [req.params.code]));

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
            masterType: 'Currency Code',
            recordId: req.params.code,
            details: "Currency Code \"".concat(req.params.code, "\" has been deleted successfully.")
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
            error: 'Failed to delete currency code'
          });

        case 14:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 11]]);
});
module.exports = router;