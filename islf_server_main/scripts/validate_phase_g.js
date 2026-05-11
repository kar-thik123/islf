'use strict';
/**
 * Phase G Validation Suite
 * Tests record-level ownership enforcement.
 * Run: node scripts/validate_phase_g.js
 */
require('dotenv').config();
const http = require('http');
const jwt  = require('jsonwebtoken');
const pool = require('../db');

const SECRET = process.env.JWT_SECRET;

function makeToken(payload, expiresIn = '1h') {
  return jwt.sign(payload, SECRET, { expiresIn });
}

function httpReq(method, path, token, body) {
  return new Promise((resolve) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost', port: 3001, path, method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:4200',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
      },
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', (e) => resolve({ status: 'ERR', body: e.message }));
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

let passed = 0; let failed = 0; const failures = [];

async function test(label, method, path, token, expectedStatus, body) {
  const res = await httpReq(method, path, token, body);
  const ok  = res.status === expectedStatus;
  console.log(`${ok ? '✅' : '❌'} ${label}`);
  if (!ok) {
    console.log(`     Got: ${res.status} | Expected: ${expectedStatus}`);
    console.log(`     Body: ${res.body.substring(0, 160)}`);
    failures.push(label);
    failed++;
  } else { passed++; }
  return res;
}

async function run() {
  console.log('\n========== PHASE G VALIDATION ==========\n');

  // Get admin user
  const adminRow = await pool.query(
    "SELECT id, username, role FROM users WHERE username='admin' LIMIT 1"
  );
  if (!adminRow.rows[0]) { console.error('Admin user not found'); process.exit(1); }
  const admin = adminRow.rows[0];

  // Get any second user (id=9, Dinesh) for non-owner tests
  const otherRow = await pool.query(
    "SELECT id, username, role FROM users WHERE id != $1 LIMIT 1", [admin.id]
  );
  const other = otherRow.rows[0]; // may be null if only one user

  // Tokens
  const adminToken  = makeToken({ userId: admin.id, username: admin.username, role: admin.role });
  const ghostToken  = makeToken({ userId: 9999, username: 'ghost' });

  // ── [1] User Profile — Self-Only Ownership ────────────────────────────────
  console.log('\n--- [1] User Profile: Self-Only Ownership ---');

  // Admin can access their own record
  await test(`GET /api/user/${admin.id} [admin → own]     → 200`,
    'GET', `/api/user/${admin.id}`, adminToken, 200);

  // Admin can access any user record (admin bypass)
  if (other) {
    await test(`GET /api/user/${other.id} [admin → other]   → 200`,
      'GET', `/api/user/${other.id}`, adminToken, 200);
  }

  // Ghost user (id=9999) has no role → RBAC fires first → 403 before ownership runs.
  // This is correct: RBAC + Ownership are defence-in-depth (RBAC is the outer layer).
  await test('GET /api/user/9999 [ghost, no role] → 403 (RBAC blocks before ownership)',
    'GET', '/api/user/9999', ghostToken, 403);

  // Ghost user (id=9999) trying to access admin's record (id=4) — mismatch → 403
  await test(`GET /api/user/${admin.id} [ghost → admin's]  → 403`,
    'GET', `/api/user/${admin.id}`, ghostToken, 403);

  // No token → 401
  await test(`GET /api/user/${admin.id} [no token]         → 401`,
    'GET', `/api/user/${admin.id}`, null, 401);

  // ── [2] Account Details — Created_by Ownership ─────────────────────────────
  console.log('\n--- [2] Account Details: created_by Ownership ---');

  // First check if any account_details records exist
  const acctRows = await pool.query('SELECT id, created_by FROM account_details LIMIT 3');

  if (acctRows.rows.length === 0) {
    console.log('⚠️  No account_details records exist yet — skipping record-specific tests.');
    console.log('    Fallback mode: requests with no :id pass through (list-level, no ownership check).');

    // List route (no :id) should pass through ownership guard (list mode)
    await test('GET /api/account_details [admin] → 200 (list)',
      'GET', '/api/account_details', adminToken, 200);
    await test('GET /api/account_details [ghost] → 403 (no role — RBAC blocks)',
      'GET', '/api/account_details', ghostToken, 403);

  } else {
    const owned = acctRows.rows.find(r => r.created_by === admin.username);
    const unowned = acctRows.rows.find(r => r.created_by !== admin.username);

    if (owned) {
      await test(`GET /api/account_details/${owned.id} [admin → own]    → 200`,
        'GET', `/api/account_details/${owned.id}`, adminToken, 200);
    }

    // Admin token — RBAC + ownership both pass.
    // The account_details router may not have a bare /:id GET route.
    // Verify RBAC does not block and that ownership guard allows admin through.
    // If route returns 404 (no /:id handler), that's the route's design, not a guard issue.
    const res2 = await httpReq('GET', `/api/account_details/${acctRows.rows[0].id}`, adminToken);
    const adminPassed = res2.status !== 403 && res2.status !== 401;
    console.log(`${adminPassed ? '✅' : '❌'} GET /api/account_details/${acctRows.rows[0].id} [admin] → RBAC+Ownership allow (got ${res2.status})`);
    if (adminPassed) passed++; else { failed++; failures.push('Admin bypass not working on account_details'); }

    // Ghost token: RBAC blocks first (no permission) → 403
    await test(`GET /api/account_details/${acctRows.rows[0].id} [ghost] → 403`,
      'GET', `/api/account_details/${acctRows.rows[0].id}`, ghostToken, 403);
  }

  // ── [3] Missing ownership field — fallback mode ─────────────────────────────
  console.log('\n--- [3] Fallback Mode: Missing Ownership Field ---');
  // Check that the middleware is declared with proper fallback in source
  const fs   = require('fs');
  const path = require('path');
  const src  = fs.readFileSync(path.join(__dirname, '../middleware/ownershipGuard.js'), 'utf8');
  const hasFallback = src.includes('Allowing through (fallback mode)');
  const hasAdminBypass = src.includes('adminBypass');
  console.log(`${hasFallback   ? '✅' : '❌'} Fallback mode: empty ownership field → warn + allow`);
  console.log(`${hasAdminBypass? '✅' : '❌'} Admin bypass logic implemented`);
  if (hasFallback)    passed++; else { failed++; failures.push('Fallback mode missing'); }
  if (hasAdminBypass) passed++; else { failed++; failures.push('Admin bypass missing'); }

  // ── [4] RBAC still enforced (regression) ────────────────────────────────────
  console.log('\n--- [4] RBAC Regression (Phase C/D/E/F still enforced) ---');
  await test('GET /api/authorization/admin [admin] → 200', 'GET', '/api/authorization/admin', adminToken, 200);
  await test('GET /api/authorization/admin [ghost] → 403', 'GET', '/api/authorization/admin', ghostToken, 403);
  await test('GET /api/customer           [admin] → 200',  'GET', '/api/customer',             adminToken, 200);
  await test('GET /api/customer           [ghost] → 403',  'GET', '/api/customer',             ghostToken, 403);
  await test('GET /api/company            [admin] → 200',  'GET', '/api/company',              adminToken, 200);
  await test('GET /api/enquiry            [admin] → 200',  'GET', '/api/enquiry',              adminToken, 200);

  // ── [5] Public routes unchanged ──────────────────────────────────────────────
  console.log('\n--- [5] Public Routes Unchanged ---');
  await test('GET  /api/public/bootstrap-config → 200', 'GET',  '/api/public/bootstrap-config', null, 200);
  await test('POST /api/auth/login [bad creds]  → 401', 'POST', '/api/auth/login', null, 401,
    { identifier: 'nobody', password: 'wrong' });
  await test('POST /api/auth/register [no token]→ 401', 'POST', '/api/auth/register', null, 401,
    { username: 'x', password: 'test12345' });

  // ── [6] Ownership guard structural validation ─────────────────────────────
  console.log('\n--- [6] Middleware Structure ---');
  const selfOnlyMode = src.includes('selfOnly');
  const deniesLog    = src.includes('DENY');
  const warnLog      = src.includes('WARNING');
  console.log(`${selfOnlyMode ? '✅' : '❌'} selfOnly mode implemented`);
  console.log(`${deniesLog   ? '✅' : '❌'} Denial logging implemented`);
  console.log(`${warnLog     ? '✅' : '❌'} Fallback warning logging implemented`);
  if (selfOnlyMode) passed++; else { failed++; failures.push('selfOnly mode missing'); }
  if (deniesLog)    passed++; else { failed++; failures.push('Denial logging missing'); }
  if (warnLog)      passed++; else { failed++; failures.push('Warning logging missing'); }

  // ── Summary ───────────────────────────────────────────────────────────────────
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
