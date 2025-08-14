const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET mapping (fetch most recent mapping relation)
router.get('/', async (req, res) => {
  try {
    
    const result = await pool.query('SELECT * FROM mapping_relations ORDER BY id DESC LIMIT 1');
    if (result.rows.length === 0) {
      // Return default empty mapping if not set
      return res.json({
        codeType: null,
        mapping: null,
        companyCode: null,
        branchCode: null,
        departmentCode: null,
        serviceTypeCode: null
      });
    }
    const dbRow = result.rows[0];
    res.json({
      id: dbRow.id,
      codeType: dbRow.code_type,
      mapping: dbRow.mapping,
      companyCode: dbRow.company_code,
      branchCode: dbRow.branch_code,
      departmentCode: dbRow.department_code,
      serviceTypeCode: dbRow.service_type_code,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at
    });
  } catch (err) {
    console.error('Error fetching mapping:', err);
    res.status(500).json({ error: 'Failed to fetch mapping' });
  }
});

// SAVE mapping (insert new mapping relation)
router.post('/', async (req, res) => {
  const {
    codeType,
    mapping,
    companyCode,
    branchCode,
    departmentCode,
    serviceTypeCode
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO mapping_relations (code_type, mapping, company_code, branch_code, department_code, service_type_code)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [codeType, mapping, companyCode, branchCode, departmentCode, serviceTypeCode]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error saving mapping:', err);
    res.status(500).json({ error: 'Failed to save mapping' });
  }
});

// GET all mapping relations
// Update the GET /relations endpoint
router.get('/relations', async (req, res) => {
  try {
    const { companyCode, branchCode, departmentCode } = req.query;
    
    // Build dynamic query with context filtering
    let query = `
      SELECT 
        mr.id,
        mr.code_type as "codeType",
        mr.mapping,
        c.name as company,
        b.name as branch,
        d.name as department,
        st.name as "serviceType"
      FROM mapping_relations mr
      LEFT JOIN companies c ON mr.company_code = c.code
      LEFT JOIN branches b ON mr.branch_code = b.code
      LEFT JOIN departments d ON mr.department_code = d.code
      LEFT JOIN service_types st ON mr.service_type_code = st.code
    `;
    
    const conditions = [];
    const params = [];
    let paramIndex = 1;
    
    // Add context-based filtering
    if (companyCode) {
      conditions.push(`mr.company_code = $${paramIndex}`);
      params.push(companyCode);
      paramIndex++;
    }
    
    if (branchCode) {
      conditions.push(`mr.branch_code = $${paramIndex}`);
      params.push(branchCode);
      paramIndex++;
    }
    
    if (departmentCode) {
      conditions.push(`mr.department_code = $${paramIndex}`);
      params.push(departmentCode);
      paramIndex++;
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ` ORDER BY mr.id DESC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching mapping relations:', err);
    res.status(500).json({ error: 'Failed to fetch mapping relations' });
  }
});

// POST new mapping relation
router.post('/relations', async (req, res) => {
  const {
    codeType,
    mapping,
    companyCode,
    branchCode,
    departmentCode,
    serviceTypeCode
  } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO mapping_relations (code_type, mapping, company_code, branch_code, department_code, service_type_code)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [codeType, mapping, companyCode, branchCode, departmentCode, serviceTypeCode]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating mapping relation:', err);
    res.status(500).json({ error: 'Failed to create mapping relation' });
  }
});

// PUT update mapping relation
router.put('/relations/:id', async (req, res) => {
  const { id } = req.params;
  const {
    codeType,
    mapping,
    companyCode,
    branchCode,
    departmentCode,
    serviceTypeCode
  } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE mapping_relations 
       SET code_type = $1, mapping = $2, company_code = $3, branch_code = $4, department_code = $5, service_type_code = $6
       WHERE id = $7
       RETURNING *`,
      [codeType, mapping, companyCode, branchCode, departmentCode, serviceTypeCode, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mapping relation not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating mapping relation:', err);
    res.status(500).json({ error: 'Failed to update mapping relation' });
  }
});

// DELETE mapping relation
router.delete('/relations/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('DELETE FROM mapping_relations WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mapping relation not found' });
    }
    
    res.json({ message: 'Mapping relation deleted successfully' });
  } catch (err) {
    console.error('Error deleting mapping relation:', err);
    res.status(500).json({ error: 'Failed to delete mapping relation' });
  }
});

// FLEXIBLE mapping lookup (partial match allowed)
router.get('/find', async (req, res) => {
  const { codeType, companyCode, branchCode, departmentCode, serviceTypeCode } = req.query;
  try {
    // Build dynamic WHERE clause for partial matching
    let whereClauses = ['code_type = $1'];
    let params = [codeType];
    let idx = 2;
    if (companyCode) { whereClauses.push(`company_code = $${idx++}`); params.push(companyCode); }
    if (branchCode) { whereClauses.push(`branch_code = $${idx++}`); params.push(branchCode); }
    if (departmentCode) { whereClauses.push(`department_code = $${idx++}`); params.push(departmentCode); }
    if (serviceTypeCode) { whereClauses.push(`service_type_code = $${idx++}`); params.push(serviceTypeCode); }
    const where = whereClauses.join(' AND ');
    const result = await pool.query(
      `SELECT * FROM mapping_relations WHERE ${where} ORDER BY id DESC LIMIT 1`,
      params
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No mapping found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error finding mapping:', err);
    res.status(500).json({ error: 'Failed to find mapping' });
  }
});

module.exports = router;