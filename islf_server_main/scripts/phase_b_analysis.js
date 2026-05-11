'use strict';
require('dotenv').config();
const pool = require('../db');

async function runAnalysis() {
  const client = await pool.connect();
  try {
    console.log('\n========== PHASE B SHADOW ANALYSIS ==========\n');

    // 1. Observation summary
    console.log('--- [1] RBAC OBSERVATION SUMMARY ---');
    const obs = await client.query(`
      SELECT user_role, module_name, sub_module_name, action_type,
             COUNT(*) AS total_requests,
             SUM(CASE WHEN would_deny THEN 1 ELSE 0 END) AS would_deny_count,
             SUM(CASE WHEN NOT permission_exists THEN 1 ELSE 0 END) AS no_perm_row
      FROM rbac_observation_log
      GROUP BY user_role, module_name, sub_module_name, action_type
      ORDER BY would_deny_count DESC, total_requests DESC
    `);
    console.log(JSON.stringify(obs.rows, null, 2));

    // 2. Roles that have would_deny=true
    console.log('\n--- [2] ROLES WITH DENIED ACTIONS ---');
    const denied = await client.query(`
      SELECT DISTINCT user_role, module_name, sub_module_name, action_type,
             COUNT(*) AS occurrences
      FROM rbac_observation_log
      WHERE would_deny = TRUE
      GROUP BY user_role, module_name, sub_module_name, action_type
      ORDER BY user_role, module_name
    `);
    console.log(JSON.stringify(denied.rows, null, 2));

    // 3. Unknown module entries
    console.log('\n--- [3] UNKNOWN_MODULE ENTRIES ---');
    const unknown = await client.query(`
      SELECT endpoint, user_role, action_type, COUNT(*) AS hits
      FROM rbac_observation_log
      WHERE module_name = 'UNKNOWN_MODULE'
      GROUP BY endpoint, user_role, action_type
      ORDER BY hits DESC
    `);
    console.log(JSON.stringify(unknown.rows, null, 2));

    // 4. Users with NULL/empty role
    console.log('\n--- [4] USERS WITH MISSING/NULL ROLE ---');
    const nullRoles = await client.query(`
      SELECT id, username, email, status, role
      FROM users
      WHERE role IS NULL OR role = ''
      ORDER BY id
    `);
    console.log(JSON.stringify(nullRoles.rows, null, 2));

    // 5. All distinct active roles in users table
    console.log('\n--- [5] DISTINCT ROLES IN USERS TABLE ---');
    const roles = await client.query(`
      SELECT role, COUNT(*) AS user_count
      FROM users
      WHERE role IS NOT NULL AND role != ''
      GROUP BY role
      ORDER BY user_count DESC
    `);
    console.log(JSON.stringify(roles.rows, null, 2));

    // 6. All distinct roles in role_module_permissions
    console.log('\n--- [6] ROLES IN role_module_permissions ---');
    const permRoles = await client.query(`
      SELECT role_name, COUNT(*) AS perm_rows
      FROM role_module_permissions
      GROUP BY role_name
      ORDER BY perm_rows DESC
    `);
    console.log(JSON.stringify(permRoles.rows, null, 2));

    // 7. Full permission table for reference
    console.log('\n--- [7] FULL role_module_permissions TABLE ---');
    const allPerms = await client.query(`
      SELECT role_name, module_name, sub_module_name, can_read, can_write, can_delete
      FROM role_module_permissions
      ORDER BY role_name, module_name, sub_module_name
    `);
    console.log(JSON.stringify(allPerms.rows, null, 2));

    // 8. Roles used in obs log but not in permissions table
    console.log('\n--- [8] ROLES OBSERVED BUT NOT IN PERMISSIONS TABLE ---');
    const rolesNotInPerms = await client.query(`
      SELECT DISTINCT o.user_role
      FROM rbac_observation_log o
      WHERE o.user_role IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM role_module_permissions p WHERE p.role_name = o.user_role
        )
    `);
    console.log(JSON.stringify(rolesNotInPerms.rows, null, 2));

    // 9. Module+sub combos observed but not in permissions
    console.log('\n--- [9] MODULE/SUB COMBOS OBSERVED BUT MISSING FROM PERMISSIONS ---');
    const missingCombos = await client.query(`
      SELECT DISTINCT o.user_role, o.module_name, o.sub_module_name, o.action_type
      FROM rbac_observation_log o
      WHERE o.module_name != 'UNKNOWN_MODULE'
        AND o.user_role IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM role_module_permissions p
          WHERE p.role_name = o.user_role
            AND p.module_name = o.module_name
            AND p.sub_module_name = o.sub_module_name
        )
      ORDER BY o.user_role, o.module_name, o.sub_module_name
    `);
    console.log(JSON.stringify(missingCombos.rows, null, 2));

    // 10. Admin baseline check
    console.log('\n--- [10] ADMIN BASELINE — would_deny for admin role ---');
    const adminCheck = await client.query(`
      SELECT module_name, sub_module_name, action_type,
             SUM(CASE WHEN would_deny THEN 1 ELSE 0 END) AS denied_count,
             COUNT(*) AS total
      FROM rbac_observation_log
      WHERE user_role = 'admin'
      GROUP BY module_name, sub_module_name, action_type
      HAVING SUM(CASE WHEN would_deny THEN 1 ELSE 0 END) > 0
    `);
    console.log(JSON.stringify(adminCheck.rows, null, 2));

    // 11. Total log record count
    console.log('\n--- [11] TOTAL OBSERVATION LOG RECORDS ---');
    const total = await client.query('SELECT COUNT(*) FROM rbac_observation_log');
    console.log(JSON.stringify(total.rows, null, 2));

    // 12. All users with their roles (for role integrity report)
    console.log('\n--- [12] ALL USERS WITH ROLES ---');
    const allUsers = await client.query(`
      SELECT id, username, email, role, status FROM users ORDER BY id
    `);
    console.log(JSON.stringify(allUsers.rows, null, 2));

  } finally {
    client.release();
    await pool.end();
  }
}

runAnalysis().catch(err => {
  console.error('Analysis error:', err.message);
  process.exit(1);
});
