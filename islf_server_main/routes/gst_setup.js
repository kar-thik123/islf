const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET all GST rules
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM gst_setup ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch GST rules' });
  }
});

// CREATE new GST rule
router.post('/', async (req, res) => {
  const { from, to, sgst, cgst, igst } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO gst_setup ("from", "to", sgst, cgst, igst) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [from, to, sgst, cgst, igst]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create GST rule' });
  }
});

// UPDATE GST rule
router.put('/:id', async (req, res) => {
  const { from, to, sgst, cgst, igst } = req.body;
  try {
    const result = await pool.query(
      'UPDATE gst_setup SET "from" = $1, "to" = $2, sgst = $3, cgst = $4, igst = $5 WHERE id = $6 RETURNING *',
      [from, to, sgst, cgst, igst, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update GST rule' });
  }
});

// DELETE GST rule
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM gst_setup WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete GST rule' });
  }
});

module.exports = router; 