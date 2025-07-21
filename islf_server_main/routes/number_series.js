const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get all number series
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM number_series ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch number series' });
  }
});

// Get number series by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM number_series WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch number series' });
  }
});

// Create number series
router.post('/', async (req, res) => {
  const { code, description, basecode, is_default, is_manual, is_primary } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO number_series (code, description, basecode, is_default, is_manual, is_primary) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [code, description, basecode, is_default, is_manual, is_primary]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create number series' });
  }
});

// Update number series
router.put('/:id', async (req, res) => {
  const { code, description, basecode, is_default, is_manual, is_primary } = req.body;
  try {
    const result = await pool.query(
      'UPDATE number_series SET code = $1, description = $2, basecode = $3, is_default = $4, is_manual = $5, is_primary = $6 WHERE id = $7 RETURNING *',
      [code, description, basecode, is_default, is_manual, is_primary, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update error:', err); // <-- This line is critical!
    res.status(500).json({ error: 'Failed to update number series' });
  }
});

// Delete number series
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM number_series WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete number series' });
  }
});

module.exports = router; 