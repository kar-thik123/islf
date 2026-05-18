const { Pool } = require('pg');

const pool = new Pool({
  host: '77.237.234.63',
  port: 5432,
  database: 'islf',
  user: 'islf_pr0_@(|m!n',
  password: 'Dt@cT1)5_DB-C!0u(|',
});

async function diagnose() {
  try {
    console.log('--- DIAGNOSIS START ---');
    
    // 1. Check Tariff Data Sample
    const tariffSample = await pool.query("SELECT id, code, company_code, branch_code, department_code FROM tariff ORDER BY id DESC LIMIT 5");
    console.log('Tariff Sample (Latest 5):', tariffSample.rows);
    
    // 2. Check Tariff Counts
    const tariffCounts = await pool.query("SELECT company_code, COUNT(*) FROM tariff GROUP BY company_code");
    console.log('Tariff Counts by Company:', tariffCounts.rows);
    
    // 3. Check if any record matches 'ISLF'
    const testQuery = await pool.query("SELECT COUNT(*) FROM tariff WHERE (company_code = 'ISLF' OR company_code IS NULL OR company_code = '')");
    console.log(`Test Query for "ISLF" in tariff table:`, testQuery.rows[0].count);

    console.log('--- DIAGNOSIS END ---');
    process.exit(0);
  } catch (err) {
    console.error('Diagnosis failed:', err);
    process.exit(1);
  }
}

diagnose();
