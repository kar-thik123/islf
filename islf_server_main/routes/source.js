const express = require('express');
const pool = require('../db');
const router = express.Router();
const { logMasterEvent } = require('../log');
const { getUsernameFromToken } = require('../utils/context-helper');

// 🔹 Enforce hierarchy: company → branch → department
function enforceHierarchy(companyCode, branchCode, departmentCode) {
  if (!companyCode && (branchCode || departmentCode)) {
    throw new Error('Branch/Department cannot be used without Company.');
  }
  if (!branchCode && departmentCode) {
    throw new Error('Department cannot be used without Branch.');
  }
}

// 🔹 Build WHERE clause dynamically
function buildWhereClause(filters) {
  const conditions = [];
  const values = [];
  let index = 1;
  console.log(filters);
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      conditions.push(`${key} = $${index}`);
      values.push(value);
      index++;
    }
  }

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    values
  };
}

// GET all sources
router.get('/', async (req, res) => {
  try {
    const { companyCode, branchCode, departmentCode } = req.query;
    enforceHierarchy(companyCode, branchCode, departmentCode);

    const filters = {
      company_code: companyCode,
      branch_code: branchCode,
      department_code: departmentCode
    };
    
    console.log("source filter:",filters)
    const { clause, values } = buildWhereClause(filters);

    const query = `
      SELECT *
      FROM sourcing
      ${clause}
      ORDER BY id ASC
    `;
    console.log("sourcing table query:", query,"source Value:",values);

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching source:', err);
    res.status(400).json({ error: err.message || 'Failed to fetch source' });
  }
});

