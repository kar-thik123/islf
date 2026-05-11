'use strict';
/**
 * Phase C Validation Test
 * Tests enforcement is working correctly for Batch 1 routes.
 * Run: node scripts/validate_phase_c.js
 */
require('dotenv').config();
const http = require('http');
const jwt  = require('jsonwebtoken');
const pool = require('../db');

const BASE = 'http://localhost:3001';
const SECRET = process.env.JWT_SECRET;

function makeToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}

function request(method, path, token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (e) => resolve({ status: 'ERR', body: e.message }));
    req.end();
  });
}

async function run() {
  console.log('\n========== PHASE C VALIDATION ==========\n');

  // Get admin user id from DB
  const adminRow = await pool.query("SELECT id, username, role FROM users WHERE username = 'admin' LIMIT 1");
  const admin = adminRow.rows[0];

  // Token WITH role (future-ready)
  const adminTokenWithRole = makeToken({ userId: admin.id, username: admin.username, role: admin.role });
  // Token WITHOUT role (current production state — role resolved via DB)
  const adminTokenNoRole   = makeToken({ userId: admin.id, username: admin.username });
  // Token for unknown user (no role)
  const unknownToken       = makeToken({ userId: 9999, username: 'ghost' });
  // Token for user with empty role (id=5)
  const emptyRoleToken     = makeToken({ userId: 5, username: '' });

  const tests = [
    // --- LOGS ---
    { label: 'GET /api/logs/auth  [admin, role in token]    → expect 200', method: 'GET',  path: '/api/logs/auth',   token: adminTokenWithRole, expect: 200 },
    { label: 'GET /api/logs/auth  [admin, no role in token] → expect 200', method: 'GET',  path: '/api/logs/auth',   token: adminTokenNoRole,   expect: 200 },
    { label: 'GET /api/logs/auth  [ghost user]              → expect 403', method: 'GET',  path: '/api/logs/auth',   token: unknownToken,        expect: 403 },
    { label: 'GET /api/logs/auth  [user with empty role]    → expect 403', method: 'GET',  path: '/api/logs/auth',   token: emptyRoleToken,      expect: 403 },
    { label: 'GET /api/logs/auth  [no token]                → expect 401', method: 'GET',  path: '/api/logs/auth',   token: null,                expect: 401 },

    // --- AUDIT LOGS ---
    { label: 'GET /api/audit_logs [admin]                   → expect 200', method: 'GET',  path: '/api/audit_logs',  token: adminTokenWithRole, expect: 200 },
    { label: 'GET /api/audit_logs [ghost user]              → expect 403', method: 'GET',  path: '/api/audit_logs',  token: unknownToken,        expect: 403 },

    // --- SETTINGS (GET is also enforced — admin must read) ---
    { label: 'GET /api/settings/config [admin]              → expect 200', method: 'GET',  path: '/api/settings/config', token: adminTokenWithRole, expect: 200 },
    { label: 'GET /api/settings/config [ghost user]         → expect 403', method: 'GET',  path: '/api/settings/config', token: unknownToken,        expect: 403 },

    // --- AUTHORIZATION ---
    { label: 'GET /api/authorization/admin [admin]          → expect 200', method: 'GET',  path: '/api/authorization/admin', token: adminTokenWithRole, expect: 200 },
    { label: 'GET /api/authorization/admin [ghost user]     → expect 403', method: 'GET',  path: '/api/authorization/admin', token: unknownToken,        expect: 403 },

    // --- UNPROTECTED ROUTES (must still work for any authenticated user) ---
    { label: 'GET /api/customer   [admin]                   → expect 200', method: 'GET',  path: '/api/customer',    token: adminTokenWithRole, expect: 200 },
    { label: 'GET /api/customer   [ghost user]              → expect 200', method: 'GET',  path: '/api/customer',    token: unknownToken,        expect: 200 },
  ];

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    const res = await request(t.method, t.path, t.token);
    const ok  = res.status === t.expect;
    const icon = ok ? '✅' : '❌';
    console.log(`${icon} ${t.label}`);
    if (!ok) {
      console.log(`     Got: ${res.status} | Expected: ${t.expect}`);
      console.log(`     Body: ${res.body.substring(0, 120)}`);
      failed++;
    } else {
      passed++;
    }
  }

  console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);

  await pool.end();
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Validation error:', err.message);
  process.exit(1);
});
