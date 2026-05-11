'use strict';
require('dotenv').config();
const pool = require('../db');

async function testPermissions() {
  const result = await pool.query("SELECT * FROM role_module_permissions WHERE role_name = 'SYSTEM_ADMIN' AND module_name = 'Settings' AND sub_module_name = 'User Mgmt'");
  console.table(result.rows);
  await pool.end();
}
testPermissions();
