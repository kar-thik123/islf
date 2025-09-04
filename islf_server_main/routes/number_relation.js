const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get all number series relations with context-based filtering
router.get('/', async (req, res) => {
  try {
    const { companyCode, branchCode, departmentCode } = req.query;

    let query = `
      SELECT *
      FROM number_relation
      WHERE 1=1
    `;

    const queryParams = [];
    let paramIndex = 1;

    // Hierarchical filtering
    if (companyCode) {
      query += ` AND company_code = $${paramIndex}`;
      queryParams.push(companyCode);
      paramIndex++;

      if (branchCode) {
        query += ` AND branch_code = $${paramIndex}`;
        queryParams.push(branchCode);
        paramIndex++;

        if (departmentCode) {
          query += ` AND department_code = $${paramIndex}`;
          queryParams.push(departmentCode);
          paramIndex++;
        }
      }
    }

    query += ` ORDER BY id DESC`;

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching number series relations:', err);
    res.status(500).json({ error: 'Failed to fetch number series relations' });
  }
});


// Get number series relation by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM number_relation WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching number series relation by id:', err);
    res.status(500).json({ error: 'Failed to fetch number series relation' });
  }
});

// Create number series relation
router.post('/', async (req, res) => {
  const {
    numberSeries,
    startingDate,
    startingNo,
    endingNo,
    endingDate,
    prefix,
    lastNoUsed,
    incrementBy,
    company_code,
    branch_code,
    department_code
  } = req.body;

  // Validate mutual exclusivity
  if (endingNo && endingDate) {
    return res.status(400).json({ error: 'Only one of endingNo or endingDate can be set, not both' });
  }

  try {
    // Get default company code if not provided
    let finalCompanyCode = company_code;
    if (!finalCompanyCode) {
      const companyResult = await pool.query('SELECT code FROM companies LIMIT 1');
      finalCompanyCode = companyResult.rows[0]?.code || null;
    }
    
    // Handle date conversion for proper timezone storage
    let processedStartingDate = startingDate;
    let processedEndingDate = endingDate;
    
    if (startingDate) {
      processedStartingDate = new Date(startingDate).toISOString();
    }
    
    if (endingDate) {
      const date = new Date(endingDate);
      processedEndingDate = date.toISOString();
    }

    // Handle ending_no constraint
    let finalEndingNo = endingNo;
    if (endingDate && !endingNo) {
      finalEndingNo = 0;
    }
    
    const result = await pool.query(
      'INSERT INTO number_relation (number_series, starting_date, starting_no, ending_no, ending_date, prefix, last_no_used, increment_by, company_code, branch_code, department_code) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [numberSeries, processedStartingDate, startingNo, finalEndingNo, processedEndingDate, prefix, lastNoUsed, incrementBy, finalCompanyCode, branch_code, department_code]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating number series relation:', err);
    res.status(500).json({ error: 'Failed to create number series relation' });
  }
});

// Update number series relation
router.put('/:id', async (req, res) => {
  const {
    numberSeries,
    startingDate,
    startingNo,
    endingNo,
    endingDate,
    prefix,
    lastNoUsed,
    incrementBy,
    company_code,
    branch_code,
    department_code
  } = req.body;

  console.log('Update request body:', req.body);

  // Validate mutual exclusivity
  if (endingNo && endingDate) {
    return res.status(400).json({ error: 'Only one of endingNo or endingDate can be set, not both' });
  }

  try {
    // Handle date conversion for proper timezone storage
    let processedStartingDate = startingDate;
    let processedEndingDate = endingDate;
    
    if (startingDate) {
      processedStartingDate = new Date(startingDate).toISOString();
    }
    
    if (endingDate) {
      const date = new Date(endingDate);
      processedEndingDate = date.toISOString();
    }

    // Get company code if not provided
    let finalCompanyCode = company_code;
    if (!finalCompanyCode) {
      const companyResult = await pool.query('SELECT code FROM companies LIMIT 1');
      finalCompanyCode = companyResult.rows[0]?.code || null;
    }

    // Handle ending_no constraint
    let finalEndingNo = endingNo;
    if (endingDate && !endingNo) {
      finalEndingNo = 0;
    }
    
    const result = await pool.query(
      'UPDATE number_relation SET number_series = $1, starting_date = $2, starting_no = $3, ending_no = $4, ending_date = $5, prefix = $6, last_no_used = $7, increment_by = $8, company_code = $9, branch_code = $10, department_code = $11 WHERE id = $12 RETURNING *',
      [numberSeries, processedStartingDate, startingNo, finalEndingNo, processedEndingDate, prefix, lastNoUsed, incrementBy, finalCompanyCode, branch_code, department_code, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating number series relation:', err);
    console.error('Error details:', err.message);
    res.status(500).json({ error: 'Failed to update number series relation', details: err.message });
  }
});

// Delete number series relation
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM number_relation WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting number series relation:', err);
    res.status(500).json({ error: 'Failed to delete number series relation' });
  }
});

// Get unique numberSeries values for dropdown
router.get('/series/list', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT number_series FROM number_relation ORDER BY number_series');
    res.json(result.rows.map(row => row.number_series));
  } catch (err) {
    console.error('Error fetching number series list:', err);
    res.status(500).json({ error: 'Failed to fetch number series list' });
  }
});

// Debug route to check database schema
router.get('/debug/schema', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'number_relation' 
      ORDER BY ordinal_position
    `);
    res.json({
      table: 'number_relation',
      columns: result.rows
    });
  } catch (err) {
    console.error('Error checking schema:', err);
    res.status(500).json({ error: 'Failed to check schema', details: err.message });
  }
});

// Debug route to check a specific record
router.get('/debug/record/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM number_relation WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching record:', err);
    res.status(500).json({ error: 'Failed to fetch record', details: err.message });
  }
});

module.exports = router;