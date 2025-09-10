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
} // GET all tariffs


router.get('/', function _callee(req, res) {
  var _req$query, companyCode, branchCode, departmentCode, query, params, paramIndex, result;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$query = req.query, companyCode = _req$query.companyCode, branchCode = _req$query.branchCode, departmentCode = _req$query.departmentCode;
          query = "\n      SELECT *\n      FROM tariff\n      WHERE 1=1\n    ";
          params = [];
          paramIndex = 1;

          if (companyCode) {
            query += " AND company_code = $".concat(paramIndex);
            params.push(companyCode);
            paramIndex++; // Only filter by branch if branch is provided

            if (branchCode) {
              query += " AND branch_code = $".concat(paramIndex);
              params.push(branchCode);
              paramIndex++; // Only filter by department if department is provided

              if (departmentCode) {
                query += " AND department_code = $".concat(paramIndex);
                params.push(departmentCode);
                paramIndex++;
              }
            }
          }

          query += " ORDER BY id ASC";
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
          console.error('Error fetching tariffs:', _context.t0);
          res.status(500).json({
            error: 'Failed to fetch tariffs'
          });

        case 17:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 13]]);
}); // CREATE new tariff

router.post('/', function _callee2(req, res) {
  var _req$body, code, mode, shippingType, cargoType, tariffType, basis, containerType, itemName, currency, locationTypeFrom, locationTypeTo, from, to, vendorType, vendorName, charges, freightChargeType, effectiveDate, periodStartDate, periodEndDate, isMandatory, company_code, branch_code, department_code, cleanShippingType, cleanCargoType, cleanTariffType, cleanBasis, cleanContainerType, cleanItemName, cleanCurrency, cleanFrom, cleanTo, cleanVendorType, cleanVendorName, cleanCharges, cleanFreightChargeType, cleanEffectiveDate, cleanPeriodStartDate, cleanPeriodEndDate, cleanLocationTypeFrom, cleanLocationTypeTo, duplicateCheckQuery, duplicateResult, _code, seriesCode, whereConditions, queryParams, paramIndex, mappingQuery, mappingRes, client, seriesResult, series, exists, relResult, rel, nextNo, result;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$body = req.body, code = _req$body.code, mode = _req$body.mode, shippingType = _req$body.shippingType, cargoType = _req$body.cargoType, tariffType = _req$body.tariffType, basis = _req$body.basis, containerType = _req$body.containerType, itemName = _req$body.itemName, currency = _req$body.currency, locationTypeFrom = _req$body.locationTypeFrom, locationTypeTo = _req$body.locationTypeTo, from = _req$body.from, to = _req$body.to, vendorType = _req$body.vendorType, vendorName = _req$body.vendorName, charges = _req$body.charges, freightChargeType = _req$body.freightChargeType, effectiveDate = _req$body.effectiveDate, periodStartDate = _req$body.periodStartDate, periodEndDate = _req$body.periodEndDate, isMandatory = _req$body.isMandatory, company_code = _req$body.company_code, branch_code = _req$body.branch_code, department_code = _req$body.department_code; // Convert empty strings to null for optional fields

          cleanShippingType = shippingType === '' ? null : shippingType;
          cleanCargoType = cargoType === '' ? null : cargoType;
          cleanTariffType = tariffType === '' ? null : tariffType;
          cleanBasis = basis === '' ? null : basis;
          cleanContainerType = containerType === '' ? null : containerType;
          cleanItemName = itemName === '' ? null : itemName;
          cleanCurrency = currency === '' ? null : currency;
          cleanFrom = from === '' ? null : from;
          cleanTo = to === '' ? null : to;
          cleanVendorType = vendorType === '' ? null : vendorType;
          cleanVendorName = vendorName === '' ? null : vendorName;
          cleanCharges = charges === '' || charges === null ? null : parseFloat(charges);
          cleanFreightChargeType = freightChargeType === '' ? null : freightChargeType;
          cleanEffectiveDate = effectiveDate === '' ? null : effectiveDate;
          cleanPeriodStartDate = periodStartDate === '' ? null : periodStartDate;
          cleanPeriodEndDate = periodEndDate === '' ? null : periodEndDate;
          cleanLocationTypeFrom = locationTypeFrom === '' ? null : locationTypeFrom;
          cleanLocationTypeTo = locationTypeTo === '' ? null : locationTypeTo;
          _context2.prev = 19;
          // **ADD DUPLICATE CHECKING HERE**
          // Check for duplicate tariff based on key business fields
          duplicateCheckQuery = "\n      SELECT id, code FROM tariff \n      WHERE mode = $1 \n        AND (shipping_type = $2 OR (shipping_type IS NULL AND $2 IS NULL))\n        AND (cargo_type = $3 OR (cargo_type IS NULL AND $3 IS NULL))\n        AND (tariff_type = $4 OR (tariff_type IS NULL AND $4 IS NULL))\n        AND (basis = $5 OR (basis IS NULL AND $5 IS NULL))\n        AND (container_type = $6 OR (container_type IS NULL AND $6 IS NULL))\n        AND (item_name = $7 OR (item_name IS NULL AND $7 IS NULL))\n        AND (currency = $8 OR (currency IS NULL AND $8 IS NULL))\n        AND (location_type_from = $9 OR (location_type_from IS NULL AND $9 IS NULL))\n        AND (from_location = $10 OR (from_location IS NULL AND $10 IS NULL))\n        AND (location_type_to = $11 OR (location_type_to IS NULL AND $11 IS NULL))\n        AND (to_location = $12 OR (to_location IS NULL AND $12 IS NULL))\n        AND (vendor_type = $13 OR (vendor_type IS NULL AND $13 IS NULL))\n        AND (vendor_name = $14 OR (vendor_name IS NULL AND $14 IS NULL))\n        AND (effective_date = $15 OR (effective_date IS NULL AND $15 IS NULL))\n        AND (period_start_date = $16 OR (period_start_date IS NULL AND $16 IS NULL))\n        AND (period_end_date = $17 OR (period_end_date IS NULL AND $17 IS NULL))\n        AND (charges = $18 OR (charges IS NULL AND $18 IS NULL))\n        AND (freight_charge_type = $19 OR (freight_charge_type IS NULL AND $19 IS NULL))\n        AND (is_mandatory = $20 OR (is_mandatory IS NULL AND $20 IS NULL))\n        AND company_code = $21\n        AND (branch_code = $22 OR (branch_code IS NULL AND $22 IS NULL))\n        AND (department_code = $23 OR (department_code IS NULL AND $23 IS NULL))\n      LIMIT 1\n    ";
          _context2.next = 23;
          return regeneratorRuntime.awrap(pool.query(duplicateCheckQuery, [mode, cleanShippingType, cleanCargoType, cleanTariffType, cleanBasis, cleanContainerType, cleanItemName, cleanCurrency, cleanLocationTypeFrom, cleanFrom, cleanLocationTypeTo, cleanTo, cleanVendorType, cleanVendorName, cleanEffectiveDate, cleanPeriodStartDate, cleanPeriodEndDate, cleanCharges, cleanFreightChargeType, isMandatory || false, company_code, branch_code, department_code]));

        case 23:
          duplicateResult = _context2.sent;

          if (!(duplicateResult.rows.length > 0)) {
            _context2.next = 26;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            error: 'Duplicate tariff found',
            message: "A tariff with the same combination of fields already exists (Code: ".concat(duplicateResult.rows[0].code, ")"),
            duplicateCode: duplicateResult.rows[0].code
          }));

        case 26:
          _code = _code;

          if (!((!_code || _code === '') && company_code)) {
            _context2.next = 39;
            break;
          }

          // Build dynamic query based on available context
          whereConditions = ['code_type = $1', 'company_code = $2'];
          queryParams = ['tariffCode', company_code];
          paramIndex = 3;

          if (branch_code) {
            whereConditions.push("branch_code = $".concat(paramIndex));
            queryParams.push(branch_code);
            paramIndex++;
          } else {
            whereConditions.push('(branch_code IS NULL OR branch_code = \'\')');
          }

          if (department_code) {
            whereConditions.push("department_code = $".concat(paramIndex));
            queryParams.push(department_code);
          } else {
            whereConditions.push('(department_code IS NULL OR department_code = \'\')');
          }

          mappingQuery = "SELECT mapping FROM mapping_relations\n                       WHERE ".concat(whereConditions.join(' AND '), "\n                       ORDER BY id DESC\n                       LIMIT 1");
          _context2.next = 36;
          return regeneratorRuntime.awrap(pool.query(mappingQuery, queryParams));

        case 36:
          mappingRes = _context2.sent;
          console.log('TARIFF MAPPING RESULT:', mappingRes.rows);

          if (mappingRes.rows.length > 0) {
            seriesCode = mappingRes.rows[0].mapping;
            console.log('TARIFF SERIES CODE FROM MAPPING:', seriesCode);
          }

        case 39:
          if (!seriesCode) {
            _context2.next = 100;
            break;
          }

          _context2.next = 42;
          return regeneratorRuntime.awrap(pool.connect());

        case 42:
          client = _context2.sent;
          _context2.prev = 43;
          _context2.next = 46;
          return regeneratorRuntime.awrap(client.query('BEGIN'));

        case 46:
          _context2.next = 48;
          return regeneratorRuntime.awrap(client.query('SELECT * FROM number_series WHERE code = $1 ORDER BY id DESC LIMIT 1', [seriesCode]));

        case 48:
          seriesResult = _context2.sent;
          console.log('TARIFF NUMBER SERIES RESULT:', seriesResult.rows);

          if (!(seriesResult.rows.length === 0)) {
            _context2.next = 55;
            break;
          }

          _context2.next = 53;
          return regeneratorRuntime.awrap(client.query('ROLLBACK'));

        case 53:
          client.release();
          return _context2.abrupt("return", res.status(400).json({
            error: 'Number series not found'
          }));

        case 55:
          series = seriesResult.rows[0];

          if (!series.is_manual) {
            _context2.next = 72;
            break;
          }

          if (!(!_code || _code.trim() === '')) {
            _context2.next = 62;
            break;
          }

          _context2.next = 60;
          return regeneratorRuntime.awrap(client.query('ROLLBACK'));

        case 60:
          client.release();
          return _context2.abrupt("return", res.status(400).json({
            error: 'Manual code entry required for this series'
          }));

        case 62:
          _context2.next = 64;
          return regeneratorRuntime.awrap(client.query('SELECT 1 FROM tariff WHERE code = $1', [_code]));

        case 64:
          exists = _context2.sent;

          if (!(exists.rows.length > 0)) {
            _context2.next = 70;
            break;
          }

          _context2.next = 68;
          return regeneratorRuntime.awrap(client.query('ROLLBACK'));

        case 68:
          client.release();
          return _context2.abrupt("return", res.status(400).json({
            error: 'Tariff code already exists'
          }));

        case 70:
          _context2.next = 87;
          break;

        case 72:
          _context2.next = 74;
          return regeneratorRuntime.awrap(client.query('SELECT * FROM number_relation WHERE number_series = $1 ORDER BY id DESC LIMIT 1 FOR UPDATE', [seriesCode]));

        case 74:
          relResult = _context2.sent;
          console.log('TARIFF NUMBER RELATION RESULT:', relResult.rows);

          if (!(relResult.rows.length === 0)) {
            _context2.next = 81;
            break;
          }

          _context2.next = 79;
          return regeneratorRuntime.awrap(client.query('ROLLBACK'));

        case 79:
          client.release();
          return _context2.abrupt("return", res.status(400).json({
            error: 'Number series relation not found'
          }));

        case 81:
          rel = relResult.rows[0];

          if (rel.last_no_used === 0) {
            nextNo = Number(rel.starting_no);
          } else {
            nextNo = Number(rel.last_no_used) + Number(rel.increment_by);
          }

          _code = "".concat(rel.prefix || '').concat(nextNo);
          console.log('Generated tariff code:', _code); // Update the last_no_used within the same transaction

          _context2.next = 87;
          return regeneratorRuntime.awrap(client.query('UPDATE number_relation SET last_no_used = $1 WHERE id = $2', [nextNo, rel.id]));

        case 87:
          _context2.next = 89;
          return regeneratorRuntime.awrap(client.query('COMMIT'));

        case 89:
          client.release();
          _context2.next = 98;
          break;

        case 92:
          _context2.prev = 92;
          _context2.t0 = _context2["catch"](43);
          _context2.next = 96;
          return regeneratorRuntime.awrap(client.query('ROLLBACK'));

        case 96:
          client.release();
          throw _context2.t0;

        case 98:
          _context2.next = 101;
          break;

        case 100:
          if (!_code || _code === '') {
            // Fallback if no series found
            _code = 'TAR-' + Date.now();
          }

        case 101:
          _context2.next = 103;
          return regeneratorRuntime.awrap(pool.query("INSERT INTO tariff (\n        code, mode, shipping_type, cargo_type, tariff_type, basis, container_type, item_name, currency,\n        location_type_from, location_type_to, from_location, to_location, vendor_type, vendor_name, \n        charges, freight_charge_type, effective_date, period_start_date, period_end_date, is_mandatory,\n        company_code, branch_code, department_code\n      ) VALUES (\n        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24\n      ) RETURNING *", [_code, mode, cleanShippingType, cleanCargoType, cleanTariffType, cleanBasis, cleanContainerType, cleanItemName, cleanCurrency, cleanLocationTypeFrom, cleanLocationTypeTo, cleanFrom, cleanTo, cleanVendorType, cleanVendorName, cleanCharges, cleanFreightChargeType, cleanEffectiveDate, cleanPeriodStartDate, cleanPeriodEndDate, isMandatory || false, company_code, branch_code, department_code]));

        case 103:
          result = _context2.sent;
          _context2.next = 106;
          return regeneratorRuntime.awrap(logMasterEvent({
            username: getUsernameFromToken(req),
            action: 'CREATE',
            masterType: 'Tariff',
            recordId: _code,
            details: "New Tariff \"".concat(_code, "\" has been created successfully.")
          }));

        case 106:
          res.status(201).json(result.rows[0]);
          _context2.next = 113;
          break;

        case 109:
          _context2.prev = 109;
          _context2.t1 = _context2["catch"](19);
          console.error('Error creating tariff:', _context2.t1);
          res.status(500).json({
            error: 'Failed to create tariff'
          });

        case 113:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[19, 109], [43, 92]]);
}); // UPDATE tariff by ID

