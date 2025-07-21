const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get all master locations
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM master_location ORDER BY code ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching master locations:', err);
    res.status(500).json({ error: 'Failed to fetch master locations' });
  }
});

// Create master location
router.post('/', async (req, res) => {
  const { type, code, name, country, state, city, gst_state_code, pin_code, active } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO master_location (type, code, name, country, state, city, gst_state_code, pin_code, active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [type, code, name, country, state, city, gst_state_code, pin_code, active]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating master location:', err);
    res.status(500).json({ error: 'Failed to create master location' });
  }
});

// Update master location
router.put('/:code', async (req, res) => {
  const { type, name, country, state, city, gst_state_code, pin_code, active } = req.body;
  try {
    const result = await pool.query(
      'UPDATE master_location SET type = $1, name = $2, country = $3, state = $4, city = $5, gst_state_code = $6, pin_code = $7, active = $8 WHERE code = $9 RETURNING *',
      [type, name, country, state, city, gst_state_code, pin_code, active, req.params.code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating master location:', err);
    res.status(500).json({ error: 'Failed to update master location' });
  }
});

// Delete master location
router.delete('/:code', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM master_location WHERE code = $1 RETURNING *', [req.params.code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting master location:', err);
    res.status(500).json({ error: 'Failed to delete master location' });
  }
});

module.exports = router; 