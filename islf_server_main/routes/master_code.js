const express = require('express');
const pool = require('../db');
const router = express.Router();
const { logMasterEvent } = require('../log');
const {getUsernameFromToken}=require('../utils/context-helper')

// Get all master codes
router.get('/', async (req, res) => {
  try {
    const { companyCode, branchCode, departmentCode } = req.query;

    let query = `
      SELECT *
      FROM master_code
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
    console.error('Error fetching master codes:', err);
    res.status(500).json({ error: 'Failed to fetch master codes' });
  }
});


// Get master code by code
router.get('/:code', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM master_code WHERE code = $1', [req.params.code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Failed to fetch master code' });
  }
});

// Create master code
router.post('/', async (req, res) => {
  const { code, description, reference, status,company_code,branch_code,department_code } = req.body;

  try {
    const created_by = getUsernameFromToken(req);
    const result = await pool.query(
      'INSERT INTO master_code (code, description, reference, status,company_code,branch_code,department_code,created_by) VALUES ($1, $2, $3, $4,$5,$6,$7,$8) RETURNING *',
      [code, description, reference, status,company_code,branch_code,department_code,created_by]
    );
 
   // Log the master event
   await logMasterEvent({
    username: getUsernameFromToken(req),
    action: 'CREATE',
    masterType: 'Master Code',
    recordId: code,
    details: `New MasterCode "${code}" has been created successfully.`

  });
  res.status(201).json(result.rows[0]);
} catch (err) {
  res.status(500).json({ error: 'Failed to create master code' });
}
});

// Update master code
router.put('/:code', async (req, res) => {
  const { description, reference, status } = req.body;
  try {
    const oldResult = await pool.query('SELECT * FROM master_code WHERE code = $1', [req.params.code]);
    if(oldResult.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const code = oldResult.rows[0].code;
    const result = await pool.query(
      'UPDATE master_code SET description = $1, reference = $2, status = $3 WHERE code = $4 RETURNING *',
      [description, reference, status, req.params.code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const changedFields = [];
    const fieldsToCheck = {
      description,
      reference,
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

       // Log the master event
  await logMasterEvent({
    username: getUsernameFromToken(req),
    action: 'UPDATE',
    masterType: 'Master Code',
    recordId: code,
    details
  });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update master code' });
  }
 
});
// Update only status
router.patch('/:code/status', async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE master_code SET status = $1 WHERE code = $2 RETURNING *',
      [status, req.params.code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});
// Delete master code
router.delete('/:code', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM master_code WHERE code = $1 RETURNING *', [req.params.code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
     // Log the master event
    await logMasterEvent({
      username: getUsernameFromToken(req),
      action: 'DELETE',
      masterType: 'Master Code',
      recordId: result.rows[0].code,
      details: `MasterCode deleted: ${result.rows[0].description} (${result.rows[0].code})`
    });
    res.json({ success: true });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Failed to delete master code' });
  }

});

module.exports = router;