// CREATE new source
router.post('/', async (req, res) => {
  const data = req.body;

  // 🔹 Convert empty strings → null
  const cleanData = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === '' ? null : v])
  );

  try {
    enforceHierarchy(cleanData.company_code, cleanData.branch_code, cleanData.department_code);

    // 🔹 Duplicate check
    const duplicateCheckQuery = `
      SELECT id, code FROM sourcing 
      WHERE mode = $1 
        AND (shipping_type = $2 OR (shipping_type IS NULL AND $2 IS NULL))
        AND (cargo_type = $3 OR (cargo_type IS NULL AND $3 IS NULL))
        AND (basis = $4 OR (basis IS NULL AND $4 IS NULL))
        AND (item_name = $5 OR (item_name IS NULL AND $5 IS NULL))
        AND (location_type_from = $6 OR (location_type_from IS NULL AND $6 IS NULL))
        AND (from_location = $7 OR (from_location IS NULL AND $7 IS NULL))
        AND (location_type_to = $8 OR (location_type_to IS NULL AND $8 IS NULL))
        AND (to_location = $9 OR (to_location IS NULL AND $9 IS NULL))
        AND (vendor_type = $10 OR (vendor_type IS NULL AND $10 IS NULL))
        AND (vendor_name = $11 OR (vendor_name IS NULL AND $11 IS NULL))
        AND (effective_date = $12 OR (effective_date IS NULL AND $12 IS NULL))
        AND (period_start_date = $13 OR (period_start_date IS NULL AND $13 IS NULL))
        AND (period_end_date = $14 OR (period_end_date IS NULL AND $14 IS NULL))
        AND (charges = $15 OR (charges IS NULL AND $15 IS NULL))
        AND (is_mandatory = $16 OR (is_mandatory IS NULL AND $16 IS NULL))
        AND company_code = $17
        AND (branch_code = $18 OR (branch_code IS NULL AND $18 IS NULL))
        AND (department_code = $19 OR (department_code IS NULL AND $19 IS NULL))
        AND (currency = $20 OR (currency IS NULL AND $20 IS NULL))
        AND (service_area = $21 OR (service_area IS NULL AND $21 IS NULL))
        AND (source_sales_code = $22 OR (source_sales_code IS NULL AND $22 IS NULL))
      LIMIT 1
    `;

    const duplicateResult = await pool.query(duplicateCheckQuery, [
      cleanData.mode, cleanData.shippingType, cleanData.cargoType, cleanData.basis,
      cleanData.itemName, cleanData.locationTypeFrom, cleanData.from,
      cleanData.locationTypeTo, cleanData.to, cleanData.vendorType, cleanData.vendorName, cleanData.effectiveDate,
      cleanData.periodStartDate, cleanData.periodEndDate, cleanData.charges,
      cleanData.isMandatory || false, cleanData.company_code, cleanData.branch_code, cleanData.department_code,cleanData.currency,cleanData.serviceArea,cleanData.sourceSalesCode
    ]);

    if (duplicateResult.rows.length > 0) {
      return res.status(400).json({
        error: 'Duplicate source found',
        message: `A source with the same combination of fields already exists (Code: ${duplicateResult.rows[0].code})`,
        duplicateCode: duplicateResult.rows[0].code
      });
    }

    let code = cleanData.code;
    let seriesCode;

    // 🔹 Number series lookup
    if ((!code || code === '') && cleanData.company_code) {
      let whereConditions = ['code_type = $1', 'company_code = $2'];
      let queryParams = ['sourceCode', cleanData.company_code];
      let paramIndex = 3;

      if (cleanData.branch_code) {
        whereConditions.push(`branch_code = $${paramIndex}`);
        queryParams.push(cleanData.branch_code);
        paramIndex++;
      } else {
        whereConditions.push('(branch_code IS NULL OR branch_code = \'\')');
      }

      if (cleanData.department_code) {
        whereConditions.push(`department_code = $${paramIndex}`);
        queryParams.push(cleanData.department_code);
      } else {
        whereConditions.push('(department_code IS NULL OR department_code = \'\')');
      }

      const mappingQuery = `
        SELECT mapping FROM mapping_relations
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY id DESC
        LIMIT 1
      `;

      const mappingRes = await pool.query(mappingQuery, queryParams);
      if (mappingRes.rows.length > 0) {
        seriesCode = mappingRes.rows[0].mapping;
      }
    }

    // 🔹 Generate source code
    if (seriesCode) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const seriesResult = await client.query(
          'SELECT * FROM number_series WHERE code = $1 ORDER BY id DESC LIMIT 1',
          [seriesCode]
        );

        if (seriesResult.rows.length === 0) {
          await client.query('ROLLBACK');
          client.release();
          return res.status(400).json({ error: 'Number series not found' });
        }

        const series = seriesResult.rows[0];
        if (series.is_manual) {
          if (!code || code.trim() === '') {
            await client.query('ROLLBACK');
            client.release();
            return res.status(400).json({ error: 'Manual code entry required for this series' });
          }
          const exists = await client.query('SELECT 1 FROM sourcing WHERE code = $1', [code]);
          if (exists.rows.length > 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(400).json({ error: 'Tariff code already exists' });
          }
        } else {
          const relResult = await client.query(
            'SELECT * FROM number_relation WHERE number_series = $1 ORDER BY id DESC LIMIT 1 FOR UPDATE',
            [seriesCode]
          );

          if (relResult.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(400).json({ error: 'Number series relation not found' });
          }

          const rel = relResult.rows[0];
          let nextNo = rel.last_no_used === 0
            ? Number(rel.starting_no)
            : Number(rel.last_no_used) + Number(rel.increment_by);

          code = `${rel.prefix || ''}${nextNo}`;

          await client.query(
            'UPDATE number_relation SET last_no_used = $1 WHERE id = $2',
            [nextNo, rel.id]
          );
        }

        await client.query('COMMIT');
        client.release();
      } catch (error) {
        await client.query('ROLLBACK');
        client.release();
        throw error;
      }
    } else if (!code || code === '') {
      code = 'SRC-' + Date.now();
    }
    const created_by = getUsernameFromToken(req);
    // 🔹 Insert new tariff
    const result = await pool.query(
      `INSERT INTO sourcing (
        code, mode, shipping_type, cargo_type, basis, item_name, location_type_from, location_type_to, from_location, to_location, vendor_type, vendor_name, currency,
        charges, effective_date, period_start_date, period_end_date, is_mandatory,
        company_code, branch_code, department_code,created_by,service_area,source_sales_code
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20, $21,$22,$23,$24
      ) RETURNING *`,
      [
        code, cleanData.mode, cleanData.shippingType, cleanData.cargoType,
        cleanData.basis, cleanData.itemName, 
        cleanData.locationTypeFrom, cleanData.locationTypeTo, cleanData.from, cleanData.to,
        cleanData.vendorType, cleanData.vendorName, cleanData.currency,
        cleanData.charges, cleanData.effectiveDate, cleanData.periodStartDate, cleanData.periodEndDate,
        cleanData.isMandatory || false, cleanData.company_code, cleanData.branch_code, cleanData.department_code,created_by,cleanData.serviceArea,cleanData.sourceSalesCode
      ]
    );

    await logMasterEvent({
      username: getUsernameFromToken(req),
      action: 'CREATE',
      masterType: 'Sourcing',
      recordId: code,
      details: `New Source "${code}" has been created successfully.`
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating source:', err);
    res.status(400).json({ error: err.message || 'Failed to create source' });
  }
});

