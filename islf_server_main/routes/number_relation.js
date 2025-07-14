const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get all number series relations
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM number_relation ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching number series relations:', err);
    res.status(500).json({ error: 'Failed to fetch number series relations' });
  }
});

// Get number series relation by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM number_relation WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching number series relation by id:', err);
    res.status(500).json({ error: 'Failed to fetch number series relation' });
  }
});

// Create number series relation
router.post('/', async (req, res) => {
  const {
    numberSeries,
    startingDate,
    startingNo,
    endingNo,
    prefix,
    lastNoUsed,
    incrementBy
  } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO number_relation (number_series, starting_date, starting_no, ending_no, prefix, last_no_used, increment_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [numberSeries, startingDate, startingNo, endingNo, prefix, lastNoUsed, incrementBy]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating number series relation:', err);
    res.status(500).json({ error: 'Failed to create number series relation' });
  }
});

// Update number series relation
router.put('/:id', async (req, res) => {
  const {
    numberSeries,
    startingDate,
    startingNo,
    endingNo,
    prefix,
    lastNoUsed,
    incrementBy
  } = req.body;
  try {
    const result = await pool.query(
      'UPDATE number_relation SET number_series = $1, starting_date = $2, starting_no = $3, ending_no = $4, prefix = $5, last_no_used = $6, increment_by = $7 WHERE id = $8 RETURNING *',
      [numberSeries, startingDate, startingNo, endingNo, prefix, lastNoUsed, incrementBy, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating number series relation:', err);
    res.status(500).json({ error: 'Failed to update number series relation' });
  }
});

// Delete number series relation
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM number_relation WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting number series relation:', err);
    res.status(500).json({ error: 'Failed to delete number series relation' });
  }
});

// Get unique numberSeries values for dropdown
router.get('/series/list', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT number_series FROM number_relation ORDER BY number_series');
    res.json(result.rows.map(row => row.number_series));
  } catch (err) {
    console.error('Error fetching number series list:', err);
    res.status(500).json({ error: 'Failed to fetch number series list' });
  }
});

module.exports = router; 