const express = require('express');
const pool = require('../db');
const router = express.Router();
const { getUsernameFromToken } = require('../utils/context-helper');
const { ADMIN_BYPASS_ROLES } = require('../constants/roles');

// Get all master locations with pagination
router.get('/', async (req, res) => {
  try {
    let { companyCode, branchCode, departmentCode, page = 1, limit = 1000 } = req.query;

    // Phase T4.1: Enforced Context Isolation
    // If not admin, enforce context from JWT if missing in query
    const isBypass = req.user && ADMIN_BYPASS_ROLES.has(req.user.role);
    if (!isBypass) {
      companyCode = companyCode || req.user.company_code;
      branchCode = branchCode || req.user.branch;
      departmentCode = departmentCode || req.user.department;

      // Safety: If no company context is found for a non-admin, restrict access
      if (!companyCode) {
        console.warn(`⚠️ [Context Leakage Prevention] No company context for user: ${req.user?.username}`);
        return res.json({ data: [], total: 0 });
      }
    }

    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT *
      FROM master_location
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Hierarchical filtering (Phase T4.1 updated: allow NULL for global records)
    if (companyCode) {
      query += ` AND (company_code = $${paramIndex} OR company_code IS NULL)`;
      params.push(companyCode);
      paramIndex++;

      if (branchCode) {
        query += ` AND (branch_code = $${paramIndex} OR branch_code IS NULL)`;
        params.push(branchCode);
        paramIndex++;

        if (departmentCode) {
          query += ` AND (department_code = $${paramIndex} OR department_code IS NULL)`;
          params.push(departmentCode);
          paramIndex++;
        }
      }
    }

    // Capture count before ordering and limit/offset
    const countQuery = `SELECT COUNT(*) FROM (${query}) AS total`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    query += ` ORDER BY code ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), Number(offset));

    const result = await pool.query(query, params);
    res.json({ data: result.rows, total });
  } catch (err) {
    console.error('Error fetching master locations:', err);
    res.status(500).json({ error: 'Failed to fetch master locations' });
  }
});

// Create master location
router.post('/', async (req, res) => {
  const { type, code, name, country, state, city, gst_state_code, pin_code, active, company_code, branch_code, department_code } = req.body;

  try {
    const created_by = getUsernameFromToken(req);
    const result = await pool.query(
      'INSERT INTO master_location (type, code, name, country, state, city, gst_state_code, pin_code, active,company_code,branch_code,department_code,created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10,$11,$12,$13) RETURNING *',
      [type, code, name, country, state, city, gst_state_code, pin_code, active, company_code, branch_code, department_code, created_by]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {

    // Handle specific database constraint errors
    if (err.code === '23505' && err.constraint === 'master_location_code_key') {
      res.status(400).json({
        error: 'Duplicate code',
        detail: `Location code "${code}" already exists. Please use a different code.`,
        code: code
      });
    } else if (err.code === '23505') {
      res.status(400).json({
        error: 'Duplicate entry',
        detail: `A location with this information already exists.`,
        code: code
      });
    } else {
      res.status(500).json({ error: 'Failed to create master location' });
    }
  }
});

// Update master location
router.put('/:code', async (req, res) => {
  const { type, name, country, state, city, gst_state_code, pin_code, active } = req.body;
  try {
    const oldResult = await pool.query('SELECT * FROM master_location WHERE code = $1', [req.params.code]);
    if (oldResult.rows.length === 0) return res.status(404).json({ error: 'Location not found' });
    const oldLocation = oldResult.rows[0];
    const result = await pool.query(
      'UPDATE master_location SET type = $1, name = $2, country = $3, state = $4, city = $5, gst_state_code = $6, pin_code = $7, active = $8 WHERE code = $9 RETURNING *',
      [type, name, country, state, city, gst_state_code, pin_code, active, req.params.code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Location not found' });

    res.json(result.rows[0]);
  } catch (err) {

    // Handle specific database constraint errors
    if (err.code === '23505' && err.constraint === 'master_location_code_key') {
      res.status(400).json({
        error: 'Duplicate code',
        detail: `Location code "${req.params.code}" already exists. Please use a different code.`,
        code: req.params.code
      });
    } else if (err.code === '23505') {
      res.status(400).json({
        error: 'Duplicate entry',
        detail: `A location with this information already exists.`,
        code: req.params.code
      });
    } else {
      res.status(500).json({ msg: 'Failed to update master location', error: err.msg });
    }
  }
});

// Delete master location
router.delete('/:code', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM master_location WHERE code = $1 RETURNING *', [req.params.code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete master location' });
  }
});
module.exports = router;