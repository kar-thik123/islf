'use strict';
/**
 * Phase D Validation Test Suite
 * Tests all Batch 2 enforced routes.
 * Run: node scripts/validate_phase_d.js
 *
 * Prerequisites:
 *   - Server running on localhost:3001
 *   - Admin user (id=4, role='admin') exists and is seeded
 *   - Pre-check passed (no users with NULL/empty roles)
 */
require('dotenv').config();
const http  = require('http');
const https = require('https');
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
  console.log('\n========== PHASE D VALIDATION ==========\n');

  // Fetch admin user from DB
  const adminRow = await pool.query(
    "SELECT id, username, role FROM users WHERE username = 'admin' LIMIT 1"
  );
  if (!adminRow.rows[0]) {
    console.error('❌ Admin user not found — cannot run validation.');
    process.exit(1);
  }
  const admin = adminRow.rows[0];

  // Tokens
  const adminToken    = makeToken({ userId: admin.id, username: admin.username, role: admin.role });
  const noRoleToken   = makeToken({ userId: 9999, username: 'ghost' }); // non-existent user
  const emptyRoleToken= makeToken({ userId: 5,    username: '' });       // empty role user
  const noToken       = null;

  // -----------------------------------------------------------------------
  // USER MANAGEMENT — closes D5
  // -----------------------------------------------------------------------
  console.log('\n--- User Management (D5 closure) ---');
  await test('GET  /api/user         [admin]      → 200', 'GET',  '/api/user',   adminToken,     200);
  await test('GET  /api/user         [ghost]      → 403', 'GET',  '/api/user',   noRoleToken,    403);
  await test('GET  /api/user         [no token]   → 401', 'GET',  '/api/user',   noToken,        401);

  // -----------------------------------------------------------------------
  // MASTER TYPES
  // -----------------------------------------------------------------------
  console.log('\n--- Master Types ---');
  await test('GET  /api/master_code  [admin]      → 200', 'GET',  '/api/master_code', adminToken,  200);
  await test('GET  /api/master_code  [ghost]      → 403', 'GET',  '/api/master_code', noRoleToken, 403);
  await test('GET  /api/master_code  [no token]   → 401', 'GET',  '/api/master_code', noToken,     401);
  await test('GET  /api/master_type  [admin]      → 200', 'GET',  '/api/master_type', adminToken,  200);
  await test('GET  /api/master_type  [ghost]      → 403', 'GET',  '/api/master_type', noRoleToken, 403);

  // -----------------------------------------------------------------------
  // MASTERS — sample of key routes
  // -----------------------------------------------------------------------
  console.log('\n--- Masters ---');
  await test('GET  /api/customer     [admin]      → 200', 'GET',  '/api/customer',        adminToken,     200);
  await test('GET  /api/customer     [ghost]      → 403', 'GET',  '/api/customer',        noRoleToken,    403);
  await test('GET  /api/customer     [no token]   → 401', 'GET',  '/api/customer',        noToken,        401);
  await test('GET  /api/vendor       [admin]      → 200', 'GET',  '/api/vendor',          adminToken,     200);
  await test('GET  /api/vendor       [ghost]      → 403', 'GET',  '/api/vendor',          noRoleToken,    403);
  await test('GET  /api/master_location [admin]   → 200', 'GET',  '/api/master_location', adminToken,     200);
  await test('GET  /api/master_location [ghost]   → 403', 'GET',  '/api/master_location', noRoleToken,    403);
  await test('GET  /api/master_item  [admin]      → 200', 'GET',  '/api/master_item',     adminToken,     200);
  await test('GET  /api/master_item  [ghost]      → 403', 'GET',  '/api/master_item',     noRoleToken,    403);
  await test('GET  /api/master_vessel [admin]     → 200', 'GET',  '/api/master_vessel',   adminToken,     200);
  await test('GET  /api/master_vessel [ghost]     → 403', 'GET',  '/api/master_vessel',   noRoleToken,    403);
  await test('GET  /api/master_airline [admin]    → 200', 'GET',  '/api/master_airline',  adminToken,     200);
  await test('GET  /api/master_airline [ghost]    → 403', 'GET',  '/api/master_airline',  noRoleToken,    403);
  await test('GET  /api/currency_code [admin]     → 200', 'GET',  '/api/currency_code',   adminToken,     200);
  await test('GET  /api/currency_code [ghost]     → 403', 'GET',  '/api/currency_code',   noRoleToken,    403);
  await test('GET  /api/container_code [admin]    → 200', 'GET',  '/api/container_code',  adminToken,     200);
  await test('GET  /api/container_code [ghost]    → 403', 'GET',  '/api/container_code',  noRoleToken,    403);
  await test('GET  /api/basis        [admin]      → 200', 'GET',  '/api/basis',           adminToken,     200);
  await test('GET  /api/basis        [ghost]      → 403', 'GET',  '/api/basis',           noRoleToken,    403);
  await test('GET  /api/tariff       [admin]      → 200', 'GET',  '/api/tariff',          adminToken,     200);
  await test('GET  /api/tariff       [ghost]      → 403', 'GET',  '/api/tariff',          noRoleToken,    403);
  await test('GET  /api/service_area [admin]      → 200', 'GET',  '/api/service_area',    adminToken,     200);
  await test('GET  /api/service_area [ghost]      → 403', 'GET',  '/api/service_area',    noRoleToken,    403);
  await test('GET  /api/source_sales [admin]      → 200', 'GET',  '/api/source_sales',    adminToken,     200);
  await test('GET  /api/source_sales [ghost]      → 403', 'GET',  '/api/source_sales',    noRoleToken,    403);
  await test('GET  /api/gst_setup    [admin]      → 200', 'GET',  '/api/gst_setup',       adminToken,     200);
  await test('GET  /api/gst_setup    [ghost]      → 403', 'GET',  '/api/gst_setup',       noRoleToken,    403);
  await test('GET  /api/master_uom   [admin]      → 200', 'GET',  '/api/master_uom',      adminToken,     200);
  await test('GET  /api/master_uom   [ghost]      → 403', 'GET',  '/api/master_uom',      noRoleToken,    403);
  await test('GET  /api/mapping      [admin]      → 200', 'GET',  '/api/mapping',         adminToken,     200);
  await test('GET  /api/mapping      [ghost]      → 403', 'GET',  '/api/mapping',         noRoleToken,    403);

  // -----------------------------------------------------------------------
  // OPERATIONS
  // -----------------------------------------------------------------------
  console.log('\n--- Operations ---');
  await test('GET  /api/enquiry      [admin]      → 200', 'GET',  '/api/enquiry',  adminToken,  200);
  await test('GET  /api/enquiry      [ghost]      → 403', 'GET',  '/api/enquiry',  noRoleToken, 403);
  await test('GET  /api/enquiry      [no token]   → 401', 'GET',  '/api/enquiry',  noToken,     401);
  await test('GET  /api/booking      [admin]      → 200', 'GET',  '/api/booking',  adminToken,  200);
  await test('GET  /api/booking      [ghost]      → 403', 'GET',  '/api/booking',  noRoleToken, 403);

  // -----------------------------------------------------------------------
  // Phase C routes still enforced (regression check)
  // -----------------------------------------------------------------------
  console.log('\n--- Regression: Phase C routes still enforced ---');
  await test('GET  /api/logs/auth     [admin]      → 200', 'GET',  '/api/logs/auth',          adminToken,  200);
  await test('GET  /api/logs/auth     [ghost]      → 403', 'GET',  '/api/logs',              noRoleToken, 403);
  await test('GET  /api/settings/config [admin]   → 200', 'GET',  '/api/settings/config',   adminToken,  200);
  await test('GET  /api/settings/config [ghost]   → 403', 'GET',  '/api/settings/config',   noRoleToken, 403);
  await test('GET  /api/authorization/admin [admin]→200', 'GET',  '/api/authorization/admin',adminToken, 200);
  await test('GET  /api/authorization/admin [ghost]→403', 'GET',  '/api/authorization/admin',noRoleToken,403);

  // -----------------------------------------------------------------------
  // Public / unaffected routes
  // -----------------------------------------------------------------------
  console.log('\n--- Public & unaffected routes ---');
  await test('GET  /api/public/bootstrap-config   → 200', 'GET', '/api/public/bootstrap-config', noToken, 200);
  await test('POST /api/auth/login [no token]     → 200 or 400', 'POST', '/api/auth/login', noToken, 400,
    { identifier: '', password: '' }
  );

  // -----------------------------------------------------------------------
  // Results
  // -----------------------------------------------------------------------
  console.log(`\n--- Results: ${passed} passed, ${failed} failed ---`);
  if (failures.length) {
    console.log('\nFailed tests:');
    failures.forEach(f => console.log('  ❌ ' + f));
  }

  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Validation error:', err.message);
  process.exit(1);
});
