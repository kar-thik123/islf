const bcrypt = require("bcryptjs");
const pool = require("../db");

const allModules = [
  { module: 'Settings', subModules: ['Company Mgmt', 'No. Series', 'No. Series Relation', 'No. Series Mapping', 'IT Setup', 'User Mgmt', 'Carriage Direction', 'Authorization'] },
  { module: 'Logs', subModules: ['Auth Logs', 'Masters Logs', 'Master Type Logs', 'Operations Logs', 'Setup Logs', 'System Logs'] },
  { module: 'Masters', subModules: ['Master Code', 'Master Type', 'Customer', 'Vendor', 'Location', 'Vessel', 'Airline', 'Unit of Measure', 'Basis', 'Master Item', 'Cargo', 'Charges', 'Currency Code', 'Container', 'GST Setup', 'Local Tariff', 'Sourcing', 'Service Area', 'Source Sales'] },
  { module: 'Master Types', subModules: ['User Status', 'Tariff Type', 'Customer', 'Vendor', 'Cargo Type', 'Charge Type', 'Basis', 'Service Area', 'Item', 'Location', 'Carriage'] },
  { module: 'Search', subModules: ['Tariff'] },
  { module: 'Operations', subModules: ['Enquiry', 'Booking'] }
];

async function seedAdmin() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("Starting Admin Seeding...");

    const roleName = "admin";
    const passwordRaw = "admin123";

    // 1. Create permissions mapping
    // Initialize auth table if it doesn't exist just in case
    await client.query(`
      CREATE TABLE IF NOT EXISTS role_module_permissions (
        id SERIAL PRIMARY KEY,
        role_name VARCHAR(255) NOT NULL,
        module_name VARCHAR(255) NOT NULL,
        sub_module_name VARCHAR(255) NOT NULL,
        can_read BOOLEAN DEFAULT false,
        can_write BOOLEAN DEFAULT false,
        can_delete BOOLEAN DEFAULT false,
        UNIQUE(role_name, module_name, sub_module_name)
      )
    `);

    // Insert all permissions for admin
    for (const m of allModules) {
      for (const sm of m.subModules) {
        await client.query(
          `INSERT INTO role_module_permissions (role_name, module_name, sub_module_name, can_read, can_write, can_delete)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (role_name, module_name, sub_module_name)
           DO UPDATE SET
             can_read = EXCLUDED.can_read,
             can_write = EXCLUDED.can_write,
             can_delete = EXCLUDED.can_delete`,
          [roleName, m.module, sm, true, true, true]
        );
      }
    }
    console.log("Admin permissions generated successfully.");

    // 2. Add 'admin' to master_types if the table exists
    // The UI fetches "user_role" key from master_types for roles
    try {
      const typeCheck = await client.query("SELECT 1 FROM information_schema.tables WHERE table_name = 'master_types'");
      if (typeCheck.rows.length > 0) {
        await client.query(
          `INSERT INTO master_types (key, value, status) 
           VALUES ('user_role', 'admin', 'Active') 
           ON CONFLICT DO NOTHING` // Assuming a standard structure; if it fails, it'll just catch
        );
        console.log("Added 'admin' to master_types 'user_role'.");
      }
    } catch (e) {
      console.log("Could not insert into master_types, maybe different schema. Skipping.", e.message);
    }

    // 3. Create or update admin user
    const hashed = await bcrypt.hash(passwordRaw, 10);
    const userExist = await client.query("SELECT * FROM users WHERE username = $1", ["admin"]);
    
    if (userExist.rows.length > 0) {
      console.log("Admin user already exists. Updating role and asserting permissions.");
      await client.query("UPDATE users SET role = $1 WHERE username = 'admin'", [roleName]);
    } else {
      console.log("Creating new admin user: admin / admin123");
      // Check user table columns
      // If we don't have enough defaults, just an insert.
      // Will insert basic requirements.
      const timestampId = "EMP-ADMIN";
      await client.query(`
        INSERT INTO users (username, password, email, full_name, role, status, employee_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, ["admin", hashed, "admin@example.com", "System Admin", roleName, "Active", timestampId]);
    }

    await client.query("COMMIT");
    console.log("Admin Seeding Complete. You can now login with: Username: admin | Password: admin123");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error during admin seed:", error);
  } finally {
    client.release();
    pool.end();
  }
}

seedAdmin();
