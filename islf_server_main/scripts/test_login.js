'use strict';
require('dotenv').config();

async function loginAndTest() {
  const loginRes = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'islf_root', password: 'ISLF#Root@2026!X9m' })
  });
  
  if (loginRes.status !== 200) {
    console.log("Login failed:", loginRes.status, await loginRes.text());
    return;
  }
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log("TOKEN ROLE IN PAYLOAD:", JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role);
  
  const res = await fetch('http://localhost:3001/api/user/by-username/islf_root', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log("STATUS:", res.status);
  console.log("DATA:", data);
}
loginAndTest();
