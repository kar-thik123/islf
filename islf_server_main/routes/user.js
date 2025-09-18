const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const router = express.Router();
const {logSetupEvent} = require('../log');
const {getUsernameFromToken, fieldChangeDetection} = require('../utils/context-helper')

// Add this function after the requires
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

// Create user
router.post('/', async (req, res) => {
  const {
    fullName, employeeId, email, phoneNumber, gender, dateOfBirth, branch, department, designation, reportingManager,
    username, password, role, status, joiningDate, employmentType, vehicleAssigned, shiftTiming, bio, avatar, permission,
    company_code, branch_code, department_code
  } = req.body;

  try {
    // Format dates safely
    const safeDateOfBirth = dateOfBirth ? new Date(dateOfBirth).toISOString().split('T')[0] : null;
    const safeJoiningDate = joiningDate ? new Date(joiningDate).toISOString().split('T')[0] : null;
    
    let finalEmployeeId = employeeId;
    let seriesCode;

    console.log('User creation - Context values:', { company_code, branch_code, department_code, employeeId });

    // IT setup aware number series lookup
    if ((!employeeId || employeeId === '') && company_code && branch_code && department_code) {
      console.log('Looking up mapping for employee code with IT setup validation...');
      const mapping = await findMappingByContext('employeeCode', company_code, branch_code, department_code);
      if (mapping) {
        seriesCode = mapping.mapping;
        console.log('Found series code via IT setup validation:', seriesCode);
      }
    }

    // Relation-based number series lookup with hierarchical context matching
    if (!seriesCode && company_code) {
      console.log('Looking up mapping for employee code with hierarchical matching...');
      
      // Try hierarchical matching: most specific to least specific
      const hierarchicalQueries = [];
      
      // 1. Try exact match with all available context
      if (company_code && branch_code && department_code) {
        hierarchicalQueries.push({
          query: `SELECT mapping FROM mapping_relations 
                   WHERE code_type = 'employeeCode' AND company_code = $1 AND branch_code = $2 AND department_code = $3 
                   ORDER BY id DESC LIMIT 1`,
          params: [company_code, branch_code, department_code],
          description: 'company+branch+department'
        });
      }
      
      // 2. Try company + branch match
      if (company_code && branch_code) {
        hierarchicalQueries.push({
          query: `SELECT mapping FROM mapping_relations 
                   WHERE code_type = 'employeeCode' AND company_code = $1 AND branch_code = $2 
                   AND (department_code IS NULL OR department_code = '') 
                   ORDER BY id DESC LIMIT 1`,
          params: [company_code, branch_code],
          description: 'company+branch'
        });
      }
      
      // 3. Try company only match
      hierarchicalQueries.push({
        query: `SELECT mapping FROM mapping_relations 
                 WHERE code_type = 'employeeCode' AND company_code = $1 
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
          console.log(`EMPLOYEE SERIES CODE FROM MAPPING (${queryObj.description}):`, seriesCode);
          break;
        }
      }
      
      if (!seriesCode) {
        console.log('No mapping found in hierarchical lookup');
      }
    }

    // Generate employee ID if series code found
    if (seriesCode) {
      console.log('Processing number series with code:', seriesCode);
      const seriesResult = await pool.query(
        'SELECT * FROM number_series WHERE code = $1 ORDER BY id DESC LIMIT 1',
        [seriesCode]
      );
      
      if (seriesResult.rows.length === 0) {
        return res.status(400).json({ error: 'Number series not found' });
      }
      
      const series = seriesResult.rows[0];
      console.log('Series details:', series);
      
      if (series.is_manual) {
        // Manual: require employeeId from user
        if (!employeeId || employeeId.trim() === '') {
          return res.status(400).json({ error: 'Manual employee ID entry required for this series' });
        }
        // Check for duplicate employeeId
        const exists = await pool.query('SELECT 1 FROM users WHERE employee_id = $1', [employeeId]);
        if (exists.rows.length > 0) {
          return res.status(400).json({ error: 'Employee ID already exists' });
        }
        finalEmployeeId = employeeId;
      } else {
        // Not manual: generate employeeId using relation with transaction safety
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
          
          finalEmployeeId = `${rel.prefix || ''}${nextNo}`;
          console.log('Generated employee ID:', finalEmployeeId);
          
          // Update the last_no_used within the same transaction
          await client.query(
            'UPDATE number_relation SET last_no_used = $1 WHERE id = $2',
            [nextNo, rel.id]
          );
          
          await client.query('COMMIT');
          client.release();
          await logSetupEvent({username:getUsernameFromToken(req)||'System',
            action: 'CREATE',
            setupType: 'User Management',
            entityCode: company_code,
            details: `User ${username} created Successfully.`
          });

        } catch (error) {
          await client.query('ROLLBACK');
          client.release();
          throw error;
        }
      }
    } else {
      console.log('Falling back to timestamp code. Conditions not met:', { seriesCode, company_code, branch_code, department_code, employeeId });
      if (!employeeId || employeeId === '' || employeeId === 'AUTO') {
        // Fallback: generate employeeId as EMP-<timestamp>
        finalEmployeeId = 'EMP-' + Date.now();
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (
        username, password, email, phone, full_name, employee_id, gender, date_of_birth, branch, department, designation, reporting_manager, role, status, joining_date, employment_type, vehicle_assigned, shift_timing, bio, avatar_url, permission, company_code, branch_code, department_code, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW()
      ) RETURNING *`,
      [
        username,
        hashedPassword,
        email,
        phoneNumber,
        fullName,
        finalEmployeeId,
        gender,
        safeDateOfBirth,
        branch,
        department,
        designation,
        reportingManager,
        role,
        status,
        safeJoiningDate,
        employmentType,
        vehicleAssigned,
        shiftTiming,
        bio,
        avatar,
        permission,
        company_code,
        branch_code,
        department_code
      ]
    );
    await logSetupEvent({username:getUsernameFromToken(req)||'System',
      action: 'CREATE',
      setupType: 'User Management',
      entityCode: company_code,
      details: `User ${username} created Successfully.`
    });

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      res.status(409).json({ message: 'Username, email, or phone already exists' });
    } else {
      console.error('Database error:', err);
      res.status(500).json({ message: 'Database error', error: err });
    }
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const { companyCode, branchCode, departmentCode } = req.query;

    let query = `
      SELECT id, full_name, employee_id, designation, joining_date, status, bio, permission
      FROM users
      WHERE 1=1
    `;

    const queryParams = [];
    let paramIndex = 1;

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

    query += ` ORDER BY id ASC`;

    const result = await pool.query(query, queryParams);
    const users = result.rows.map(user => ({
      id: user.id,
      full_name: user.full_name,
      employee_id: user.employee_id,
      designation: user.designation,
      joining_date: user.joining_date,
      status: user.status,
      bio: user.bio,
      permission: user.permission
    }));
    res.json({ users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Database error', error: err });
  }
});


// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, full_name, employee_id, designation, joining_date, status, email, phone, gender, date_of_birth, branch, department, designation, reporting_manager, username, role, employment_type, vehicle_assigned, shift_timing, bio, avatar_url, permission FROM users WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = result.rows[0];
    res.json({ user });
  } catch (err) {
    console.error('Error fetching user by ID:', err);
    res.status(500).json({ message: 'Database error', error: err });
  }
});

