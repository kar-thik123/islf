const express = require('express');
const pool = require('../db');
const router = express.Router();
const { logMasterEvent } = require('../log');

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
  const { item_type, code, name, hs_code,description,active, company_code, branch_code, department_code, masterType } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO master_item (item_type, code, name,description,hs_code, active, company_code, branch_code, department_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9)
       RETURNING *`,
      [item_type, code, name, hs_code, active, company_code, branch_code, department_code]
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
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  const { item_type, code, name, hs_code, active, masterType } = req.body;
  try {
    const oldResult = await pool.query('SELECT * FROM master_item WHERE id = $1', [id]);
    if (oldResult.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    const oldItem = oldResult.rows[0];

    const result = await pool.query(
      `UPDATE master_item
       SET item_type = $1, code = $2, name = $3,description = $4, hs_code = $5, active = $6
       WHERE id = $6
       RETURNING *`,
      [item_type, code, name, hs_code, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const changedFields = [];
    const fieldsToCheck = {
      item_type, code, name, hs_code, active,description
    };
    const normalize = (value) => {
      if (value === null || value === undefined) return '';
      return value.toString().trim();
    };
    for (const field in fieldsToCheck) {
      const newValue = normalize(fieldsToCheck[field]);
      const oldValue = normalize(oldItem[field]);
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
