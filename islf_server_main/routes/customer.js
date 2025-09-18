const express = require('express');
const pool = require('../db');
const { logMasterEvent } = require('../log');
const router = express.Router();

function getUsernameFromToken(req) {
  if (!req.user) {
    console.log('No user in request');
    return 'system';
  }
  
  // Debug: log what's in the user object
  console.log('User object from JWT:', req.user);
  
  const username = req.user.name || req.user.username || req.user.email || 'system';
  console.log('Extracted username:', username);
  return username;
}

// GET all customers with optional context-based filtering
router.get('/', async (req, res) => {
  try {
    const { company_code, branch_code, department_code, service_type_code } = req.query;
    console.log("Query params:", req.query);

    let query = `
      SELECT *
      FROM customer
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Hierarchical filtering
    if (company_code) {
      query += ` AND company_code = $${paramIndex}`;
      params.push(company_code);
      paramIndex++;

      if (branch_code) {
        query += ` AND branch_code = $${paramIndex}`;
        params.push(branch_code);
        paramIndex++;

        if (department_code) {
          query += ` AND department_code = $${paramIndex}`;
          params.push(department_code);
          paramIndex++;
        }
      }
    }

    // Service type is independent → apply if provided
    if (service_type_code) {
      query += ` AND service_type_code = $${paramIndex}`;
      params.push(service_type_code);
      paramIndex++;
    }

    query += ` ORDER BY id ASC`;

    const result = await pool.query(query, params);
    
    // Fetch contacts for each customer
    const customers = result.rows;
    for (const customer of customers) {
      const contactsResult = await pool.query(
        'SELECT * FROM customer_contacts WHERE customer_id = $1 AND is_active = true ORDER BY is_primary DESC, id ASC',
        [customer.id]
      );
      customer.contacts = contactsResult.rows;
    }
    
    res.json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});


// CREATE new customer (with number series logic and manual/default check)
router.post('/', async (req, res) => {
  // UPDATE the POST route parameter extraction
  let {
    seriesCode, customer_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website,
    bill_to_customer_name, vat_gst_no, place_of_supply, pan_no, tan_no, contacts,
    company_code, branch_code, department_code, service_type_code // <-- Use snake_case
  } = req.body;
  // Debug: log the request body
  console.log('REQ BODY:', req.body);
  try {
    // Relation-based number series lookup
    // This approach handles null values in mapping_relations as wildcards
    if (!seriesCode && company_code && branch_code && department_code) {
      // First try to find exact match including service_type_code
      let mappingRes;
      if (service_type_code) {
        mappingRes = await pool.query(
          `SELECT mapping FROM mapping_relations
           WHERE code_type = $1
           AND company_code = $2
           AND branch_code = $3
           AND department_code = $4
           AND (service_type_code = $5 OR service_type_code IS NULL)
           ORDER BY CASE WHEN service_type_code IS NULL THEN 1 ELSE 0 END, id DESC
           LIMIT 1`,
          ['customerCode', company_code, branch_code, department_code, service_type_code]
        );
      } else {
        mappingRes = await pool.query(
          `SELECT mapping FROM mapping_relations
           WHERE code_type = $1
           AND company_code = $2
           AND branch_code = $3
           AND department_code = $4
           AND service_type_code IS NULL
           ORDER BY id DESC
           LIMIT 1`,
          ['customerCode', company_code, branch_code, department_code]
        );
      }
      
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
        // Not manual: generate code using relation with transaction safety
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          
          const relResult = await client.query(
            'SELECT * FROM number_relation WHERE number_series = $1 ORDER BY id DESC LIMIT 1 FOR UPDATE',
            [seriesCode]
          );
          
          if (relResult.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(400).json({ error: 'Number series relation not found' });
          }
          
          const rel = relResult.rows[0];
          let nextNo;
          if (rel.last_no_used === 0) {
            // If this is the first use, start with starting_no
            nextNo = Number(rel.starting_no);
          } else {
            // Otherwise, increment from last_no_used
            nextNo = Number(rel.last_no_used) + Number(rel.increment_by);
          }
          
          customer_no = `${rel.prefix || ''}${nextNo}`;
          console.log('Generated customer code:', customer_no);
          
          // Update the last_no_used within the same transaction
          await client.query(
            'UPDATE number_relation SET last_no_used = $1 WHERE id = $2',
            [nextNo, rel.id]
          );
          
          await client.query('COMMIT');
          client.release();
        } catch (error) {
          await client.query('ROLLBACK');
          client.release();
          throw error;
        }
      }
    } else if (!customer_no || customer_no === 'AUTO') {
      customer_no = 'CUS-' + Date.now();
    }
    // Start transaction for customer and contacts
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Insert customer without contacts field
      const result = await client.query(
        `INSERT INTO customer (
          customer_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website,
          bill_to_customer_name, vat_gst_no, place_of_supply, pan_no, tan_no,
          company_code, branch_code, department_code, service_type_code
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
          $18, $19, $20, $21 ) RETURNING *`,
        [
          customer_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website,
          bill_to_customer_name, vat_gst_no, place_of_supply, pan_no, tan_no,
          company_code, branch_code, department_code, service_type_code
        ]
      );
      
      const customerId = result.rows[0].id;
      
      // Insert contacts if provided
      if (contacts && Array.isArray(contacts) && contacts.length > 0) {
        for (const contact of contacts) {
          await client.query(
            `INSERT INTO customer_contacts (
              customer_id, name, department, mobile, landline, email, remarks, is_primary, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              customerId,
              contact.name || '',
              contact.department || null,
              contact.mobile || null,
              contact.landline || null,
              contact.email || null,
              contact.remarks || null,
              contact.is_primary || false,
              contact.is_active !== false // Default to true unless explicitly false
            ]
          );
        }
      }
      
      await client.query('COMMIT');
      client.release();
      
      // Log the master event
      await logMasterEvent({
        username: getUsernameFromToken(req),
        action: 'CREATE',
        masterType: 'Customer',
        recordId: customer_no,
        details: `New Customer ${customer_no}-${name} has been created successfully.`
      });
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      throw error;
    }
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
    bill_to_customer_name, vat_gst_no, place_of_supply, pan_no, tan_no, contacts,
  } = req.body;
  try {
    // Fetch existing customer for comparison
    const oldResult = await pool.query('SELECT * FROM customer WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const oldCustomer = oldResult.rows[0];
    // Start transaction for customer and contacts update
    const client = await pool.connect();
    let result;
    try {
      await client.query('BEGIN');
      
      result = await client.query(
        `UPDATE customer SET
          customer_no = $1, type = $2, name = $3, name2 = $4, blocked = $5, address = $6, address1 = $7, country = $8, state = $9, city = $10, postal_code = $11, website = $12,
          bill_to_customer_name = $13, vat_gst_no = $14, place_of_supply = $15, pan_no = $16, tan_no = $17
        WHERE id = $18 RETURNING *`,
        [
          customer_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website,
          bill_to_customer_name, vat_gst_no, place_of_supply, pan_no, tan_no, id
        ]
      );
      
      // Update contacts if provided
      if (contacts && Array.isArray(contacts)) {
        // Delete existing contacts
        await client.query('DELETE FROM customer_contacts WHERE customer_id = $1', [id]);
        
        // Insert new contacts
        for (const contact of contacts) {
          await client.query(
            `INSERT INTO customer_contacts (
              customer_id, name, department, mobile, landline, email, remarks, is_primary, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              id,
              contact.name || '',
              contact.department || null,
              contact.mobile || null,
              contact.landline || null,
              contact.email || null,
              contact.remarks || null,
              contact.is_primary || false,
              contact.is_active !== false // Default to true unless explicitly false
            ]
          );
        }
      }
      
      await client.query('COMMIT');
      client.release();
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      throw error;
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const changedFields = [];
    const fieldsToCheck = {
      customer_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website,
      vat_gst_no, place_of_supply, pan_no, tan_no, contacts
    };  
    const normalize = (value) => {
      if (value === null || value === undefined) return '';
      if (value instanceof Date) return value.toISOString().split('T')[0];
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value;
      return value.toString().trim();
    };
    for (const field in fieldsToCheck) {
      const newValue = normalize(fieldsToCheck[field]);
      const oldValue = normalize(oldCustomer[field]);
      
      const valuesAreEqual = newValue === oldValue;
      if (!valuesAreEqual) {
        changedFields.push(`Field "${field}" changed from "${oldValue}" to "${newValue}".`);
      }
    }
    const details = changedFields.length > 0
      ? `Changes detected in the \n` + changedFields.join('\n')
      :  'No actual changes detected.';
    
    
    // Log the master event
    await logMasterEvent({
      username: getUsernameFromToken(req),
      action: 'UPDATE',
      masterType: 'Customer',
      recordId: customer_no,
      details
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
    // Start transaction to delete customer and related contacts
    const client = await pool.connect();
    let result;
    try {
      await client.query('BEGIN');
      
      // First get customer details for logging
      const customerResult = await client.query('SELECT * FROM customer WHERE id = $1', [id]);
      if (customerResult.rows.length === 0) {
        await client.query('ROLLBACK');
        client.release();
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      // Delete related contacts first
      await client.query('DELETE FROM customer_contacts WHERE customer_id = $1', [id]);
      
      // Then delete the customer
      result = await client.query(
        `DELETE FROM customer WHERE id = $1 RETURNING *`,
        [id]
      );
      
      await client.query('COMMIT');
      client.release();
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      throw error;
    }
    
    // Log the master event
    await logMasterEvent({
      username: getUsernameFromToken(req),
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