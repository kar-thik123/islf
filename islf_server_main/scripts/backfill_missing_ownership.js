'use strict';
/**
 * Phase I — Backfill Missing Ownership
 *
 * Rules:
 *   - NEVER overwrite existing created_by values.
 *   - Only fill where created_by IS NULL or empty AND a safe inference is possible.
 *   - Log all uncertain/skipped rows.
 *   - Dry-run by default; pass --commit to actually write.
 *
 * Run (dry-run):  node scripts/backfill_missing_ownership.js
 * Run (commit):   node scripts/backfill_missing_ownership.js --commit
 */
require('dotenv').config();
const pool = require('../db');

const COMMIT = process.argv.includes('--commit');

// Tables to backfill + how to infer the owner
const TARGETS = [
  {
    table: 'enquiry',
    idCol: 'id',
    labelCol: 'enquiry_no',
    // Infer from audit logs if we ever add that; for now just report
    inferStrategy: null,
  },
  {
    table: 'booking',
    idCol: 'id',
    labelCol: 'booking_no',
    inferStrategy: null,
  },
  {
    table: 'customer',
    idCol: 'id',
    labelCol: 'customer_no',
    inferStrategy: null,
  },
  {
    table: 'vendor',
    idCol: 'id',
    labelCol: 'vendor_no',
    inferStrategy: null,
  },
  {
    table: 'master_service_area',
    idCol: 'id',
    labelCol: 'code',
    inferStrategy: null,
  },
  {
    table: 'master_source_sales',
    idCol: 'id',
    labelCol: 'code',
    inferStrategy: null,
  },
  {
    table: 'account_details',
    idCol: 'id',
    labelCol: 'entity_code',
    inferStrategy: null,
  },
];

// Safe backfill: only fill if there is exactly one active admin user
async function inferAdminUsername(client) {
  const r = await client.query(
    "SELECT username FROM users WHERE role = 'admin' AND status = 'Active' LIMIT 1"
  );
  return r.rows[0]?.username || null;
}

async function run() {
  const client = await pool.connect();
  try {
    console.log('\n========== PHASE I: OWNERSHIP BACKFILL ==========');
    console.log(`Mode: ${COMMIT ? '🔴 COMMIT (writing to DB)' : '🟡 DRY RUN (no writes)'}\n`);

    let totalMissing = 0;
    let totalBackfilled = 0;
    let totalUncertain = 0;

    // Only do admin-inference if there is exactly ONE admin user
    // (Safe rule: if ambiguous, log uncertain and skip)
    const adminCountRes = await client.query(
      "SELECT COUNT(*) FROM users WHERE role = 'admin' AND status = 'Active'"
    );
    const adminCount = parseInt(adminCountRes.rows[0].count);
    const singleAdmin = adminCount === 1 ? await inferAdminUsername(client) : null;

    for (const target of TARGETS) {
      console.log(`\n--- Table: ${target.table} ---`);

      // Find rows missing created_by
      const missing = await client.query(
        `SELECT ${target.idCol} AS id, ${target.labelCol} AS label, created_by
         FROM ${target.table}
         WHERE created_by IS NULL OR TRIM(COALESCE(created_by, '')) = ''
         ORDER BY ${target.idCol}`
      );

      if (missing.rows.length === 0) {
        console.log(`  ✅ All ${target.table} rows have created_by set.`);
        continue;
      }

      totalMissing += missing.rows.length;
      console.log(`  ⚠️  ${missing.rows.length} row(s) missing created_by:`);

      for (const row of missing.rows) {
        // Strategy 1: Single admin inference (only if exactly one admin exists)
        if (singleAdmin) {
          console.log(
            `  🔧 ${target.table}(${target.idCol}=${row.id}, ${target.labelCol}="${row.label}") → infer "${singleAdmin}" (sole admin)`
          );
          if (COMMIT) {
            await client.query(
              `UPDATE ${target.table} SET created_by = $1 WHERE ${target.idCol} = $2 AND (created_by IS NULL OR TRIM(COALESCE(created_by,'')) = '')`,
              [singleAdmin, row.id]
            );
            totalBackfilled++;
          } else {
            totalBackfilled++; // count as "would backfill"
          }
        } else {
          // Cannot safely infer owner — log and skip
          console.log(
            `  ❓ ${target.table}(${target.idCol}=${row.id}, ${target.labelCol}="${row.label}") → UNCERTAIN (multiple admins or no admin found) — SKIPPED`
          );
          totalUncertain++;
        }
      }
    }

    // Summary
    console.log('\n========== BACKFILL SUMMARY ==========');
    console.log(`  Total rows missing created_by : ${totalMissing}`);
    console.log(`  Rows ${COMMIT ? 'backfilled' : 'would backfill'}: ${totalBackfilled}`);
    console.log(`  Rows skipped (uncertain)       : ${totalUncertain}`);
    if (!COMMIT && totalBackfilled > 0) {
      console.log('\n  ▶ Re-run with --commit to write changes.');
    }
    if (totalUncertain > 0) {
      console.log('\n  ⚠️  Uncertain rows must be manually assigned via User Management.');
    }
    if (totalMissing === 0) {
      console.log('\n  ✅ No backfill required — all ownership data is clean.');
    }

  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error('Backfill error:', err.message);
  process.exit(1);
});
