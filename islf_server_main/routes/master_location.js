const express = require('express');
const pool = require('../db');
const { logMasterEvent } = require('../log'); 
const router = express.Router();
const {getUsernameFromToken} = require('../utils/context-helper');

// Get all master locations
router.get('/', async (req, res) => {
  try {
    const { companyCode, branchCode, departmentCode } = req.query;

    let query = `
      SELECT *
      FROM master_location
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Hierarchical filtering
    if (companyCode) {
      query += ` AND company_code = $${paramIndex}`;
      params.push(companyCode);
      paramIndex++;

      if (branchCode) {
        query += ` AND branch_code = $${paramIndex}`;
        params.push(branchCode);
        paramIndex++;

        if (departmentCode) {
          query += ` AND department_code = $${paramIndex}`;
          params.push(departmentCode);
          paramIndex++;
        }
      }
    }

    query += ` ORDER BY code ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching master locations:', err);
    res.status(500).json({ error: 'Failed to fetch master locations' });
  }
});

// Create master location
router.post('/', async (req, res) => {
  const { type, code, name, country, state, city, gst_state_code, pin_code, active,company_code,branch_code,department_code } = req.body;

  try {
    const created_by = getUsernameFromToken(req);
    const result = await pool.query(
      'INSERT INTO master_location (type, code, name, country, state, city, gst_state_code, pin_code, active,company_code,branch_code,department_code,created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10,$11,$12,$13) RETURNING *',
      [type, code, name, country, state, city, gst_state_code, pin_code, active,company_code,branch_code,department_code,created_by]
    );
    // Log the master event
    await logMasterEvent({
      username: getUsernameFromToken(req),
      action: 'CREATE',
      masterType: 'Master Location',
      recordId: code,
      details: `New MasterLocation "${code}" has been created successfully.`
    });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    
    // Handle specific database constraint errors
    if (err.code === '23505' && err.constraint === 'master_location_code_key') {
      res.status(400).json({ 
        error: 'Duplicate code', 
        detail: `Location code "${code}" already exists. Please use a different code.`,
        code: code 
      });
    } else if (err.code === '23505') {
      res.status(400).json({ 
        error: 'Duplicate entry', 
        detail: `A location with this information already exists.`,
        code: code 
      });
    } else {
      res.status(500).json({ error: 'Failed to create master location' });
    }
  }
});

// Update master location
router.put('/:code', async (req, res) => {
  const { type, name, country, state, city, gst_state_code, pin_code, active } = req.body;
  try {
    const oldResult = await pool.query('SELECT * FROM master_location WHERE code = $1', [req.params.code]);
    if (oldResult.rows.length === 0) return res.status(404).json({ error: 'Location not found' });
    const oldLocation = oldResult.rows[0];
    const result = await pool.query(
      'UPDATE master_location SET type = $1, name = $2, country = $3, state = $4, city = $5, gst_state_code = $6, pin_code = $7, active = $8 WHERE code = $9 RETURNING *',
      [type, name, country, state, city, gst_state_code, pin_code, active, req.params.code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Location not found' });
    const changedFields = [];
    const fieldsToCheck = {
      type, name, country, state, city, gst_state_code, pin_code, active
    };
    const normalize = (value) => {
      if (value === null || value === undefined) return '';
      return value.toString().trim();
    };
    for (const field in fieldsToCheck) {
      const newValue = normalize(fieldsToCheck[field]);
      const oldValue = normalize(oldLocation[field]);
      const valuesAreEqual = newValue === oldValue;
      if (!valuesAreEqual) {
        changedFields.push(`Field "${field}" changed from "${oldValue}" to "${newValue}".`);
      }
    }
    const details = changedFields.length > 0
      ? `Changes detected in the\n` + changedFields.join('\n')
      : 'No actual changes detected.';
    // Log the master event
    await logMasterEvent({
      username: getUsernameFromToken(req),
      action: 'UPDATE',
      masterType: 'Master Location',
      recordId: req.params.code,
      details
    });
    res.json(result.rows[0]);
  } catch (err) {
    
    // Handle specific database constraint errors
    if (err.code === '23505' && err.constraint === 'master_location_code_key') {
      res.status(400).json({ 
        error: 'Duplicate code', 
        detail: `Location code "${req.params.code}" already exists. Please use a different code.`,
        code: req.params.code 
      });
    } else if (err.code === '23505') {
      res.status(400).json({ 
        error: 'Duplicate entry', 
        detail: `A location with this information already exists.`,
        code: req.params.code 
      });
    } else {
      res.status(500).json({ msg: 'Failed to update master location', error: err.msg  });
    }
  }
});

// Delete master location
router.delete('/:code', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM master_location WHERE code = $1 RETURNING *', [req.params.code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    // Log the master event
    await logMasterEvent({
      username: getUsernameFromToken(req),
      action: 'DELETE',
      masterType: 'Master Location',
      recordId: result.rows[0].code,
      details: `MasterLocation "${result.rows[0].code}" has been deleted successfully.`
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete master location' });
  }
});
module.exports = router;