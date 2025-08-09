const express = require('express');
const pool = require('../db');
const { logSetupEvent } = require('../log');
const router = express.Router();

// Get all branches, optionally filtered by company_code
router.get('/', async (req, res) => {
  try {
    const { company_code } = req.query;
    let query = 'SELECT * FROM branches';
    let params = [];
    
    if (company_code) {
      query += ' WHERE company_code = $1';
      params.push(company_code);
    }
    
    query += ' ORDER BY code DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching branches:', err);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

// Get branch by code
router.get('/:code', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branches WHERE code = $1', [req.params.code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching branch:', err);
    res.status(500).json({ error: 'Failed to fetch branch' });
  }
});

// Create branch
router.post('/', async (req, res) => {
  const { code, company_code, name, description, address, gst, incharge_name, incharge_from, status, start_date, close_date, remarks } = req.body;
  try {
    // Validate required fields
    if (!code) {
      return res.status(400).json({ error: 'Branch code is required' });
    }
    
    // Check if branch code already exists
    const existingBranch = await pool.query('SELECT code FROM branches WHERE code = $1', [code]);
    if (existingBranch.rows.length > 0) {
      return res.status(400).json({ error: 'Branch code already exists' });
    }
    
    const result = await pool.query(
      'INSERT INTO branches (code, company_code, name, description, address, gst, incharge_name, incharge_from, status, start_date, close_date, remarks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [code, company_code, name, description, address, gst, incharge_name, incharge_from, status, start_date, close_date, remarks]
    );
    
    // Log the setup event
    await logSetupEvent({
      username: req.user?.username || 'system',
      action: 'CREATE',
      setupType: 'Branch',
      entityType: 'branch',
      entityCode: code,
      entityName: name,
      details: `Branch created: ${name} (${code}) for company ${company_code}`
    });
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating branch:', err);
    res.status(500).json({ error: 'Failed to create branch' });
  }
});

// Update branch
router.put('/:code', async (req, res) => {
  const { company_code, name, description, address, gst, incharge_name, incharge_from, status, start_date, close_date, remarks } = req.body;
  try {
    const result = await pool.query(
      'UPDATE branches SET company_code = $1, name = $2, description = $3, address = $4, gst = $5, incharge_name = $6, incharge_from = $7, status = $8, start_date = $9, close_date = $10, remarks = $11 WHERE code = $12 RETURNING *',
      [company_code, name, description, address, gst, incharge_name, incharge_from, status, start_date, close_date, remarks, req.params.code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    
    // Log the setup event
    await logSetupEvent({
      username: req.user?.username || 'system',
      action: 'UPDATE',
      setupType: 'Branch',
      entityType: 'branch',
      entityCode: req.params.code,
      entityName: name,
      details: `Branch updated: ${name} (${req.params.code}) for company ${company_code}`
    });
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating branch:', err);
    res.status(500).json({ error: 'Failed to update branch' });
  }
});

// Delete branch
router.delete('/:code', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM branches WHERE code = $1 RETURNING *', [req.params.code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    
    // Log the setup event
    await logSetupEvent({
      username: req.user?.username || 'system',
      action: 'DELETE',
      setupType: 'Branch',
      entityType: 'branch',
      entityCode: req.params.code,
      entityName: result.rows[0]?.name || 'Unknown',
      details: `Branch deleted: ${result.rows[0]?.name || 'Unknown'} (${req.params.code})`
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting branch:', err);
    res.status(500).json({ error: 'Failed to delete branch' });
  }
});

module.exports = router; 