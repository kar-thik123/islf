/**
 * Phase K6 Validation Script
 * ==========================
 * Validates the Phase K6 Bootstrap Seeding:
 * - islf_root and islf_admin exist
 * - Passwords are hashed
 * - Cannot change role or status of these users
 *
 * Run: node scripts/validate_phase_k6.js
 */

'use strict';
require('dotenv').config();
const pool = require('../db');
const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function pass(msg) { passed++; console.log(`  ✅ PASS: ${msg}`); }
function fail(msg) { failed++; console.log(`  ❌ FAIL: ${msg}`); }

function readFile(relPath) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf8');
}

(async () => {
  console.log('\n=== Phase K6 Validation ===\n');
  try {
    // 1. Database Checks
    const users = await pool.query("SELECT * FROM users WHERE username IN ('islf_root', 'islf_admin')");
    
    const rootUser = users.rows.find(u => u.username === 'islf_root');
    if (rootUser) {
      pass("SYSTEM_ADMIN user (islf_root) exists");
      if (rootUser.role === 'SYSTEM_ADMIN') pass("islf_root role is SYSTEM_ADMIN");
      else fail(`islf_root role is ${rootUser.role}`);
      
      if (rootUser.password && (rootUser.password.startsWith('$2a$') || rootUser.password.startsWith('$2b$'))) pass("islf_root password is hashed with bcrypt");
      else fail("islf_root password is NOT hashed with bcrypt");
    } else {
      fail("SYSTEM_ADMIN user (islf_root) does not exist");
    }

    const adminUser = users.rows.find(u => u.username === 'islf_admin');
    if (adminUser) {
      pass("ADMIN user (islf_admin) exists");
      if (adminUser.role === 'ADMIN') pass("islf_admin role is ADMIN");
      else fail(`islf_admin role is ${adminUser.role}`);

      if (adminUser.password && (adminUser.password.startsWith('$2a$') || adminUser.password.startsWith('$2b$'))) pass("islf_admin password is hashed with bcrypt");
      else fail("islf_admin password is NOT hashed with bcrypt");
    } else {
      fail("ADMIN user (islf_admin) does not exist");
    }

    // 2. Code Checks (Backend API Enforcement)
    const userApiFile = readFile(path.join(__dirname, '../routes/user.js'));
    if (userApiFile) {
      if (userApiFile.includes("currentUser.username === 'islf_root'") &&
          userApiFile.includes("Cannot change role of protected account") &&
          userApiFile.includes("Cannot deactivate protected account")) {
        pass("Backend API protects bootstrap users from role and status changes");
      } else {
        fail("Backend API missing protections for bootstrap users");
      }
    } else {
      fail("routes/user.js not found");
    }

    console.log('\n' + '═'.repeat(60));
    console.log('Phase K6 Validation Summary');
    console.log('═'.repeat(60));
    console.log(`  ✅ Passed:   ${passed}`);
    console.log(`  ❌ Failed:   ${failed}`);
    console.log('═'.repeat(60));

    if (failed > 0) process.exit(1);
    else process.exit(0);

  } catch (err) {
    console.error('Validation script failed to run:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