// Get user by username (for profile sidebar)
router.get('/by-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const result = await pool.query(
      'SELECT id, full_name, avatar_url FROM users WHERE username = $1',
      [username]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Error fetching user by username:', err);
    res.status(500).json({ message: 'Database error', error: err });
  }
});

// Update user by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      employeeId,
      email,
      phoneNumber,
      gender,
      dateOfBirth,
      branch,
      department,
      designation,
      reportingManager,
      username,
      role,
      status,
      joiningDate,
      employmentType,
      vehicleAssigned,
      shiftTiming,
      bio,
      avatar,
      permission
    } = req.body;

    // Debug: log received permission
    console.log('Received permission (PUT):', permission);
    // Convert empty string dates to null
    const safeDateOfBirth = dateOfBirth === "" ? null : dateOfBirth;
    const safeJoiningDate = joiningDate === "" ? null : joiningDate;

    const result = await pool.query(
      `UPDATE users SET
        full_name = $1,
        employee_id = $2,
        email = $3,
        phone = $4,
        gender = $5,
        date_of_birth = $6,
        branch = $7,
        department = $8,
        designation = $9,
        reporting_manager = $10,
        username = $11,
        role = $12,
        status = $13,
        joining_date = $14,
        employment_type = $15,
        vehicle_assigned = $16,
        shift_timing = $17,
        bio = $18,
        avatar_url = $19,
        permission = $20
      WHERE id = $21
      RETURNING *`,
      [
        fullName,
        employeeId,
        email,
        phoneNumber,
        gender,
        safeDateOfBirth,
        branch,
        department,
        designation,
        reportingManager,
        username,
        role,
        status,
        safeJoiningDate,
        employmentType,
        vehicleAssigned,
        shiftTiming,
        bio,
        avatar,
        permission,
        id
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    await logSetupEvent({username:getUsernameFromToken(req)||'System',
      action: 'UPDATE',
      setupType: 'User Management',
      entityCode: result.rows[0]['company_code'],
      details: `User ${username} Updated Successfully.`
    });

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Database error', error: err });
  }
});

module.exports = router;