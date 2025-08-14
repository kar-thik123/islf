const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get all master codes
router.get('/', async (req, res) => {
  try {
     const { companyCode, branchCode, departmentCode } = req.query;
    
    // If context parameters are provided, filter by their context
    if (companyCode || branchCode || departmentCode) {
      let query = `
        SELECT *
        FROM master_code
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
      const result = await pool.query('SELECT * FROM master_code ORDER BY code DESC');
      res.json(result.rows);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch master codes' });
  }
});

// Get master code by code
router.get('/:code', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM master_code WHERE code = $1', [req.params.code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Failed to fetch master code' });
  }
});

// Create master code
router.post('/', async (req, res) => {
  const { code, description, reference, status,company_code,branch_code,department_code } = req.body;

  console.log('Inserting:', { code, description, reference, status,company_code,branch_code,department_code });
  try {
    const result = await pool.query(
      'INSERT INTO master_code (code, description, reference, status,company_code,branch_code,department_code) VALUES ($1, $2, $3, $4,$5,$6,$7) RETURNING *',
      [code, description, reference, status,company_code,branch_code,department_code]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create master code' });
  }
});

// Update master code
router.put('/:code', async (req, res) => {
  const { description, reference, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE master_code SET description = $1, reference = $2, status = $3 WHERE code = $4 RETURNING *',
      [description, reference, status, req.params.code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating master code:', err);
    res.status(500).json({ error: 'Failed to update master code' });
  }
});
// Update only status
router.patch('/:code/status', async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE master_code SET status = $1 WHERE code = $2 RETURNING *',
      [status, req.params.code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});
// Delete master code
router.delete('/:code', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM master_code WHERE code = $1 RETURNING *', [req.params.code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Failed to delete master code' });
  }
});

module.exports = router; 
