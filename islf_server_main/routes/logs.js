const express = require('express');
const pool = require('../db');
const router = express.Router();

// Redirected: Now queries centralized action_logs table
router.get('/auth', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        username, 
        action, 
        payload->>'details' as details, 
        timestamp 
      FROM action_logs 
      WHERE module = 'auth' 
      ORDER BY timestamp DESC 
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch auth logs:', err);
    res.status(500).json({ error: 'Failed to fetch auth logs' });
  }
});

// Redirected: Now queries centralized action_logs table
router.get('/masters', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        username, 
        action, 
        module as master_type, 
        payload->>'id' as record_id, 
        COALESCE(payload->>'details', (method || ' ' || endpoint)) as details, 
        timestamp 
      FROM action_logs 
      WHERE module IN ('master_code', 'master_type', 'master_location', 'master_uom', 'master_item', 'master_vessel', 'master_airline', 'customer', 'vendor')
      ORDER BY timestamp DESC 
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch masters logs:', err);
    res.status(500).json({ error: 'Failed to fetch masters logs' });
  }
});

// Redirected: Now queries centralized action_logs table
router.get('/setup', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        username, 
        action, 
        module as setup_type, 
        payload->>'entityCode' as entity_code, 
        COALESCE(payload->>'details', (method || ' ' || endpoint)) as details, 
        timestamp 
      FROM action_logs 
      WHERE module IN ('number_series', 'number_relation', 'department', 'service_types', 'company', 'branch', 'user', 'settings')
      ORDER BY timestamp DESC 
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch setup logs:', err);
    res.status(500).json({ error: 'Failed to fetch setup logs' });
  }
});

// Unified endpoint for all action logs with advanced filtering
router.get('/all', async (req, res) => {
  try {
    const {
      domain,
      module,
      username,
      action,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    const offset = (page - 1) * limit;
    let query = `SELECT * FROM action_logs WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    // Domain Filtering
    if (domain) {
      if (domain === 'setup') {
        query += ` AND module IN ('number_series', 'number_relation', 'department', 'service_types', 'company', 'branch', 'user', 'settings', 'gst_setup', 'currency_code', 'service_area')`;
      } else if (domain === 'masters') {
        query += ` AND module IN ('customer', 'vendor', 'master_location', 'master_item', 'master_vessel', 'master_airline')`;
      } else if (domain === 'master_types') {
        query += ` AND module IN ('master_code', 'master_type', 'master_uom', 'container_code')`;
      } else if (domain === 'operations') {
        query += ` AND module IN ('booking', 'enquiry', 'tariff', 'source', 'source_sales')`;
      } else if (domain === 'auth') {
        query += ` AND module = 'auth'`;
      }
    }

    // Specific Module Filtering
    if (module) {
      query += ` AND module = $${paramIndex}`;
      params.push(module);
      paramIndex++;
    }

    // User Filtering
    if (username) {
      query += ` AND username = $${paramIndex}`;
      params.push(username);
      paramIndex++;
    }

    // Action Filtering
    if (action) {
      query += ` AND action = $${paramIndex}`;
      params.push(action);
      paramIndex++;
    }

    // Status Filtering
    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Date Range Filtering
    if (startDate) {
      query += ` AND timestamp >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      query += ` AND timestamp <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    // Count for pagination
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const totalResult = await pool.query(countQuery, params);
    const total = parseInt(totalResult.rows[0].count);

    // Sorting and Pagination
    query += ` ORDER BY timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      data: result.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('Failed to fetch all logs:', err);
    res.status(500).json({ error: 'Failed to fetch all logs' });
  }
});

module.exports = router;