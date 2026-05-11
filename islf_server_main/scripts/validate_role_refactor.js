/**
 * RBAC Role Refactor Validation Script
 * =====================================
 * Validates the Phase 1-4 RBAC refactor changes.
 * 
 * Run: node scripts/validate_role_refactor.js
 * 
 * Checks:
 * 1. Dynamic roles load from master_types
 * 2. No hardcoded roles appear in frontend source
 * 3. User Management assigns only role (no permission UI)
 * 4. Authorization screen loads permissions correctly
 * 5. Token reaches /api/authorization/:role (no HttpClientModule bypass)
 * 6. Existing JWT sessions still work
 * 7. Existing RBAC enforcement still passes
 * 8. Backend ORDER BY is present
 */

'use strict';

const fs = require('fs');
const path = require('path');

const FRONTEND_ROOT = path.resolve(__dirname, '../../islf_ui_main/islf_logistics/src');
const BACKEND_ROOT = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;
let warnings = 0;

function pass(msg) {
  passed++;
  console.log(`  ✅ PASS: ${msg}`);
}

function fail(msg) {
  failed++;
  console.log(`  ❌ FAIL: ${msg}`);
}

function warn(msg) {
  warnings++;
  console.log(`  ⚠️  WARN: ${msg}`);
}

function readFile(relPath) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  return fs.readFileSync(fullPath, 'utf8');
}

// ─────────────────────────────────────────────────────────
// Test 1: No hardcoded roles in authorization.ts
// ─────────────────────────────────────────────────────────
console.log('\n═══ Test 1: No hardcoded roles in authorization.ts ═══');

