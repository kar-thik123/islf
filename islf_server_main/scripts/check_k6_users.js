'use strict';
require('dotenv').config();
const pool = require('../db');

async function checkUsers() {
  try {
    const res = await pool.query("SELECT id, username, role, status FROM users WHERE username IN ('islf_root', 'islf_admin') ORDER BY id");
    console.table(res.rows);
  } finally {
    await pool.end();
  }
}
checkUsers();
