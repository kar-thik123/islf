const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const { getContextFromRequest } = require('../utils/context-helper');
const { logMasterEvent } = require('../log');

function getUsernameFromToken(req) {
  const context = getContextFromRequest(req);
  return context.username || 'system';
}

// Get all service areas with IT setup validation filtering
router.get('/', async (req, res) => {
  try {
    const context = getContextFromRequest(req);
    const { company_code, branch_code, department_code, service_type_code } = req.query;
    
    // Check IT setup validation for filtering
    const configResult = await pool.query(
      "SELECT value FROM settings WHERE key = $1",
      [`validation_service_area_filter`]
    );
    
    const filter = configResult.rows[0]?.value || '';
    
    let query = `
      SELECT msa.*, mt.description as type_description
      FROM master_service_area msa
      LEFT JOIN master_type mt ON msa.type = mt.code AND mt.type = 'SERVICE_AREA'
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
    res.status(500).send('Server error');
  }
});

// Get service area by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { company_code, branch_code, department_code, service_type_code } = req.query;
    
    // Check IT setup validation for filtering
    const configResult = await pool.query(
      "SELECT value FROM settings WHERE key = $1",
      [`validation_service_area_filter`]
    );
    
    const filter = configResult.rows[0]?.value || '';
    
    let query = `
      SELECT msa.*, mt.description as type_description
      FROM master_service_area msa
      LEFT JOIN master_type mt ON msa.type = mt.code AND mt.type = 'SERVICE_AREA'
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
      SELECT code, description
      FROM master_type
      WHERE type = 'SERVICE_AREA'
      ORDER BY code
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
    const context = getContextFromRequest(req);
    
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
        context.username, context.username
      ]
    );
    
    // Log the event
    await logMasterEvent(
      'service_area',
      code,
      'create',
      { new_data: req.body },
      context.username
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET service areas with ellipsis search
router.get('/search/ellipsis', async (req, res) => {
  try {
    const { term, company_code, branch_code, department_code, service_type_code } = req.query;
    
    // Check IT setup validation for filtering
    const configResult = await pool.query(
      "SELECT value FROM settings WHERE key = $1",
      [`validation_service_area_filter`]
    );
    
    const filter = configResult.rows[0]?.value || '';
    
    let query = `
      SELECT msa.code, msa.description, msa.type, mt.description as type_description
      FROM master_service_area msa
      LEFT JOIN master_type mt ON msa.type = mt.code AND mt.type = 'SERVICE_AREA'
      WHERE (msa.code ILIKE $1 OR msa.service_area ILIKE $1)
    `;
    
    const params = [`%${term || ''}%`];
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
    
    query += ` ORDER BY msa.code LIMIT 50`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error searching service areas:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update service area
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { code, type, service_area, from_location, to_location, status, company_code, branch_code, department_code, service_type_code } = req.body;
    const context = getContextFromRequest(req);
    
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
    await logMasterEvent(
      'service_area',
      code,
      'update',
      {
        old_data: oldData,
        new_data: result.rows[0]
      },
      context.username
    );
    
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