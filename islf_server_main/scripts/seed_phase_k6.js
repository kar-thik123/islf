'use strict';

require('dotenv').config();

const pool = require('../db');
const bcrypt = require('bcryptjs');

async function seedK6() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('[Phase K6] Starting protected bootstrap seeding...\n');

    // =====================================================
    // Hardcoded secure bootstrap credentials
    // =====================================================
    const SYSTEM_ADMIN_USERNAME = 'islf_root';
    const SYSTEM_ADMIN_PASSWORD = 'ISLF#Root@2026!X9m';

    const ADMIN_USERNAME = 'islf_admin';
    const ADMIN_PASSWORD = 'ISLF#Admin@2026!K4r';

    // Hash separately
    const systemHash = await bcrypt.hash(SYSTEM_ADMIN_PASSWORD, 10);
    const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // =====================================================
    // Step 1 — SYSTEM_ADMIN
    // =====================================================
    console.log('[Step 1] Checking SYSTEM_ADMIN...');

    const systemExists = await client.query(
      `SELECT id FROM users WHERE username = $1`,
      [SYSTEM_ADMIN_USERNAME]
    );

    if (systemExists.rows.length === 0) {
      const result = await client.query(
        `
        INSERT INTO users (
          full_name,
          username,
          email,
          password,
          role,
          status,
          joining_date,
          employment_type
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, CURRENT_DATE, $7
        )
        RETURNING id
        `,
        [
          'ISLF System Root',
          SYSTEM_ADMIN_USERNAME,
          'root@islf.com',
          systemHash,
          'SYSTEM_ADMIN',
          'Active',
          'Full-time'
        ]
      );

      console.log(
        `SYSTEM_ADMIN created successfully (id: ${result.rows[0].id})`
      );
    } else {
      console.log('SYSTEM_ADMIN already exists. Skipping.');
    }

    // =====================================================
    // Step 2 — ADMIN
    // =====================================================
    console.log('\n[Step 2] Checking ADMIN...');

    const adminExists = await client.query(
      `SELECT id FROM users WHERE username = $1`,
      [ADMIN_USERNAME]
    );

    if (adminExists.rows.length === 0) {
      const result = await client.query(
        `
        INSERT INTO users (
          full_name,
          username,
          email,
          password,
          role,
          status,
          joining_date,
          employment_type
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, CURRENT_DATE, $7
        )
        RETURNING id
        `,
        [
          'ISLF Tenant Admin',
          ADMIN_USERNAME,
          'admin@islf.com',
          adminHash,
          'ADMIN',
          'Active',
          'Full-time'
        ]
      );

      console.log(
        `ADMIN created successfully (id: ${result.rows[0].id})`
      );
    } else {
      console.log('ADMIN already exists. Skipping.');
    }

    await client.query('COMMIT');

    console.log('\nProtected bootstrap seeding completed successfully.');

    console.log('\n================ BOOTSTRAP LOGIN =================');
    console.log('SYSTEM_ADMIN → islf_root / ISLF#Root@2026!X9m');
    console.log('ADMIN        → islf_admin / ISLF#Admin@2026!K4r');
    console.log('==================================================');

  } catch (error) {
    await client.query('ROLLBACK');

    console.error('\nSeeding failed. Transaction rolled back.');
    console.error(error.message);

    process.exit(1);

  } finally {
    client.release();
    await pool.end();
  }
}

seedK6();