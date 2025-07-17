const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get all master codes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM master_code ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch master codes' });
  }
});

// Get master code by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM master_code WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Failed to fetch master code' });
  }
});

// Create master code
router.post('/', async (req, res) => {
  const { code, description, status } = req.body;
  const referencepage = req.body.referencePage || req.body.referencepage;
  const referencefield = req.body.referenceField || req.body.referencefield;
  console.log('Inserting:', { code, description, referencepage, referencefield, status });
  try {
    const result = await pool.query(
      'INSERT INTO master_code (code, description, referencepage, referencefield, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [code, description, referencepage, referencefield, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create master code' });
  }
});

// Update master code
router.put('/:id', async (req, res) => {
  const { code, description, status } = req.body;
  const referencepage = req.body.referencePage || req.body.referencepage;
  const referencefield = req.body.referenceField || req.body.referencefield;
  try {
    const result = await pool.query(
      'UPDATE master_code SET code = $1, description = $2, referencepage = $3, referencefield = $4, status = $5 WHERE id = $6 RETURNING *',
      [code, description, referencepage, referencefield, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update master code' });
  }
});

// Delete master code
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM master_code WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Failed to delete master code' });
  }
});

module.exports = router; 