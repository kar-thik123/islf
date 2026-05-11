'use strict';
/**
 * PHASE B — PERMISSION BACKFILL SCRIPT
 *
 * Purpose : Insert ONLY missing permission rows into role_module_permissions.
 * Rules   : Uses INSERT ... ON CONFLICT DO NOTHING — never overwrites existing rows.
 *           Never deletes any row.
 *           Safe to run multiple times (idempotent).
 *
 * Run with: node scripts/backfill_permissions.js
 *
 * Based on Phase B analysis findings:
 *   - Only role in use: 'admin' (fully seeded already)
 *   - User id=5 (dtacticsit@gmail.com) has role='' → needs assignment
 *   - User id=9 (Dinesh) has role=null → needs assignment
 *   - No other roles exist → no missing permission rows for other roles
 *
 * The backfill also ensures 'admin' has complete coverage for all
 * routes registered in the RBAC observer (including any additions since seeding).
 */

require('dotenv').config();
const pool = require('../db');

// ---------------------------------------------------------------------------
// Complete canonical module/submodule list.
// Matches seed_admin.js + additional submodules discovered via routes audit.
// ---------------------------------------------------------------------------
const FULL_MODULE_MAP = [
  {
    module: 'Settings',
    subModules: [
      'Company Mgmt',
      'No. Series',
      'No. Series Relation',
      'No. Series Mapping',
      'IT Setup',
      'User Mgmt',
      'Carriage Direction',
      'Authorization',
    ],
  },
  {
    module: 'Logs',
    subModules: [
      'Auth Logs',
      'Masters Logs',
      'Master Type Logs',
      'Operations Logs',
      'Setup Logs',
      'System Logs',
    ],
  },
  {
    module: 'Masters',
    subModules: [
      'Master Code',
      'Master Type',
      'Customer',
      'Vendor',
      'Location',
      'Vessel',
      'Airline',
      'Unit of Measure',
      'Basis',
      'Master Item',
      'Cargo',
      'Charges',
      'Currency Code',
      'Container',
      'GST Setup',
      'Local Tariff',
      'Sourcing',
      'Service Area',
      'Source Sales',
    ],
  },
  {
    module: 'Master Types',
    subModules: [
      'User Status',
      'Tariff Type',
      'Customer',
      'Vendor',
      'Cargo Type',
      'Charge Type',
      'Basis',
      'Service Area',
      'Item',
      'Location',
      'Carriage',
    ],
  },
  {
    module: 'Search',
    subModules: ['Tariff'],
  },
  {
    module: 'Operations',
    subModules: ['Enquiry', 'Booking'],
  },
];

// ---------------------------------------------------------------------------
// Roles and their default permission set for this backfill.
// Only 'admin' is active in the system currently.
// All three flags are set to true for admin (full access).
// ---------------------------------------------------------------------------
const ROLE_DEFAULTS = [
  {
    role: 'admin',
    can_read: true,
    can_write: true,
    can_delete: true,
  },
];

async function backfillPermissions() {
  const client = await pool.connect();
  let inserted = 0;
  let skipped = 0;

  try {
    await client.query('BEGIN');
    console.log('[Backfill] Starting permission backfill...\n');

    for (const roleConfig of ROLE_DEFAULTS) {
      console.log(`[Backfill] Processing role: "${roleConfig.role}"`);

      for (const mod of FULL_MODULE_MAP) {
        for (const sub of mod.subModules) {
          const result = await client.query(
            `INSERT INTO role_module_permissions
               (role_name, module_name, sub_module_name, can_read, can_write, can_delete)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (role_name, module_name, sub_module_name)
             DO NOTHING
             RETURNING id`,
            [
              roleConfig.role,
              mod.module,
              sub,
              roleConfig.can_read,
              roleConfig.can_write,
              roleConfig.can_delete,
            ]
          );

          if (result.rows.length > 0) {
            console.log(
              `  ✅ INSERTED: [${roleConfig.role}] ${mod.module} → ${sub}`
            );
            inserted++;
          } else {
            // Row already existed — ON CONFLICT DO NOTHING
            skipped++;
          }
        }
      }
    }

    await client.query('COMMIT');

    console.log(`\n[Backfill] Complete.`);
    console.log(`  Rows inserted : ${inserted}`);
    console.log(`  Rows skipped  : ${skipped} (already existed — not modified)`);

    // ---------------------------------------------------------------------------
    // Report users with missing/empty roles (informational only — no UPDATE)
    // ---------------------------------------------------------------------------
    console.log('\n[Backfill] Checking for users with missing roles...');
    const badUsers = await client.query(`
      SELECT id, username, email, role, status
      FROM users
      WHERE role IS NULL OR TRIM(role) = ''
      ORDER BY id
    `);

    if (badUsers.rows.length === 0) {
      console.log('  ✅ All users have a role assigned.');
    } else {
      console.log(
        `  ⚠️  ${badUsers.rows.length} user(s) have NULL or empty role — they will trigger would_deny=true for ALL permission checks.\n`
      );
      console.log('  Users requiring manual role assignment:');
      for (const u of badUsers.rows) {
        console.log(
          `    id=${u.id} | username="${u.username}" | email="${u.email}" | current_role="${u.role}" | status="${u.status}"`
        );
      }
      console.log(
        '\n  ACTION REQUIRED: An administrator must assign a valid role to these users via the User Management screen.'
      );
      console.log(
        '  DO NOT run an automated UPDATE — role assignment must be a deliberate business decision.'
      );
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Backfill] ERROR — transaction rolled back:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

backfillPermissions();
