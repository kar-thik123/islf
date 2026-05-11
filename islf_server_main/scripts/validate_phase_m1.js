'use strict';
require('dotenv').config();

// The accounts seeded in Phase K6:
// islf_root : ISLF#Root@2026!X9m (SYSTEM_ADMIN)
// islf_admin : ISLF#Admin@2026!P7q (ADMIN)

async function testLogin(identifier, password, expectedRole) {
  console.log(`\nTesting login for: ${identifier}`);
  try {
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    
    if (loginRes.status !== 200) {
      console.log(`❌ Login failed for ${identifier}: ${loginRes.status} ${await loginRes.text()}`);
      return false;
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    
    if (!token) {
      console.log(`❌ No token returned for ${identifier}`);
      return false;
    }

    // Decode JWT payload without verifying signature
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());

    console.log(`✅ Login successful. JWT Payload:`);
    console.log(payload);

    // Verify properties
    if (payload.role !== expectedRole) {
      console.log(`❌ Role mismatch: expected ${expectedRole}, got ${payload.role}`);
      return false;
    }

    // Verify new properties exist (even if null)
    if (!('branch' in payload) || !('department' in payload) || !('company_code' in payload)) {
      console.log(`❌ Missing context fields in JWT. Expected branch, department, company_code.`);
      return false;
    }

    console.log(`✅ Context fields successfully hydrated in JWT.`);
    return true;

  } catch (err) {
    console.log(`❌ Test error for ${identifier}:`, err);
    return false;
  }
}

async function runValidation() {
  console.log('--- STARTING PHASE M1 VALIDATION ---');
  
  const rootSuccess = await testLogin('islf_root', 'ISLF#Root@2026!X9m', 'SYSTEM_ADMIN');
  const adminSuccess = await testLogin('islf_admin', 'ISLF#Admin@2026!K4r', 'ADMIN');
  
  if (rootSuccess && adminSuccess) {
    console.log('\n✅✅✅ ALL PHASE M1 VALIDATIONS PASSED ✅✅✅');
  } else {
    console.log('\n❌❌❌ PHASE M1 VALIDATION FAILED ❌❌❌');
    process.exit(1);
  }
}

runValidation();
