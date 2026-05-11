'use strict';
require('dotenv').config();
const jwt = require('jsonwebtoken');

async function testRoute() {
  const token = jwt.sign(
    {
      userId: 13,
      username: 'islf_root',
      role: 'SYSTEM_ADMIN'
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  try {
    const res = await fetch('http://localhost:3001/api/user/by-username/islf_root', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log("STATUS:", res.status);
    console.log("DATA:", data);
  } catch (err) {
    console.log("ERROR:", err.message);
  }
}
testRoute();
