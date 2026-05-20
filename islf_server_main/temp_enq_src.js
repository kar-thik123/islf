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
    const enqRes = await client.query(`
      SELECT *
      FROM enquiry 
      WHERE code = 'Enq_10' OR enquiry_no = 'Enq_10'
    `);
    
    const srcRes = await client.query(`
      SELECT *
      FROM sourcing 
      WHERE code = 'SOURCE19'
    `);
    
    console.log("=== ENQUIRY (Enq_10) ===");
    console.log(JSON.stringify(enqRes.rows, null, 2));
    
    console.log("\n=== SOURCING (SOURCE19) ===");
    console.log(JSON.stringify(srcRes.rows, null, 2));
    
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
