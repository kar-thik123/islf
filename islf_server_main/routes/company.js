const express = require('express');
const pool = require('../db');
const { logSetupEvent } = require('../log');
const router = express.Router();

// Get all companies
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies ORDER BY code DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching companies:', err);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Get company by code
router.get('/:code', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies WHERE code = $1', [req.params.code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching company:', err);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// Create company
router.post('/', async (req, res) => {
  const { code, name, name2, gst, phone, landline, email, website, pan_number, register_number, register_address, head_office_address, logo,company_type } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO companies (code, name, name2, gst, phone, landline, email, website, pan_number, register_number, register_address, head_office_address, logo,company_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,$14) RETURNING *',
      [code, name, name2, gst, phone, landline, email, website, pan_number, register_number, register_address, head_office_address, logo,company_type]
    );
    
    // Log the setup event
    await logSetupEvent({
      username: req.user?.username || 'system',
      action: 'CREATE',
      setupType: 'Company',
      entityType: 'company',
      entityCode: code,
      entityName: name,
      details: `Company created: ${name} (${code})`
    });
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating company:', err);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// Update company
router.put('/:code', async (req, res) => {
  const { name, name2, gst, phone, landline, email, website, pan_number, register_number, register_address, head_office_address, logo,company_type } = req.body;
  try {
    const oldResult = await pool.query('SELECT * FROM companies WHERE code = $1', [req.params.code]);
    if (oldResult.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const oldCompany = oldResult.rows[0];
    
    const result = await pool.query(
      'UPDATE companies SET name = $1, name2 = $2, gst = $3, phone = $4, landline = $5, email = $6, website = $7, pan_number = $8, register_number = $9, register_address = $10, head_office_address = $11, logo = $12,company_type = $13 WHERE code = $14 RETURNING *',
      [name, name2, gst, phone, landline, email, website, pan_number, register_number, register_address, head_office_address, logo,company_type, req.params.code]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const changedFields = [];
    const fieldsToCheck = {
      name,
      name2,
      gst,
      phone,
      landline,
      email,
      website,
      pan_number,
      register_number,
      register_address,
      head_office_address
    };
    const normalize = (value) => {
      if (value === null || value === undefined) return '';
      if (value instanceof Date) return value.toISOString().split('T')[0];
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value;
      return value.toString().trim();
    };
    for (const field in fieldsToCheck) {
      const newValueRaw = fieldsToCheck[field];
      const oldValueRaw = oldCompany[field];
      const newValue = normalize(newValueRaw);
      const oldValue = normalize(oldValueRaw);
      
      const valuesAreEqual = newValue === oldValue;
      if (!valuesAreEqual) {
      changedFields.push(`${field}: "${oldValue}" → "${newValue}"`);
    }
  }
    const details = changedFields.length > 0
      ? `Company updated:\n` + changedFields.join('\n')
      : 'No actual changes detected.';

    // Log the setup event
    await logSetupEvent({
      username: req.user?.username || 'system',
      action: 'UPDATE',
      setupType: 'Company',
      entityType: 'company',
      entityCode: req.params.code,
      entityName: name,
      details
    });
    
    res.json(result.rows[0]);
    // End of try block
  } 
  catch (err) {
    console.error('Error updating company:', err);
    res.status(500).json({ error: 'Failed to update company' });
  }
  });

// Delete company
router.delete('/:code', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM companies WHERE code = $1 RETURNING *', [req.params.code]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    
    // Log the setup event
    await logSetupEvent({
      username: req.user?.username || 'system',
      action: 'DELETE',
      setupType: 'Company',
      entityType: 'company',
      entityCode: req.params.code,
      entityName: result.rows[0]?.name || 'Unknown',
      details: `Company deleted: ${JSON.stringify({
        name: result.rows[0]?.name || 'Unknown',
        code: req.params.code
      })}`
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting company:', err);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

module.exports = router;
