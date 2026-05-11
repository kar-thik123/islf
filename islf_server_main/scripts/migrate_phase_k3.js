/**
 * Phase K3 — Protected Role Permission Initialization + User Migration
 * ====================================================================
 * 
 * This script:
 *   Step 1.1: Clones all 'admin' permissions to 'SYSTEM_ADMIN'.
 *   Step 1.2: Clones all 'admin' permissions to 'ADMIN' (but sets 'IT Setup' access to false).
 *   Step 2:   Migrates the seeded 'admin' user to the 'SYSTEM_ADMIN' role.
 *
 * Safety:
 *   - Uses ON CONFLICT DO NOTHING (idempotent).
 *   - Wrapped in a transaction.
 *   - Leaves legacy 'admin' permissions in place for JWT backward compatibility.
 *   - Only updates username = 'admin'.
 *
 * Rollback:
 *   DELETE FROM role_module_permissions WHERE role_name IN ('SYSTEM_ADMIN', 'ADMIN');
 *   UPDATE users SET role = 'admin' WHERE username = 'admin' AND role = 'SYSTEM_ADMIN';
 *
 * Run: node scripts/migrate_phase_k3.js
 */

'use strict';
require('dotenv').config();
const pool = require('../db');

async function migrateK3() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('[Phase K3] Starting Permission Initialization & User Migration...\n');

    // ───────────────────────────────────────────────────────────
    // Step 1.1: Clone to SYSTEM_ADMIN
    // ───────────────────────────────────────────────────────────
    console.log('[Step 1.1] Cloning permissions to SYSTEM_ADMIN (full access)...');
    const sysAdminClone = await client.query(`
      INSERT INTO role_module_permissions (role_name, module_name, sub_module_name, can_read, can_write, can_delete)
      SELECT 'SYSTEM_ADMIN', module_name, sub_module_name, can_read, can_write, can_delete
      FROM role_module_permissions 
      WHERE role_name = 'admin'
      ON CONFLICT DO NOTHING
    `);
    console.log(`  ✅ SYSTEM_ADMIN permissions inserted: ${sysAdminClone.rowCount} rows`);

    // ───────────────────────────────────────────────────────────
    // Step 1.2: Clone to ADMIN (excluding IT Setup)
    // ───────────────────────────────────────────────────────────
    console.log('[Step 1.2] Cloning permissions to ADMIN (excluding IT Setup)...');
    const adminClone = await client.query(`
      INSERT INTO role_module_permissions (role_name, module_name, sub_module_name, can_read, can_write, can_delete)
      SELECT 'ADMIN', module_name, sub_module_name, 
        CASE WHEN module_name = 'Settings' AND sub_module_name = 'IT Setup' THEN false ELSE can_read END as can_read,
        CASE WHEN module_name = 'Settings' AND sub_module_name = 'IT Setup' THEN false ELSE can_write END as can_write,
        CASE WHEN module_name = 'Settings' AND sub_module_name = 'IT Setup' THEN false ELSE can_delete END as can_delete
      FROM role_module_permissions 
      WHERE role_name = 'admin'
      ON CONFLICT DO NOTHING
    `);
    console.log(`  ✅ ADMIN permissions inserted: ${adminClone.rowCount} rows`);

    // ───────────────────────────────────────────────────────────
    // Step 2: User Migration
    // ───────────────────────────────────────────────────────────
    console.log('\n[Step 2] Migrating seeded user...');
    const userUpdate = await client.query(`
      UPDATE users 
      SET role = 'SYSTEM_ADMIN' 
      WHERE username = 'admin' AND (role = 'admin' OR role IS NULL)
    `);
    console.log(`  ✅ Users updated: ${userUpdate.rowCount} (username = 'admin' is now SYSTEM_ADMIN)`);

    // ───────────────────────────────────────────────────────────
    // Verification
    // ───────────────────────────────────────────────────────────
    console.log('\n[Verify] Checking IT Setup permissions...');
    const verifyPerms = await client.query(`
      SELECT role_name, module_name, sub_module_name, can_read, can_write, can_delete
      FROM role_module_permissions
      WHERE module_name = 'Settings' AND sub_module_name = 'IT Setup'
      ORDER BY role_name
    `);
    console.table(verifyPerms.rows);

    await client.query('COMMIT');
    console.log('\n🎉 Phase K3 migration complete.\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n⛔ Migration failed — rolled back:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateK3();