// UPDATE tariff by ID
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const data = req.body;
  const cleanData = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === '' ? null : v])
  );

  try {
    const oldResult = await pool.query('SELECT * FROM sourcing WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const oldTariff = oldResult.rows[0];

    const result = await pool.query(
      `UPDATE sourcing SET
        code = $1, mode = $2, shipping_type = $3, cargo_type = $4, basis = $5, item_name = $6, location_type_from = $7, location_type_to = $8, from_location = $9, to_location = $10, vendor_type = $11, vendor_name = $12, currency = $13, charges = $14, effective_date = $15, period_start_date = $16, period_end_date = $17, is_mandatory = $18,service_area = $19,source_sales_code = $20
      WHERE id = $21 RETURNING *`,
      [
        cleanData.code, cleanData.mode, cleanData.shippingType, cleanData.cargoType, 
        cleanData.basis, cleanData.itemName, cleanData.locationTypeFrom, cleanData.locationTypeTo, cleanData.from, cleanData.to, cleanData.vendorType, cleanData.vendorName, cleanData.currency, cleanData.charges, cleanData.effectiveDate, cleanData.periodStartDate, cleanData.periodEndDate,cleanData.serviceArea,cleanData.sourceSalesCode,
        cleanData.isMandatory || false, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Source not found' });
    }

    const changedFields = [];
    const fieldMap = {
      code: { newVal: cleanData.code, db: 'code' },
      mode: { newVal: cleanData.mode, db: 'mode' },
      shipping_type: { newVal: cleanData.shippingType, db: 'shipping_type' },
      cargo_type: { newVal: cleanData.cargoType, db: 'cargo_type' },
      basis: { newVal: cleanData.basis, db: 'basis' },
      item_name: { newVal: cleanData.itemName, db: 'item_name' },
      currency: { newVal: cleanData.currency, db: 'currency' },
      location_type_from: { newVal: cleanData.locationTypeFrom, db: 'location_type_from' },
      location_type_to: { newVal: cleanData.locationTypeTo, db: 'location_type_to' },
      from_location: { newVal: cleanData.from, db: 'from_location' },
      to_location: { newVal: cleanData.to, db: 'to_location' },
      vendor_type: { newVal: cleanData.vendorType, db: 'vendor_type' },
      vendor_name: { newVal: cleanData.vendorName, db: 'vendor_name' },
      charges: { newVal: cleanData.charges, db: 'charges' },
      effective_date: { newVal: cleanData.effectiveDate, db: 'effective_date' },
      period_start_date: { newVal: cleanData.periodStartDate, db: 'period_start_date' },
      period_end_date: { newVal: cleanData.periodEndDate, db: 'period_end_date' },
      is_mandatory: { newVal: cleanData.isMandatory || false, db: 'is_mandatory' },
      service_area: { newVal: cleanData.serviceArea, db: 'service_area' },
      source_sales_code: { newVal: cleanData.sourceSalesCode, db: 'source_sales_code' },
    };

    const normalize = (value) => {
      if (value === null || value === undefined) return '';
      if (value instanceof Date) return value.toISOString();
      if (typeof value === 'number') return Number.isNaN(value) ? '' : String(value);
      return String(value).trim();
    };

    for (const label in fieldMap) {
      const mapping = fieldMap[label];
      const newValue = normalize(mapping.newVal);
      const oldValue = normalize(oldTariff[mapping.db]);
      if (newValue !== oldValue) {
        changedFields.push(`Field "${label}" changed from "${oldValue}" to "${newValue}".`);
      }
    }

    const details = changedFields.length > 0
      ? `Changes detected:\n` + changedFields.join('\n')
      : 'No actual changes detected.';

    await logMasterEvent({
      username: getUsernameFromToken(req),
      action: 'UPDATE',
      masterType: 'Source',
      recordId: cleanData.code,
      details
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating source:', err);
    res.status(500).json({ error: 'Failed to update source' });
  }
});

module.exports = router;
