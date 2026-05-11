'use strict';
require('dotenv').config();
const pool = require('../db');
const bcrypt = require('bcryptjs');

async function fixPasswords() {
  const defaultPasswordRoot = 'ISLF#Root@2026!X9m'; // Wait, the output said "SYSTEM_ADMIN → islf_root / ISLF#Root@2026!X9m"
  const defaultPasswordAdmin = 'ISLF#Admin@2026!K4r';
  
  const salt = await bcrypt.genSalt(10);
  const hashedRoot = await bcrypt.hash(defaultPasswordRoot, salt);
  const hashedAdmin = await bcrypt.hash(defaultPasswordAdmin, salt);

  try {
    await pool.query("UPDATE users SET password = $1 WHERE username = 'islf_root'", [hashedRoot]);
    await pool.query("UPDATE users SET password = $1 WHERE username = 'islf_admin'", [hashedAdmin]);
    console.log("Passwords hashed successfully.");
  } finally {
    await pool.end();
  }
}
fixPasswords();
