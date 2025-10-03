const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const { getContextFromRequest, getUsernameFromToken } = require('../utils/context-helper');
const { logMasterEvent } = require('../log');


// Get all service areas with IT setup validation filtering
router.get('/', async (req, res) => {
  try {
    // const context = getContextFromRequest(req);
    const { company_code, branch_code, department_code, service_type_code } = req.query;
    
    // Check IT setup validation for filtering
    const configResult = await pool.query(
      "SELECT value FROM settings WHERE key = $1",
      [`validation_service_area_filter`]
    );
    
    const filter = configResult.rows[0]?.value || '';
    
    let query = `
      SELECT msa.*, mt.description as type_description
      FROM master_service_area AS msa
      LEFT JOIN master_type AS mt ON msa.type = mt.key AND mt.key = 'SERVICE_AREA'
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Apply context filtering based on IT setup
    if (filter.includes('C') && company_code) {
      query += ` AND msa.company_code = $${paramIndex}`;
      params.push(company_code);
      paramIndex++;
    }
    
    if (filter.includes('B') && branch_code) {
      query += ` AND msa.branch_code = $${paramIndex}`;
      params.push(branch_code);
      paramIndex++;
    }
    
    if (filter.includes('D') && department_code) {
      query += ` AND msa.department_code = $${paramIndex}`;
      params.push(department_code);
      paramIndex++;
    }
    
    if (filter.includes('ST') && service_type_code) {
      query += ` AND msa.service_type_code = $${paramIndex}`;
      params.push(service_type_code);
      paramIndex++;
    }
    
    query += ` ORDER BY msa.code`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('ERR: Internal Server error');
  }
});

// Get service area by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company_code, branch_code, department_code, service_type_code } = req.query;

    const isValidId = await pool.query(
      "SELECT * FROM master_service_area WHERE id = $1", [id]
    )
    if(isValidId.rows.length === 0 ){
      return res.status(404).json({msg: "Invalid User ID"});
    }
    
    // Check IT setup validation for filtering
    const configResult = await pool.query(
      "SELECT value FROM settings WHERE key = $1",
      [`validation_service_area_filter`]
    );
    
    const filter = configResult.rows[0]?.value || '';
    
    let query = `
      SELECT msa.*, mt.description as type_description
      FROM master_service_area msa
      LEFT JOIN master_type mt ON msa.type = mt.key AND mt.key = 'SERVICE_AREA'
      WHERE msa.id = $1
    `;
    
    const params = [id];
    let paramIndex = 2;
    
    // Apply context filtering based on IT setup
    if (filter.includes('C') && company_code) {
      query += ` AND msa.company_code = $${paramIndex}`;
      params.push(company_code);
      paramIndex++;
    }
    
    if (filter.includes('B') && branch_code) {
      query += ` AND msa.branch_code = $${paramIndex}`;
      params.push(branch_code);
      paramIndex++;
    }
    
    if (filter.includes('D') && department_code) {
      query += ` AND msa.department_code = $${paramIndex}`;
      params.push(department_code);
      paramIndex++;
    }
    
    if (filter.includes('ST') && service_type_code) {
      query += ` AND msa.service_type_code = $${paramIndex}`;
      params.push(service_type_code);
      paramIndex++;
    }
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service area not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get service area types from master_type
router.get('/types/list', async (req, res) => {
  try {
    const query = `
      SELECT value, description
      FROM master_type
      WHERE key = 'SERVICE_AREA'
      ORDER BY id
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting service area types:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create service area
router.post('/', async (req, res) => {
  try {
    const { code, type, service_area, from_location, to_location, status, company_code, branch_code, department_code, service_type_code } = req.body;
    // const context = getContextFromRequest(req);
    let username = await getUsernameFromToken(req) ;
    let svcAreaCode;
    let seriesCode;
    let codeType= 'serviceAreaCode';
    
    // Check if required fields are provided
    if (!code || !type) {
      return res.status(400).json({ error: 'Code and type are required' });
    }
    // Check IT setup validation for context matching
    const configResult = await pool.query(
      "SELECT value FROM settings WHERE key = $1",
      [`validation_service_area_filter`]
    );
    
    const filter = configResult.rows[0]?.value || '';

    // Validate context based on IT setup
    if (filter.includes('C') && !company_code) {
      return res.status(400).json({ error: 'Company code is required based on IT setup' });
    }
    if (filter.includes('B') && !branch_code) {
      return res.status(400).json({ error: 'Branch code is required based on IT setup' });
    }

    if (filter.includes('D') && !department_code) {
      return res.status(400).json({ error: 'Department code is required based on IT setup' });
    }
    

    if (filter.includes('ST') && !service_type_code) {
      return res.status(400).json({ error: 'Service type code is required based on IT setup' });
    }
    
    // Check if code already exists
    const codeCheck = await pool.query(
      'SELECT * FROM master_service_area WHERE code = $1',
      [code]
    );
    
    if (codeCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Service area code already exists' });
    }

   
    // 🔹 Number series lookup
    if ((!code || code === '') && company_code) {
      let whereConditions = ['code_type = $1', 'company_code = $2'];
      let queryParams = [codeType, company_code];
      let paramIndex = 3;
        
      if (branch_code) {
        whereConditions.push(`branch_code = $${paramIndex}`);
        queryParams.push(branch_code);
        paramIndex++;
      } else {
        whereConditions.push('(branch_code IS NULL OR branch_code = \'\')');
      }
        
      if (department_code) {
        whereConditions.push(`department_code = $${paramIndex}`);
        queryParams.push(department_code);
      } else {
         whereConditions.push('(department_code IS NULL OR department_code = \'\')');
      }
        
              const mappingQuery = `
                SELECT mapping FROM mapping_relations
                WHERE ${whereConditions.join(' AND ')}
                ORDER BY id DESC
                LIMIT 1
              `;
        
              const mappingRes = await pool.query(mappingQuery, queryParams);
              if (mappingRes.rows.length > 0) {
                seriesCode = mappingRes.rows[0].mapping;
              }
            }
        
            // 🔹 Generate source code
            if (seriesCode) {
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
                if (series.is_manual) {
                  if (!code || code.trim() === '') {
                    await client.query('ROLLBACK');
                    client.release();
                    return res.status(400).json({ error: 'Manual code entry required for this series' });
                  }
                  const exists = await client.query('SELECT 1 FROM master_item WHERE code = $1', [code]);
                  if (exists.rows.length > 0) {
                    await client.query('ROLLBACK');
                    client.release();
                    return res.status(400).json({ error: 'service Area code already exists' });
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
                  let nextNo = rel.last_no_used === 0
                    ? Number(rel.starting_no)
                    : Number(rel.last_no_used) + Number(rel.increment_by);
        
                  code = `${rel.prefix || ''}${nextNo}`;
        
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
            } else if (!code || code === '') {
              code = 'SVC-AREA-' + Date.now();
            }
    
    const result = await pool.query(
      `INSERT INTO master_service_area 
       (code, type, service_area, from_location, to_location, status, 
        company_code, branch_code, department_code, service_type_code,
        created_by, updated_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [
        code, type, service_area, from_location, to_location, status || 'active',
        company_code || null, branch_code || null, department_code || null, service_type_code || null,
        username, username
      ]
    );

    // Log the event
    await logMasterEvent({
      masterType: 'service_area',
      username,
      action: 'Create',
      details:'Created New Service area master',
      recordId: code

    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({msg:'Server error', err:err.body});
  }
});

// // GET service areas with ellipsis search
// router.get('/search/ellipsis', async (req, res) => {
//   try {
//     const { term, company_code, branch_code, department_code, service_type_code } = req.query;
    
//     // Check IT setup validation for filtering
//     const configResult = await pool.query(
//       "SELECT value FROM settings WHERE key = $1",
//       [`validation_service_area_filter`]
//     );
    
//     const filter = configResult.rows[0]?.value || '';
    
//     let query = `
//       SELECT msa.code, msa.description, msa.type, mt.description as type_description
//       FROM master_service_area msa
//       LEFT JOIN master_type mt ON msa.type = mt.code AND mt.type = 'SERVICE_AREA'
//       WHERE (msa.code ILIKE $1 OR msa.service_area ILIKE $1)
//     `;
    
//     const params = [`%${term || ''}%`];
//     let paramIndex = 2;
    
//     // Apply context filtering based on IT setup
//     if (filter.includes('C') && company_code) {
//       query += ` AND msa.company_code = $${paramIndex}`;
//       params.push(company_code);
//       paramIndex++;
//     }
    
//     if (filter.includes('B') && branch_code) {
//       query += ` AND msa.branch_code = $${paramIndex}`;
//       params.push(branch_code);
//       paramIndex++;
//     }
    
//     if (filter.includes('D') && department_code) {
//       query += ` AND msa.department_code = $${paramIndex}`;
//       params.push(department_code);
//       paramIndex++;
//     }
    
//     if (filter.includes('ST') && service_type_code) {
//       query += ` AND msa.service_type_code = $${paramIndex}`;
//       params.push(service_type_code);
//       paramIndex++;
//     }
    
//     query += ` ORDER BY msa.code LIMIT 50`;
    
//     const result = await pool.query(query, params);
//     res.json(result.rows);
//   } catch (err) {
//     console.error('Error searching service areas:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// Update service area
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, type, service_area, from_location, to_location, status, company_code, branch_code, department_code, service_type_code } = req.body;
    // const context = getContextFromRequest(req);
    const username = await getUsernameFromToken(req);
    
    // Check if required fields are provided
    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }
    
    // Check IT setup validation for context matching
    const configResult = await pool.query(
      "SELECT value FROM settings WHERE key = $1",
      [`validation_service_area_filter`]
    );
    
    const filter = configResult.rows[0]?.value || '';
    
    // Validate context based on IT setup
    if (filter.includes('C') && !company_code) {
      return res.status(400).json({ error: 'Company code is required based on IT setup' });
    }
    
    if (filter.includes('B') && !branch_code) {
      return res.status(400).json({ error: 'Branch code is required based on IT setup' });
    }
    
    if (filter.includes('D') && !department_code) {
      return res.status(400).json({ error: 'Department code is required based on IT setup' });
    }
    
    if (filter.includes('ST') && !service_type_code) {
      return res.status(400).json({ error: 'Service type code is required based on IT setup' });
    }
    
    // Check if service area exists
    const serviceAreaCheck = await pool.query(
      'SELECT * FROM master_service_area WHERE id = $1',
      [id]
    );
    
    if (serviceAreaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Service area not found' });
    }
    
    // Check if updated code already exists for another record
    if (code !== serviceAreaCheck.rows[0].code) {
      const codeCheck = await pool.query(
        'SELECT * FROM master_service_area WHERE code = $1 AND id != $2',
        [code, id]
      );
      
      if (codeCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Service area code already exists' });
      }
    }
    
    // Get existing data for logging
    const oldData = serviceAreaCheck.rows[0];
    
    // Update service area
    const result = await pool.query(
      `UPDATE master_service_area 
       SET code = $1, type = $2, service_area = $3, from_location = $4, to_location = $5, status = $6, 
           company_code = $7, branch_code = $8, department_code = $9, service_type_code = $10,
           updated_by = $11, updated_at = NOW() 
       WHERE id = $12 
       RETURNING *`,
      [
        code, type, service_area, from_location, to_location, status,
        company_code || null, branch_code || null, department_code || null, service_type_code || null,
        context.username, id
      ]
    );
    
    // Log the event
    await logMasterEvent({
      masterType:'service_area',
      action: 'update',
      details: 'Service Are Master updated',
      username,
      recordId: code
    });
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete service area
router.delete('/:id',   async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM master_service_area WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Service area not found' });
    }
    
    res.json({ message: 'Service area deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;