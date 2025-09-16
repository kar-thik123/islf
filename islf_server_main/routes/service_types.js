const express = require('express');
const pool = require('../db');
const { logSetupEvent } = require('../log');
const router = express.Router();

// Get all service types
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM service_types ORDER BY code DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching service types:', err);
    res.status(500).json({ error: 'Failed to fetch service types' });
  }
});

// Get service types by department
router.get('/department/:departmentCode', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM service_types WHERE department_code = $1 ORDER BY code DESC',
      [req.params.departmentCode]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching service types by department:', err);
    res.status(500).json({ error: 'Failed to fetch service types by department' });
  }
});

// Get service type by code
router.get('/:code', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM service_types WHERE code = $1',
      [req.params.code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching service type:', err);
    res.status(500).json({ error: 'Failed to fetch service type' });
  }
});

// Create service type
router.post('/', async (req, res) => {
  const {
    code, company_code, branch_code, department_code,
    name, description, incharge_name, incharge_from,
    status, start_date, close_date, remarks
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO service_types 
       (code, company_code, branch_code, department_code, name, description, incharge_name, incharge_from, status, start_date, close_date, remarks) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [code, company_code, branch_code, department_code, name, description, incharge_name, incharge_from, status, start_date, close_date, remarks]
    );

    await logSetupEvent({
      username: req.user?.username || 'system',
      action: 'CREATE',
      setupType: 'ServiceType',
      entityCode: code,
      details: `Service type created: ${name} (${code}) for department ${department_code}`
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating service type:', err);
    res.status(500).json({ error: 'Failed to create service type' });
  }
});

// Update service type
router.put('/:code', async (req, res) => {
  const {
    company_code, branch_code, department_code, name,
    description, incharge_name, incharge_from, status,
    start_date, close_date, remarks
  } = req.body;

  try {
    // Get old record
    const oldResult = await pool.query(
      'SELECT * FROM service_types WHERE code = $1',
      [req.params.code]
    );

    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    const oldServiceType = oldResult.rows[0];

    // Update record
    const result = await pool.query(
      `UPDATE service_types SET 
        company_code = $1, branch_code = $2, department_code = $3,
        name = $4, description = $5, incharge_name = $6, incharge_from = $7,
        status = $8, start_date = $9, close_date = $10, remarks = $11
       WHERE code = $12 RETURNING *`,
      [company_code, branch_code, department_code, name,
        description, incharge_name, incharge_from, status,
        start_date, close_date, remarks, req.params.code]
    );

    // Build detailed change log
    const changedFields = [];
    const fieldsToCheck = {
      name,
      department_code,
      description,
      incharge_name,
      incharge_from,
      status,
      start_date,
      close_date,
      remarks
    };

    const normalize = (value) => {
      if (value === null || value === undefined) return '';
      if (value instanceof Date) return value.toISOString().split('T')[0];
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value;
      return value.toString().trim();
    };

    for (const field in fieldsToCheck) {
      const newValueRaw = fieldsToCheck[field];
      const oldValueRaw = oldServiceType[field];

      const newValue = normalize(newValueRaw);
      const oldValue = normalize(oldValueRaw);

      const bothEmpty = newValue === '' && oldValue === '';
      const isDifferent = newValue !== oldValue;

      if (!bothEmpty && isDifferent) {
        changedFields.push(`${field}: "${oldValue}" → "${newValue}"`);
      }
    }

    const details = changedFields.length > 0
      ? `Service type updated:\n` + changedFields.join('\n')
      : 'No actual changes detected.';

    await logSetupEvent({
      username: req.user?.username || 'system',
      action: 'UPDATE',
      setupType: 'ServiceType',
      entityCode: req.params.code,
      details
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating service type:', err);
    res.status(500).json({ error: 'Failed to update service type' });
  }
});

// Delete service type
router.delete('/:code', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM service_types WHERE code = $1 RETURNING *',
      [req.params.code]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    await logSetupEvent({
      username: req.user?.username || 'system',
      action: 'DELETE',
      setupType: 'ServiceType',
      entityCode: req.params.code,
      details: `Service type deleted: ${JSON.stringify({
        name: result.rows[0]?.name || 'Unknown',
        code: req.params.code
      })}`
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting service type:', err);
    res.status(500).json({ error: 'Failed to delete service type' });
  }
});

module.exports = router;