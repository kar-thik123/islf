'use strict';
require('dotenv').config();
const pool = require('../db');

async function testRole() {
  const result = await pool.query("SELECT id, username, role FROM users WHERE username = 'islf_root'");
  console.table(result.rows);
  await pool.end();
}
testRole();
