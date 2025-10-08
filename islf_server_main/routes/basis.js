const express = require('express');
const pool = require('../db');
const router = express.Router();
const { logMasterEvent } = require('../log');
const { getUsernameFromToken } = require('../utils/context-helper');



// Get all basis codes with optional context filtering
router.get('/', async (req, res) => {
  try {
    const { companyCode, branchCode, departmentCode } = req.query;
    
    // If context parameters are provided, filter by their context
    if (companyCode || branchCode || departmentCode) {
      let query = `
        SELECT *
        FROM basis
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
      
      query += ` ORDER BY code ASC`;
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } else {
      // If no context filtering, return all basis codes
      const result = await pool.query('SELECT * FROM basis ORDER BY code ASC');
      res.json(result.rows);
    }
  } catch (err) {
    console.error('Error fetching basis codes:', err);
    res.status(500).json({ error: 'Failed to fetch basis codes' });
  }
});

// GET single basis code by code
router.get('/:code', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM basis WHERE code = $1', [req.params.code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch basis code' });
  }
});

// CREATE new basis code
router.post('/', async (req, res) => {
  const created_by= getUsernameFromToken(req);
  const { code, description, status, company_code, branch_code, department_code } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO basis (code, description, status, company_code, branch_code, department_code, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [code, description, status || 'Active', company_code, branch_code, department_code, created_by]
    );
    // Log the master event
    await logMasterEvent({
      username: getUsernameFromToken(req),
      action: 'CREATE',
      masterType: 'Basis',
      recordId: code,
      details: `New Basis Code "${code}" has been created successfully.`
    });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating basis code:', err);
    res.status(500).json({ error: 'Failed to create basis code' });
  }
});

// UPDATE basis code
router.put('/:code', async (req, res) => {
  const { description, status } = req.body;
  const code = req.params.code;
  try {
    const oldResult = await pool.query('SELECT * FROM basis WHERE code = $1', [req.params.code]);
    if (oldResult.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const oldBasis = oldResult.rows[0];
    const result = await pool.query(
      'UPDATE basis SET description = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE code = $3 RETURNING *',
      [description, status, req.params.code]
    );
    const changedFields = [];
    const fieldsToCheck = {
      description, status
    };
    const normalize = (value) => {
      if (value === null || value === undefined) return '';
      return value.toString().trim();
    };
    for (const field in fieldsToCheck) {
      const newValue = normalize(fieldsToCheck[field]);
      const oldValue = normalize(oldBasis[field]);
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
      masterType: 'Basis',
      recordId: code,
      details
    });
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update basis code' });
  }
});

// DELETE basis code
router.delete('/:code', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM basis WHERE code = $1 RETURNING *', [req.params.code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    // Log the master event
    await logMasterEvent({
      username: getUsernameFromToken(req),
      action: 'DELETE',
      masterType: 'Basis',
      recordId: req.params.code,
      details: `Basis Code "${req.params.code}" has been deleted successfully.`
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete basis code' });
  }
});

module.exports = router;