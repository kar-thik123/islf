'use strict';
require('dotenv').config();
const pool = require('../db');

async function discover() {
  const client = await pool.connect();
  try {
    // Ownership column scan
    const ownerCols = await client.query(`
      SELECT c.table_name, c.column_name, c.data_type
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.column_name IN (
          'created_by','created_by_user_id','owner_id',
          'employee_id','user_id','updated_by','assigned_to'
        )
      ORDER BY c.table_name, c.column_name
    `);
    console.log('\n=== OWNERSHIP COLUMNS ===');
    console.table(ownerCols.rows);

    // users table
    const userCols = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_schema='public' AND table_name='users' ORDER BY ordinal_position
    `);
    console.log('\n=== users table columns ===');
    console.table(userCols.rows);

    // account_details table
    try {
      const acctCols = await client.query(`
        SELECT column_name, data_type FROM information_schema.columns
        WHERE table_schema='public' AND table_name='account_details' ORDER BY ordinal_position
      `);
      console.log('\n=== account_details table columns ===');
      console.table(acctCols.rows);
    } catch(e) { console.log('account_details:', e.message); }

    // enquiry ownership cols
    const enqOw = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_schema='public' AND table_name='enquiry'
        AND column_name IN ('created_by','user_id','owner_id','created_by_user_id')
    `);
    console.log('\n=== enquiry ownership columns ===');
    console.table(enqOw.rows);

  } finally {
    client.release();
    await pool.end();
  }
}
discover().catch(e => { console.error(e.message); process.exit(1); });
