const { Client } = require('pg');
const client = new Client({
  host: '77.237.234.63',
  user: 'islf_pr0_@(|m!n',
  password: 'Dt@cT1)5_DB-C!0u(|',
  database: 'islf',
  port: 5432
});

async function run() {
  await client.connect();
  try {
    const res = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND (column_name ILIKE '%carriage%' OR table_name ILIKE '%carriage%')
      ORDER BY table_name, column_name;
    `);
    
    console.log("=== DB Schema Matches for 'carriage' ===");
    console.table(res.rows);
    
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
