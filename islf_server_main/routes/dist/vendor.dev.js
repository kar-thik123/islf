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
} // GET all vendors with optional context-based filtering


router.get('/', function _callee(req, res) {
  var _req$query, company_code, branch_code, department_code, service_type_code, query, params, paramIndex, result;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$query = req.query, company_code = _req$query.company_code, branch_code = _req$query.branch_code, department_code = _req$query.department_code, service_type_code = _req$query.service_type_code;
          query = "\n      SELECT *\n      FROM vendor\n      WHERE 1=1\n    ";
          params = [];
          paramIndex = 1; // Hierarchical filtering

          if (company_code) {
            query += " AND company_code = $".concat(paramIndex);
            params.push(company_code);
            paramIndex++;

            if (branch_code) {
              query += " AND branch_code = $".concat(paramIndex);
              params.push(branch_code);
              paramIndex++;

              if (department_code) {
                query += " AND department_code = $".concat(paramIndex);
                params.push(department_code);
                paramIndex++;
              }
            }
          } // Service type filter (independent)


          if (service_type_code) {
            query += " AND service_type_code = $".concat(paramIndex);
            params.push(service_type_code);
            paramIndex++;
          }

          query += " ORDER BY id ASC";
          _context.next = 10;
          return regeneratorRuntime.awrap(pool.query(query, params));

        case 10:
          result = _context.sent;
          res.json(result.rows);
          _context.next = 18;
          break;

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](0);
          console.error('Error fetching vendors:', _context.t0);
          res.status(500).json({
            error: 'Failed to fetch vendors'
          });

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 14]]);
}); // CREATE new vendor (with number series logic and manual/default check)

