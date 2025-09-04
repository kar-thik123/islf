const express = require('express');
const pool = require('../db');
const router = express.Router();

// Add this function at the top after the requires
// Replace the findMappingByContext function (lines 6-45)
async function findMappingByContext(code_type, company_code, branch_code, department_code, service_type_code) {
  try {
    console.log('Finding mapping with context:', { code_type, company_code, branch_code, department_code, service_type_code });
    
    // Get IT setup configuration for this code type
    const configResult = await pool.query(
      "SELECT value FROM settings WHERE key = $1",
      [`validation_${code_type.toLowerCase().replace('code', '')}_filter`]
    );
    
    const filter = configResult.rows[0]?.value || '';
    console.log(`IT Setup filter for ${code_type}:`, filter);
    
    // Build context parameters based on IT setup validation
    let whereClauses = ['code_type = $1'];
    let params = [code_type];
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
    
    // Build the query with proper ordering for specificity
    const query = `
      SELECT mapping FROM mapping_relations 
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY 
        CASE WHEN company_code IS NOT NULL THEN 1 ELSE 0 END DESC,
        CASE WHEN branch_code IS NOT NULL THEN 1 ELSE 0 END DESC,
        CASE WHEN department_code IS NOT NULL THEN 1 ELSE 0 END DESC,
        CASE WHEN service_type_code IS NOT NULL THEN 1 ELSE 0 END DESC,
        id DESC
      LIMIT 1`;
    
    console.log('Mapping query:', query, params);
    const result = await pool.query(query, params);
    
    if (result.rows.length > 0) {
      console.log('Found mapping via IT setup validation:', result.rows[0]);
      return result.rows[0];
    }
    
    console.log('No mapping found for context');
    return null;
  } catch (err) {
    console.error('Error finding mapping by context:', err);
    return null;
  }
}

// GET all vessels with optional context filtering
router.get('/', async (req, res) => {
  try {
    const { company_code, branch_code, department_code, service_type_code } = req.query;

    let query = `
      SELECT *
      FROM master_vessel
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
    console.error('Error fetching vessels:', err);
    res.status(500).json({ error: 'Failed to fetch vessels' });
  }
});

// CREATE new vessel (with IT setup aware number series logic)
router.post('/', async (req, res) => {
  let { seriesCode, code, vessel_name, imo_number, flag, year_build, active, vessel_type, company_code, branch_code, department_code, Service_type_code } = req.body;
  
  try {
    // Extract year from date if year_build is a date object
    if (year_build) {
      if (typeof year_build === 'string' && (year_build.includes('T') || year_build.includes('-'))) {
        year_build = new Date(year_build).getFullYear().toString();
      } else if (year_build instanceof Date) {
        year_build = year_build.getFullYear().toString();
      }
    }
    
    console.log('Vessel creation - Context values:', { company_code, branch_code, department_code, seriesCode });
    
    // IT setup aware number series lookup
    if (!seriesCode && company_code && branch_code && department_code) {
      console.log('Looking up mapping for vessel code with IT setup validation...');
      const mapping = await findMappingByContext('vesselCode', company_code, branch_code, department_code, Service_type_code);
      if (mapping) {
        seriesCode = mapping.mapping;
        console.log('Found series code via IT setup validation:', seriesCode);
      }
    }
    
    // Replace the relation-based number series lookup section (around lines 162-180)
    // Relation-based number series lookup with hierarchical context matching
    if (!seriesCode && company_code) {
    console.log('Looking up mapping for vessel code with hierarchical matching...');
    
    // Try hierarchical matching: most specific to least specific
    const hierarchicalQueries = [];
    
    // 1. Try exact match with all available context
    if (company_code && branch_code && department_code) {
    hierarchicalQueries.push({
    query: `SELECT mapping FROM mapping_relations 
             WHERE code_type = 'vesselCode' AND company_code = $1 AND branch_code = $2 AND department_code = $3 
             ORDER BY id DESC LIMIT 1`,
    params: [company_code, branch_code, department_code],
    description: 'company+branch+department'
    });
    }
    
    // 2. Try company + branch match
    if (company_code && branch_code) {
    hierarchicalQueries.push({
    query: `SELECT mapping FROM mapping_relations 
             WHERE code_type = 'vesselCode' AND company_code = $1 AND branch_code = $2 
             AND (department_code IS NULL OR department_code = '') 
             ORDER BY id DESC LIMIT 1`,
    params: [company_code, branch_code],
    description: 'company+branch'
    });
    }
    
    // 3. Try company only match
    hierarchicalQueries.push({
    query: `SELECT mapping FROM mapping_relations 
             WHERE code_type = 'vesselCode' AND company_code = $1 
             AND (branch_code IS NULL OR branch_code = '') 
             AND (department_code IS NULL OR department_code = '') 
             ORDER BY id DESC LIMIT 1`,
    params: [company_code],
    description: 'company only'
    });
    
    // Execute queries in order of specificity
    for (const queryObj of hierarchicalQueries) {
    console.log(`Trying ${queryObj.description} mapping lookup...`);
    const mappingRes = await pool.query(queryObj.query, queryObj.params);
    
    if (mappingRes.rows.length > 0) {
    seriesCode = mappingRes.rows[0].mapping;
    console.log(`VESSEL SERIES CODE FROM MAPPING (${queryObj.description}):`, seriesCode);
    break;
    }
    }
    
    if (!seriesCode) {
    console.log('No mapping found in hierarchical lookup');
    }
    }
    
    // Replace the number series processing condition (around line 165)
    if (seriesCode) {
    console.log('Processing number series with code:', seriesCode);
    // 1. Get the number series for the selected code
    const seriesResult = await pool.query(
    'SELECT * FROM number_series WHERE code = $1 ORDER BY id DESC LIMIT 1',
    [seriesCode]
    );
    console.log('Series result:', seriesResult.rows);
    if (seriesResult.rows.length === 0) {
    return res.status(400).json({ error: 'Number series not found' });
    }
    const series = seriesResult.rows[0];
    console.log('Series details:', series);
    
    if (series.is_manual) {
      // Manual: require code from user
      if (!code || code.trim() === '') {
        return res.status(400).json({ error: 'Manual code entry required for this series' });
      }
      // Check for duplicate code
      const exists = await pool.query('SELECT 1 FROM master_vessel WHERE code = $1', [code]);
      if (exists.rows.length > 0) {
        return res.status(400).json({ error: 'Vessel code already exists' });
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
        
        code = `${rel.prefix || ''}${nextNo}`;
        console.log('Generated vessel code:', code);
        
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
    } else {
      console.log('Falling back to timestamp code. Conditions not met:', { seriesCode, company_code, branch_code, department_code, code });
      if (!code || code === 'AUTO') {
        // Fallback: generate code as VESSEL-<timestamp>
        code = 'VESSEL-' + Date.now();
      }
    }
      // Check for duplicate IMO number if provided
      if (imo_number && imo_number.trim() !== '') {
        const imoExists = await pool.query('SELECT 1 FROM master_vessel WHERE imo_number = $1', [imo_number]);
        if (imoExists.rows.length > 0) {
          return res.status(400).json({ error: 'IMO number already exists' });
        }
      }
      // 4. Insert the new vessel
      const result = await pool.query(
        `INSERT INTO master_vessel (code, vessel_name, imo_number, flag, year_build, active, vessel_type, company_code, branch_code, department_code)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [code, vessel_name, imo_number, flag, year_build, active, vessel_type, company_code, branch_code, department_code]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating vessel:', err);
      res.status(500).json({ error: 'Failed to create vessel' });
    }
});