router.put('/:id', function _callee3(req, res) {
  var id, _req$body2, code, mode, shippingType, cargoType, tariffType, basis, containerType, itemName, currency, locationTypeFrom, locationTypeTo, from, to, vendorType, vendorName, charges, freightChargeType, effectiveDate, periodStartDate, periodEndDate, isMandatory, cleanShippingType, cleanCargoType, cleanTariffType, cleanBasis, cleanContainerType, cleanItemName, cleanCurrency, cleanLocationTypeFrom, cleanLocationTypeTo, cleanFrom, cleanTo, cleanVendorType, cleanVendorName, cleanCharges, cleanFreightChargeType, cleanEffectiveDate, cleanPeriodStartDate, cleanPeriodEndDate, oldResult, oldTariff, result, changedFields, fieldMap, normalize, label, mapping, newRaw, oldRaw, newValue, oldValue, details;

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
          _req$body2 = req.body, code = _req$body2.code, mode = _req$body2.mode, shippingType = _req$body2.shippingType, cargoType = _req$body2.cargoType, tariffType = _req$body2.tariffType, basis = _req$body2.basis, containerType = _req$body2.containerType, itemName = _req$body2.itemName, currency = _req$body2.currency, locationTypeFrom = _req$body2.locationTypeFrom, locationTypeTo = _req$body2.locationTypeTo, from = _req$body2.from, to = _req$body2.to, vendorType = _req$body2.vendorType, vendorName = _req$body2.vendorName, charges = _req$body2.charges, freightChargeType = _req$body2.freightChargeType, effectiveDate = _req$body2.effectiveDate, periodStartDate = _req$body2.periodStartDate, periodEndDate = _req$body2.periodEndDate, isMandatory = _req$body2.isMandatory; // Convert empty strings to null for optional fields

          cleanShippingType = shippingType === '' ? null : shippingType;
          cleanCargoType = cargoType === '' ? null : cargoType;
          cleanTariffType = tariffType === '' ? null : tariffType;
          cleanBasis = basis === '' ? null : basis;
          cleanContainerType = containerType === '' ? null : containerType;
          cleanItemName = itemName === '' ? null : itemName;
          cleanCurrency = currency === '' ? null : currency;
          cleanLocationTypeFrom = locationTypeFrom === '' ? null : locationTypeFrom;
          cleanLocationTypeTo = locationTypeTo === '' ? null : locationTypeTo;
          cleanFrom = from === '' ? null : from;
          cleanTo = to === '' ? null : to;
          cleanVendorType = vendorType === '' ? null : vendorType;
          cleanVendorName = vendorName === '' ? null : vendorName;
          cleanCharges = charges === '' || charges === null ? null : parseFloat(charges);
          cleanFreightChargeType = freightChargeType === '' ? null : freightChargeType;
          cleanEffectiveDate = effectiveDate === '' ? null : effectiveDate;
          cleanPeriodStartDate = periodStartDate === '' ? null : periodStartDate;
          cleanPeriodEndDate = periodEndDate === '' ? null : periodEndDate;
          _context3.prev = 22;
          _context3.next = 25;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM tariff WHERE id = $1', [id]));

        case 25:
          oldResult = _context3.sent;

          if (!(oldResult.rows.length === 0)) {
            _context3.next = 28;
            break;
          }

          return _context3.abrupt("return", res.status(404).json({
            error: 'Not found'
          }));

        case 28:
          oldTariff = oldResult.rows[0];
          _context3.next = 31;
          return regeneratorRuntime.awrap(pool.query("UPDATE tariff SET\n        code = $1, mode = $2, shipping_type = $3, cargo_type = $4, tariff_type = $5, basis = $6, container_type = $7, item_name = $8, currency = $9,\n        location_type_from = $10, location_type_to = $11, from_location = $12, to_location = $13, vendor_type = $14, vendor_name = $15, charges = $16, freight_charge_type = $17, effective_date = $18, period_start_date = $19, period_end_date = $20, is_mandatory = $21\n      WHERE id = $22 RETURNING *", [code, mode, cleanShippingType, cleanCargoType, cleanTariffType, cleanBasis, cleanContainerType, cleanItemName, cleanCurrency, cleanLocationTypeFrom, cleanLocationTypeTo, cleanFrom, cleanTo, cleanVendorType, cleanVendorName, cleanCharges, cleanFreightChargeType, cleanEffectiveDate, cleanPeriodStartDate, cleanPeriodEndDate, isMandatory || false, id]));

        case 31:
          result = _context3.sent;

          if (!(result.rows.length === 0)) {
            _context3.next = 34;
            break;
          }

          return _context3.abrupt("return", res.status(404).json({
            error: 'Tariff not found'
          }));

        case 34:
          changedFields = [];
          fieldMap = {
            code: {
              newVal: code,
              db: 'code'
            },
            mode: {
              newVal: mode,
              db: 'mode'
            },
            shipping_type: {
              newVal: cleanShippingType,
              db: 'shipping_type'
            },
            cargo_type: {
              newVal: cleanCargoType,
              db: 'cargo_type'
            },
            tariff_type: {
              newVal: cleanTariffType,
              db: 'tariff_type'
            },
            basis: {
              newVal: cleanBasis,
              db: 'basis'
            },
            container_type: {
              newVal: cleanContainerType,
              db: 'container_type'
            },
            item_name: {
              newVal: cleanItemName,
              db: 'item_name'
            },
            currency: {
              newVal: cleanCurrency,
              db: 'currency'
            },
            location_type_from: {
              newVal: cleanLocationTypeFrom,
              db: 'location_type_from'
            },
            location_type_to: {
              newVal: cleanLocationTypeTo,
              db: 'location_type_to'
            },
            from_location: {
              newVal: cleanFrom,
              db: 'from_location'
            },
            to_location: {
              newVal: cleanTo,
              db: 'to_location'
            },
            vendor_type: {
              newVal: cleanVendorType,
              db: 'vendor_type'
            },
            vendor_name: {
              newVal: cleanVendorName,
              db: 'vendor_name'
            },
            charges: {
              newVal: cleanCharges,
              db: 'charges'
            },
            freight_charge_type: {
              newVal: cleanFreightChargeType,
              db: 'freight_charge_type'
            },
            effective_date: {
              newVal: cleanEffectiveDate,
              db: 'effective_date'
            },
            period_start_date: {
              newVal: cleanPeriodStartDate,
              db: 'period_start_date'
            },
            period_end_date: {
              newVal: cleanPeriodEndDate,
              db: 'period_end_date'
            },
            is_mandatory: {
              newVal: isMandatory || false,
              db: 'is_mandatory'
            }
          };

          normalize = function normalize(value) {
            if (value === null || value === undefined) return '';
            if (value instanceof Date) return value.toISOString();
            if (typeof value === 'number') return Number.isNaN(value) ? '' : String(value);
            return String(value).trim();
          };

          for (label in fieldMap) {
            mapping = fieldMap[label];
            newRaw = mapping.newVal;
            oldRaw = oldTariff[mapping.db];
            newValue = normalize(newRaw);
            oldValue = normalize(oldRaw);

            if (newValue !== oldValue) {
              changedFields.push("Field \"".concat(label, "\" changed from \"").concat(oldValue, "\" to \"").concat(newValue, "\"."));
            }
          }

          details = changedFields.length > 0 ? "Changes detected in the\n" + changedFields.join('\n') : 'No actual changes detected.'; // Log the master event

          _context3.next = 41;
          return regeneratorRuntime.awrap(logMasterEvent({
            username: getUsernameFromToken(req),
            action: 'UPDATE',
            masterType: 'Tariff',
            recordId: code,
            details: details
          }));

        case 41:
          res.json(result.rows[0]);
          _context3.next = 48;
          break;

        case 44:
          _context3.prev = 44;
          _context3.t0 = _context3["catch"](22);
          console.error('Error updating tariff:', _context3.t0);
          res.status(500).json({
            error: 'Failed to update tariff'
          });

        case 48:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[22, 44]]);
});
module.exports = router;