router.post('/', function _callee2(req, res) {
  var _req$body, seriesCode, vendor_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website, bill_to_vendor_name, vat_gst_no, place_of_supply, pan_no, tan_no, contacts, company_code, branch_code, department_code, service_type_code, mappingRes, seriesResult, series, exists, client, relResult, rel, nextNo, result;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body = req.body, seriesCode = _req$body.seriesCode, vendor_no = _req$body.vendor_no, type = _req$body.type, name = _req$body.name, name2 = _req$body.name2, blocked = _req$body.blocked, address = _req$body.address, address1 = _req$body.address1, country = _req$body.country, state = _req$body.state, city = _req$body.city, postal_code = _req$body.postal_code, website = _req$body.website, bill_to_vendor_name = _req$body.bill_to_vendor_name, vat_gst_no = _req$body.vat_gst_no, place_of_supply = _req$body.place_of_supply, pan_no = _req$body.pan_no, tan_no = _req$body.tan_no, contacts = _req$body.contacts, company_code = _req$body.company_code, branch_code = _req$body.branch_code, department_code = _req$body.department_code, service_type_code = _req$body.service_type_code; // Debug: log the request body

          console.log('REQ BODY:', req.body);
          _context2.prev = 2;

          if (!(!seriesCode && company_code && branch_code && department_code)) {
            _context2.next = 15;
            break;
          }

          if (!service_type_code) {
            _context2.next = 10;
            break;
          }

          _context2.next = 7;
          return regeneratorRuntime.awrap(pool.query("SELECT mapping FROM mapping_relations\n           WHERE code_type = $1\n           AND company_code = $2\n           AND branch_code = $3\n           AND department_code = $4\n           AND (service_type_code = $5 OR service_type_code IS NULL)\n           ORDER BY CASE WHEN service_type_code IS NULL THEN 1 ELSE 0 END, id DESC\n           LIMIT 1", ['vendorCode', company_code, branch_code, department_code, service_type_code]));

        case 7:
          mappingRes = _context2.sent;
          _context2.next = 13;
          break;

        case 10:
          _context2.next = 12;
          return regeneratorRuntime.awrap(pool.query("SELECT mapping FROM mapping_relations\n           WHERE code_type = $1\n           AND company_code = $2\n           AND branch_code = $3\n           AND department_code = $4\n           AND service_type_code IS NULL\n           ORDER BY id DESC\n           LIMIT 1", ['vendorCode', company_code, branch_code, department_code]));

        case 12:
          mappingRes = _context2.sent;

        case 13:
          // Debug: log mapping result
          console.log('MAPPING RESULT:', mappingRes.rows);

          if (mappingRes.rows.length > 0) {
            seriesCode = mappingRes.rows[0].mapping; // Debug: log series code from mapping

            console.log('SERIES CODE FROM MAPPING:', seriesCode);
          }

        case 15:
          if (!seriesCode) {
            _context2.next = 66;
            break;
          }

          _context2.next = 18;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM number_series WHERE code = $1 ORDER BY id DESC LIMIT 1', [seriesCode]));

        case 18:
          seriesResult = _context2.sent;
          // Debug: log number series result
          console.log('NUMBER SERIES RESULT:', seriesResult.rows);

          if (!(seriesResult.rows.length === 0)) {
            _context2.next = 22;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            error: 'Number series not found'
          }));

        case 22:
          series = seriesResult.rows[0];

          if (!series.is_manual) {
            _context2.next = 33;
            break;
          }

          if (!(!vendor_no || vendor_no.trim() === '')) {
            _context2.next = 26;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            error: 'Manual code entry required for this series'
          }));

        case 26:
          _context2.next = 28;
          return regeneratorRuntime.awrap(pool.query('SELECT 1 FROM vendor WHERE vendor_no = $1', [vendor_no]));

        case 28:
          exists = _context2.sent;

          if (!(exists.rows.length > 0)) {
            _context2.next = 31;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            error: 'Vendor No already exists'
          }));

        case 31:
          _context2.next = 64;
          break;

        case 33:
          _context2.next = 35;
          return regeneratorRuntime.awrap(pool.connect());

        case 35:
          client = _context2.sent;
          _context2.prev = 36;
          _context2.next = 39;
          return regeneratorRuntime.awrap(client.query('BEGIN'));

        case 39:
          _context2.next = 41;
          return regeneratorRuntime.awrap(client.query('SELECT * FROM number_relation WHERE number_series = $1 ORDER BY id DESC LIMIT 1 FOR UPDATE', [seriesCode]));

        case 41:
          relResult = _context2.sent;

          if (!(relResult.rows.length === 0)) {
            _context2.next = 47;
            break;
          }

          _context2.next = 45;
          return regeneratorRuntime.awrap(client.query('ROLLBACK'));

        case 45:
          client.release();
          return _context2.abrupt("return", res.status(400).json({
            error: 'Number series relation not found'
          }));

        case 47:
          rel = relResult.rows[0];

          if (rel.last_no_used === 0) {
            // If this is the first use, start with starting_no
            nextNo = Number(rel.starting_no);
          } else {
            // Otherwise, increment from last_no_used
            nextNo = Number(rel.last_no_used) + Number(rel.increment_by);
          }

          vendor_no = "".concat(rel.prefix || '').concat(nextNo);
          console.log('Generated vendor code:', vendor_no); // Update the last_no_used within the same transaction

          _context2.next = 53;
          return regeneratorRuntime.awrap(client.query('UPDATE number_relation SET last_no_used = $1 WHERE id = $2', [nextNo, rel.id]));

        case 53:
          _context2.next = 55;
          return regeneratorRuntime.awrap(client.query('COMMIT'));

        case 55:
          client.release();
          _context2.next = 64;
          break;

        case 58:
          _context2.prev = 58;
          _context2.t0 = _context2["catch"](36);
          _context2.next = 62;
          return regeneratorRuntime.awrap(client.query('ROLLBACK'));

        case 62:
          client.release();
          throw _context2.t0;

        case 64:
          _context2.next = 67;
          break;

        case 66:
          if (!vendor_no || vendor_no === 'AUTO') {
            vendor_no = 'VEN-' + Date.now();
          }

        case 67:
          _context2.next = 69;
          return regeneratorRuntime.awrap(pool.query("INSERT INTO vendor (\n        vendor_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website,\n        bill_to_vendor_name, vat_gst_no, place_of_supply, pan_no, tan_no, contacts,\n        company_code, branch_code, department_code, service_type_code\n      ) VALUES (\n        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,\n        $19, $20, $21, $22 ) RETURNING *", [vendor_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website, bill_to_vendor_name, vat_gst_no, place_of_supply, pan_no, tan_no, JSON.stringify(contacts || []), company_code, branch_code, department_code, service_type_code // <-- Use snake_case variables
          ]));

        case 69:
          result = _context2.sent;
          _context2.next = 72;
          return regeneratorRuntime.awrap(logMasterEvent({
            username: getUsernameFromToken(req) || 'system',
            action: 'CREATE',
            masterType: 'Vendor',
            recordId: vendor_no,
            details: "New Vendor ".concat(vendor_no, "-").concat(name, " has been created successfully.")
          }));

        case 72:
          res.status(201).json(result.rows[0]);
          _context2.next = 79;
          break;

        case 75:
          _context2.prev = 75;
          _context2.t1 = _context2["catch"](2);
          console.error('Error creating vendor:', _context2.t1);
          res.status(500).json({
            error: 'Failed to create vendor'
          });

        case 79:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[2, 75], [36, 58]]);
}); // UPDATE vendor by ID

