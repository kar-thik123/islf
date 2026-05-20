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
    const params = ["EXPORT","FCL Freight","INENR","SEA PORT","NLRTM","SEA PORT","GENERAL","20'GP","FREIGHT","FCL_Export","2026-05-19","2026-05-19"];
    
    const queryWithBasis = `
      SELECT sub.code FROM ( 
        SELECT s.*, COALESCE(v.vendor_no, s.vendor_name) AS vendor_name, v.name AS vendor_alias,
        CASE
          WHEN s.period_end_date IS NULL THEN 'Active'
          WHEN NOW() > s.period_end_date::DATE THEN 'Expired'
          ELSE 'Active' 
        END AS source_status
        FROM sourcing s
        LEFT JOIN vendor v ON (s.vendor_name = v.vendor_no OR s.vendor_name = v.name OR s.vendor_name = v.name2)
      ) AS sub WHERE source_status = 'Active'
     AND LOWER(REPLACE(REPLACE(mode, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($1, ' ', ''), '_', '')) 
     AND LOWER(REPLACE(REPLACE(service_area, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($2, ' ', ''), '_', '')) 
     AND (LOWER(REPLACE(REPLACE(from_location, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($3, ' ', ''), '_', '')) AND LOWER(REPLACE(REPLACE(location_type_from, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($4, ' ', ''), '_', ''))) 
     AND (LOWER(REPLACE(REPLACE(to_location, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($5, ' ', ''), '_', '')) AND LOWER(REPLACE(REPLACE(location_type_to, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($6, ' ', ''), '_', ''))) 
     AND LOWER(REPLACE(REPLACE(cargo_type, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($7, ' ', ''), '_', '')) 
     AND LOWER(REPLACE(REPLACE(basis, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($8, ' ', ''), '_', '')) 
     AND LOWER(REPLACE(REPLACE(type, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($9, ' ', ''), '_', '')) 
     AND ((LOWER(REPLACE(REPLACE(shipping_type, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($10, ' ', ''), '_', '')) OR LOWER(REPLACE(REPLACE(type, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($10, ' ', ''), '_', '')))) 
     AND (
        (period_start_date IS NULL OR period_start_date <= $12) AND 
        (period_end_date IS NULL OR period_end_date >= $11)
      )
    `;

    const queryWithoutBasis = `
      SELECT sub.code FROM ( 
        SELECT s.*, COALESCE(v.vendor_no, s.vendor_name) AS vendor_name, v.name AS vendor_alias,
        CASE
          WHEN s.period_end_date IS NULL THEN 'Active'
          WHEN NOW() > s.period_end_date::DATE THEN 'Expired'
          ELSE 'Active' 
        END AS source_status
        FROM sourcing s
        LEFT JOIN vendor v ON (s.vendor_name = v.vendor_no OR s.vendor_name = v.name OR s.vendor_name = v.name2)
      ) AS sub WHERE source_status = 'Active'
     AND LOWER(REPLACE(REPLACE(mode, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($1, ' ', ''), '_', '')) 
     AND LOWER(REPLACE(REPLACE(service_area, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($2, ' ', ''), '_', '')) 
     AND (LOWER(REPLACE(REPLACE(from_location, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($3, ' ', ''), '_', '')) AND LOWER(REPLACE(REPLACE(location_type_from, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($4, ' ', ''), '_', ''))) 
     AND (LOWER(REPLACE(REPLACE(to_location, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($5, ' ', ''), '_', '')) AND LOWER(REPLACE(REPLACE(location_type_to, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($6, ' ', ''), '_', ''))) 
     AND LOWER(REPLACE(REPLACE(cargo_type, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($7, ' ', ''), '_', '')) 
     AND LOWER(REPLACE(REPLACE(type, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($9, ' ', ''), '_', '')) 
     AND ((LOWER(REPLACE(REPLACE(shipping_type, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($10, ' ', ''), '_', '')) OR LOWER(REPLACE(REPLACE(type, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($10, ' ', ''), '_', '')))) 
     AND (
        (period_start_date IS NULL OR period_start_date <= $12) AND 
        (period_end_date IS NULL OR period_end_date >= $11)
      )
    `;

    const res1 = await client.query(queryWithBasis, params);
    console.log("With Basis filter:", res1.rows);

    const res2 = await client.query(queryWithoutBasis, params);
    console.log("Without Basis filter:", res2.rows);

  } catch(e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
