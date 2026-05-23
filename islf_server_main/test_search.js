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
    const testCases = [
      // 1. Searching using values from a booking where fields are names (like "Chennai" and "Singapore")
      {
        department: "EXPORT",
        service_type: "FCL_Export",
        from_location: "INMAA", // Frontend resolved "Chennai" to code "INMAA"
        to_location: "SGSIN"    // Frontend resolved "Singapore" to code "SGSIN"
      },
      // 2. What if frontend sends names directly? (If mapping to codes fails/didn't run)
      {
        department: "EXPORT",
        service_type: "FCL_Export",
        from_location: "Chennai",
        to_location: "Singapore"
      },
      // 3. What if frontend sends empty values? (like in openCreateDialog)
      {
        department: "",
        service_type: "",
        from_location: "",
        to_location: ""
      }
    ];

    for (const [i, criteria] of testCases.entries()) {
      console.log(`\n--- Test Case ${i + 1}: criteria =`, criteria);
      const { department, service_type, from_location, to_location } = criteria;
      
      let query = `SELECT id, code, cargo_type, customer_id, customer_name, company_name, from_location, to_location, effective_date_from, effective_date_to, department, service_type, status
                   FROM enquiry WHERE (effective_date_to >= CURRENT_DATE OR effective_date_to IS NULL)
                   AND LOWER(COALESCE(status, '')) NOT IN ('closed', 'cancelled')`;
      const params = [];
      let idx = 1;
      const norm = (f, i) => `LOWER(REPLACE(${f}, ' ', '')) = LOWER(REPLACE($${i}, ' ', ''))`;
      
      if (department) {
        query += ` AND (${norm('department', idx)} OR ${norm('department_code', idx)})`;
        params.push(department); idx++;
      }
      if (service_type) {
        query += ` AND (${norm('service_type', idx)} OR ${norm('service_type_code', idx)})`;
        params.push(service_type); idx++;
      }
      if (from_location) { 
        query += ` AND (
          ${norm('from_location', idx)} 
          OR LOWER(from_location) = (SELECT LOWER(name) FROM master_location WHERE code = $${idx} LIMIT 1)
        )`; 
        params.push(from_location); 
        idx++; 
      }
      if (to_location) { 
        query += ` AND (
          ${norm('to_location', idx)} 
          OR LOWER(to_location) = (SELECT LOWER(name) FROM master_location WHERE code = $${idx} LIMIT 1)
        )`; 
        params.push(to_location); 
        idx++; 
      }
      query += ` ORDER BY id DESC LIMIT 5`;

      const { rows } = await client.query(query, params);
      console.log(`Found ${rows.length} matching enquiries:`);
      rows.forEach(r => {
        console.log(`  - Code: ${r.code}, From: ${r.from_location}, To: ${r.to_location}, Status: ${r.status}`);
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
