const express = require('express');
const pool = require('../db');
const router = express.Router();
const { logMasterEvent } = require('../log');
const { getUsernameFromToken } = require('../utils/context-helper');


// GET all master items
router.get('/', async (req, res) => {
  try {
     const { companyCode, branchCode, departmentCode } = req.query;
    
    // If context parameters are provided, filter by their context
    if (companyCode || branchCode || departmentCode) {
      let query = `
        SELECT *
        FROM master_item
        WHERE 1=1
      `;
      
      const params = [];
      let paramIndex = 1;
      
      if (companyCode) {
        query += ` AND company_code = $${paramIndex}`;
        params.push(companyCode);
        paramIndex++;
      }
      
      if (branchCode) {
        query += ` AND branch_code = $${paramIndex}`;
        params.push(branchCode);
        paramIndex++;
      }
      
      if (departmentCode) {
        query += ` AND department_code = $${paramIndex}`;
        params.push(departmentCode);
        paramIndex++;
      }
      
      query += ` ORDER BY code ASC`;router.get('/', async (req, res) => {
  try {
    const { companyCode, branchCode, departmentCode } = req.query;

    let query = `
      SELECT *
      FROM master_item
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Hierarchical filtering
    if (companyCode) {
      query += ` AND company_code = $${paramIndex}`;
      params.push(companyCode);
      paramIndex++;

      if (branchCode) {
        query += ` AND branch_code = $${paramIndex}`;
        params.push(branchCode);
        paramIndex++;

        if (departmentCode) {
          query += ` AND department_code = $${paramIndex}`;
          params.push(departmentCode);
          paramIndex++;
        }
      }
    }

    query += ` ORDER BY code ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching master items:', err);
    res.status(500).json({ error: 'Failed to fetch master items' });
  }
});

      const result = await pool.query(query, params);
      res.json(result.rows);
    } else {
      // If no context, return all items
      const result = await pool.query('SELECT * FROM master_item ORDER BY id ASC');
      res.json(result.rows);
    }
  } catch (err) {
    console.error('Error fetching master items:', err);
    res.status(500).json({ error: 'Failed to fetch master items' });
  }
});

// CREATE new master item
router.post('/', async (req, res) => {
  const { item_type, code, name, hs_code, description, active, company_code, branch_code, department_code, masterType, charge_type } = req.body;

  try {
      let code;
      let seriesCode;
      let codeType= masterType.toLowerCase() ==='cargo type' ? 'cargoCode': 'chargeCode';
      console.log("Master Item code type,",codeType);
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
                return res.status(400).json({ error: 'Cargo code already exists' });
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
          code = 'CAR-' + Date.now();
        }
    
   const created_by = getUsernameFromToken(req);
  //  Insert New Cargo
    const result = await pool.query(
      `INSERT INTO master_item (item_type, code, name, description, hs_code, active, company_code, branch_code, department_code, charge_type,created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10 , $11)
       RETURNING *`,
      [item_type, code, name, description || '', hs_code, Boolean(active), company_code, branch_code, department_code, charge_type || null, created_by]
    );
    

    // Log the master event
    await logMasterEvent({
      username: getUsernameFromToken(req),
      action: 'CREATE',
      masterType: masterType || 'Master Item',
      recordId: code,
      details: `New ${masterType || 'Master Item'} "${code}" has been created successfully.`
    });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating master item:', err);
    res.status(500).json({ error: 'Failed to create master item' });
  }
});

// UPDATE master item by ID
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  // if (isNaN(id)) {
  //   return res.status(400).json({ error: 'Invalid ID format' });
  // }

  const { item_type, code, name, description, hs_code, active, masterType, charge_type } = req.body;
  try {
    const oldResult = await pool.query('SELECT * FROM master_item WHERE code = $1', [code]);
    if (oldResult.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    const oldItem = oldResult.rows[0];

    const result = await pool.query(
      `UPDATE master_item
       SET item_type = $1, code = $2, name = $3, description = $4, hs_code = $5, active = $6, charge_type = $7
       WHERE id = $8
       RETURNING *`,
      [item_type, code, name, description || '', hs_code, Boolean(active), charge_type || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const changedFields = [];
    const fieldsToCheck = {
      item_type, code, name, hs_code, active, description, charge_type
    };
    const normalize = (value) => {
      if (value === null || value === undefined) return '';
      return value.toString().trim();
    };
    for (const field in fieldsToCheck) {
      let newValue, oldValue;
      if (field === 'active') {
        newValue = Boolean(fieldsToCheck[field]);
        oldValue = Boolean(oldItem[field]);
      } else {
        newValue = normalize(fieldsToCheck[field]);
        oldValue = normalize(oldItem[field]);
      }
      const valuesAreEqual = newValue === oldValue;
      if (!valuesAreEqual) {
        changedFields.push(`Field "${field}" changed from "${oldValue}" to "${newValue}".`);
      }
    }
    const details = changedFields.length > 0
      ? `Changes detected in the\n` + changedFields.join('\n')
      : 'No actual changes detected.';
      
    // Log the UPDATE action
    await logMasterEvent({
      username: getUsernameFromToken(req),
      action: 'UPDATE',
      masterType: masterType || 'Master Item',
      recordId: code,
      details
    });
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating master item:', err);
    res.status(500).json({ error: 'Failed to update master item' });
  }
});

// DELETE master item by ID
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  try {
    const result = await pool.query(
      `DELETE FROM master_item
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Log the master event
    await logMasterEvent({
      username: getUsernameFromToken(req),
      action: 'DELETE',
      masterType: req.body.masterType || 'Master Item',
      recordId: result.rows[0].code,
      details: `MasterItem "${result.rows[0].code}" has been deleted successfully.`
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting master item:', err);
    res.status(500).json({ error: 'Failed to delete master item' });
  }
});

module.exports = router;
