const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const router = express.Router();

// Create user
router.post('/', async (req, res) => {
  const {
    fullName, employeeId, email, phoneNumber, gender, dateOfBirth, branch, department, designation, reportingManager,
    username, password, role, status, joiningDate, employmentType, vehicleAssigned, shiftTiming, bio, avatar, permission,
    company_code, branch_code, department_code
  } = req.body;

  try {
    let finalEmployeeId = employeeId;
    let seriesCode;

    // IT setup aware number series lookup
    if ((!employeeId || employeeId === '') && company_code && branch_code && department_code) {
      const mapping = await findMappingByContext('employeeCode', company_code, branch_code, department_code);
      if (mapping) {
        seriesCode = mapping.mapping;
        console.log('Found series code via IT setup validation:', seriesCode);
      }
    }

    // Generate employee ID if series code found
    if (seriesCode) {
      const seriesResult = await pool.query(
        'SELECT * FROM number_series WHERE code = $1 ORDER BY id DESC LIMIT 1',
        [seriesCode]
      );
      
      if (seriesResult.rows.length === 0) {
        return res.status(400).json({ error: 'Number series not found' });
      }
      
      const series = seriesResult.rows[0];
      if (!series.is_manual) {
        // Generate automatic employee ID
        const relResult = await pool.query(
          'SELECT * FROM number_relation WHERE number_series = $1 ORDER BY id DESC LIMIT 1',
          [seriesCode]
        );
        
        if (relResult.rows.length === 0) {
          return res.status(400).json({ error: 'Number series relation not found' });
        }
        
        const rel = relResult.rows[0];
        let nextNo;
        if (rel.last_no_used === 0) {
          nextNo = Number(rel.starting_no);
        } else {
          nextNo = Number(rel.last_no_used) + Number(rel.increment_by);
        }
        
        finalEmployeeId = `${rel.prefix || ''}${nextNo}`;
        console.log('Generated employee ID:', finalEmployeeId);
        
        // Update the last_no_used
        await pool.query(
          'UPDATE number_relation SET last_no_used = $1 WHERE id = $2',
          [nextNo, rel.id]
        );
      }
    } else if (!employeeId || employeeId === '') {
      // Fallback if no series found
      finalEmployeeId = 'EMP-' + Date.now();
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
    
    let query = `SELECT id, full_name, employee_id, designation, joining_date, status, bio, permission FROM users`;
    let queryParams = [];
    let whereConditions = [];
    
    // Add context-based filtering
    if (companyCode) {
      whereConditions.push(`company_code = $${queryParams.length + 1}`);
      queryParams.push(companyCode);
    }
    
    if (branchCode) {
      whereConditions.push(`branch_code = $${queryParams.length + 1}`);
      queryParams.push(branchCode);
    }
    
    if (departmentCode) {
      whereConditions.push(`department_code = $${queryParams.length + 1}`);
      queryParams.push(departmentCode);
    }
    
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
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
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Database error', error: err });
  }
});

module.exports = router;