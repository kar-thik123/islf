const pool = require('./db');

async function run() {
  try {
    const res = await pool.query('SELECT * FROM role_module_permissions ORDER BY role_name, module_name LIMIT 50');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
