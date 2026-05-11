/**
 * Phase K2 Validation Script
 * ==========================
 * Validates the Phase K2 protected role setup:
 * - is_protected column exists
 * - SYSTEM_ADMIN exists and is protected
 * - ADMIN exists and is protected
 * - No duplicate roles in master_type
 * - Users remain unchanged (no K2 roles assigned yet)
 *
 * Run: node scripts/validate_phase_k2.js
 */

'use strict';
require('dotenv').config();
const pool = require('../db');

let passed = 0;
let failed = 0;

function pass(msg) { passed++; console.log(`  ✅ PASS: ${msg}`); }
function fail(msg) { failed++; console.log(`  ❌ FAIL: ${msg}`); }

(async () => {
  console.log('\n=== Phase K2 Database Validation ===\n');
  try {
    // 1. Check is_protected column
    const cols = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'master_type' AND column_name = 'is_protected'"
    );
    if (cols.rows.length > 0 && cols.rows[0].data_type === 'boolean') {
      pass('master_type.is_protected column exists and is BOOLEAN');
    } else {
      fail('master_type.is_protected column is missing or wrong type');
    }

    // 2. Load the roles
    const roles = await pool.query("SELECT * FROM master_type WHERE key = 'USER_ROLE'");
    const sysAdmin = roles.rows.find(r => r.value === 'SYSTEM_ADMIN');
    const admin = roles.rows.find(r => r.value === 'ADMIN');

    if (sysAdmin) {
      pass('SYSTEM_ADMIN exists in master_type');
      if (sysAdmin.is_protected === true) {
        pass('SYSTEM_ADMIN is marked as is_protected=true');
      } else {
        fail('SYSTEM_ADMIN is NOT protected');
      }
    } else {
      fail('SYSTEM_ADMIN missing from master_type');
    }

    if (admin) {
      pass('ADMIN exists in master_type');
      if (admin.is_protected === true) {
        pass('ADMIN is marked as is_protected=true');
      } else {
        fail('ADMIN is NOT protected');
      }
    } else {
      fail('ADMIN missing from master_type');
    }

    // 3. Check for duplicates
    const duplicates = await pool.query(`
      SELECT value, COUNT(*) 
      FROM master_type 
      WHERE key = 'USER_ROLE' 
      GROUP BY value 
      HAVING COUNT(*) > 1
    `);
    if (duplicates.rows.length === 0) {
      pass('No duplicate roles found in master_type');
    } else {
      fail(`Found duplicate roles: ${duplicates.rows.map(r => r.value).join(', ')}`);
    }

    // 4. Ensure old admin user wasn't modified
    const adminUser = await pool.query("SELECT * FROM users WHERE username = 'admin'");
    if (adminUser.rows.length > 0) {
      if (adminUser.rows[0].role === 'admin') {
        pass('Existing admin user role remains "admin"');
      } else {
        fail(`Existing admin user role was changed to: ${adminUser.rows[0].role}`);
      }
    } else {
      fail('Existing admin user is missing');
    }

    // 5. Ensure no users have new roles yet
    const newRoleUsers = await pool.query("SELECT id FROM users WHERE role IN ('SYSTEM_ADMIN', 'ADMIN')");
    if (newRoleUsers.rows.length === 0) {
      pass('No users have been assigned the new K2 roles yet');
    } else {
      fail(`${newRoleUsers.rows.length} user(s) were assigned K2 roles prematurely`);
    }

    console.log('\n' + '═'.repeat(60));
    console.log('Phase K2 Validation Summary');
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