router.put('/:id', function _callee3(req, res) {
  var id, _req$body2, seriesCode, vendor_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website, bill_to_vendor_name, vat_gst_no, place_of_supply, pan_no, tan_no, contacts, company_code, branch_code, department_code, service_type_code, oldResult, oldVendor, result, changedFields, fieldsToCheck, normalize, field, newValue, oldValue, valuesAreEqual, details;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          id = parseInt(req.params.id, 10);

          if (!isNaN(id)) {
            _context3.next = 3;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            error: 'Invalid ID format'
          }));

        case 3:
          _req$body2 = req.body, seriesCode = _req$body2.seriesCode, vendor_no = _req$body2.vendor_no, type = _req$body2.type, name = _req$body2.name, name2 = _req$body2.name2, blocked = _req$body2.blocked, address = _req$body2.address, address1 = _req$body2.address1, country = _req$body2.country, state = _req$body2.state, city = _req$body2.city, postal_code = _req$body2.postal_code, website = _req$body2.website, bill_to_vendor_name = _req$body2.bill_to_vendor_name, vat_gst_no = _req$body2.vat_gst_no, place_of_supply = _req$body2.place_of_supply, pan_no = _req$body2.pan_no, tan_no = _req$body2.tan_no, contacts = _req$body2.contacts, company_code = _req$body2.company_code, branch_code = _req$body2.branch_code, department_code = _req$body2.department_code, service_type_code = _req$body2.service_type_code;
          _context3.prev = 4;
          _context3.next = 7;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM vendor WHERE id = $1', [id]));

        case 7:
          oldResult = _context3.sent;

          if (!(oldResult.rows.length === 0)) {
            _context3.next = 10;
            break;
          }

          return _context3.abrupt("return", res.status(404).json({
            error: 'Vendor not found'
          }));

        case 10:
          oldVendor = oldResult.rows[0]; // Relation-based number series lookup (if seriesCode provided)

          _context3.next = 13;
          return regeneratorRuntime.awrap(pool.query("UPDATE vendor SET\n        vendor_no = $1, type = $2, name = $3, name2 = $4, blocked = $5, address = $6, address1 = $7, country = $8, state = $9, city = $10, postal_code = $11, website = $12,\n        bill_to_vendor_name = $13, vat_gst_no = $14, place_of_supply = $15, pan_no = $16, tan_no = $17, contacts = $18,\n        company_code = $19, branch_code = $20, department_code = $21, service_type_code = $22\n      WHERE id = $23 RETURNING *", [vendor_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website, bill_to_vendor_name, vat_gst_no, place_of_supply, pan_no, tan_no, JSON.stringify(contacts || []), company_code, branch_code, department_code, service_type_code, id]));

        case 13:
          result = _context3.sent;

          if (!(result.rows.length === 0)) {
            _context3.next = 16;
            break;
          }

          return _context3.abrupt("return", res.status(404).json({
            error: 'Vendor not found'
          }));

        case 16:
          changedFields = [];
          fieldsToCheck = {
            vendor_no: vendor_no,
            type: type,
            name: name,
            name2: name2,
            blocked: blocked,
            address: address,
            address1: address1,
            country: country,
            state: state,
            city: city,
            postal_code: postal_code,
            website: website,
            bill_to_vendor_name: bill_to_vendor_name,
            vat_gst_no: vat_gst_no,
            place_of_supply: place_of_supply,
            pan_no: pan_no,
            tan_no: tan_no,
            contacts: contacts
          };

          normalize = function normalize(value) {
            if (value === null || value === undefined) return '';
            if (value instanceof Date) return value.toISOString().split('T')[0];
            if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value;
            return value.toString().trim();
          };

          for (field in fieldsToCheck) {
            newValue = normalize(fieldsToCheck[field]);
            oldValue = normalize(oldVendor[field]);
            valuesAreEqual = newValue === oldValue;

            if (!valuesAreEqual) {
              changedFields.push("Field \"".concat(field, "\" changed from \"").concat(oldValue, "\" to \"").concat(newValue, "\"."));
            }
          }

          details = changedFields.length > 0 ? "Changes detected in the\n" + changedFields.join('\n') : 'No actual changes detected.'; // Log the master event

          _context3.next = 23;
          return regeneratorRuntime.awrap(logMasterEvent({
            username: getUsernameFromToken(req) || 'system',
            action: 'UPDATE',
            masterType: 'Vendor',
            recordId: vendor_no,
            details: details
          }));

        case 23:
          res.json(result.rows[0]);
          _context3.next = 30;
          break;

        case 26:
          _context3.prev = 26;
          _context3.t0 = _context3["catch"](4);
          console.error('Error updating vendor:', _context3.t0);
          res.status(500).json({
            error: 'Failed to update vendor'
          });

        case 30:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[4, 26]]);
}); // DELETE vendor by ID

