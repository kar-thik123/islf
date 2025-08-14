const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get all master types
router.get('/', async (req, res) => {
  try {
    const { companyCode, branchCode, departmentCode } = req.query;
    
    let query = `
      SELECT *
      FROM master_type
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
    
    query += ` ORDER BY key ASC`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch master types' });
  }
});

// Get master type by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM master_type WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch master type' });
  }
});

// Create master type
router.post('/', async (req, res) => {
  const { key, value, description, status ,company_code,branch_code,department_code} = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO master_type (key, value, description, status,company_code,branch_code,department_code) VALUES ($1, $2, $3, $4,$5,$6,$7) RETURNING *',
      [key, value, description, status,company_code,branch_code,department_code]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create master type' });
  }
});

// Update master type
router.put('/:id', async (req, res) => {
  const { value, description, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE master_type SET value = $1, description = $2, status = $3 WHERE id = $4 RETURNING *',
      [value, description, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update master type' });
  }
});

// Delete master type
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM master_type WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete master type' });
  }
});

module.exports = router;