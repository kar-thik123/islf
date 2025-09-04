const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get all master UOMs with optional context filtering
router.get('/', async (req, res) => {
  try {
    const { companyCode, branchCode, departmentCode } = req.query;

    let query = `
      SELECT *
      FROM master_uom
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Hierarchical filtering
    if (companyCode) {
      query += ` AND company_code = $${paramIndex}`;
      params.push(companyCode);
      paramIndex++;

      if (branchCode) {
        query += ` AND branch_code = $${paramIndex}`;
        params.push(branchCode);
        paramIndex++;

        if (departmentCode) {
          query += ` AND department_code = $${paramIndex}`;
          params.push(departmentCode);
          paramIndex++;
        }
      }
    }

    query += ` ORDER BY code ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching master UOMs:', err);
    res.status(500).json({ error: 'Failed to fetch master UOMs' });
  }
});

// Create master UOM
router.post('/', async (req, res) => {
  console.log('POST /master_uom - Request body:', JSON.stringify(req.body, null, 2));
  const { uom_type, code, description, active, company_code, branch_code, department_code } = req.body;
  console.log('Extracted context values:', { company_code, branch_code, department_code });
  try {
    const result = await pool.query(
      `INSERT INTO master_uom (uom_type, code, description, active, company_code, branch_code, department_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [uom_type, code, description, active, company_code, branch_code, department_code]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating master UOM:', err);
    res.status(500).json({ error: 'Failed to create master UOM' });
  }
});

// Update master UOM by ID
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { uom_type, code, description, active} = req.body;
  try {
    const result = await pool.query(
      `UPDATE master_uom
       SET uom_type = $1, code = $2, description = $3, active = $4
       WHERE id = $5
       RETURNING *`,
      [uom_type, code, description, active, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'UOM not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating master UOM:', err);
    res.status(500).json({ error: 'Failed to update master UOM' });
  }
});

// Delete master UOM by ID
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const result = await pool.query('DELETE FROM master_uom WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'UOM not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting master UOM:', err);
    res.status(500).json({ error: 'Failed to delete master UOM' });
  }
});

module.exports = router;
