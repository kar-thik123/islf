'use strict';
require('dotenv').config();
const pool = require('../db');

async function checkHashes() {
  try {
    const users = await pool.query("SELECT username, password FROM users WHERE username IN ('islf_root', 'islf_admin')");
    console.table(users.rows);
  } finally {
    await pool.end();
  }
}
checkHashes();
