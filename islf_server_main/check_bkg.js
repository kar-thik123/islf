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
      SELECT id, booking_no, booking_type, enquiry_id, selected_enquiries, customer_name, company_name, department, service_type, from_location, to_location, cargo
      FROM booking 
      WHERE booking_no = 'BKG000070'
    `);
    console.log("=== ENQUIRY ===");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
