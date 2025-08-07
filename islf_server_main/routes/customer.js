const express = require('express');
const pool = require('../db');
const { logMasterEvent } = require('../log');
const router = express.Router();

// GET all customers
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customer ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// CREATE new customer (with number series logic and manual/default check)
router.post('/', async (req, res) => {
  let {
    seriesCode, customer_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website,
    bill_to_customer_name, vat_gst_no, place_of_supply, pan_no, tan_no, contacts,
    companyCode, branchCode,departmentCode,ServiceTypeCode // <-- expect these in the request
  } = req.body;
  // Debug: log the request body
  console.log('REQ BODY:', req.body);
  try {
    // Relation-based number series lookup
    if (!seriesCode && companyCode && branchCode && departmentCode && ServiceTypeCode) {
      const mappingRes = await pool.query(
        `SELECT mapping FROM mapping_relations WHERE code_type = 'customerCode' AND company_code = $1 AND branch_code = $2 AND department_code = $3 AND service_type_code = $4 LIMIT 1`,
        [companyCode, branchCode, departmentCode, ServiceTypeCode]
      );
      // Debug: log mapping result
      console.log('MAPPING RESULT:', mappingRes.rows);
      if (mappingRes.rows.length > 0) {
        seriesCode = mappingRes.rows[0].mapping;
        // Debug: log series code from mapping
        console.log('SERIES CODE FROM MAPPING:', seriesCode);
      }
    }
    if (seriesCode) {
      const seriesResult = await pool.query(
        'SELECT * FROM number_series WHERE code = $1 ORDER BY id DESC LIMIT 1',
        [seriesCode]
      );
      // Debug: log number series result
      console.log('NUMBER SERIES RESULT:', seriesResult.rows);
      if (seriesResult.rows.length === 0) {
        return res.status(400).json({ error: 'Number series not found' });
      }
      const series = seriesResult.rows[0];
      if (series.is_manual) {
        if (!customer_no || customer_no.trim() === '') {
          return res.status(400).json({ error: 'Manual code entry required for this series' });
        }
        // Check for duplicate code
        const exists = await pool.query('SELECT 1 FROM customer WHERE customer_no = $1', [customer_no]);
        if (exists.rows.length > 0) {
          return res.status(400).json({ error: 'Customer No already exists' });
        }
      } else {
        // Not manual: generate code using relation
        const relResult = await pool.query(
          'SELECT * FROM number_relation WHERE number_series = $1 ORDER BY id DESC LIMIT 1',
          [seriesCode]
        );
        // Debug: log number relation result
        console.log('NUMBER RELATION RESULT:', relResult.rows);
        if (relResult.rows.length === 0) {
          return res.status(400).json({ error: 'Number series relation not found' });
        }
        const rel = relResult.rows[0];
        const nextNo = Number(rel.last_no_used) + Number(rel.increment_by);
        customer_no = `${rel.prefix || ''}${nextNo}`;
        await pool.query(
          'UPDATE number_relation SET last_no_used = $1 WHERE id = $2',
          [nextNo, rel.id]
        );
      }
    } else if (!customer_no || customer_no === 'AUTO') {
      customer_no = 'CUSTOMER-' + Date.now();
    }
    const result = await pool.query(
      `INSERT INTO customer (
        customer_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website,
        bill_to_customer_name, vat_gst_no, place_of_supply, pan_no, tan_no, contacts
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      ) RETURNING *`,
      [
        customer_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website,
        bill_to_customer_name, vat_gst_no, place_of_supply, pan_no, tan_no, JSON.stringify(contacts || [])
      ]
    );
    
    // Log the master event
    await logMasterEvent({
      username: req.user?.username || 'system',
      action: 'CREATE',
      masterType: 'Customer',
      recordId: customer_no,
      recordName: name,
      details: `Customer created: ${name} (${customer_no})`
    });
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// UPDATE customer by ID
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  const {
    customer_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website,
    bill_to_customer_name, vat_gst_no, place_of_supply, pan_no, tan_no, contacts
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE customer SET
        customer_no = $1, type = $2, name = $3, name2 = $4, blocked = $5, address = $6, address1 = $7, country = $8, state = $9, city = $10, postal_code = $11, website = $12,
        bill_to_customer_name = $13, vat_gst_no = $14, place_of_supply = $15, pan_no = $16, tan_no = $17, contacts = $18
      WHERE id = $19 RETURNING *`,
      [
        customer_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website,
        bill_to_customer_name, vat_gst_no, place_of_supply, pan_no, tan_no, JSON.stringify(contacts || []), id
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Log the master event
    await logMasterEvent({
      username: req.user?.username || 'system',
      action: 'UPDATE',
      masterType: 'Customer',
      recordId: customer_no,
      recordName: name,
      details: `Customer updated: ${name} (${customer_no})`
    });
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// DELETE customer by ID
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  try {
    const result = await pool.query(
      `DELETE FROM customer WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Log the master event
    await logMasterEvent({
      username: req.user?.username || 'system',
      action: 'DELETE',
      masterType: 'Customer',
      recordId: result.rows[0].customer_no,
      recordName: result.rows[0].name,
      details: `Customer deleted: ${result.rows[0].name} (${result.rows[0].customer_no})`
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting customer:', err);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

module.exports = router; 