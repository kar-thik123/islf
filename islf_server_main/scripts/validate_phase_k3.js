/**
 * Phase K3 Validation Script
 * ==========================
 * Validates the Phase K3 permissions and user migration:
 * - SYSTEM_ADMIN has permissions (including IT Setup)
 * - ADMIN has permissions (EXCLUDING IT Setup)
 * - Seeded admin user is now SYSTEM_ADMIN
 * - Legacy admin permissions still exist for JWT compatibility
 *
 * Run: node scripts/validate_phase_k3.js
 */

'use strict';
require('dotenv').config();
const pool = require('../db');

let passed = 0;
let failed = 0;

function pass(msg) { passed++; console.log(`  ✅ PASS: ${msg}`); }
function fail(msg) { failed++; console.log(`  ❌ FAIL: ${msg}`); }

(async () => {
  console.log('\n=== Phase K3 Migration Validation ===\n');
  try {
    // 1. Check SYSTEM_ADMIN permissions
    const sysAdminPerms = await pool.query(
      "SELECT * FROM role_module_permissions WHERE role_name = 'SYSTEM_ADMIN'"
    );
    if (sysAdminPerms.rows.length > 0) {
      pass(`SYSTEM_ADMIN has permissions (${sysAdminPerms.rows.length} rows)`);
      const itSetup = sysAdminPerms.rows.find(
        p => p.module_name === 'Settings' && p.sub_module_name === 'IT Setup'
      );
      if (itSetup && itSetup.can_read === true && itSetup.can_write === true) {
        pass('SYSTEM_ADMIN includes IT Setup access');
      } else {
        fail('SYSTEM_ADMIN is missing IT Setup access');
      }
    } else {
      fail('SYSTEM_ADMIN has no permissions');
    }

    // 2. Check ADMIN permissions
    const adminPerms = await pool.query(
      "SELECT * FROM role_module_permissions WHERE role_name = 'ADMIN'"
    );
    if (adminPerms.rows.length > 0) {
      pass(`ADMIN has permissions (${adminPerms.rows.length} rows)`);
      const itSetup = adminPerms.rows.find(
        p => p.module_name === 'Settings' && p.sub_module_name === 'IT Setup'
      );
      if (itSetup && itSetup.can_read === false && itSetup.can_write === false && itSetup.can_delete === false) {
        pass('ADMIN does NOT have IT Setup access (correctly restricted)');
      } else {
        fail('ADMIN incorrectly has IT Setup access');
      }
    } else {
      fail('ADMIN has no permissions');
    }

    // 3. Check Legacy admin permissions
    const legacyPerms = await pool.query(
      "SELECT * FROM role_module_permissions WHERE role_name = 'admin'"
    );
    if (legacyPerms.rows.length > 0) {
      pass(`Legacy admin permissions still exist for JWT compatibility (${legacyPerms.rows.length} rows)`);
    } else {
      fail('Legacy admin permissions were deleted, breaking old JWTs');
    }

    // 4. Check Seeded user
    const userCheck = await pool.query("SELECT * FROM users WHERE username = 'admin'");
    if (userCheck.rows.length > 0) {
      if (userCheck.rows[0].role === 'SYSTEM_ADMIN') {
        pass('Seeded user "admin" is now role "SYSTEM_ADMIN"');
      } else {
        fail(`Seeded user "admin" role is "${userCheck.rows[0].role}" instead of "SYSTEM_ADMIN"`);
      }
    } else {
      fail('Seeded user "admin" not found');
    }

    console.log('\n' + '═'.repeat(60));
    console.log('Phase K3 Validation Summary');
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
