const express = require('express');
const pool = require('../db');
const { logSetupEvent } = require('../log');
const router = express.Router();

// Get all departments, optionally filtered by branch_code
router.get('/', async (req, res) => {
  try {
    const { branch_code } = req.query;
    let query = 'SELECT * FROM departments';
    let params = [];
    
    if (branch_code) {
      query += ' WHERE branch_code = $1';
      params.push(branch_code);
    }
    
    query += ' ORDER BY code DESC';
    
    const result = await pool.query(query, params);
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
  const { code, company_code, branch_code, name, description, incharge_name, incharge_from, status, start_date, close_date, remarks, gst = null } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO departments (code, company_code, branch_code, name, description, incharge_name, incharge_from, status, start_date, close_date, remarks, gst) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [code, company_code, branch_code, name, description, incharge_name, incharge_from, status, start_date, close_date, remarks, gst]
    );
    
    // Log the setup event
    await logSetupEvent({
      username: req.user?.username || 'system',
      action: 'CREATE',
      setupType: 'Department',
      entityType: 'department',
      entityCode: code,
      entityName: name,
      details: `Department created: ${name} (${code}) for branch ${branch_code}`
    });
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating department:', err);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// Update department
router.put('/:code', async (req, res) => {
  const { company_code, branch_code, name, description, incharge_name, incharge_from, status, start_date, close_date, remarks, gst = null } = req.body;
  try {
    const result = await pool.query(
      'UPDATE departments SET company_code = $1, branch_code = $2, name = $3, description = $4, incharge_name = $5, incharge_from = $6, status = $7, start_date = $8, close_date = $9, remarks = $10, gst = $11 WHERE code = $12 RETURNING *',
      [company_code, branch_code, name, description, incharge_name, incharge_from, status, start_date, close_date, remarks, gst, req.params.code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    
    // Log the setup event
    await logSetupEvent({
      username: req.user?.username || 'system',
      action: 'UPDATE',
      setupType: 'Department',
      entityType: 'department',
      entityCode: req.params.code,
      entityName: name,
      details: `Department updated: ${name} (${req.params.code}) for branch ${branch_code}`
    });
    
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
    
    // Log the setup event
    await logSetupEvent({
      username: req.user?.username || 'system',
      action: 'DELETE',
      setupType: 'Department',
      entityType: 'department',
      entityCode: req.params.code,
      entityName: result.rows[0]?.name || 'Unknown',
      details: `Department deleted: ${result.rows[0]?.name || 'Unknown'} (${req.params.code})`
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting department:', err);
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

module.exports = router;