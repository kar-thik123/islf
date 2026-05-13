'use strict';
/**
 * Phase U2.2 Validation Test Suite
 * Tests RBAC Naming Alignment, Normalization, and Context Inheritance.
 * Run: node scripts/validate_phase_u2_2.js
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
  console.log('\n========== PHASE U2.2 VALIDATION ==========\n');

  // 1. Setup Test Data: Create a read-only Enquiry user role
  const TEST_ROLE = 'test_enquiry_readonly_u2_2';
  console.log(`Setup: Seeding role "${TEST_ROLE}" with ONLY Operations -> Enquiry permission...`);
  
  await pool.query('DELETE FROM role_module_permissions WHERE role_name = $1', [TEST_ROLE]);
  await pool.query(
    `INSERT INTO role_module_permissions (role_name, module_name, sub_module_name, can_read, can_write, can_delete)
     VALUES ($1, 'Operations', 'Enquiry', true, false, false)`,
    [TEST_ROLE]
  );

  // 2. Create Tokens
  const enquiryUserToken = makeToken({ userId: 1002, username: 'enq_user_u2_2', role: TEST_ROLE });

  // -----------------------------------------------------------------------
  // TASK 1 & 2: NAMING ALIGNMENT & NORMALIZATION
  // -----------------------------------------------------------------------
  console.log('\n--- Task 1 & 2: Naming Alignment & Normalization ---');
  // Master Type now correctly maps to Master Types -> User Status in main.js
  // Middleware now normalizes 'read' (used in main.js) to 'can_read'
  await test('GET  /api/master_type    [enquiry user] → 200 (Inherited + Normalized)', 'GET', '/api/master_type', enquiryUserToken, 200);
  await test('GET  /api/master_code    [enquiry user] → 200 (Inherited + Normalized)', 'GET', '/api/master_code', enquiryUserToken, 200);

  // -----------------------------------------------------------------------
  // TASK 3: CONTEXT INHERITANCE
  // -----------------------------------------------------------------------
  console.log('\n--- Task 3: Context Dependency Inheritance ---');
  await test('GET  /api/company        [enquiry user] → 200 (Inherited)', 'GET', '/api/company', enquiryUserToken, 200);
  await test('GET  /api/branch         [enquiry user] → 200 (Inherited)', 'GET', '/api/branch', enquiryUserToken, 200);
  await test('GET  /api/department     [enquiry user] → 200 (Inherited)', 'GET', '/api/department', enquiryUserToken, 200);

  // -----------------------------------------------------------------------
  // SECURITY & MUTATION LOCKDOWN
  // -----------------------------------------------------------------------
  console.log('\n--- Security: Mutating requests must still be blocked ---');
  await test('POST /api/vendor         [enquiry user] → 403 (Blocked)', 'POST', '/api/vendor', enquiryUserToken, 403, { name: 'Test' });
  await test('POST /api/company        [enquiry user] → 403 (Blocked)', 'POST', '/api/company', enquiryUserToken, 403, { name: 'Test' });

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
