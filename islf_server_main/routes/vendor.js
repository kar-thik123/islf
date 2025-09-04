const express = require('express');
const pool = require('../db');
const { logMasterEvent } = require('../log');
const router = express.Router();

// Helper function to find mapping with IT setup validation
async function findMappingByContext(codeType, company_code, branch_code, department_code, service_type_code) {
  try {
    // Get IT setup configuration for this code type
    const configResult = await pool.query(
      "SELECT value FROM settings WHERE key = $1",
      [`validation_${codeType.toLowerCase().replace('code', '')}_filter`]
    );
    
    const filter = configResult.rows[0]?.value || '';
    console.log(`IT Setup filter for ${codeType}:`, filter);
    
    // Build context parameters based on IT setup validation
    let whereClauses = ['code_type = $1'];
    let params = [codeType];
    let idx = 2;
    
    // Only include context parameters that are required by IT setup
    if (filter.includes('C') && company_code) {
      whereClauses.push(`(company_code = $${idx} OR company_code IS NULL)`);
      params.push(company_code);
      idx++;
    }
    
    if (filter.includes('B') && branch_code) {
      whereClauses.push(`(branch_code = $${idx} OR branch_code IS NULL)`);
      params.push(branch_code);
      idx++;
    }
    
    if (filter.includes('D') && department_code) {
      whereClauses.push(`(department_code = $${idx} OR department_code IS NULL)`);
      params.push(department_code);
      idx++;
    }
    
    if (filter.includes('ST') && service_type_code) {
      whereClauses.push(`(service_type_code = $${idx} OR service_type_code IS NULL)`);
      params.push(service_type_code);
      idx++;
    }
    
    const where = whereClauses.join(' AND ');
    
    // Order by specificity: exact matches first, then wildcards
    const orderBy = `
      ORDER BY 
        CASE WHEN company_code IS NOT NULL THEN 1 ELSE 0 END DESC,
        CASE WHEN branch_code IS NOT NULL THEN 1 ELSE 0 END DESC,
        CASE WHEN department_code IS NOT NULL THEN 1 ELSE 0 END DESC,
        CASE WHEN service_type_code IS NOT NULL THEN 1 ELSE 0 END DESC,
        id DESC
      LIMIT 1
    `;
    
    const result = await pool.query(
      `SELECT * FROM mapping_relations WHERE ${where} ${orderBy}`,
      params
    );
    
    return result.rows[0] || null;
  } catch (err) {
    console.error('Error finding mapping:', err);
    return null;
  }
}

// GET all vendors with optional context-based filtering
router.get('/', async (req, res) => {
  try {
    const { company_code, branch_code, department_code, service_type_code } = req.query;

    let query = `
      SELECT *
      FROM vendor
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

    // Service type filter (independent)
    if (service_type_code) {
      query += ` AND service_type_code = $${paramIndex}`;
      params.push(service_type_code);
      paramIndex++;
    }

    query += ` ORDER BY id ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching vendors:', err);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// CREATE new vendor (with IT setup aware number series logic)
router.post('/', async (req, res) => {
  let {
    seriesCode, vendor_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website,
    bill_to_vendor_name, vat_gst_no, place_of_supply, pan_no, tan_no, contacts,
    company_code, branch_code, department_code, service_type_code // <-- expect these in the request
  } = req.body;
  
  try {
    // IT setup aware number series lookup
    if (!seriesCode && company_code && branch_code && department_code) {
      const mapping = await findMappingByContext('vendorCode', company_code, branch_code, department_code, service_type_code);
      if (mapping) {
        seriesCode = mapping.mapping;
        console.log('Found series code via IT setup validation:', seriesCode);
      }
    }
    if (seriesCode) {
      const seriesResult = await pool.query(
        'SELECT * FROM number_series WHERE code = $1 ORDER BY id DESC LIMIT 1',
        [seriesCode]
      );
      if (seriesResult.rows.length === 0) {
        return res.status(400).json({ error: 'Number series not found' });
      }
      const series = seriesResult.rows[0];
      if (series.is_manual) {
        if (!vendor_no || vendor_no.trim() === '') {
          return res.status(400).json({ error: 'Manual code entry required for this series' });
        }
        // Check for duplicate code
        const exists = await pool.query('SELECT 1 FROM vendor WHERE vendor_no = $1', [vendor_no]);
        if (exists.rows.length > 0) {
          return res.status(400).json({ error: 'Vendor No already exists' });
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
          
          vendor_no = `${rel.prefix || ''}${nextNo}`;
          console.log('Generated vendor code:', vendor_no);
          
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
    } else if (!vendor_no || vendor_no === 'AUTO') {
      vendor_no = 'VENDOR-' + Date.now();
    }
    const result = await pool.query(
      `INSERT INTO vendor (
        vendor_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website,
        bill_to_vendor_name, vat_gst_no, place_of_supply, pan_no, tan_no, contacts,
        company_code, branch_code, department_code, service_type_code
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22
      ) RETURNING *`,
      [
        vendor_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website,
        bill_to_vendor_name, vat_gst_no, place_of_supply, pan_no, tan_no, JSON.stringify(contacts || []),
        company_code, branch_code, department_code, service_type_code
      ]
    );
    
    // Log the master event
    await logMasterEvent({
      username: req.user?.username || 'system',
      action: 'CREATE',
      masterType: 'Vendor',
      recordId: vendor_no,
      recordName: name,
      details: `Vendor created: ${name} (${vendor_no})`
    });
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating vendor:', err);
    res.status(500).json({ error: 'Failed to create vendor' });
  }
});

// UPDATE vendor by ID
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  let {
    seriesCode, vendor_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website,
    bill_to_vendor_name, vat_gst_no, place_of_supply, pan_no, tan_no, contacts,
    company_code, branch_code, department_code, service_type_code // <-- Updated to snake_case
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE vendor SET
        vendor_no = $1, type = $2, name = $3, name2 = $4, blocked = $5, address = $6, address1 = $7, country = $8, state = $9, city = $10, postal_code = $11, website = $12,
        bill_to_vendor_name = $13, vat_gst_no = $14, place_of_supply = $15, pan_no = $16, tan_no = $17, contacts = $18,
        company_code = $19, branch_code = $20, department_code = $21, service_type_code = $22
      WHERE id = $23 RETURNING *`,
      [
        vendor_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website,
        bill_to_vendor_name, vat_gst_no, place_of_supply, pan_no, tan_no, JSON.stringify(contacts || []),
        company_code, branch_code, department_code, service_type_code, id
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    // Log the master event
    await logMasterEvent({
      username: req.user?.username || 'system',
      action: 'UPDATE',
      masterType: 'Vendor',
      recordId: vendor_no,
      recordName: name,
      details: `Vendor updated: ${name} (${vendor_no})`
    });
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating vendor:', err);
    res.status(500).json({ error: 'Failed to update vendor' });
  }
});

// DELETE vendor by ID
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  try {
    const result = await pool.query(
      `DELETE FROM vendor WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    // Log the master event
    await logMasterEvent({
      username: req.user?.username || 'system',
      action: 'DELETE',
      masterType: 'Vendor',
      recordId: result.rows[0].vendor_no,
      recordName: result.rows[0].name,
      details: `Vendor deleted: ${result.rows[0].name} (${result.rows[0].vendor_no})`
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting vendor:', err);
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

module.exports = router;