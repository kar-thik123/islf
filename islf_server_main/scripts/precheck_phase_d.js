'use strict';
/**
 * Phase D Pre-Check — User Role Integrity Gate
 * Queries all users and verifies every active user has a valid role.
 * Exits with code 1 (blocking) if any invalid roles are found.
 * Phase D enforcement must NOT proceed until this exits with code 0.
 */
require('dotenv').config();
const pool = require('../db');

async function preCheck() {
  const client = await pool.connect();
  try {
    console.log('\n========== PHASE D PRE-CHECK ==========\n');

    // 1. All users — full picture
    const all = await client.query(
      `SELECT id, username, email, role, status FROM users ORDER BY id`
    );
    console.log(`Total users in system: ${all.rows.length}`);
    console.table(all.rows.map(u => ({
      id: u.id,
      username: u.username || '(empty)',
      email: u.email,
      role: u.role || '(NULL/EMPTY)',
      status: u.status || '(empty)',
    })));

    // 2. Users with NULL or empty role
    const blocked = await client.query(`
      SELECT id, username, email, role, status
      FROM users
      WHERE role IS NULL OR TRIM(COALESCE(role, '')) = ''
      ORDER BY id
    `);

    // 3. Distinct active roles and whether they have permission rows
    const roleCoverage = await client.query(`
      SELECT
        u.role,
        COUNT(DISTINCT u.id)                        AS user_count,
        COUNT(DISTINCT p.module_name || p.sub_module_name) AS perm_rows
      FROM users u
      LEFT JOIN role_module_permissions p ON p.role_name = u.role
      WHERE u.role IS NOT NULL AND TRIM(u.role) != ''
      GROUP BY u.role
      ORDER BY user_count DESC
    `);

    console.log('\n--- Role Coverage ---');
    console.table(roleCoverage.rows);

    if (blocked.rows.length > 0) {
      console.error('\n🔴 PRE-CHECK FAILED — Phase D BLOCKED\n');
      console.error(`${blocked.rows.length} user(s) have NULL or empty role.`);
      console.error('These users will receive 403 on ALL enforced endpoints.\n');
      console.error('Blocking users:');
      for (const u of blocked.rows) {
        console.error(
          `  ❌  id=${u.id} | username="${u.username || ''}" | ` +
          `email="${u.email}" | role="${u.role}" | status="${u.status}"`
        );
      }
      console.error('\n ACTION: An administrator must assign a valid role to each user');
      console.error('  listed above using the User Management screen (PUT /api/user/:id).');
      console.error('  Then re-run this pre-check before proceeding with Phase D.\n');
      process.exit(1);
    }

    console.log('\n✅ PRE-CHECK PASSED — All users have valid roles. Phase D may proceed.\n');
    process.exit(0);
  } finally {
    client.release();
    await pool.end();
  }
}

preCheck().catch(err => {
  console.error('Pre-check error:', err.message);
  process.exit(1);
});
