'use strict';
require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${PORT}`;

// Helper to generate a test token
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

async function testApi(name, token, url, method, expectedStatus, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${BASE_URL}${url}`, options);
    if (res.status === expectedStatus) {
      console.log(`✅ ${name} (Expected ${expectedStatus}, Got ${res.status})`);
      return true;
    } else {
      console.log(`❌ ${name} (Expected ${expectedStatus}, Got ${res.status})`);
      const text = await res.text();
      console.log(`   Response: ${text}`);
      return false;
    }
  } catch (err) {
    console.log(`❌ ${name} (Error: ${err.message})`);
    return false;
  }
}

async function runValidation() {
  console.log('--- STARTING PHASE M2 VALIDATION ---');

  let allPassed = true;

  // Mock Payloads
  const systemAdminPayload = { userId: 1, username: 'sysadmin', role: 'SYSTEM_ADMIN' };
  const adminPayload = { userId: 2, username: 'admin', role: 'ADMIN' };
  
  const dynamicUserPayload = { 
    userId: 3, 
    username: 'dynuser', 
    role: 'MANAGER',
    company_code: 'COMP_A',
    branch: 'BR001, BR002',
    department: 'HR, IT'
  };

  const legacyUserPayload = {
    userId: 4,
    username: 'legacyuser',
    role: 'MANAGER'
    // no branch, department, company_code
  };

  const sysToken = generateToken(systemAdminPayload);
  const adminToken = generateToken(adminPayload);
  const dynToken = generateToken(dynamicUserPayload);
  const legacyToken = generateToken(legacyUserPayload);

  // 1. SYSTEM_ADMIN bypass works
  // Using GET /api/enquiry?branchCode=INVALID
  allPassed &= await testApi(
    'SYSTEM_ADMIN bypass context restriction', 
    sysToken, 
    '/api/enquiry?branchCode=INVALID', 
    'GET', 
    200
  );

  // 2. ADMIN bypass works
  allPassed &= await testApi(
    'ADMIN bypass context restriction', 
    adminToken, 
    '/api/enquiry?branchCode=INVALID', 
    'GET', 
    200
  );

  // 3. Dynamic user with valid branch works
  allPassed &= await testApi(
    'Dynamic user with VALID branch', 
    dynToken, 
    '/api/enquiry?branchCode=BR001', 
    'GET', 
    200
  );

  // 4. Dynamic user with invalid branch -> 403
  allPassed &= await testApi(
    'Dynamic user with INVALID branch', 
    dynToken, 
    '/api/enquiry?branchCode=BR003', 
    'GET', 
    403
  );

  // 5. Dynamic user with invalid department -> 403
  allPassed &= await testApi(
    'Dynamic user with INVALID department', 
    dynToken, 
    '/api/enquiry?departmentCode=FINANCE', 
    'GET', 
    403
  );

  // 6. Legacy token without branch -> still works (Fail-open)
  allPassed &= await testApi(
    'Legacy token without assignments (Fail-open)', 
    legacyToken, 
    '/api/enquiry?branchCode=BR001', 
    'GET', 
    200
  );

  // 7. Public routes unaffected (no token required)
  allPassed &= await testApi(
    'Public route unaffected', 
    null, 
    '/api/public/bootstrap-config', 
    'GET', 
    200
  );

  // Note: Existing RBAC and ownership are tested by ensuring 
  // the requests reaching them (e.g. GET /api/enquiry) return 200 instead of 403,

  if (allPassed) {
    console.log('\n✅✅✅ ALL PHASE M2 VALIDATIONS PASSED ✅✅✅');
  } else {
    console.log('\n❌❌❌ PHASE M2 VALIDATION FAILED ❌❌❌');
    process.exitCode = 1;
  }
}

const pool = require('../db');
async function setupAndRun() {
  try {
    // Insert dummy permission for test role MANAGER
    await pool.query(`INSERT INTO role_module_permissions (role_name, module_name, sub_module_name, can_read, can_write, can_delete)
                      VALUES ('MANAGER', 'Operations', 'Enquiry', true, true, true)
                      ON CONFLICT (role_name, module_name, sub_module_name) DO UPDATE SET can_read=true`);
                      
    await runValidation();
  } finally {
    await pool.end();
  }
}

setupAndRun();
