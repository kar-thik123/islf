const express = require('express');
const pool = require('../db');
const router = express.Router();
const { logMasterEvent } = require('../log');
const { getUsernameFromToken } = require('../utils/context-helper');

// GET all GST rules
router.get('/', async (req, res) => {
  try {
    const { companyCode, branchCode, departmentCode } = req.query;
    
    let query = `
      SELECT *
      FROM gst_setup
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (companyCode) {
      query += ` AND company_code = $${paramIndex}`;
      params.push(companyCode);
      paramIndex++;
    }
    
    if (branchCode) {
      query += ` AND branch_code = $${paramIndex}`;
      params.push(branchCode);
      paramIndex++;
    }
    
    if (departmentCode) {
      query += ` AND department_code = $${paramIndex}`;
      params.push(departmentCode);
      paramIndex++;
    }
    
    query += ` ORDER BY id ASC`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch GST rules' });
  }
});

// CREATE new GST rule
router.post('/', async (req, res) => {
  const { from, to, sgst, cgst, igst, company_code, branch_code, department_code } = req.body;
  try {
    const created_by = getUsernameFromToken(req);
    const result = await pool.query(
      'INSERT INTO gst_setup ("from", "to", sgst, cgst, igst,company_code,branch_code,department_code,created_by) VALUES ($1, $2, $3, $4, $5,$6,$7,$8,$9) RETURNING *',
      [from, to, sgst, cgst, igst,company_code,branch_code,department_code,created_by]
    );
    // Log the master event
    await logMasterEvent({
      username: getUsernameFromToken(req),
      action: 'CREATE',
      masterType: 'GST Setup',
      recordId: 'from',
      details: `New GST Setup  has been created successfully.`
    });
    res.status(201).json(result.rows[0]);
  } catch (err) {

    res.status(500).json({ error: 'Failed to create GST rule' });
  }
});

// UPDATE GST rule
router.put('/:id', async (req, res) => {
  const { from, to, sgst, cgst, igst } = req.body;
  try {
    const oldResult = await pool.query('SELECT * FROM gst_setup WHERE id = $1', [req.params.id]);
    if (oldResult.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const oldGST = oldResult.rows[0];
    const result = await pool.query(
      'UPDATE gst_setup SET "from" = $1, "to" = $2, sgst = $3, cgst = $4, igst = $5 WHERE id = $6 RETURNING *',
      [from, to, sgst, cgst, igst, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const changedFields = [];
    const fieldsToCheck = {
      from, to, sgst, cgst, igst
    };
    const normalize = (value) => {
      if (value === null || value === undefined) return '';
      return value.toString().trim();
    };
    for (const field in fieldsToCheck) {
      const newValue = normalize(fieldsToCheck[field]);
      const oldValue = normalize(oldGST[field]);
      const valuesAreEqual = newValue === oldValue;
      if (!valuesAreEqual) {
        changedFields.push(`Field "${field}" changed from "${oldValue}" to "${newValue}".`);
      }
    }
    const details = changedFields.length > 0
      ? `Changes detected in the\n` + changedFields.join('\n')
      : 'No actual changes detected.';
    // Log the master event
    await logMasterEvent({
      username: getUsernameFromToken(req),
      action: 'UPDATE',
      masterType: 'GST Setup',
      recordId:from,
      details
    });
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
    // Log the master event
    await logMasterEvent({
      username: getUsernameFromToken(req),
      action: 'DELETE',
      masterType: 'GST Setup',
      recordId: req.params.id,
      details: `GST Setup "${req.params.id}" has been deleted successfully.`
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete GST rule' });
  }
});

module.exports = router;