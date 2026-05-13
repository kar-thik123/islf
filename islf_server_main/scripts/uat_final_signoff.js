'use strict';
/**
 * ISLF FINAL UAT & SECURITY SIGNOFF SCRIPT
 * 
 * Verifies all security phases (K -> U2.2) in a single run.
 * Tests:
 * 1. SYSTEM_ADMIN (Full Bypass)
 * 2. ADMIN (Business Bypass, Setup Blocked)
 * 3. ENQUIRY_READ_ONLY (Inherited Read, Mutation Blocked)
 * 4. BOOKING_WRITE (CRUD on Booking, Dependencies Read)
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

async function run() {
  console.log('\n======================================================');
  console.log('   ISLF FINAL UAT & SECURITY SIGNOFF REPORT');
  console.log('======================================================\n');

  // 1. ROLES SETUP
  const ROLES = {
    SYSTEM_ADMIN: 'SYSTEM_ADMIN',
    ADMIN: 'ADMIN',
    ENQUIRY_READ_ONLY: 'enquiry_readonly_uat_v2',
    BOOKING_WRITE: 'booking_write_uat_v2'
  };

  console.log('1. Preparing test roles and permissions...');
  
  // Cleanup
  await pool.query('DELETE FROM role_module_permissions WHERE role_name IN ($1, $2)', [ROLES.ENQUIRY_READ_ONLY, ROLES.BOOKING_WRITE]);

  // Seed ENQUIRY_READ_ONLY (Inherited Read Test)
  await pool.query(
    `INSERT INTO role_module_permissions (role_name, module_name, sub_module_name, can_read, can_write, can_delete)
     VALUES ($1, 'Operations', 'Enquiry', true, false, false)`,
    [ROLES.ENQUIRY_READ_ONLY]
  );

  // Seed BOOKING_WRITE
  await pool.query(
    `INSERT INTO role_module_permissions (role_name, module_name, sub_module_name, can_read, can_write, can_delete)
     VALUES ($1, 'Operations', 'Booking', true, true, false)`,
    [ROLES.BOOKING_WRITE]
  );

  const tokens = {
    sysAdmin: makeToken({ userId: 1, username: 'sys_root', role: ROLES.SYSTEM_ADMIN }),
    admin: makeToken({ userId: 2, username: 'bus_admin', role: ROLES.ADMIN }),
    enquiry: makeToken({ userId: 3, username: 'enq_user', role: ROLES.ENQUIRY_READ_ONLY }),
    booking: makeToken({ userId: 4, username: 'book_user', role: ROLES.BOOKING_WRITE })
  };

  let total = 0, passed = 0;
  const test = async (label, method, path, token, expected) => {
    total++;
    const res = await request(method, path, token);
    const ok = res.status === expected;
    if (ok) passed++;
    console.log(`${ok ? '✅' : '❌'} [${method}] ${path.padEnd(30)} | Expected: ${expected} | Got: ${res.status} | ${label}`);
  };

  // 2. SYSTEM_ADMIN TESTS
  console.log('\n--- Role: SYSTEM_ADMIN (Full Bypass) ---');
  await test('Access IT Setup', 'GET', '/api/settings/config', tokens.sysAdmin, 200);
  await test('Access Authorization', 'GET', '/api/authorization/admin', tokens.sysAdmin, 200);
  await test('Access User Mgmt', 'GET', '/api/user', tokens.sysAdmin, 200);

  // 3. ADMIN TESTS
  console.log('\n--- Role: ADMIN (Business Bypass, Setup Blocked) ---');
  await test('Access Masters', 'GET', '/api/vendor', tokens.admin, 200);
  await test('Access Operations', 'GET', '/api/enquiry', tokens.admin, 200);
  await test('Block IT Setup', 'GET', '/api/settings/config', tokens.admin, 403);
  await test('Block Authorization', 'GET', '/api/authorization/admin', tokens.admin, 403);

  // 4. ENQUIRY_READ_ONLY TESTS
  console.log('\n--- Role: ENQUIRY_READ_ONLY (Inherited & Dependencies) ---');
  await test('Primary Module Access', 'GET', '/api/enquiry', tokens.enquiry, 200);
  await test('Inherited: Vendor Dropdown', 'GET', '/api/vendor', tokens.enquiry, 200);
  await test('Inherited: Company Dropdown', 'GET', '/api/company', tokens.enquiry, 200);
  await test('Inherited: Branch Dropdown', 'GET', '/api/branch', tokens.enquiry, 200);
  await test('Inherited: Master Type', 'GET', '/api/master_type', tokens.enquiry, 200);
  await test('Security: Block POST Vendor', 'POST', '/api/vendor', tokens.enquiry, 403);

  // 5. BOOKING_WRITE TESTS
  console.log('\n--- Role: BOOKING_WRITE (CRUD + Read-Only Deps) ---');
  await test('Access Booking', 'GET', '/api/booking', tokens.booking, 200);
  await test('Inherited: Customer Dropdown', 'GET', '/api/customer', tokens.booking, 200);
  await test('Inherited: Mapping', 'GET', '/api/mapping', tokens.booking, 200);
  await test('Block Vendor Write', 'POST', '/api/vendor', tokens.booking, 403);

  // 6. CACHE & CONSISTENCY
  console.log('\n--- Cache & Consistency Tests ---');
  console.log('Testing permission invalidation...');
  // Update permissions via API to trigger invalidation
  const updateRes = await request('POST', `/api/authorization/${ROLES.ENQUIRY_READ_ONLY}`, tokens.sysAdmin, {
    permissions: [
      { module_name: 'Operations', sub_module_name: 'Enquiry', can_read: false, can_write: false, can_delete: false }
    ]
  });
  
  if (updateRes.status === 200) {
    console.log('SUCCESS: Permissions updated and cache invalidated');
    await test('Block after permission removal', 'GET', '/api/enquiry', tokens.enquiry, 403);
  } else {
    console.error('FAILED: Could not update permissions for cache test', updateRes.status, updateRes.body);
  }

  console.log('\n======================================================');
  console.log(`   FINAL RESULTS: ${passed}/${total} PASSED`);
  console.log('======================================================\n');

  if (passed === total) {
    console.log('VERDICT: PRODUCTION READY - SECURITY SIGNOFF GRANTED');
  } else {
    console.log('VERDICT: FAIL - SECURITY VULNERABILITIES DETECTED');
  }

  await pool.end();
}

run().catch(err => {
  console.error('UAT Error:', err);
  process.exit(1);
});