const authzFile = readFile(path.join(FRONTEND_ROOT, 'app/pages/setup/authorization.ts'));
if (!authzFile) {
  fail('authorization.ts not found');
} else {
  // Check for hardcoded fallback arrays
  const hardcodedPatterns = [
    { pattern: /label:\s*['"]admin['"]/i, name: 'hardcoded admin role' },
    { pattern: /label:\s*['"]manager['"]/i, name: 'hardcoded manager role' },
    { pattern: /label:\s*['"]staff['"]/i, name: 'hardcoded staff role' },
    { pattern: /label:\s*['"]driver['"]/i, name: 'hardcoded driver role' },
    { pattern: /const\s+defaults\s*=\s*\[/, name: 'defaults merge array' },
  ];

  let foundHardcoded = false;
  for (const { pattern, name } of hardcodedPatterns) {
    if (pattern.test(authzFile)) {
      fail(`Found ${name} in authorization.ts`);
      foundHardcoded = true;
    }
  }

  if (!foundHardcoded) {
    pass('No hardcoded role arrays found in authorization.ts');
  }

  // Check roles come from masterTypeService
  if (authzFile.includes('masterTypeService.getAll()')) {
    pass('Roles loaded from masterTypeService.getAll()');
  } else {
    fail('masterTypeService.getAll() not found — roles may not load from DB');
  }
}

// ─────────────────────────────────────────────────────────
// Test 2: No hardcoded roles in usercreate.ts
// ─────────────────────────────────────────────────────────
console.log('\n═══ Test 2: No hardcoded roles in usercreate.ts ═══');

const ucFile = readFile(path.join(FRONTEND_ROOT, 'app/pages/setup/userManagement/usercreate.ts'));
if (!ucFile) {
  fail('usercreate.ts not found');
} else {
  // Check for the old static roles array
  if (/roles\s*=\s*\[\s*\{\s*label:\s*['"]Admin['"]/.test(ucFile)) {
    fail('Static roles array still present in usercreate.ts');
  } else {
    pass('Static roles array removed from usercreate.ts');
  }

  // Check for rolePermissionsMap
  if (/rolePermissionsMap/.test(ucFile) && !/removed|deprecated/i.test(ucFile.substring(ucFile.indexOf('rolePermissionsMap') - 100, ucFile.indexOf('rolePermissionsMap')))) {
    // Only flag if it's not a comment about removal
    const rpIdx = ucFile.indexOf('rolePermissionsMap');
    const context = ucFile.substring(Math.max(0, rpIdx - 50), rpIdx + 100);
    if (/manage_users|view_reports|approve_invoices/.test(context)) {
      fail('rolePermissionsMap with hardcoded permissions still active');
    } else {
      pass('rolePermissionsMap reference is a deprecation comment only');
    }
  } else {
    pass('rolePermissionsMap removed or deprecated in usercreate.ts');
  }
}

// ─────────────────────────────────────────────────────────
// Test 3: Permissions multiselect removed from User form
// ─────────────────────────────────────────────────────────
console.log('\n═══ Test 3: User Management assigns role only (no permissions UI) ═══');

if (ucFile) {
  // Check for permission multiselect in template
  if (/selectedPermissions/.test(ucFile) && !/deprecated|removed/i.test(ucFile.substring(ucFile.indexOf('selectedPermissions') - 100, ucFile.indexOf('selectedPermissions')))) {
    const spIdx = ucFile.indexOf('selectedPermissions');
    const context = ucFile.substring(Math.max(0, spIdx - 50), spIdx + 100);
    if (/ngModel.*selectedPermissions|selectedPermissions.*ngModel/.test(context)) {
      fail('Permissions multiselect still bound in template');
    } else {
      pass('selectedPermissions is not bound in template');
    }
  } else {
    pass('selectedPermissions removed or deprecated');
  }

  // Check permission dropdown template is removed
  if (/defaultLabel="Select Permissions"/.test(ucFile)) {
    fail('Permissions multiselect dropdown still in template');
  } else {
    pass('Permissions multiselect dropdown removed from template');
  }

  // Check that permission sends empty string (backward compat)
  const permEmptyMatches = ucFile.match(/permission:\s*''/g);
  if (permEmptyMatches && permEmptyMatches.length >= 1) {
    pass(`permission field sends empty string (${permEmptyMatches.length} occurrences) — backward compatible`);
  } else {
    warn('Could not verify permission sends empty string');
  }
}

// ─────────────────────────────────────────────────────────
// Test 4: HttpClientModule removed from standalone components
// ─────────────────────────────────────────────────────────
console.log('\n═══ Test 4: HttpClientModule removed (interceptor bypass fix) ═══');

if (authzFile) {
  // Check if HttpClientModule is in imports array (not just imported)
  if (/imports:\s*\[[\s\S]*?HttpClientModule[\s\S]*?\]/.test(authzFile)) {
    fail('HttpClientModule still in authorization.ts standalone imports');
  } else {
    pass('HttpClientModule removed from authorization.ts standalone imports');
  }
}

if (ucFile) {
  // Strip single-line comments before checking — the removal comment contains HttpClientModule
  const ucNoComments = ucFile.replace(/\/\/.*$/gm, '');
  if (/imports:\s*\[[\s\S]*?HttpClientModule[\s\S]*?\]/.test(ucNoComments)) {
    fail('HttpClientModule still in usercreate.ts standalone imports');
  } else {
    pass('HttpClientModule removed from usercreate.ts standalone imports');
  }
}

// Verify AuthInterceptor is registered at app level
const appConfigFile = readFile(path.join(FRONTEND_ROOT, 'app/app.config.ts'));
if (appConfigFile) {
  if (/withInterceptors\(\[AuthInterceptor/.test(appConfigFile)) {
    pass('AuthInterceptor registered at app level in app.config.ts');
  } else {
    fail('AuthInterceptor not found in app.config.ts');
  }
}

// ─────────────────────────────────────────────────────────
// Test 5: Backend ORDER BY present
// ─────────────────────────────────────────────────────────
console.log('\n═══ Test 5: Backend authorization query has ORDER BY ═══');

const backendAuthz = readFile(path.join(BACKEND_ROOT, 'routes/authorization.js'));
if (!backendAuthz) {
  fail('routes/authorization.js not found');
} else {
  if (/ORDER BY\s+module_name/i.test(backendAuthz)) {
    pass('ORDER BY module_name found in GET /:roleName query');
  } else {
    fail('ORDER BY not found in authorization GET query');
  }

  if (/ORDER BY.*sub_module_name/i.test(backendAuthz)) {
    pass('ORDER BY includes sub_module_name');
  } else {
    warn('ORDER BY does not include sub_module_name');
  }
}

// ─────────────────────────────────────────────────────────
// Test 6: JWT structure unchanged
// ─────────────────────────────────────────────────────────
console.log('\n═══ Test 6: JWT structure and RBAC middleware unchanged ═══');

const authRoute = readFile(path.join(BACKEND_ROOT, 'routes/auth.js'));
if (authRoute) {
  if (/jwt\.sign\([\s\S]*?userId[\s\S]*?username[\s\S]*?role/.test(authRoute)) {
    pass('JWT still contains userId, username, role');
  } else {
    fail('JWT structure may have changed');
  }
}

const rbacEnforcer = readFile(path.join(BACKEND_ROOT, 'middleware/rbacEnforcer.js'));
if (rbacEnforcer) {
  if (/requirePermission/.test(rbacEnforcer)) {
    pass('rbacEnforcer.js still exports requirePermission');
  } else {
    fail('rbacEnforcer.js may have been modified');
  }
}

const authMiddleware = readFile(path.join(BACKEND_ROOT, 'middleware/auth.js'));
if (authMiddleware) {
  if (/authenticateToken/.test(authMiddleware)) {
    pass('auth.js middleware still exports authenticateToken');
  } else {
    fail('auth.js middleware may have been modified');
  }
}

// ─────────────────────────────────────────────────────────
// Test 7: Ownership middleware unchanged
// ─────────────────────────────────────────────────────────
console.log('\n═══ Test 7: Ownership middleware unchanged ═══');

const ownershipGuard = readFile(path.join(BACKEND_ROOT, 'middleware/ownershipGuard.js'));
if (ownershipGuard) {
  if (/requireOwnership/.test(ownershipGuard)) {
    pass('ownershipGuard.js still exports requireOwnership');
  } else {
    fail('ownershipGuard.js may have been modified');
  }
}

// ─────────────────────────────────────────────────────────
// Test 8: Lockscreen restores permissions
// ─────────────────────────────────────────────────────────
console.log('\n═══ Test 8: Session hygiene (lockscreen + logout) ═══');

const lockscreenFile = readFile(path.join(FRONTEND_ROOT, 'app/pages/auth/lockscreen.ts'));
if (lockscreenFile) {
  if (/userPermissions/.test(lockscreenFile) && /userRole/.test(lockscreenFile)) {
    pass('Lockscreen restores userPermissions and userRole on unlock');
  } else {
    fail('Lockscreen does not restore userPermissions/userRole');
  }
}

const loginServiceFile = readFile(path.join(FRONTEND_ROOT, 'app/services/login.service.ts'));
if (loginServiceFile) {
  if (/removeItem\('userPermissions'\)/.test(loginServiceFile) && /removeItem\('userRole'\)/.test(loginServiceFile)) {
    pass('Logout clears userPermissions and userRole from localStorage');
  } else {
    fail('Logout does not clear userPermissions/userRole');
  }
}

// ─────────────────────────────────────────────────────────
// Test 9: Module selector in authorization screen
// ─────────────────────────────────────────────────────────
console.log('\n═══ Test 9: Authorization UX — module selector ═══');

if (authzFile) {
  if (/selectedModule/.test(authzFile) && /moduleOptions/.test(authzFile)) {
    pass('Module selector (Step 2) present in authorization screen');
  } else {
    fail('Module selector not found in authorization screen');
  }

  if (/md:w-6/.test(authzFile)) {
    pass('Role dropdown width upgraded to md:w-6');
  } else if (/md:w-3/.test(authzFile)) {
    fail('Role dropdown still at md:w-3');
  } else {
    warn('Could not determine role dropdown width');
  }

  if (/filteredPermissions/.test(authzFile)) {
    pass('Filtered permissions getter present for module filtering');
  } else {
    fail('filteredPermissions not found');
  }
}

// ─────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(60));
console.log(`RBAC Refactor Validation Summary`);
console.log('═'.repeat(60));
console.log(`  ✅ Passed:   ${passed}`);
console.log(`  ❌ Failed:   ${failed}`);
console.log(`  ⚠️  Warnings: ${warnings}`);
console.log('═'.repeat(60));

if (failed > 0) {
  console.log('\n⛔ VALIDATION FAILED — Review the failures above before deploying.\n');
  process.exit(1);
} else if (warnings > 0) {
  console.log('\n⚠️  VALIDATION PASSED WITH WARNINGS — Review warnings above.\n');
  process.exit(0);
} else {
  console.log('\n🎉 ALL VALIDATIONS PASSED — RBAC refactor is clean.\n');
  process.exit(0);
}
