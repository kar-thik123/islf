const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const { getContextFromRequest, getUsernameFromToken } = require('../utils/context-helper');
const { logMasterEvent } = require('../log');

// Get all source sales with IT setup validation filtering
router.get('/', async (req, res) => {
  try {
    const { company_code, branch_code, department_code, service_type_code } = req.query;
    
    // Check IT setup validation for filtering
    const configResult = await pool.query(
      "SELECT value FROM settings WHERE key = $1",
      [`validation_source_filter`]
    );
    
    const filter = configResult.rows[0]?.value || '';
    
    let query = `
      SELECT mss.*
      FROM master_source_sales AS mss
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Apply context filtering based on IT setup
    if (filter.includes('C') && company_code) {
      query += ` AND mss.company_code = $${paramIndex}`;
      params.push(company_code);
      paramIndex++;
    }
    
    if (filter.includes('B') && branch_code) {
      query += ` AND mss.branch_code = $${paramIndex}`;
      params.push(branch_code);
      paramIndex++;
    }
    
    if (filter.includes('D') && department_code) {
      query += ` AND mss.department_code = $${paramIndex}`;
      params.push(department_code);
      paramIndex++;
    }
    
    if (filter.includes('ST') && service_type_code) {
      query += ` AND mss.service_type_code = $${paramIndex}`;
      params.push(service_type_code);
      paramIndex++;
    }
    
    query += ` ORDER BY mss.code`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('ERR: Internal Server error');
  }
});

// Get source sales by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company_code, branch_code, department_code, service_type_code } = req.query;

    const isValidId = await pool.query(
      "SELECT * FROM master_source_sales WHERE id = $1", [id]
    )
    if(isValidId.rows.length === 0 ){
      return res.status(404).json({msg: "Invalid Source Sales ID"});
    }
    
    // Check IT setup validation for filtering
    const configResult = await pool.query(
      "SELECT value FROM settings WHERE key = $1",
      [`validation_source_filter`]
    );
    
    const filter = configResult.rows[0]?.value || '';
    
    let query = `
      SELECT mss.*
      FROM master_source_sales mss
      WHERE mss.id = $1
    `;
    
    const params = [id];
    let paramIndex = 2;
    
    // Apply context filtering based on IT setup
    if (filter.includes('C') && company_code) {
      query += ` AND mss.company_code = $${paramIndex}`;
      params.push(company_code);
      paramIndex++;
    }
    
    if (filter.includes('B') && branch_code) {
      query += ` AND mss.branch_code = $${paramIndex}`;
      params.push(branch_code);
      paramIndex++;
    }
    
    if (filter.includes('D') && department_code) {
      query += ` AND mss.department_code = $${paramIndex}`;
      params.push(department_code);
      paramIndex++;
    }
    
    if (filter.includes('ST') && service_type_code) {
      query += ` AND mss.service_type_code = $${paramIndex}`;
      params.push(service_type_code);
      paramIndex++;
    }
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Source sales not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create source sales
router.post('/', async (req, res) => {
  try {
    console.log('🔹 Request body:', req.body);

    const { code, name, commission_percentage, email, phone, status, company_code, branch_code, department_code, service_type_code } = req.body;

    let username = await getUsernameFromToken(req);
    console.log('🔹 Username from token:', username);

    let seriesCode;
    let finalCode = code || '';
    let codeType = 'SOURCE_SALES';

    // Required field check
    if (!name) {
      console.log('❌ Missing required field: name');
      return res.status(400).json({ error: 'Name is required' });
    }

    // IT setup validation
    const configResult = await pool.query(
      "SELECT value FROM settings WHERE key = $1",
      [`validation_source_filter`]
    );
    const filter = configResult.rows[0]?.value || '';
    console.log('🔹 IT setup filter:', filter);

    if (filter.includes('C') && !company_code) return res.status(400).json({ error: 'Company code is required based on IT setup' });
    if (filter.includes('B') && !branch_code) return res.status(400).json({ error: 'Branch code is required based on IT setup' });
    if (filter.includes('D') && !department_code) return res.status(400).json({ error: 'Department code is required based on IT setup' });
    if (filter.includes('ST') && !service_type_code) return res.status(400).json({ error: 'Service type code is required based on IT setup' });

    // Check if code already exists
    if (finalCode) {
      const codeCheck = await pool.query('SELECT * FROM master_source_sales WHERE code = $1', [finalCode]);
      if (codeCheck.rows.length > 0) {
        console.log('❌ Source sales code already exists:', finalCode);
        return res.status(400).json({ error: 'Source sales code already exists' });
      }
    }

    console.log('🔹 Proceeding to number series lookup if code is empty');

    // Determine seriesCode if code is empty
    if (!finalCode && company_code) {
      if (req.body.seriesCode) {
        seriesCode = req.body.seriesCode;
        console.log('🔹 Using seriesCode from request:', seriesCode);
      } else {
        // Lookup series from mapping_relations
        let whereConditions = ['code_type = $1', 'company_code = $2'];
        let queryParams = [codeType, company_code];
        let paramIndex = 3;

        if (branch_code) {
          whereConditions.push(`branch_code = $${paramIndex}`);
          queryParams.push(branch_code);
          paramIndex++;
        } else whereConditions.push('(branch_code IS NULL OR branch_code = \'\')');

        if (department_code) {
          whereConditions.push(`department_code = $${paramIndex}`);
          queryParams.push(department_code);
        } else whereConditions.push('(department_code IS NULL OR department_code = \'\')');

        const mappingQuery = `SELECT mapping FROM mapping_relations WHERE ${whereConditions.join(' AND ')} ORDER BY id DESC LIMIT 1`;
        console.log('🔹 Mapping query:', mappingQuery, queryParams);

        const mappingRes = await pool.query(mappingQuery, queryParams);
        if (mappingRes.rows.length > 0) {
          seriesCode = mappingRes.rows[0].mapping;
          console.log('🔹 Found series code from mapping:', seriesCode);
        }
      }
    }

    // Generate code from number_series / number_relation
    if (seriesCode) {
      console.log('🔹 Generating code from series...');
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const seriesResult = await client.query(
          'SELECT * FROM number_series WHERE code = $1 ORDER BY id DESC LIMIT 1',
          [seriesCode]
        );

        if (seriesResult.rows.length === 0) {
          await client.query('ROLLBACK');
          client.release();
          return res.status(400).json({ error: 'Number series not found' });
        }

        const series = seriesResult.rows[0];
        console.log('🔹 Series details:', series);

        if (series.is_manual) {
          if (!finalCode.trim()) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(400).json({ error: 'Manual code entry required for this series' });
          }
        } else {
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
          const nextNo = rel.last_no_used === 0 ? Number(rel.starting_no) : Number(rel.last_no_used) + Number(rel.increment_by);
          finalCode = `${rel.prefix || ''}${nextNo}`;
          console.log('🔹 Generated code from series:', finalCode);

          await client.query(
            'UPDATE number_relation SET last_no_used = $1 WHERE id = $2',
            [nextNo, rel.id]
          );
        }

        await client.query('COMMIT');
        client.release();
      } catch (error) {
        await client.query('ROLLBACK');
        client.release();
        throw error;
      }
    } else if (!finalCode) {
      // Fallback code if no series
      finalCode = 'SRC-SALES-' + Date.now();
      console.log('🔹 Generated fallback code:', finalCode);
    }

    // Insert into master_source_sales
    const result = await pool.query(
      `INSERT INTO master_source_sales 
       (code, name, commission_percentage, email, phone, status, company_code, branch_code, department_code, service_type_code, created_by, updated_by) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) 
       RETURNING *`,
      [
        finalCode, name, commission_percentage || null, email || null, phone || null, status || 'A',
        company_code || null, branch_code || null, department_code || null, service_type_code || null,
        username, username
      ]
    );

    console.log('✅ Source sales created successfully:', result.rows[0]);

    // Log the event
    await logMasterEvent({
      masterType: 'source_sales',
      username,
      action: 'Create',
      details: 'Created New Source Sales master',
      recordId: finalCode
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Server error:', err);
    res.status(500).json({ msg: 'Server error', err: err.message || err });
  }
});


// Update source sales
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, commission_percentage, email, phone, status, company_code, branch_code, department_code, service_type_code } = req.body;
    const username = await getUsernameFromToken(req);
    
    // Check if required fields are provided
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Check IT setup validation for context matching
    const configResult = await pool.query(
      "SELECT value FROM settings WHERE key = $1",
      [`validation_source_filter`]
    );
    
    const filter = configResult.rows[0]?.value || '';
    
    // Check if source sales exists
    const sourceSalesCheck = await pool.query(
      "SELECT * FROM master_source_sales WHERE id = $1",
      [id]
    );
    
    if (sourceSalesCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Source sales not found' });
    }
    
    // Context validation
    if (filter.includes('C') && company_code !== sourceSalesCheck.rows[0].company_code) {
      return res.status(400).json({ error: 'Cannot change company code based on IT setup' });
    }
    
    if (filter.includes('B') && branch_code !== sourceSalesCheck.rows[0].branch_code) {
      return res.status(400).json({ error: 'Cannot change branch code based on IT setup' });
    }
    
    if (filter.includes('D') && department_code !== sourceSalesCheck.rows[0].department_code) {
      return res.status(400).json({ error: 'Cannot change department code based on IT setup' });
    }
    
    if (filter.includes('ST') && service_type_code !== sourceSalesCheck.rows[0].service_type_code) {
      return res.status(400).json({ error: 'Cannot change service type code based on IT setup' });
    }
    
    // Check if code is being changed and if it already exists
    if (code !== sourceSalesCheck.rows[0].code) {
      const codeCheck = await pool.query(
        "SELECT * FROM master_source_sales WHERE code = $1",
        [code]
      );
      
      if (codeCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Source sales code already exists' });
      }
    }
    
    // Get existing data for logging
    const oldData = sourceSalesCheck.rows[0];
    
    // Update source sales
    const result = await pool.query(
      `UPDATE master_source_sales 
       SET code = $1, name = $2, commission_percentage = $3, email = $4, phone = $5, status = $6, 
           company_code = $7, branch_code = $8, department_code = $9, service_type_code = $10 
       WHERE id = $11
       RETURNING *`,
      [
        code, 
        name, 
        commission_percentage || null, 
        email || null, 
        phone || null, 
        status || 'A',
        company_code || null, 
        branch_code || null, 
        department_code || null, 
        service_type_code || null,
        id
      ]
    );
    
    // Log the event
    await logMasterEvent({
      masterType: 'source_sales',
      action: 'update',
      details: 'Source Sales Master updated',
      username,
      recordId: code
    });
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete source sales
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const username = await getUsernameFromToken(req);
    
    // Check if source sales exists and get code for logging
    const sourceSalesCheck = await pool.query(
      "SELECT * FROM master_source_sales WHERE id = $1",
      [id]
    );
    
    if (sourceSalesCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Source sales not found' });
    }
    
    const sourceSalesCode = sourceSalesCheck.rows[0].code;
    
    const result = await pool.query(
      'DELETE FROM master_source_sales WHERE id = $1 RETURNING *',
      [id]
    );
    
    // Log the event
    await logMasterEvent({
      masterType: 'source_sales',
      action: 'delete',
      details: 'Source Sales Master deleted',
      username,
      recordId: sourceSalesCode
    });
    
    res.json({ message: 'Source sales deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;