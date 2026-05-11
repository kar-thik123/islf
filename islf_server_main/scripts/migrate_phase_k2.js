/**
 * Phase K2 — Protected Role Architecture Migration
 * ==================================================
 * 
 * This script:
 *   Step 2: Adds 'is_protected' BOOLEAN column to master_type (if missing)
 *   Step 2.1: Inserts 'USER_ROLE' into master_code to satisfy foreign key constraint
 *   Step 3: Seeds SYSTEM_ADMIN and ADMIN as protected roles in master_type
 *
 * Safety:
 *   - Uses IF NOT EXISTS / ON CONFLICT DO NOTHING (idempotent)
 *   - Wrapped in a transaction (all or nothing)
 *   - Does NOT modify existing users
 *   - Does NOT modify existing role_module_permissions
 *   - Does NOT change any JWT or RBAC behavior
 *
 * Rollback:
 *   DELETE FROM master_type WHERE key = 'USER_ROLE' AND value IN ('SYSTEM_ADMIN', 'ADMIN');
 *   ALTER TABLE master_type DROP COLUMN IF EXISTS is_protected;
 *
 * Run: node scripts/migrate_phase_k2.js
 */

'use strict';
require('dotenv').config();
const pool = require('../db');

async function migrateK2() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('[Phase K2] Starting Protected Role Architecture migration...\n');

    // ───────────────────────────────────────────────────────────
    // Step 2: Add is_protected column to master_type
    // ───────────────────────────────────────────────────────────
    console.log('[Step 2] Adding is_protected column to master_type...');
    await client.query(`
      ALTER TABLE master_type 
      ADD COLUMN IF NOT EXISTS is_protected BOOLEAN DEFAULT false
    `);
    console.log('  ✅ is_protected column added (or already existed).\n');

    // ───────────────────────────────────────────────────────────
    // Step 2.1: Add USER_ROLE to master_code
    // ───────────────────────────────────────────────────────────
    console.log('[Step 2.1] Adding USER_ROLE to master_code to satisfy foreign key...');
    await client.query(`
      INSERT INTO master_code (code, description, status)
      VALUES ('USER_ROLE', 'User Roles for the system', 'Active')
      ON CONFLICT DO NOTHING
    `);
    console.log('  ✅ USER_ROLE added to master_code (or already existed).\n');

    // ───────────────────────────────────────────────────────────
    // Step 3: Seed protected roles
    // ───────────────────────────────────────────────────────────
    console.log('[Step 3] Seeding protected roles...');

    // SYSTEM_ADMIN — full access including IT Setup
    const sysAdminResult = await client.query(`
      INSERT INTO master_type (key, value, description, status, is_protected)
      VALUES ('USER_ROLE', 'SYSTEM_ADMIN', 'System Administrator — full access including IT Setup', 'Active', true)
      ON CONFLICT DO NOTHING
      RETURNING id
    `);
    if (sysAdminResult.rows.length > 0) {
      console.log('  ✅ SYSTEM_ADMIN role seeded (id=' + sysAdminResult.rows[0].id + ')');
    } else {
      console.log('  ℹ️  SYSTEM_ADMIN already exists — skipped.');
    }

    // ADMIN — full business access, no IT Setup
    const adminResult = await client.query(`
      INSERT INTO master_type (key, value, description, status, is_protected)
      VALUES ('USER_ROLE', 'ADMIN', 'Administrator — full business access, no IT Setup', 'Active', true)
      ON CONFLICT DO NOTHING
      RETURNING id
    `);
    if (adminResult.rows.length > 0) {
      console.log('  ✅ ADMIN role seeded (id=' + adminResult.rows[0].id + ')');
    } else {
      console.log('  ℹ️  ADMIN already exists — skipped.');
    }

    // ───────────────────────────────────────────────────────────
    // Verification: Read back what we inserted
    // ───────────────────────────────────────────────────────────
    console.log('\n[Verify] Reading back protected roles...');
    const verify = await client.query(`
      SELECT id, key, value, status, is_protected, description
      FROM master_type 
      WHERE key = 'USER_ROLE' 
      ORDER BY id
    `);
    console.table(verify.rows);

    // ───────────────────────────────────────────────────────────
    // Safety check: Confirm no user records were modified
    // ───────────────────────────────────────────────────────────
    console.log('[Safety] Confirming no user records were modified...');
    const users = await client.query('SELECT id, username, role FROM users ORDER BY id');
    const systemAdminUsers = users.rows.filter(u => u.role === 'SYSTEM_ADMIN');
    const adminRoleUsers = users.rows.filter(u => u.role === 'ADMIN');
    if (systemAdminUsers.length === 0 && adminRoleUsers.length === 0) {
      console.log('  ✅ No users have SYSTEM_ADMIN or ADMIN roles yet (as expected for K2).');
    } else {
      console.log('  ⚠️  Some users already have new roles — this is unexpected for Phase K2.');
      console.table(systemAdminUsers.concat(adminRoleUsers));
    }

    await client.query('COMMIT');
    console.log('\n🎉 Phase K2 migration complete.\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n⛔ Migration failed — rolled back:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateK2();
