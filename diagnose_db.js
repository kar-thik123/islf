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
    
    // 1. Check IT Setup Filter
    const settings = await pool.query("SELECT key, value FROM settings WHERE key LIKE 'validation_%_filter'");
    console.log('Settings:', settings.rows);
    
    // 2. Check Sourcing Data Sample
    const sourcingSample = await pool.query("SELECT id, code, company_code, branch_code, department_code FROM sourcing ORDER BY id DESC LIMIT 5");
    console.log('Sourcing Sample (Latest 5):', sourcingSample.rows);
    
    // 3. Check Sourcing Counts
    const sourcingCounts = await pool.query("SELECT company_code, COUNT(*) FROM sourcing GROUP BY company_code");
    console.log('Sourcing Counts by Company:', sourcingCounts.rows);
    
    // 4. Check specific company if exists
    if (sourcingCounts.rows.length > 0) {
        const firstCompany = sourcingCounts.rows[0].company_code;
        const testQuery = await pool.query("SELECT COUNT(*) FROM sourcing WHERE (company_code = $1 OR company_code IS NULL OR company_code = '')", [firstCompany]);
        console.log(`Test Query for "${firstCompany}":`, testQuery.rows[0].count);
        
        const nullQuery = await pool.query("SELECT COUNT(*) FROM sourcing WHERE (company_code IS NULL OR company_code = '')");
        console.log(`Null/Empty Company Query:`, nullQuery.rows[0].count);
    }

    console.log('--- DIAGNOSIS END ---');
    process.exit(0);
  } catch (err) {
    console.error('Diagnosis failed:', err);
    process.exit(1);
  }
}

diagnose();