router["delete"]('/:id', function _callee4(req, res) {
  var id, result;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          id = parseInt(req.params.id, 10);

          if (!isNaN(id)) {
            _context4.next = 3;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            error: 'Invalid ID format'
          }));

        case 3:
          _context4.prev = 3;
          _context4.next = 6;
          return regeneratorRuntime.awrap(pool.query("DELETE FROM vendor WHERE id = $1 RETURNING *", [id]));

        case 6:
          result = _context4.sent;

          if (!(result.rows.length === 0)) {
            _context4.next = 9;
            break;
          }

          return _context4.abrupt("return", res.status(404).json({
            error: 'Vendor not found'
          }));

        case 9:
          _context4.next = 11;
          return regeneratorRuntime.awrap(logMasterEvent({
            username: getUsernameFromToken(req) || 'system',
            action: 'DELETE',
            masterType: 'Vendor',
            recordId: result.rows[0].vendor_no,
            recordName: result.rows[0].name,
            details: "Vendor deleted: ".concat(result.rows[0].name, " (").concat(result.rows[0].vendor_no, ")")
          }));

        case 11:
          res.json({
            success: true
          });
          _context4.next = 18;
          break;

        case 14:
          _context4.prev = 14;
          _context4.t0 = _context4["catch"](3);
          console.error('Error deleting vendor:', _context4.t0);
          res.status(500).json({
            error: 'Failed to delete vendor'
          });

        case 18:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[3, 14]]);
});
module.exports = router;