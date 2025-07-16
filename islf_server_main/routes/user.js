const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const router = express.Router();

// Create user
router.post('/', async (req, res) => {
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
    password,
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
  console.log('Received permission (POST):', permission);
  // Convert empty string dates to null
  const safeDateOfBirth = dateOfBirth === "" ? null : dateOfBirth;
  const safeJoiningDate = joiningDate === "" ? null : joiningDate;

  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Username, password, and email are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (
        username, password, email, phone, full_name, employee_id, gender, date_of_birth, branch, department, designation, reporting_manager, role, status, joining_date, employment_type, vehicle_assigned, shift_timing, bio, avatar_url, permission, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW()
      ) RETURNING id, username, email, phone, full_name, employee_id, gender, date_of_birth, branch, department, designation, reporting_manager, role, status, joining_date, employment_type, vehicle_assigned, shift_timing, bio, avatar_url, permission, created_at`,
      [
        username,
        hashedPassword,
        email,
        phoneNumber,
        fullName,
        employeeId,
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
        avatar, // avatar from frontend, mapped to avatar_url in DB
        permission
      ]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      res.status(409).json({ message: 'Username, email, or phone already exists' });
    } else {
      console.error('Database error:', err); // 👈 for debugging
      res.status(500).json({ message: 'Database error', error: err });
    }
    
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, employee_id, designation, joining_date, status, bio, permission FROM users`
    );
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