const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get all departments
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departments ORDER BY code DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Get department by code
router.get('/:code', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departments WHERE code = $1', [req.params.code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching department:', err);
    res.status(500).json({ error: 'Failed to fetch department' });
  }
});

// Create department
router.post('/', async (req, res) => {
  const { code, company_code, branch_code, name, description, incharge_name, incharge_from, status, start_date, close_date, remarks } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO departments (code, company_code, branch_code, name, description, incharge_name, incharge_from, status, start_date, close_date, remarks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [code, company_code, branch_code, name, description, incharge_name, incharge_from, status, start_date, close_date, remarks]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating department:', err);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// Update department
router.put('/:code', async (req, res) => {
  const { company_code, branch_code, name, description, incharge_name, incharge_from, status, start_date, close_date, remarks } = req.body;
  try {
    const result = await pool.query(
      'UPDATE departments SET company_code = $1, branch_code = $2, name = $3, description = $4, incharge_name = $5, incharge_from = $6, status = $7, start_date = $8, close_date = $9, remarks = $10 WHERE code = $11 RETURNING *',
      [company_code, branch_code, name, description, incharge_name, incharge_from, status, start_date, close_date, remarks, req.params.code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating department:', err);
    res.status(500).json({ error: 'Failed to update department' });
  }
});

// Delete department
router.delete('/:code', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM departments WHERE code = $1 RETURNING *', [req.params.code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting department:', err);
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

module.exports = router; 