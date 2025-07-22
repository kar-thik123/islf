const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET mapping (map DB fields to camelCase)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mapping LIMIT 1');
    if (result.rows.length === 0) {
      // Return default empty mapping if not set
      return res.json({
        customerCode: null,
        vendorCode: null,
        employeeCode: null,
        customerQuote: null,
        invoiceNo: null,
        taxNo: null,
        jobcardNo: null,
        branchNo: null,
        departmentNo: null,
        vesselCode: null
      });
    }
    const dbRow = result.rows[0];
    res.json({
      customerCode: dbRow.customercode,
      vendorCode: dbRow.vendorcode,
      employeeCode: dbRow.employeecode,
      customerQuote: dbRow.customerquote,
      invoiceNo: dbRow.invoiceno,
      taxNo: dbRow.taxno,
      jobcardNo: dbRow.jobcardno,
      branchNo: dbRow.branchno,
      departmentNo: dbRow.departmentno,
      vesselCode: dbRow.vesselcode
    });
  } catch (err) {
    console.error('Error fetching mapping:', err);
    res.status(500).json({ error: 'Failed to fetch mapping' });
  }
});

// SAVE mapping (upsert: delete all, insert new, use lowercase columns)
router.post('/', async (req, res) => {
  const {
    customerCode,
    vendorCode,
    employeeCode,
    customerQuote,
    invoiceNo,
    taxNo,
    jobcardNo,
    branchNo,
    departmentNo,
    vesselCode
  } = req.body;
  try {
    await pool.query('DELETE FROM mapping');
    const result = await pool.query(
      `INSERT INTO mapping (customercode, vendorcode, employeecode, customerquote, invoiceno, taxno, jobcardno, branchno, departmentno, vesselcode)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [customerCode, vendorCode, employeeCode, customerQuote, invoiceNo, taxNo, jobcardNo, branchNo, departmentNo, vesselCode]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error saving mapping:', err);
    res.status(500).json({ error: 'Failed to save mapping' });
  }
});

module.exports = router; 