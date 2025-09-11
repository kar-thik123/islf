const express = require('express');
const pool = require('../db');
const router = express.Router();


// Get all number series with has_used_relation and context-based filtering
router.get('/', async (req, res) => {
  try {
    const { companyCode, branchCode, departmentCode } = req.query;
    
    // Base query with has_used_relation check
    let query = `
      SELECT
        ns.*,
        EXISTS (
          SELECT 1 FROM number_relation nr
          WHERE nr.number_series = ns.code AND nr.last_no_used > 0
        ) AS has_used_relation
      FROM number_series ns
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Add context-based filtering if parameters are provided
    if (companyCode) {
      query += ` AND ns.company_code = $${paramIndex}`;
      params.push(companyCode);
      paramIndex++;
    }
    
    if (branchCode) {
      query += ` AND ns.branch_code = $${paramIndex}`;
      params.push(branchCode);
      paramIndex++;
    }
    
    if (departmentCode) {
      query += ` AND ns.department_code = $${paramIndex}`;
      params.push(departmentCode);
      paramIndex++;
    }
    
    query += ` ORDER BY ns.id`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching number series:', err);
    res.status(500).json({ error: 'Failed to fetch number series' });
  }
});

// Get number series by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM number_series WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch number series' });
  }
});

// Create number series
router.post('/', async (req, res) => {
  const { code, description, basecode, is_default, is_manual, is_primary, company_code, branch_code, department_code } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO number_series (code, description, basecode, is_default, is_manual, is_primary, company_code, branch_code, department_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [code, description, basecode, is_default, is_manual, is_primary, company_code, branch_code, department_code]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating master code:', err);
    if (err.code === '23505') {
      userMessage = 'This code already exists. Please choose a different one.';
    }
  
    res.status(400).json({
      error: userMessage, 
    });
  }
  
});

// Update number series
router.put('/:id', async (req, res) => {
  const { code, description, basecode, is_default, is_manual, is_primary, company_code, branch_code, department_code } = req.body;
  try {
    const result = await pool.query(
      'UPDATE number_series SET code = $1, description = $2, basecode = $3, is_default = $4, is_manual = $5, is_primary = $6, company_code = $7, branch_code = $8, department_code = $9 WHERE id = $10 RETURNING *',
      [code, description, basecode, is_default, is_manual, is_primary, company_code, branch_code, department_code, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update number series' });
  }
});

// Delete number series
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM number_series WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete number series' });
  }
});

module.exports = router;