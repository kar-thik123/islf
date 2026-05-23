const { Pool } = require('pg');

const pool = new Pool({
  host: '77.237.234.63',
  port: 5432,
  database: 'islf',
  user: 'islf_pr0_@(|m!n',
  password: 'Dt@cT1)5_DB-C!0u(|',
});

async function run() {
  const client = await pool.connect();
  try {
    const locRes = await client.query("SELECT code, name, type FROM master_location WHERE name ILIKE '%singapore%' OR code = 'SGSIN'");
    console.log('--- Singapore Locations ---');
    console.log(JSON.stringify(locRes.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
