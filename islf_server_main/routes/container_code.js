const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET all container codes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM container_code ORDER BY code ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch container codes' });
  }
});

// GET single container code by code
router.get('/:code', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM container_code WHERE code = $1', [req.params.code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch container code' });
  }
});

// CREATE new container code
router.post('/', async (req, res) => {
  const { code, description, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO container_code (code, description, status) VALUES ($1, $2, $3) RETURNING *',
      [code, description, status || 'Active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create container code' });
  }
});

// UPDATE container code
router.put('/:code', async (req, res) => {
  const { description, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE container_code SET description = $1, status = $2 WHERE code = $3 RETURNING *',
      [description, status, req.params.code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update container code' });
  }
});

// DELETE container code
router.delete('/:code', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM container_code WHERE code = $1 RETURNING *', [req.params.code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete container code' });
  }
});

module.exports = router; 