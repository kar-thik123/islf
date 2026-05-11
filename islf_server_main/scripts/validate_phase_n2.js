'use strict';
require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${PORT}`;

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

async function testApi(name, token, url, method, expectedStatus) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${url}`, options);
    if (res.status === expectedStatus) {
      console.log(`✅ ${name} (Expected ${expectedStatus}, Got ${res.status})`);
      if (res.status === 200) {
        const body = await res.json();
        // check if password is leaked
        if (body.user && body.user.password) {
           console.log(`❌ ${name} PASSWORD LEAK DETECTED!`);
           return false;
        }
      }
      return true;
    } else {
      console.log(`❌ ${name} (Expected ${expectedStatus}, Got ${res.status})`);
      const text = await res.text();
      console.log(`   Response: ${text}`);
      return false;
    }
  } catch (err) {
    console.log(`❌ ${name} (Error: ${err.message})`);
    return false;
  }
}

async function runValidation() {
  console.log('--- STARTING PHASE N2 VALIDATION ---');

  let allPassed = true;

  const sysAdminPayload = { userId: 1, username: 'sysadmin', role: 'SYSTEM_ADMIN' };
  const adminPayload = { userId: 2, username: 'admin', role: 'ADMIN' };
  const dynamicUserPayload = { userId: 3, username: 'manager', role: 'MANAGER' };

  const sysToken = generateToken(sysAdminPayload);
  const adminToken = generateToken(adminPayload);
  const dynToken = generateToken(dynamicUserPayload);

  // Note: we're using mock tokens here. If the mock users don't exist in DB, 
  // the /api/user/me route will return 404 instead of 403.
  // Returning 404 means it successfully bypassed RBAC and reached the query!
  
  // 1. SYSTEM_ADMIN can call /api/user/me
  allPassed = allPassed && await testApi('SYSTEM_ADMIN bypasses RBAC for /me', sysToken, '/api/user/me', 'GET', 404);

  // 2. ADMIN can call /api/user/me
  allPassed = allPassed && await testApi('ADMIN bypasses RBAC for /me', adminToken, '/api/user/me', 'GET', 404);

  // 3. Dynamic users can call /api/user/me
  allPassed = allPassed && await testApi('Dynamic user bypasses RBAC for /me', dynToken, '/api/user/me', 'GET', 404);

  // Test with real user (islf_root)
  const realUserPayload = { userId: 13, username: 'islf_root', role: 'SYSTEM_ADMIN' };
  const realToken = generateToken(realUserPayload);
  allPassed = allPassed && await testApi('Real user fetches self profile successfully', realToken, '/api/user/me', 'GET', 200);

  // 6. Existing /api/user routes still work (Dynamic user should be blocked)
  allPassed = allPassed && await testApi('Dynamic user blocked from /api/user', dynToken, '/api/user', 'GET', 403);

  if (allPassed) {
    console.log('\n✅✅✅ ALL PHASE N2 VALIDATIONS PASSED ✅✅✅');
  } else {
    console.log('\n❌❌❌ PHASE N2 VALIDATION FAILED ❌❌❌');
    process.exitCode = 1;
  }
}

runValidation();
