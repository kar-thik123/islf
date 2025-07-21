const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get all branches
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM branches ORDER BY code DESC');
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
  const { code: userCode, company_code, name, description, address, gst, incharge_name, incharge_from, status, start_date, close_date, remarks } = req.body;
  try {
    // Fetch number series for 'Branch'
    const seriesResult = await pool.query("SELECT * FROM number_series WHERE code = 'Branch' LIMIT 1");
    const series = seriesResult.rows[0];
    if (!series) {
      return res.status(400).json({ error: 'Number series for Branch not found' });
    }
    let code = userCode;
    if (series.is_default) {
      // Auto-generate code using number_relation
      const relResult = await pool.query("SELECT * FROM number_relation WHERE number_series = 'Branch' ORDER BY id DESC LIMIT 1");
      const relation = relResult.rows[0];
      if (!relation) {
        return res.status(400).json({ error: 'Number relation for Branch not found' });
      }
      const nextNo = (relation.last_no_used || relation.starting_no || 0) + (relation.increment_by || 1);
      code = relation.prefix + String(nextNo).padStart(2, '0');
      // Update last_no_used
      await pool.query("UPDATE number_relation SET last_no_used = $1 WHERE id = $2", [nextNo, relation.id]);
    } else if (series.is_manual) {
      // Use user-supplied code (already assigned)
      if (!code) {
        return res.status(400).json({ error: 'Branch code is required in manual mode' });
      }
    }
    const result = await pool.query(
      'INSERT INTO branches (code, company_code, name, description, address, gst, incharge_name, incharge_from, status, start_date, close_date, remarks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [code, company_code, name, description, address, gst, incharge_name, incharge_from, status, start_date, close_date, remarks]
    );
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
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting branch:', err);
    res.status(500).json({ error: 'Failed to delete branch' });
  }
});

module.exports = router; 