'use strict';
require('dotenv').config();
const pool = require('../db');
(async () => {
  try {
    const fk = await pool.query(`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table,
        ccu.column_name AS foreign_column
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'master_type'
        AND tc.constraint_type = 'FOREIGN KEY'
    `);
    console.log('\n=== FOREIGN KEY CONSTRAINTS on master_type ===');
    console.table(fk.rows);

    // Also check unique constraints
    const uq = await pool.query(`
      SELECT tc.constraint_name, kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'master_type'
        AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
    `);
    console.log('\n=== UNIQUE/PK CONSTRAINTS on master_type ===');
    console.table(uq.rows);

    // Check the master_code table for valid keys
    const mc = await pool.query(`SELECT DISTINCT code FROM master_code ORDER BY code`);
    console.log('\n=== DISTINCT master_code.code values ===');
    console.table(mc.rows);
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
})();
