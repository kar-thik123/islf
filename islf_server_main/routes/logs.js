const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/auth', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM auth_logs ORDER BY timestamp DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch logs:', err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router; 