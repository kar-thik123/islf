const pool = require("./db");
async function check() {
  try {
    const res = await pool.query("SELECT username, role, employee_id FROM users WHERE username='admin'");
    console.log("Admin user:", res.rows);
    const perms = await pool.query("SELECT count(*) FROM role_module_permissions WHERE role_name='admin'");
    console.log("Admin permissions count:", perms.rows[0].count);
  } catch(e) {
    console.log("Error:", e.message);
  } finally {
    process.exit(0);
  }
}
check();
