/**
 * Phase K5 — Legacy admin Cleanup
 * ====================================================================
 * 
 * This script:
 *   Step 1: Performs a safety audit to ensure no users still have role='admin'.
 *   Step 2: Deletes legacy 'admin' from role_module_permissions.
 *   Step 3: Sets status='Inactive' for 'admin' in master_type (if it exists).
 *
 * Safety:
 *   - Aborts if any active users with role='admin' exist.
 *   - Wrapped in a transaction.
 *
 * Rollback:
 *   - Re-insert permissions from SYSTEM_ADMIN back to 'admin'
 *   - Update master_type status='Active'
 *
 * Run: node scripts/migrate_phase_k5.js
 */

'use strict';
require('dotenv').config();
const pool = require('../db');

async function migrateK5() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('[Phase K5] Starting Legacy Admin Cleanup...\n');

    // ───────────────────────────────────────────────────────────
    // Step 1: Safety Audit
    // ───────────────────────────────────────────────────────────
    console.log('[Step 1] Safety Audit...');
    const users = await client.query("SELECT id, username FROM users WHERE role = 'admin'");
    if (users.rows.length > 0) {
      console.error(`  ⛔ BLOCKER: Found ${users.rows.length} user(s) with role='admin'.`);
      console.table(users.rows);
      throw new Error('Safety audit failed. Cannot proceed with cleanup while users depend on legacy role.');
    }
    console.log("  ✅ Safety audit passed. No users have role='admin'.");

    // ───────────────────────────────────────────────────────────
    // Step 2: Permission Cleanup
    // ───────────────────────────────────────────────────────────
    console.log('\n[Step 2] Cleaning up legacy permissions...');
    const deletePerms = await client.query("DELETE FROM role_module_permissions WHERE role_name = 'admin'");
    console.log(`  ✅ Deleted ${deletePerms.rowCount} rows for legacy 'admin' from role_module_permissions.`);

    // ───────────────────────────────────────────────────────────
    // Step 3: Role Master Cleanup
    // ───────────────────────────────────────────────────────────
    console.log('\n[Step 3] Deactivating legacy admin in master_type...');
    const updateMaster = await client.query(`
      UPDATE master_type 
      SET status = 'Inactive' 
      WHERE value = 'admin' AND key = 'USER_ROLE'
    `);
    console.log(`  ✅ Updated ${updateMaster.rowCount} row(s) to Inactive in master_type.`);

    await client.query('COMMIT');
    console.log('\n🎉 Phase K5 database cleanup complete.\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n⛔ Cleanup failed — rolled back:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateK5();
