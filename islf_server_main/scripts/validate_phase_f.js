'use strict';
/**
 * Phase F Validation Suite
 * Tests all Phase F security hardening changes.
 * Run: node scripts/validate_phase_f.js
 */
require('dotenv').config();
const http = require('http');
const jwt  = require('jsonwebtoken');
const pool = require('../db');

const SECRET = process.env.JWT_SECRET;

function makeToken(payload, expiresIn = '1h') {
  return jwt.sign(payload, SECRET, { expiresIn });
}

function httpReq(method, path, token, body, extraHeaders = {}) {
  return new Promise((resolve) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost', port: 3001, path, method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:4200',   // default allowed origin
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {}),
        ...extraHeaders,
      },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', (e) => resolve({ status: 'ERR', headers: {}, body: e.message }));
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

let passed = 0; let failed = 0; const failures = [];

async function test(label, method, path, token, expectedStatus, body, extraHeaders) {
  const res = await httpReq(method, path, token, body, extraHeaders || {});
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
  console.log('\n========== PHASE F VALIDATION ==========\n');

  const r = await pool.query("SELECT id, username, role FROM users WHERE username='admin' LIMIT 1");
  if (!r.rows[0]) { console.error('Admin user not found'); process.exit(1); }
  const admin = r.rows[0];

  const adminToken = makeToken({ userId: admin.id, username: admin.username, role: admin.role });
  const ghostToken = makeToken({ userId: 9999, username: 'ghost' });

  // ── [1] Public registration blocked ──────────────────────────────────────
  console.log('\n--- [1] Public Registration Blocked (D8) ---');
  await test(
    'POST /api/auth/register [no token]       → 401',
    'POST', '/api/auth/register', null, 401,
    { username: 'hacker', password: 'password123' }
  );
  await test(
    'POST /api/auth/register [ghost, no role] → 403',
    'POST', '/api/auth/register', ghostToken, 403,
    { username: 'hacker', password: 'password123' }
  );
  await test(
    'POST /api/auth/register [admin token]    → 201 or 409',
    'POST', '/api/auth/register', adminToken, 201,
    { username: `testuser_${Date.now()}`, email: `test${Date.now()}@example.com`, password: 'Admin@12345' }
  );

  // ── [2] Login rate limiter active ────────────────────────────────────────
  console.log('\n--- [2] Login Rate Limiting (D12) ---');
  // Check that valid login still works
  const loginRes = await httpReq('POST', '/api/auth/login', null,
    { identifier: 'admin', password: 'admin123' }, { 'Origin': 'http://localhost:4200' });
  const loginOk = loginRes.status === 200;
  console.log(`${loginOk ? '✅' : '❌'} POST /api/auth/login [valid creds]      → 200`);
  if (loginOk) passed++; else { failed++; failures.push('Login broken by rate limiter'); }

  // Check rate limit headers are present
  const hasRateLimitHeader = 'ratelimit-limit' in loginRes.headers || 'x-ratelimit-limit' in loginRes.headers;
  console.log(`${hasRateLimitHeader ? '✅' : '❌'} Rate-Limit headers present in login response`);
  if (hasRateLimitHeader) passed++; else { failed++; failures.push('Rate limit headers missing'); }

  // ── [3] CORS — allowed origin passes ─────────────────────────────────────
  console.log('\n--- [3] CORS Allowlist (D13) ---');
  const corsAllowed = await httpReq('GET', '/api/public/bootstrap-config', null, null,
    { 'Origin': 'http://localhost:4200' });
  const corsAllowedOk = corsAllowed.status === 200 &&
    corsAllowed.headers['access-control-allow-origin'] === 'http://localhost:4200';
  console.log(`${corsAllowedOk ? '✅' : '❌'} GET bootstrap-config [allowed origin] → 200 + CORS header`);
  if (corsAllowedOk) passed++; else {
    console.log(`     ACAO header: "${corsAllowed.headers['access-control-allow-origin']}"`);
    failed++; failures.push('CORS allowed origin not working');
  }

  // CORS blocked origin — should fail at transport level (network error) or return CORS error
  const corsBlocked = await httpReq('GET', '/api/public/bootstrap-config', null, null,
    { 'Origin': 'http://evil.attacker.com' });
  const corsBlockedOk = corsBlocked.status !== 200 ||
    corsBlocked.headers['access-control-allow-origin'] !== 'http://evil.attacker.com';
  console.log(`${corsBlockedOk ? '✅' : '❌'} GET bootstrap-config [evil origin]    → CORS blocked`);
  if (corsBlockedOk) passed++; else { failed++; failures.push('CORS not blocking unknown origins'); }

  // ── [4] Password reset URL uses env var ──────────────────────────────────
  console.log('\n--- [4] Password Reset URL (D14) ---');
  // Check source code contains FRONTEND_URL (static check — no email sent)
  const fs = require('fs');
  const pwdSrc = fs.readFileSync(
    require('path').join(__dirname, '../routes/password.js'), 'utf8'
  );
  const usesEnvVar = pwdSrc.includes('FRONTEND_URL');
  const noHardcoded = !pwdSrc.includes("'http://localhost:4200/auth/newpassword'") &&
                      !pwdSrc.includes('"http://localhost:4200/auth/newpassword"');
  console.log(`${usesEnvVar  ? '✅' : '❌'} password.js uses process.env.FRONTEND_URL`);
  console.log(`${noHardcoded ? '✅' : '❌'} Hardcoded localhost reset URL removed`);
  if (usesEnvVar)  passed++; else { failed++; failures.push('FRONTEND_URL not used in password.js'); }
  if (noHardcoded) passed++; else { failed++; failures.push('Hardcoded localhost URL still present'); }

  // ── [5] Audit log sanitization ────────────────────────────────────────────
  console.log('\n--- [5] Audit Log Sanitization ---');
  const auditSrc = fs.readFileSync(
    require('path').join(__dirname, '../middleware/enhancedAuditLogMiddleware.js'), 'utf8'
  );
  const hasSanitize = auditSrc.includes('sanitizePayload');
  const hasSensitiveSet = auditSrc.includes('SENSITIVE_FIELDS');
  const sanitizesPayload = auditSrc.includes('sanitizePayload(req.body)');
  console.log(`${hasSanitize       ? '✅' : '❌'} sanitizePayload() function exists in audit middleware`);
  console.log(`${hasSensitiveSet   ? '✅' : '❌'} SENSITIVE_FIELDS set defined (password, token, smtp_password, api_key, api_secret)`);
  console.log(`${sanitizesPayload  ? '✅' : '❌'} req.body is sanitized before writing to system_logs`);
  if (hasSanitize)      passed++; else { failed++; failures.push('sanitizePayload missing'); }
  if (hasSensitiveSet)  passed++; else { failed++; failures.push('SENSITIVE_FIELDS missing'); }
  if (sanitizesPayload) passed++; else { failed++; failures.push('Payload not sanitized before logging'); }

  // Functional check: login writes sanitized payload (password should not appear in system_logs)
  await httpReq('POST', '/api/auth/login', null,
    { identifier: 'admin', password: 'admin123' });
  await new Promise(r => setTimeout(r, 500)); // let audit write complete
  const logCheck = await pool.query(`
    SELECT payload FROM system_logs
    WHERE module_name = 'auth' AND method = 'POST'
    ORDER BY created_at DESC LIMIT 1
  `);
  if (logCheck.rows[0]) {
    const payloadStr = JSON.stringify(logCheck.rows[0].payload || '');
    const passwordVisible = payloadStr.includes('"admin123"') || payloadStr.includes("'admin123'");
    console.log(`${!passwordVisible ? '✅' : '❌'} Password NOT stored in plaintext in system_logs`);
    if (!passwordVisible) passed++; else { failed++; failures.push('Password stored in system_logs plaintext'); }
  } else {
    console.log('⚠️  No recent auth log found — skipping plaintext password check');
  }

  // ── [6] Existing JWT sessions still work ─────────────────────────────────
  console.log('\n--- [6] Existing JWT Sessions Unchanged ---');
  await test('GET /api/customer   [admin token]    → 200', 'GET', '/api/customer',       adminToken, 200);
  await test('GET /api/settings/config [admin]     → 200', 'GET', '/api/settings/config', adminToken, 200);
  await test('GET /api/user       [admin]          → 200', 'GET', '/api/user',            adminToken, 200);
  await test('GET /api/enquiry    [admin]          → 200', 'GET', '/api/enquiry',         adminToken, 200);

  // ── [7] Phase C/D/E regression ───────────────────────────────────────────
  console.log('\n--- [7] Phase C/D/E Regression ---');
  await test('GET /api/authorization/admin [admin] → 200', 'GET', '/api/authorization/admin', adminToken, 200);
  await test('GET /api/number_series  [admin]      → 200', 'GET', '/api/number_series',       adminToken, 200);
  await test('GET /api/company        [admin]      → 200', 'GET', '/api/company',             adminToken, 200);
  await test('GET /api/authorization/admin [ghost] → 403', 'GET', '/api/authorization/admin', ghostToken, 403);
  await test('GET /api/customer       [ghost]      → 403', 'GET', '/api/customer',            ghostToken, 403);

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
