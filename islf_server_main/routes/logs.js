const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/auth', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM auth_logs ORDER BY timestamp DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch auth logs:', err);
    res.status(500).json({ error: 'Failed to fetch auth logs' });
  }
});

router.get('/masters', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM master_logs ORDER BY timestamp DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch masters logs:', err);
    res.status(500).json({ error: 'Failed to fetch masters logs' });
  }
});

router.get('/setup', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM setup_logs ORDER BY timestamp DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch setup logs:', err);
    res.status(500).json({ error: 'Failed to fetch setup logs' });
  }
});

module.exports = router; 