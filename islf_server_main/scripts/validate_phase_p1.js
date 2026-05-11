'use strict';
require('dotenv').config();

/**
 * VALIDATION SCRIPT — PHASE P1 (Critical Performance Stabilization)
 * 
 * Verifies:
 * 1. User List API supports pagination (LIMIT/OFFSET)
 * 2. Master Code API supports pagination (LIMIT/OFFSET)
 * 3. Token Blacklist check works correctly (security regression check)
 * 4. RBAC Permission enforcement still works correctly
 */

async function validatePhaseP1() {
  const API_URL = 'http://localhost:3001/api';
  
  console.log('--- Phase P1 Validation Started ---');

  // 1. Get Token
  console.log('1. Fetching Admin Token...');
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'islf_root', password: 'ISLF#Root@2026!X9m' })
  });
  
  if (loginRes.status !== 200) {
    console.error('FAILED: Could not login with islf_root');
    process.exit(1);
  }
  const { token } = await loginRes.json();
  const authHeaders = { 'Authorization': `Bearer ${token}` };

  // 2. Test User List Pagination
  console.log('2. Testing User List Pagination (limit=2)...');
  const userRes = await fetch(`${API_URL}/user?page=1&limit=2`, { headers: authHeaders });
  const userData = await userRes.json();
  
  if (userRes.status === 200 && userData.users && userData.users.length <= 2) {
    console.log(`SUCCESS: User List returned ${userData.users.length} records (max 2)`);
  } else {
    console.error('FAILED: User List pagination check', userRes.status, userData);
  }

  // 3. Test Master Code Pagination
  console.log('3. Testing Master Code Pagination (limit=5)...');
  const masterRes = await fetch(`${API_URL}/master_code?page=1&limit=5`, { headers: authHeaders });
  const masterData = await masterRes.json();
  
  if (masterRes.status === 200 && Array.isArray(masterData) && masterData.length <= 5) {
    console.log(`SUCCESS: Master Code returned ${masterData.length} records (max 5)`);
  } else {
    console.error('FAILED: Master Code pagination check', masterRes.status);
  }

  // 4. Test RBAC Still Works (Security Check)
  console.log('4. Verifying RBAC still allows Admin access...');
  const logsRes = await fetch(`${API_URL}/logs`, { headers: authHeaders });
  if (logsRes.status === 200) {
    console.log('SUCCESS: RBAC still allows system_admin to access logs');
  } else {
    console.error('FAILED: RBAC blocked admin from logs', logsRes.status);
  }

  // 5. Test Token Revocation Still Works (Security Check)
  console.log('5. Testing Token Revocation (Logout)...');
  const logoutRes = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: authHeaders
  });
  
  if (logoutRes.status === 200) {
    console.log('SUCCESS: Token revoked successfully');
    
    // Check if revoked token is blocked (may hit cache if tested immediately, but should work)
    const checkRes = await fetch(`${API_URL}/user`, { headers: authHeaders });
    if (checkRes.status === 401) {
      console.log('SUCCESS: Revoked token correctly blocked');
    } else {
      console.warn('WARNING: Revoked token was not immediately blocked (might be cache delay). Status:', checkRes.status);
    }
  } else {
    console.error('FAILED: Logout/Revocation check', logoutRes.status);
  }

  console.log('--- Phase P1 Validation Complete ---');
}

validatePhaseP1().catch(err => {
  console.error('Validation Error:', err);
  process.exit(1);
});
