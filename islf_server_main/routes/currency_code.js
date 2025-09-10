const express = require('express');
const pool = require('../db');
const router = express.Router();
const { logMasterEvent } = require('../log');

function getUsernameFromToken(req) {
  if (!req.user) {
    console.log('No user in request');
    return 'system';
  }
  
  // Debug: log what's in the user object
  console.log('User object from JWT:', req.user);
  
  const username = req.user.name || req.user.username || req.user.email || 'system';
  console.log('Extracted username:', username);
  return username;
}

// GET all currency codes
router.get('/', async (req, res) => {
  try {
    const { companyCode, branchCode, departmentCode } = req.query;
    
    let query = `
      SELECT *
      FROM currency_code
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch currency codes' });
  }
});

// GET single currency code by code
router.get('/:code', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM currency_code WHERE code = $1', [req.params.code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch currency code' });
  }
});

// CREATE new currency code
router.post('/', async (req, res) => {
  const { code, description, status ,company_code,branch_code,department_code } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO currency_code (code, description, status,company_code,branch_code,department_code) VALUES ($1, $2, $3,$4,$5,$6) RETURNING *',
      [code, description, status || 'Active',company_code,branch_code,department_code]
    );
    // Log the master event
    await logMasterEvent({
      username: getUsernameFromToken(req),
      action: 'CREATE',
      masterType: 'Currency Code',
      recordId: code,
      details: `New Currency Code "${code}" has been created successfully.`
    });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create currency code' });
  }
});

// UPDATE currency code
router.put('/:code', async (req, res) => {
  const { description, status } = req.body;
  try {
    const oldResult = await pool.query('SELECT * FROM currency_code WHERE code = $1', [req.params.code]);
    if (oldResult.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const oldCurrency = oldResult.rows[0];
    const result = await pool.query(
      'UPDATE currency_code SET description = $1, status = $2 WHERE code = $3 RETURNING *',
      [description, status, req.params.code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
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
      const oldValue = normalize(oldCurrency[field]);
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
      masterType: 'Currency Code',
      recordId: code,
      details
    });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update currency code' });
  }
});

// DELETE currency code
router.delete('/:code', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM currency_code WHERE code = $1 RETURNING *', [req.params.code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    // Log the master event
    await logMasterEvent({
      username: getUsernameFromToken(req),
      action: 'DELETE',
      masterType: 'Currency Code',
      recordId: req.params.code,
      details: `Currency Code "${req.params.code}" has been deleted successfully.`
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete currency code' });
  }
});

module.exports = router;