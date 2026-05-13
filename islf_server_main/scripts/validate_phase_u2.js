'use strict';
/**
 * Phase U2 Validation Test Suite
 * Tests RBAC Dependency Inheritance and Fixed Route Mappings.
 * Run: node scripts/validate_phase_u2.js
 */
require('dotenv').config();
const http  = require('http');
const jwt   = require('jsonwebtoken');
const pool  = require('../db');

const SECRET = process.env.JWT_SECRET;

function makeToken(payload, expiresIn = '1h') {
  return jwt.sign(payload, SECRET, { expiresIn });
}

function request(method, path, token, body) {
  return new Promise((resolve) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', (e) => resolve({ status: 'ERR', body: e.message }));
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

let passed = 0;
let failed = 0;
const failures = [];

async function test(label, method, path, token, expectedStatus, body) {
  const res = await request(method, path, token, body);
  const ok  = res.status === expectedStatus;
  const icon = ok ? '✅' : '❌';
  console.log(`${icon} ${label}`);
  if (!ok) {
    console.log(`     Got: ${res.status} | Expected: ${expectedStatus}`);
    console.log(`     Body: ${res.body.substring(0, 160)}`);
    failures.push(label);
    failed++;
  } else {
    passed++;
  }
}

async function run() {
  console.log('\n========== PHASE U2 VALIDATION ==========\n');

  // 1. Setup Test Data: Create a read-only Enquiry user role
  const TEST_ROLE = 'test_enquiry_readonly';
  console.log(`Setup: Seeding role "${TEST_ROLE}" with ONLY Operations -> Enquiry permission...`);
  
  await pool.query('DELETE FROM role_module_permissions WHERE role_name = $1', [TEST_ROLE]);
  await pool.query(
    `INSERT INTO role_module_permissions (role_name, module_name, sub_module_name, can_read, can_write, can_delete)
     VALUES ($1, 'Operations', 'Enquiry', true, false, false)`,
    [TEST_ROLE]
  );

  // 2. Create Tokens
  const enquiryUserToken = makeToken({ userId: 1001, username: 'enq_user', role: TEST_ROLE });
  const adminTokenRow = await pool.query("SELECT id, role FROM users WHERE username = 'admin' LIMIT 1");
  const adminToken = adminTokenRow.rows[0] ? makeToken({ userId: adminTokenRow.rows[0].id, username: 'admin', role: adminTokenRow.rows[0].role }) : null;

  // -----------------------------------------------------------------------
  // TASK 1: FIXED ROUTE MAPPINGS
  // -----------------------------------------------------------------------
  console.log('\n--- Task 1: Fixed Route Mappings ---');
  // Master Type should now be Masters/Master Type, not Master Types/User Status
  // Since our test user only has Enquiry permission, we check if they can access it via inheritance
  await test('GET  /api/master_type    [enquiry user] → 200 (Inherited)', 'GET', '/api/master_type', enquiryUserToken, 200);
  await test('GET  /api/master_code    [enquiry user] → 200 (Inherited)', 'GET', '/api/master_code', enquiryUserToken, 200);

  // -----------------------------------------------------------------------
  // TASK 2 & 3: INHERITANCE VALIDATION
  // -----------------------------------------------------------------------
  console.log('\n--- Task 2 & 3: Dependency Inheritance ---');
  
  // Inherited Reads (GET should be allowed)
  await test('GET  /api/vendor         [enquiry user] → 200 (Inherited)', 'GET', '/api/vendor', enquiryUserToken, 200);
  await test('GET  /api/customer       [enquiry user] → 200 (Inherited)', 'GET', '/api/customer', enquiryUserToken, 200);
  await test('GET  /api/master_location [enquiry user] → 200 (Inherited)', 'GET', '/api/master_location', enquiryUserToken, 200);
  await test('GET  /api/mapping         [enquiry user] → 200 (Inherited)', 'GET', '/api/mapping', enquiryUserToken, 200);
  await test('GET  /api/department      [enquiry user] → 200 (Inherited)', 'GET', '/api/department', enquiryUserToken, 200);
  await test('GET  /api/service_types   [enquiry user] → 200 (Inherited)', 'GET', '/api/service_types', enquiryUserToken, 200);
  await test('GET  /api/settings/carriage-direction [enquiry user] → 200 (Inherited)', 'GET', '/api/settings/carriage-direction', enquiryUserToken, 200);

  // Blocked Writes (POST/PUT/DELETE should be 403)
  console.log('\n--- Security: Mutating requests must still be blocked ---');
  await test('POST /api/vendor         [enquiry user] → 403 (Blocked)', 'POST', '/api/vendor', enquiryUserToken, 403, { name: 'Test' });
  await test('PUT  /api/customer/1     [enquiry user] → 403 (Blocked)', 'PUT',  '/api/customer/1', enquiryUserToken, 403, { name: 'Test' });
  await test('POST /api/master_type    [enquiry user] → 403 (Blocked)', 'POST', '/api/master_type', enquiryUserToken, 403, { key: 'TEST', value: 'VAL' });

  // -----------------------------------------------------------------------
  // REGRESSION CHECK
  // -----------------------------------------------------------------------
  if (adminToken) {
    console.log('\n--- Regression: Admin still has full access ---');
    await test('GET  /api/user           [admin]        → 200', 'GET', '/api/user', adminToken, 200);
    await test('POST /api/master_type    [admin]        → 200 or 400', 'POST', '/api/master_type', adminToken, 400); // 400 because of missing body fields, but NOT 403
  }

  // -----------------------------------------------------------------------
  // Cleanup
  // -----------------------------------------------------------------------
  console.log('\nCleanup: Removing test role...');
  await pool.query('DELETE FROM role_module_permissions WHERE role_name = $1', [TEST_ROLE]);

  console.log(`\n========== RESULTS: ${passed} passed, ${failed} failed ==========\n`);
  
  if (failures.length) {
    console.log('Failures:');
    failures.forEach(f => console.log(`  ❌ ${f}`));
  }

  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Validation Script Error:', err);
  process.exit(1);
});
