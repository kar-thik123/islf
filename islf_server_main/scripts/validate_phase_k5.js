/**
 * Phase K5 Validation Script
 * ==========================
 * Validates the Phase K5 Legacy admin cleanup:
 * - No users with role='admin'
 * - No permissions with role_name='admin'
 * - master_type 'admin' is Inactive
 * - LEGACY_ADMIN is removed from constants files
 *
 * Run: node scripts/validate_phase_k5.js
 */

'use strict';
require('dotenv').config();
const pool = require('../db');
const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = path.resolve(__dirname, '..');
const FRONTEND_ROOT = path.resolve(__dirname, '../../islf_ui_main/islf_logistics/src');

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
  console.log('\n=== Phase K5 Validation ===\n');
  try {
    // 1. Database Checks
    const users = await pool.query("SELECT id FROM users WHERE role = 'admin'");
    if (users.rows.length === 0) {
      pass("No users have role='admin'");
    } else {
      fail(`${users.rows.length} users still have role='admin'`);
    }

    const perms = await pool.query("SELECT role_name FROM role_module_permissions WHERE role_name = 'admin'");
    if (perms.rows.length === 0) {
      pass("No permissions exist for role_name='admin'");
    } else {
      fail(`${perms.rows.length} permission rows still exist for role_name='admin'`);
    }

    const master = await pool.query("SELECT status FROM master_type WHERE value = 'admin'");
    if (master.rows.length === 0 || master.rows[0].status === 'Inactive') {
      pass("master_type entry for 'admin' is Inactive (or deleted/absent)");
    } else {
      fail("master_type entry for 'admin' is still Active");
    }

    // 2. Code Checks
    const backendConstants = readFile(path.join(BACKEND_ROOT, 'constants/roles.js'));
    if (backendConstants) {
      if (!/LEGACY_ADMIN/.test(backendConstants)) {
        pass("LEGACY_ADMIN removed from backend roles.js");
      } else {
        fail("LEGACY_ADMIN still present in backend roles.js");
      }
    }

    const frontendConstants = readFile(path.join(FRONTEND_ROOT, 'app/constants/roles.ts'));
    if (frontendConstants) {
      if (!/LEGACY_ADMIN/.test(frontendConstants)) {
        pass("LEGACY_ADMIN removed from frontend roles.ts");
      } else {
        fail("LEGACY_ADMIN still present in frontend roles.ts");
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('Phase K5 Validation Summary');
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
