'use strict';
/**
 * Phase E Validation Suite
 * Tests JWT role embedding + remaining settings routes + backward compatibility.
 * Run: node scripts/validate_phase_e.js
 */
require('dotenv').config();
const http = require('http');
const jwt  = require('jsonwebtoken');
const pool = require('../db');

const SECRET = process.env.JWT_SECRET;

function makeToken(payload, expiresIn = '1h') {
  return jwt.sign(payload, SECRET, { expiresIn });
}

function httpRequest(method, path, token, body) {
  return new Promise((resolve) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost', port: 3001, path, method,
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

let passed = 0; let failed = 0;
const failures = [];

async function test(label, method, path, token, expectedStatus, body) {
  const res = await httpRequest(method, path, token, body);
  const ok  = res.status === expectedStatus;
  console.log(`${ok ? '✅' : '❌'} ${label}`);
  if (!ok) {
    console.log(`     Got: ${res.status} | Expected: ${expectedStatus}`);
    console.log(`     Body: ${res.body.substring(0, 160)}`);
    failures.push(label);
    failed++;
  } else { passed++; }
}

async function run() {
  console.log('\n========== PHASE E VALIDATION ==========\n');

  // Fetch admin
  const r = await pool.query("SELECT id, username, role FROM users WHERE username='admin' LIMIT 1");
  if (!r.rows[0]) { console.error('Admin user not found'); process.exit(1); }
  const admin = r.rows[0];

  // ── Token types ──────────────────────────────────────────────────────────
  // New-style token: role IN the JWT (Phase E upgrade)
  const newAdminToken  = makeToken({ userId: admin.id, username: admin.username, role: admin.role });
  // Old-style token: role NOT in JWT (backward compat — DB fallback must handle)
  const oldAdminToken  = makeToken({ userId: admin.id, username: admin.username });
  // Ghost: non-existent user, no role
  const ghostToken     = makeToken({ userId: 9999, username: 'ghost' });
  // Empty role user (id=5)
  const emptyRoleToken = makeToken({ userId: 5, username: '' });

  // ── Step 1: JWT role embedding verification ───────────────────────────────
  console.log('\n--- [1] JWT Role Embedding ---');

  const decoded = jwt.verify(newAdminToken, SECRET);
  const roleInToken = decoded.role === 'admin';
  console.log(`${roleInToken ? '✅' : '❌'} New token contains role="${decoded.role}" (expected "admin")`);
  if (roleInToken) passed++; else { failed++; failures.push('JWT role field missing'); }

  const decodedOld = jwt.verify(oldAdminToken, SECRET);
  const noRoleInOld = !decodedOld.role;
  console.log(`${noRoleInOld ? '✅' : '❌'} Old token has NO role field (backward compat baseline confirmed)`);
  if (noRoleInOld) passed++; else { failed++; failures.push('Old token unexpectedly has role'); }

  // ── Step 2: Backward compatibility (old token still works) ──────────────
  console.log('\n--- [2] Backward Compatibility: Old Token (no role in JWT) ---');
  await test('GET /api/customer         [old token, admin] → 200', 'GET', '/api/customer',       oldAdminToken, 200);
  await test('GET /api/number_series    [old token, admin] → 200', 'GET', '/api/number_series',  oldAdminToken, 200);
  await test('GET /api/settings/config  [old token, admin] → 200', 'GET', '/api/settings/config',oldAdminToken, 200);
  await test('GET /api/authorization/admin [old token]     → 200', 'GET', '/api/authorization/admin', oldAdminToken, 200);

  // ── Step 3: Phase E new routes — new token ─────────────────────────────
  console.log('\n--- [3] Phase E Routes: New Token (role in JWT) ---');
  await test('GET /api/number_series    [admin]     → 200', 'GET', '/api/number_series',   newAdminToken, 200);
  await test('GET /api/number_series    [ghost]     → 403', 'GET', '/api/number_series',   ghostToken,    403);
  await test('GET /api/number_series    [no token]  → 401', 'GET', '/api/number_series',   null,          401);

  await test('GET /api/number_relation  [admin]     → 200', 'GET', '/api/number_relation', newAdminToken, 200);
  await test('GET /api/number_relation  [ghost]     → 403', 'GET', '/api/number_relation', ghostToken,    403);

  await test('GET /api/company          [admin]     → 200', 'GET', '/api/company',         newAdminToken, 200);
  await test('GET /api/company          [ghost]     → 403', 'GET', '/api/company',         ghostToken,    403);
  await test('GET /api/company          [no token]  → 401', 'GET', '/api/company',         null,          401);

  await test('GET /api/branch           [admin]     → 200', 'GET', '/api/branch',          newAdminToken, 200);
  await test('GET /api/branch           [ghost]     → 403', 'GET', '/api/branch',          ghostToken,    403);

  await test('GET /api/department       [admin]     → 200', 'GET', '/api/department',      newAdminToken, 200);
  await test('GET /api/department       [ghost]     → 403', 'GET', '/api/department',      ghostToken,    403);

  await test('GET /api/service_types    [admin]     → 200', 'GET', '/api/service_types',   newAdminToken, 200);
  await test('GET /api/service_types    [ghost]     → 403', 'GET', '/api/service_types',   ghostToken,    403);

  // Empty role
  await test('GET /api/company          [empty role]→ 403', 'GET', '/api/company',         emptyRoleToken, 403);

  // ── Step 4: Phase C/D regression ─────────────────────────────────────────
  console.log('\n--- [4] Regression: Phase C & D Still Enforced ---');
  await test('GET /api/logs/auth        [admin]     → 200', 'GET', '/api/logs/auth',              newAdminToken, 200);
  await test('GET /api/logs/auth        [ghost]     → 403', 'GET', '/api/logs/auth',              ghostToken,    403);
  await test('GET /api/settings/config  [admin]     → 200', 'GET', '/api/settings/config',        newAdminToken, 200);
  await test('GET /api/settings/config  [ghost]     → 403', 'GET', '/api/settings/config',        ghostToken,    403);
  await test('GET /api/authorization/admin [admin]  → 200', 'GET', '/api/authorization/admin',    newAdminToken, 200);
  await test('GET /api/authorization/admin [ghost]  → 403', 'GET', '/api/authorization/admin',    ghostToken,    403);
  await test('GET /api/customer         [admin]     → 200', 'GET', '/api/customer',               newAdminToken, 200);
  await test('GET /api/customer         [ghost]     → 403', 'GET', '/api/customer',               ghostToken,    403);
  await test('GET /api/enquiry          [admin]     → 200', 'GET', '/api/enquiry',                newAdminToken, 200);
  await test('GET /api/enquiry          [ghost]     → 403', 'GET', '/api/enquiry',                ghostToken,    403);
  await test('GET /api/user             [admin]     → 200', 'GET', '/api/user',                   newAdminToken, 200);
  await test('GET /api/user             [ghost]     → 403', 'GET', '/api/user',                   ghostToken,    403);

  // ── Step 5: Public routes unchanged ──────────────────────────────────────
  console.log('\n--- [5] Public Routes Unchanged ---');
  await test('GET  /api/public/bootstrap-config    → 200', 'GET',  '/api/public/bootstrap-config', null,  200);
  await test('POST /api/auth/login [bad creds]     → 401', 'POST', '/api/auth/login',              null,  401,
    { identifier: 'nobody', password: 'wrong' });
  await test('POST /api/auth/login [empty body]    → 400', 'POST', '/api/auth/login',              null,  400,
    { identifier: '', password: '' });

  // ── Step 6: Login returns role in token ──────────────────────────────────
  console.log('\n--- [6] Login Response Includes Role in JWT Payload ---');
  const loginRes = await httpRequest('POST', '/api/auth/login', null,
    { identifier: 'admin', password: 'admin123' }
  );
  if (loginRes.status === 200) {
    try {
      const body   = JSON.parse(loginRes.body);
      const claims = jwt.verify(body.token, SECRET);
      const hasRole = claims.role === 'admin';
      console.log(`${hasRole ? '✅' : '❌'} Login JWT contains role="${claims.role}" (expected "admin")`);
      if (hasRole) passed++; else { failed++; failures.push('Login JWT missing role claim'); }
    } catch (e) {
      console.log(`❌ Could not verify login JWT: ${e.message}`);
      failed++; failures.push('Login JWT parse error');
    }
  } else {
    console.log(`❌ Login returned ${loginRes.status} — check admin password`);
    failed++; failures.push('Login failed');
  }

  // ── Summary ───────────────────────────────────────────────────────────────
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