// UPDATE vessel by ID
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  let { code, vessel_name, imo_number, flag, year_build, active, vessel_type } = req.body;
  try {
    // Extract year from date if year_build is a date object
    if (year_build) {
      if (typeof year_build === 'string' && (year_build.includes('T') || year_build.includes('-'))) {
        // Handle both ISO date strings and date-only strings
        year_build = new Date(year_build).getFullYear().toString();
      } else if (year_build instanceof Date) {
        // Handle Date objects
        year_build = year_build.getFullYear().toString();
      }
    }
    // Check for duplicate code excluding current record
    const codeExists = await pool.query('SELECT 1 FROM master_vessel WHERE code = $1 AND id != $2', [code, id]);
    if (codeExists.rows.length > 0) {
      return res.status(400).json({ error: 'Vessel code already exists' });
    }
    
    // Check for duplicate IMO number excluding current record
    if (imo_number && imo_number.trim() !== '') {
      const imoExists = await pool.query('SELECT 1 FROM master_vessel WHERE imo_number = $1 AND id != $2', [imo_number, id]);
      if (imoExists.rows.length > 0) {
        return res.status(400).json({ error: 'IMO number already exists' });
      }
    }
    
    const result = await pool.query(
      `UPDATE master_vessel
       SET code = $1, vessel_name = $2, imo_number = $3, flag = $4, year_build = $5, active = $6, vessel_type = $7
       WHERE id = $8
       RETURNING *`,
      [code, vessel_name, imo_number, flag, year_build, active, vessel_type, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating vessel:', err);
    res.status(500).json({ error: 'Failed to update vessel' });
  }
});

// DELETE vessel by ID
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  try {
    const result = await pool.query(
      `DELETE FROM master_vessel
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting vessel:', err);
    res.status(500).json({ error: 'Failed to delete vessel' });
  }
});

module.exports = router;