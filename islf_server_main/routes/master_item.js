const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET all master items
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM master_item ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching master items:', err);
    res.status(500).json({ error: 'Failed to fetch master items' });
  }
});

// CREATE new master item
router.post('/', async (req, res) => {
  const { item_type, code, name, hs_code, active } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO master_item (item_type, code, name, hs_code, active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [item_type, code, name, hs_code, active]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating master item:', err);
    res.status(500).json({ error: 'Failed to create master item' });
  }
});

// UPDATE master item by ID
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const { item_type, code, name, hs_code, active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE master_item
       SET item_type = $1, code = $2, name = $3, hs_code = $4, active = $5
       WHERE id = $6
       RETURNING *`,
      [item_type, code, name, hs_code, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating master item:', err);
    res.status(500).json({ error: 'Failed to update master item' });
  }
});

// DELETE master item by ID
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const result = await pool.query(
      `DELETE FROM master_item
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting master item:', err);
    res.status(500).json({ error: 'Failed to delete master item' });
  }
});

module.exports = router;
