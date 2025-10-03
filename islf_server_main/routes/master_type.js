const express = require('express');
const pool = require('../db');
const router = express.Router();
const { logMasterEvent } = require('../log');
const {getUsernameFromToken}=require('../utils/context-helper')

// Get all master types
router.get('/', async (req, res) => {
  try {
    const { companyCode, branchCode, departmentCode } = req.query;

    let query = `
      SELECT *
      FROM master_type
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

    query += ` ORDER BY key ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching master types:", err);
    res.status(500).json({ error: 'Failed to fetch master types' });
  }
});

// Get master type by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM master_type WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch master type' });
  }
});

// Create master type
router.post('/', async (req, res) => {
  const { key, value, description, status ,company_code,branch_code,department_code} = req.body;

  try {
    const created_by = getUsernameFromToken(req);
    const result = await pool.query(
      'INSERT INTO master_type (key, value, description, status,company_code,branch_code,department_code,created_by) VALUES ($1, $2, $3, $4,$5,$6,$7,$8) RETURNING *',
      [key, value, description, status,company_code,branch_code,department_code, created_by]
    );  
      // log the master event 
  await logMasterEvent({
    username: getUsernameFromToken(req),
    action: 'CREATE',
    masterType: 'Master Type',
    recordId: key,
    details: `New MasterType "${key}" has been created successfully.`
  });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create master type' });
  }

 
});

// Update master type
router.put('/:id', async (req, res) => {
  const { value, description, status } = req.body;
  try {
    const oldResult = await pool.query('SELECT * FROM master_type WHERE id = $1', [req.params.id]);
    if(oldResult.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const id = oldResult.rows[0].id;
       const result = await pool.query(
      'UPDATE master_type SET value = $1, description = $2, status = $3 WHERE id = $4 RETURNING *',
      [value, description, status, req.params.id]
    );    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const changedFields = [];
    const fieldsToCheck = {
      value,
      description,
      status
    };
    const normalize = (value) => {
      if (value === null || value === undefined) return '';
      if (value instanceof Date) return value.toISOString().split('T')[0];
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value;
      return value.toString().trim();
    };
    for (const field in fieldsToCheck) {
      const newValueRaw = fieldsToCheck[field];
      const oldValueRaw = oldResult.rows[0][field];
      const newValue = normalize(newValueRaw);
      const oldValue = normalize(oldValueRaw);
      
      const valuesAreEqual = newValue === oldValue;
      if (!valuesAreEqual) {
        changedFields.push(`Field "${field}" changed from "${oldValue}" to "${newValue}".`);
      }
    }
    const details = changedFields.length > 0
      ? `Changes detected in the\n` + changedFields.join('\n')
      : 'No actual changes detected.';

    // Log the setup event
    await logMasterEvent({
      username: getUsernameFromToken(req),
      action: 'UPDATE', 
      masterType: 'Master Type',
      recordId: oldResult.rows[0].key,
      details
    });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update master type' });
  }
});
// Delete master type
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM master_type WHERE id = $1 RETURNING *', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Master type not found' });
    }
    // Log the master event
    await logMasterEvent({
      username: getUsernameFromToken(req),
      action: 'DELETE',
      masterType: 'Master Type',
      recordId: req.params.id,
      details: `Master type with ID ${req.params.id} has been deleted.`
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting master type:', err);
    res.status(500).json({ error: 'Failed to delete master type' });
  }
});

module.exports = router;