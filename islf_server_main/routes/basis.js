const express = require('express');
const pool = require('../db');
const router = express.Router();

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
  const { code, description, status, company_code, branch_code, department_code } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO basis (code, description, status, company_code, branch_code, department_code, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [code, description, status || 'Active', company_code, branch_code, department_code]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating basis code:', err);
    res.status(500).json({ error: 'Failed to create basis code' });
  }
});

// UPDATE basis code
router.put('/:code', async (req, res) => {
  const { description, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE basis SET description = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE code = $3 RETURNING *',
      [description, status, req.params.code]
    );
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
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete basis code' });
  }
});

module.exports = router;