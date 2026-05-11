/**
 * Phase K4 Validation Script
 * ==========================
 * Validates the Phase K4 Protected Role UI + API Enforcement changes:
 * - authorization.ts filters IT Setup for non-SYSTEM_ADMIN
 * - usercreate.ts filters SYSTEM_ADMIN from dropdown for non-SYSTEM_ADMIN
 * - user.js blocks assignment of SYSTEM_ADMIN role by non-SYSTEM_ADMIN
 * - authorization.js blocks saving IT Setup permissions by non-SYSTEM_ADMIN
 *
 * Run: node scripts/validate_phase_k4.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = path.resolve(__dirname, '..');
const FRONTEND_ROOT = path.resolve(__dirname, '../../islf_ui_main/islf_logistics/src');

let passed = 0;
let failed = 0;
let warnings = 0;

function pass(msg) { passed++; console.log(`  ✅ PASS: ${msg}`); }
function fail(msg) { failed++; console.log(`  ❌ FAIL: ${msg}`); }
function warn(msg) { warnings++; console.log(`  ⚠️  WARN: ${msg}`); }

function readFile(relPath) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf8');
}

console.log('\n=== Phase K4 API & UI Enforcement Validation ===\n');

// ═══════════════════════════════════════════════════
// Test 1: authorization.ts - UI filtering
// ═══════════════════════════════════════════════════
console.log('═══ Test 1: authorization.ts ═══');
const authUiFile = readFile(path.join(FRONTEND_ROOT, 'app/pages/setup/authorization.ts'));
if (!authUiFile) {
  fail('authorization.ts not found');
} else {
  if (/this\.selectedRole\s*!==\s*['"]SYSTEM_ADMIN['"]/.test(authUiFile) && 
      /p\.module_name\s*===\s*['"]Settings['"]\s*&&\s*p\.sub_module_name\s*===\s*['"]IT Setup['"]/.test(authUiFile)) {
    pass('authorization.ts correctly filters out IT Setup for non-SYSTEM_ADMIN roles');
  } else {
    fail('authorization.ts does not properly hide IT Setup for non-SYSTEM_ADMIN');
  }
}

// ═══════════════════════════════════════════════════
// Test 2: usercreate.ts - UI filtering
// ═══════════════════════════════════════════════════
console.log('\n═══ Test 2: usercreate.ts ═══');
const userCreateFile = readFile(path.join(FRONTEND_ROOT, 'app/pages/setup/userManagement/usercreate.ts'));
if (!userCreateFile) {
  fail('usercreate.ts not found');
} else {
  if (/currentRole\s*!==\s*['"]SYSTEM_ADMIN['"]/.test(userCreateFile) &&
      /roles\.filter\(.*!==\s*['"]SYSTEM_ADMIN['"]\)/.test(userCreateFile)) {
    pass('usercreate.ts correctly hides SYSTEM_ADMIN role option for non-SYSTEM_ADMIN');
  } else {
    fail('usercreate.ts does not properly hide SYSTEM_ADMIN role option');
  }
}

// ═══════════════════════════════════════════════════
// Test 3: user.js - API enforcement
// ═══════════════════════════════════════════════════
console.log('\n═══ Test 3: user.js API ═══');
const userApiFile = readFile(path.join(BACKEND_ROOT, 'routes/user.js'));
if (!userApiFile) {
  fail('user.js not found');
} else {
  // Check POST and PUT protections
  const protectionMatches = userApiFile.match(/req\.body\.role\s*===\s*['"]SYSTEM_ADMIN['"]\s*&&\s*req\.user\.role\s*!==\s*['"]SYSTEM_ADMIN['"]/g);
  if (protectionMatches && protectionMatches.length >= 2) {
    pass('user.js correctly blocks assigning SYSTEM_ADMIN role by non-SYSTEM_ADMIN on both create and update');
  } else {
    fail('user.js missing SYSTEM_ADMIN assignment protection on POST/PUT routes');
  }
}

// ═══════════════════════════════════════════════════
// Test 4: authorization.js - API enforcement
// ═══════════════════════════════════════════════════
console.log('\n═══ Test 4: authorization.js API ═══');
const authApiFile = readFile(path.join(BACKEND_ROOT, 'routes/authorization.js'));
if (!authApiFile) {
  fail('authorization.js not found');
} else {
  if (/req\.user\.role\s*!==\s*['"]SYSTEM_ADMIN['"]/.test(authApiFile) &&
      /module_name\s*===\s*['"]Settings['"]\s*&&\s*p\.sub_module_name\s*===\s*['"]IT Setup['"]/.test(authApiFile)) {
    pass('authorization.js correctly blocks saving IT Setup permissions for non-SYSTEM_ADMIN');
  } else {
    fail('authorization.js missing IT Setup saving protection');
  }
}

// ═══════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('Phase K4 Validation Summary');
console.log('═'.repeat(60));
console.log(`  ✅ Passed:   ${passed}`);
console.log(`  ❌ Failed:   ${failed}`);
console.log(`  ⚠️  Warnings: ${warnings}`);
console.log('═'.repeat(60));

if (failed > 0) {
  console.log('\n⛔ VALIDATION FAILED — Review failures above.\n');
  process.exit(1);
} else {
  console.log('\n🎉 ALL PHASE K4 VALIDATIONS PASSED.\n');
  process.exit(0);
}
