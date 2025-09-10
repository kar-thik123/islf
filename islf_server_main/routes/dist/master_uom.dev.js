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
} // Get all master UOMs with optional context filtering


router.get('/', function _callee(req, res) {
  var _req$query, companyCode, branchCode, departmentCode, query, params, paramIndex, result;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$query = req.query, companyCode = _req$query.companyCode, branchCode = _req$query.branchCode, departmentCode = _req$query.departmentCode;
          query = "\n      SELECT *\n      FROM master_uom\n      WHERE 1=1\n    ";
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
          _context.next = 16;
          break;

        case 13:
          _context.prev = 13;
          _context.t0 = _context["catch"](0);
          res.status(500).json({
            error: 'Failed to fetch master UOMs'
          });

        case 16:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 13]]);
}); // Create master UOM

router.post('/', function _callee2(req, res) {
  var _req$body, uom_type, code, description, active, company_code, branch_code, department_code, result;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body = req.body, uom_type = _req$body.uom_type, code = _req$body.code, description = _req$body.description, active = _req$body.active, company_code = _req$body.company_code, branch_code = _req$body.branch_code, department_code = _req$body.department_code;
          _context2.prev = 1;
          _context2.next = 4;
          return regeneratorRuntime.awrap(pool.query("INSERT INTO master_uom (uom_type, code, description, active, company_code, branch_code, department_code)\n       VALUES ($1, $2, $3, $4, $5, $6, $7)\n       RETURNING *", [uom_type, code, description, active, company_code, branch_code, department_code]));

        case 4:
          result = _context2.sent;
          _context2.next = 7;
          return regeneratorRuntime.awrap(logMasterEvent({
            username: getUsernameFromToken(req),
            action: 'CREATE',
            masterType: 'Master UOM',
            recordId: code,
            details: "New MasterUOM \"".concat(code, "\" has been created successfully.")
          }));

        case 7:
          res.status(201).json(result.rows[0]);
          _context2.next = 13;
          break;

        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](1);
          res.status(500).json({
            error: 'Failed to create master UOM'
          });

        case 13:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[1, 10]]);
}); // Update master UOM by ID

router.put('/:id', function _callee3(req, res) {
  var id, _req$body2, uom_type, code, description, active, oldResult, oldUOM, result, changedFields, fieldsToCheck, normalize, field, newValue, oldValue, valuesAreEqual, details;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          id = parseInt(req.params.id, 10);
          _req$body2 = req.body, uom_type = _req$body2.uom_type, code = _req$body2.code, description = _req$body2.description, active = _req$body2.active;
          _context3.prev = 2;
          _context3.next = 5;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM master_uom WHERE id = $1', [id]));

        case 5:
          oldResult = _context3.sent;

          if (!(oldResult.rows.length === 0)) {
            _context3.next = 8;
            break;
          }

          return _context3.abrupt("return", res.status(404).json({
            error: 'UOM not found'
          }));

        case 8:
          oldUOM = oldResult.rows[0];
          _context3.next = 11;
          return regeneratorRuntime.awrap(pool.query("UPDATE master_uom\n       SET uom_type = $1, code = $2, description = $3, active = $4\n       WHERE id = $5\n       RETURNING *", [uom_type, code, description, active, id]));

        case 11:
          result = _context3.sent;

          if (!(result.rowCount === 0)) {
            _context3.next = 14;
            break;
          }

          return _context3.abrupt("return", res.status(404).json({
            error: 'UOM not found'
          }));

        case 14:
          changedFields = [];
          fieldsToCheck = {
            uom_type: uom_type,
            code: code,
            description: description,
            active: active
          };

          normalize = function normalize(value) {
            if (value === null || value === undefined) return '';
            return value.toString().trim();
          };

          for (field in fieldsToCheck) {
            newValue = normalize(fieldsToCheck[field]);
            oldValue = normalize(oldUOM[field]);
            valuesAreEqual = newValue === oldValue;

            if (!valuesAreEqual) {
              changedFields.push("Field \"".concat(field, "\" changed from \"").concat(oldValue, "\" to \"").concat(newValue, "\"."));
            }
          }

          details = changedFields.length > 0 ? "Changes detected in the\n" + changedFields.join('\n') : 'No actual changes detected.'; // Log the master event

          _context3.next = 21;
          return regeneratorRuntime.awrap(logMasterEvent({
            username: getUsernameFromToken(req),
            action: 'UPDATE',
            masterType: 'Master UOM',
            recordId: code,
            details: details
          }));

        case 21:
          res.json(result.rows[0]);
          _context3.next = 27;
          break;

        case 24:
          _context3.prev = 24;
          _context3.t0 = _context3["catch"](2);
          res.status(500).json({
            error: 'Failed to update master UOM'
          });

        case 27:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[2, 24]]);
}); // Delete master UOM by ID

router["delete"]('/:id', function _callee4(req, res) {
  var id, result;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          id = parseInt(req.params.id, 10);
          _context4.prev = 1;
          _context4.next = 4;
          return regeneratorRuntime.awrap(pool.query('DELETE FROM master_uom WHERE id = $1 RETURNING *', [id]));

        case 4:
          result = _context4.sent;

          if (!(result.rowCount === 0)) {
            _context4.next = 7;
            break;
          }

          return _context4.abrupt("return", res.status(404).json({
            error: 'UOM not found'
          }));

        case 7:
          _context4.next = 9;
          return regeneratorRuntime.awrap(logMasterEvent({
            username: getUsernameFromToken(req),
            action: 'DELETE',
            masterType: 'Master UOM',
            recordId: result.rows[0].code,
            details: "MasterUOM \"".concat(result.rows[0].code, "\" has been deleted successfully.")
          }));

        case 9:
          res.json({
            success: true
          });
          _context4.next = 15;
          break;

        case 12:
          _context4.prev = 12;
          _context4.t0 = _context4["catch"](1);
          res.status(500).json({
            error: 'Failed to delete master UOM'
          });

        case 15:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[1, 12]]);
});
module.exports = router;