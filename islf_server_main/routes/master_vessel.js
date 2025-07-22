const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET all vessels
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM master_vessel ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching vessels:', err);
    res.status(500).json({ error: 'Failed to fetch vessels' });
  }
});

// CREATE new vessel (with number series logic and manual/default check)
router.post('/', async (req, res) => {
  let { seriesCode, code, vessel_name, flag, year_build, active } = req.body;
  try {
    if (seriesCode) {
      // 1. Get the number series for the selected code
      const seriesResult = await pool.query(
        'SELECT * FROM number_series WHERE code = $1 ORDER BY id DESC LIMIT 1',
        [seriesCode]
      );
      if (seriesResult.rows.length === 0) {
        return res.status(400).json({ error: 'Number series not found' });
      }
      const series = seriesResult.rows[0];
      if (series.is_manual) {
        // Manual: require code from user
        if (!code || code.trim() === '') {
          return res.status(400).json({ error: 'Manual code entry required for this series' });
        }
        // Optionally, check for duplicate code
        const exists = await pool.query('SELECT 1 FROM master_vessel WHERE code = $1', [code]);
        if (exists.rows.length > 0) {
          return res.status(400).json({ error: 'Vessel code already exists' });
        }
      } else {
        // Not manual: generate code using relation
        const relResult = await pool.query(
          'SELECT * FROM number_relation WHERE number_series = $1 ORDER BY id DESC LIMIT 1',
          [seriesCode]
        );
        if (relResult.rows.length === 0) {
          return res.status(400).json({ error: 'Number series relation not found' });
        }
        const rel = relResult.rows[0];
        const nextNo = Number(rel.last_no_used) + Number(rel.increment_by);
        code = `${rel.prefix || ''}${nextNo}`;
        await pool.query(
          'UPDATE number_relation SET last_no_used = $1 WHERE id = $2',
          [nextNo, rel.id]
        );
      }
    } else if (!code || code === 'AUTO') {
      // Fallback: generate code as VESSEL-<timestamp>
      code = 'VESSEL-' + Date.now();
    }
    // 4. Insert the new vessel
    const result = await pool.query(
      `INSERT INTO master_vessel (code, vessel_name, flag, year_build, active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [code, vessel_name, flag, year_build, active]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating vessel:', err);
    res.status(500).json({ error: 'Failed to create vessel' });
  }
});

// UPDATE vessel by ID
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  const { code, vessel_name, flag, year_build, active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE master_vessel
       SET code = $1, vessel_name = $2, flag = $3, year_build = $4, active = $5
       WHERE id = $6
       RETURNING *`,
      [code, vessel_name, flag, year_build, active, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating vessel:', err);
    res.status(500).json({ error: 'Failed to update vessel' });
  }
});

// DELETE vessel by ID
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  try {
    const result = await pool.query(
      `DELETE FROM master_vessel
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting vessel:', err);
    res.status(500).json({ error: 'Failed to delete vessel' });
  }
});

module.exports = router; 