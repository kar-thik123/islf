'use strict';
/**
 * Phase J Validation Suite — Session Security + Token Revocation
 * Tests: login, logout, revoked-token rejection, new-login, regression.
 * Run: node scripts/validate_phase_j.js
 */
require('dotenv').config();
const http = require('http');
const jwt  = require('jsonwebtoken');
const pool = require('../db');

const SECRET = process.env.JWT_SECRET;

function req(method, path, token, body) {
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
    const r = http.request(opts, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, body: data, json: parsed });
      });
    });
    r.on('error', e => resolve({ status: 'ERR', body: e.message, json: null }));
    if (bodyStr) r.write(bodyStr);
    r.end();
  });
}

let pass = 0; let fail = 0; const failures = [];
function check(label, ok, extra) {
  const pfx = ok ? '✅' : '❌';
  console.log(`${pfx} ${label}${extra ? `  [${extra}]` : ''}`);
  if (ok) pass++; else { fail++; failures.push(label); }
}

async function run() {
  console.log('\n========== PHASE J VALIDATION ==========\n');

  // ── [1] Files & Structure ─────────────────────────────────────────────────
  console.log('--- [1] Files & Structure ---');
  const fs   = require('fs');
  const path = require('path');
  const revSrc  = fs.readFileSync(path.join(__dirname, '../utils/tokenRevocation.js'), 'utf8');
  const authSrc = fs.readFileSync(path.join(__dirname, '../middleware/auth.js'), 'utf8');
  const rtSrc   = fs.readFileSync(path.join(__dirname, '../routes/auth.js'), 'utf8');
  const mainSrc = fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8');

  check('utils/tokenRevocation.js exists',             revSrc.length > 0);
  check('hashToken uses SHA-256',                      revSrc.includes("'sha256'"));
  check('revokeToken: ON CONFLICT DO NOTHING',         revSrc.includes('ON CONFLICT'));
  check('isTokenRevoked: hash lookup in DB',           revSrc.includes('isTokenRevoked'));
  check('auth.js: async authenticateToken',            authSrc.includes('async function authenticateToken'));
  check('auth.js: blacklist check after jwt.verify',   authSrc.includes('isTokenRevoked'));
  check('auth.js: fail-open on missing table (42P01)', authSrc.includes("'42P01'"));
  check('auth.js: /api/auth/logout in PUBLIC_ENDPOINTS', authSrc.includes('/api/auth/logout'));
  check('auth.js: req.rawToken set',                   authSrc.includes('req.rawToken = rawToken'));
  check('routes/auth.js: POST /logout route',          rtSrc.includes('router.post("/logout"'));
  check('routes/auth.js: revokeToken called',          rtSrc.includes('revokeToken('));
  check('main.js: ensureRevokedTokensTable called',    mainSrc.includes('ensureRevokedTokensTable'));
  check('scripts/cleanup_revoked_tokens.js exists',    fs.existsSync(path.join(__dirname, 'cleanup_revoked_tokens.js')));

  // ── [2] DB table existence ────────────────────────────────────────────────
  console.log('\n--- [2] Database Table ---');
  const tableRes = await pool.query(
    "SELECT 1 FROM information_schema.tables WHERE table_name = 'revoked_tokens'"
  );
  check('revoked_tokens table exists in DB', tableRes.rows.length > 0);
  const idxRes = await pool.query(
    "SELECT 1 FROM pg_indexes WHERE tablename = 'revoked_tokens' AND indexname = 'idx_revoked_tokens_hash'"
  );
  check('idx_revoked_tokens_hash index exists', idxRes.rows.length > 0);

  // Use env override for password, fallback to known value
  const ADMIN_PW = process.env.TEST_ADMIN_PASSWORD || 'admin123';

  // ── [3] Login → token valid ───────────────────────────────────────────────
  console.log('\n--- [3] Login → Token Valid ---');
  const loginRes = await req('POST', '/api/auth/login', null, { identifier: 'admin', password: ADMIN_PW });
  check('POST /api/auth/login → 200', loginRes.status === 200, `status=${loginRes.status}`);
  const token1 = loginRes.json?.token;
  check('Login returns a token', !!token1);

  if (!token1) {
    console.log('\n❌ Cannot continue without a valid token.');
    await pool.end(); process.exit(1);
  }

  // Verify token works on a protected route
  const pingRes = await req('GET', '/api/enquiry', token1);
  check('Token works on protected route after login', pingRes.status === 200, `status=${pingRes.status}`);

  // ── [4] Logout → token revoked ────────────────────────────────────────────
  console.log('\n--- [4] Logout → Token Revoked ---');
  const logoutRes = await req('POST', '/api/auth/logout', token1);
  check('POST /api/auth/logout → 200', logoutRes.status === 200, `status=${logoutRes.status}`);
  check('Logout response says session revoked', logoutRes.body.includes('revoked') || logoutRes.body.includes('Logged out'));

  // Verify hash is in DB
  const { hashToken } = require('../utils/tokenRevocation');
  const hash = hashToken(token1);
  const dbRes = await pool.query('SELECT 1 FROM revoked_tokens WHERE token_hash = $1', [hash]);
  check('Token hash stored in revoked_tokens table', dbRes.rows.length > 0);

  // ── [5] Reuse revoked token → 401 ────────────────────────────────────────
  console.log('\n--- [5] Revoked Token Rejected ---');
  const reuse = await req('GET', '/api/enquiry', token1);
  check('GET /api/enquiry [revoked token] → 401', reuse.status === 401, `status=${reuse.status}`);
  check('Response says session revoked', reuse.body.includes('revoked') || reuse.body.includes('invalid'));

  // ── [6] New login → new token works ──────────────────────────────────────
  console.log('\n--- [6] New Login → New Token Works ---');
  const login2 = await req('POST', '/api/auth/login', null, { identifier: 'admin', password: ADMIN_PW });
  const token2 = login2.json?.token;
  check('Second login returns a new token',    !!token2);
  check('New token is different from revoked', token2 !== token1);
  if (token2) {
    const ping2 = await req('GET', '/api/enquiry', token2);
    check('New token works on protected route', ping2.status === 200, `status=${ping2.status}`);

    // Cleanup: revoke token2 as well so we don't leave active test tokens
    await req('POST', '/api/auth/logout', token2);
    console.log('  🧹 token2 revoked (cleanup)');
  }

  // ── [7] Old sessions (pre-Phase J) still work ────────────────────────────
  // Pre-J tokens are not in revoked_tokens → they pass the blacklist check.
  // We simulate this by minting a token directly (like an old session would be).
  console.log('\n--- [7] Old Sessions (Pre-Phase J) Backward Compatibility ---');
  const ar = await pool.query("SELECT id, username, role FROM users WHERE username = 'admin' LIMIT 1");
  const admin = ar.rows[0];
  const legacyTok = jwt.sign(
    { userId: admin.id, username: admin.username, role: admin.role },
    SECRET,
    { expiresIn: '5m' }
  );
  const legacyPing = await req('GET', '/api/enquiry', legacyTok);
  check('Legacy token (no logout) still works', legacyPing.status === 200, `status=${legacyPing.status}`);
  // Cleanup
  await req('POST', '/api/auth/logout', legacyTok);
  console.log('  🧹 legacy test token revoked (cleanup)');

  // ── [8] RBAC regression — mint tokens directly to avoid rate limiter ──────
  console.log('\n--- [8] RBAC Regression ---');
  // Mint a fresh admin token directly (no HTTP login — avoids rate limiter)
  const ar2 = await pool.query("SELECT id, username, role FROM users WHERE username = 'admin' LIMIT 1");
  const adminUser = ar2.rows[0];
  const token3 = jwt.sign(
    { userId: adminUser.id, username: adminUser.username, role: adminUser.role },
    SECRET, { expiresIn: '5m' }
  );
  const ghostTok = jwt.sign({ userId: 9999, username: 'ghost', role: null }, SECRET, { expiresIn: '5m' });
  const r1 = await req('GET', '/api/authorization/admin', token3);
  check('GET /api/authorization/admin [admin] → 200', r1.status === 200);
  const r2 = await req('GET', '/api/authorization/admin', ghostTok);
  check('GET /api/authorization/admin [ghost] → 403 (RBAC)', r2.status === 403);
  const r3 = await req('GET', '/api/settings/config', token3);
  check('GET /api/settings/config [admin] → 200', r3.status === 200);
  await req('POST', '/api/auth/logout', token3);

  // ── [9] Ownership regression — mint token directly ──────────────────────
  console.log('\n--- [9] Ownership Regression ---');
  const token4 = jwt.sign(
    { userId: adminUser.id, username: adminUser.username, role: adminUser.role },
    SECRET, { expiresIn: '5m' }
  );
  const r4 = await req('GET', '/api/enquiry', token4);
  check('GET /api/enquiry [fresh admin token] → 200', r4.status === 200, `status=${r4.status}`);
  await req('POST', '/api/auth/logout', token4);

  // ── [10] Public routes unchanged ───────────────────────────────────────────
  console.log('\n--- [10] Public Routes ---');
  const p1 = await req('GET', '/api/public/bootstrap-config', null);
  check('GET /api/public/bootstrap-config → 200', p1.status === 200);
  const p2 = await req('POST', '/api/auth/login', null, { identifier: 'bad', password: 'bad' });
  check('POST /api/auth/login [bad creds] → 401', p2.status === 401);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log(`\n--- Results: ${pass} passed, ${fail} failed ---`);
  if (failures.length) {
    console.log('\nFailed tests:');
    failures.forEach(f => console.log('  ❌ ' + f));
  }

  await pool.end();
  process.exit(fail > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Validation error:', err.message);
  process.exit(1);
});
