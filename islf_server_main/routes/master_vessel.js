const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET all vessels with optional context filtering
router.get('/', async (req, res) => {
  try {
    const { companyCode, branchCode, departmentCode, serviceTypeCode } = req.query;
    
    // If context parameters are provided, filter vessels by their context
    if (companyCode || branchCode || departmentCode || serviceTypeCode) {
      // Filter vessels by their stored context values
      let query = `
        SELECT *
        FROM master_vessel
        WHERE 1=1
      `;
      
      const params = [];
      let paramIndex = 1;
      
      if (companyCode) {
        query += ` AND company_code = $${paramIndex}`;
        params.push(companyCode);
        paramIndex++;
      }
      
      if (branchCode) {
        query += ` AND branch_code = $${paramIndex}`;
        params.push(branchCode);
        paramIndex++;
      }
      
      if (departmentCode) {
        query += ` AND department_code = $${paramIndex}`;
        params.push(departmentCode);
        paramIndex++;
      }
      
      // Note: service_type_code column doesn't exist in master_vessel table
      // if (serviceTypeCode) {
      //   query += ` AND service_type_code = $${paramIndex}`;
      //   params.push(serviceTypeCode);
      //   paramIndex++;
      // }
      
      query += ` ORDER BY id ASC`;
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } else {
      // If no context parameters, return all vessels
      const result = await pool.query('SELECT * FROM master_vessel ORDER BY id ASC');
      res.json(result.rows);
    }
  } catch (err) {
    console.error('Error fetching vessels:', err);
    res.status(500).json({ error: 'Failed to fetch vessels' });
  }
});

// CREATE new vessel (with number series logic and manual/default check)
router.post('/', async (req, res) => {
  let { seriesCode, code, vessel_name, imo_number, flag, year_build, active, companyCode, branchCode, departmentCode, ServiceTypeCode } = req.body;
  try {
    // Relation-based number series lookup
    if (!seriesCode && companyCode && branchCode && departmentCode) {
      const mappingRes = await pool.query(
        `SELECT mapping FROM mapping_relations WHERE code_type = 'vesselCode' AND company_code = $1 AND branch_code = $2 AND department_code = $3 LIMIT 1`,
        [companyCode, branchCode, departmentCode]
      );
      if (mappingRes.rows.length > 0) {
        seriesCode = mappingRes.rows[0].mapping;
      }
    }
    if (seriesCode && companyCode && branchCode && departmentCode) {
      // 1. Get the number series for the selected code
      const seriesResult = await pool.query(
        'SELECT * FROM number_series WHERE code = $1 ORDER BY id DESC LIMIT 1',
        [seriesCode]
      );
      if (seriesResult.rows.length === 0) {
        return res.status(400).json({ error: 'Number series not found' });
      }
      const series = seriesResult.rows[0];
      if (series.is_manual) {
        // Manual: require code from user
        if (!code || code.trim() === '') {
          return res.status(400).json({ error: 'Manual code entry required for this series' });
        }
        // Check for duplicate code
        const exists = await pool.query('SELECT 1 FROM master_vessel WHERE code = $1', [code]);
        if (exists.rows.length > 0) {
          return res.status(400).json({ error: 'Vessel code already exists' });
        }
      } else {
        // Not manual: generate code using relation
        const relResult = await pool.query(
          'SELECT * FROM number_relation WHERE number_series = $1 ORDER BY id DESC LIMIT 1',
          [seriesCode]
        );
        if (relResult.rows.length === 0) {
          return res.status(400).json({ error: 'Number series relation not found' });
        }
        const rel = relResult.rows[0];
        const nextNo = Number(rel.last_no_used) + Number(rel.increment_by);
        code = `${rel.prefix || ''}${nextNo}`;
        await pool.query(
          'UPDATE number_relation SET last_no_used = $1 WHERE id = $2',
          [nextNo, rel.id]
        );
      }
    } else if (!code || code === 'AUTO') {
      // Fallback: generate code as VESSEL-<timestamp>
      code = 'VESSEL-' + Date.now();
    }
    // Check for duplicate IMO number if provided
    if (imo_number && imo_number.trim() !== '') {
      const imoExists = await pool.query('SELECT 1 FROM master_vessel WHERE imo_number = $1', [imo_number]);
      if (imoExists.rows.length > 0) {
        return res.status(400).json({ error: 'IMO number already exists' });
      }
    }
    // 4. Insert the new vessel
    const result = await pool.query(
      `INSERT INTO master_vessel (code, vessel_name, imo_number, flag, year_build, active, company_code, branch_code, department_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [code, vessel_name, imo_number, flag, year_build, active, companyCode, branchCode, departmentCode]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating vessel:', err);
    res.status(500).json({ error: 'Failed to create vessel' });
  }
});

// UPDATE vessel by ID
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  const { code, vessel_name, imo_number, flag, year_build, active } = req.body;
  try {
    // Check for duplicate code excluding current record
    const codeExists = await pool.query('SELECT 1 FROM master_vessel WHERE code = $1 AND id != $2', [code, id]);
    if (codeExists.rows.length > 0) {
      return res.status(400).json({ error: 'Vessel code already exists' });
    }
    
    // Check for duplicate IMO number excluding current record
    if (imo_number && imo_number.trim() !== '') {
      const imoExists = await pool.query('SELECT 1 FROM master_vessel WHERE imo_number = $1 AND id != $2', [imo_number, id]);
      if (imoExists.rows.length > 0) {
        return res.status(400).json({ error: 'IMO number already exists' });
      }
    }
    
    const result = await pool.query(
      `UPDATE master_vessel
       SET code = $1, vessel_name = $2, imo_number = $3, flag = $4, year_build = $5, active = $6, company_code = $7, branch_code = $8, department_code = $9
       WHERE id = $10
       RETURNING *`,
      [code, vessel_name, imo_number, flag, year_build, active, companyCode, branchCode, departmentCode, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating vessel:', err);
    res.status(500).json({ error: 'Failed to update vessel' });
  }
});

// DELETE vessel by ID
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  try {
    const result = await pool.query(
      `DELETE FROM master_vessel
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting vessel:', err);
    res.status(500).json({ error: 'Failed to delete vessel' });
  }
});

module.exports = router;