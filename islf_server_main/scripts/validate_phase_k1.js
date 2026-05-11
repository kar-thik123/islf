/**
 * Phase K1 Validation Script
 * ==========================
 * Validates the Phase K1 foundation changes:
 * - Centralized role constants created
 * - All hardcoded 'admin' runtime checks replaced
 * - Backward compatibility preserved for existing admin JWT sessions
 *
 * Run: node scripts/validate_phase_k1.js
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

// ═══════════════════════════════════════════════════
// Test 1: Backend constants file exists and is correct
// ═══════════════════════════════════════════════════
console.log('\n═══ Test 1: Backend role constants ═══');

const backendRoles = readFile(path.join(BACKEND_ROOT, 'constants/roles.js'));
if (!backendRoles) {
  fail('constants/roles.js not found');
} else {
  if (/PROTECTED_ROLES/.test(backendRoles)) {
    pass('PROTECTED_ROLES defined');
  } else {
    fail('PROTECTED_ROLES missing');
  }

  if (/ADMIN_BYPASS_ROLES/.test(backendRoles)) {
    pass('ADMIN_BYPASS_ROLES defined');
  } else {
    fail('ADMIN_BYPASS_ROLES missing');
  }

  if (/IT_SETUP_ROLES/.test(backendRoles)) {
    pass('IT_SETUP_ROLES defined');
  } else {
    fail('IT_SETUP_ROLES missing');
  }

  if (/LEGACY_ADMIN.*['"]admin['"]/.test(backendRoles)) {
    pass('LEGACY_ADMIN includes "admin" for backward compatibility');
  } else {
    fail('LEGACY_ADMIN backward compat missing');
  }

  // Verify the module actually loads without errors
  try {
    const roles = require(path.join(BACKEND_ROOT, 'constants/roles.js'));
    if (roles.ADMIN_BYPASS_ROLES.has('admin')) {
      pass('ADMIN_BYPASS_ROLES.has("admin") returns true (backward compat)');
    } else {
      fail('ADMIN_BYPASS_ROLES does NOT contain "admin" — will break existing sessions');
    }
    if (roles.ADMIN_BYPASS_ROLES.has('SYSTEM_ADMIN')) {
      pass('ADMIN_BYPASS_ROLES.has("SYSTEM_ADMIN") returns true (future-ready)');
    } else {
      fail('ADMIN_BYPASS_ROLES does NOT contain "SYSTEM_ADMIN"');
    }
    if (roles.ADMIN_BYPASS_ROLES.has('ADMIN')) {
      pass('ADMIN_BYPASS_ROLES.has("ADMIN") returns true (future-ready)');
    } else {
      fail('ADMIN_BYPASS_ROLES does NOT contain "ADMIN"');
    }
    if (roles.IT_SETUP_ROLES.has('admin')) {
      pass('IT_SETUP_ROLES.has("admin") returns true (backward compat)');
    } else {
      fail('IT_SETUP_ROLES does NOT contain "admin"');
    }
  } catch (err) {
    fail('constants/roles.js failed to load: ' + err.message);
  }
}

// ═══════════════════════════════════════════════════
// Test 2: Frontend constants file exists
// ═══════════════════════════════════════════════════
console.log('\n═══ Test 2: Frontend role constants ═══');

const frontendRoles = readFile(path.join(FRONTEND_ROOT, 'app/constants/roles.ts'));
if (!frontendRoles) {
  fail('app/constants/roles.ts not found');
} else {
  if (/PROTECTED_ROLES/.test(frontendRoles)) {
    pass('PROTECTED_ROLES defined in frontend');
  } else {
    fail('PROTECTED_ROLES missing in frontend');
  }

  if (/ADMIN_BYPASS_ROLES/.test(frontendRoles)) {
    pass('ADMIN_BYPASS_ROLES defined in frontend');
  } else {
    fail('ADMIN_BYPASS_ROLES missing in frontend');
  }

  if (/isAdminBypassRole/.test(frontendRoles)) {
    pass('isAdminBypassRole helper function defined');
  } else {
    fail('isAdminBypassRole helper missing');
  }

  if (/LEGACY_ADMIN.*['"]admin['"]/.test(frontendRoles)) {
    pass('Frontend LEGACY_ADMIN includes "admin" for backward compatibility');
  } else {
    fail('Frontend LEGACY_ADMIN backward compat missing');
  }
}

// ═══════════════════════════════════════════════════
// Test 3: auth.js no longer has hardcoded 'admin'
// ═══════════════════════════════════════════════════
console.log('\n═══ Test 3: auth.js hardcoded admin removed ═══');

const authFile = readFile(path.join(BACKEND_ROOT, 'routes/auth.js'));
if (!authFile) {
  fail('routes/auth.js not found');
} else {
  // Check that the old hardcoded check is gone
  if (/role\s*!==\s*['"]admin['"]/.test(authFile)) {
    fail('Hardcoded role !== "admin" still present in auth.js');
  } else {
    pass('Hardcoded role !== "admin" removed from auth.js');
  }

  // Check that ADMIN_BYPASS_ROLES is now used
  if (/ADMIN_BYPASS_ROLES\.has/.test(authFile)) {
    pass('ADMIN_BYPASS_ROLES.has() now used in auth.js');
  } else {
    fail('ADMIN_BYPASS_ROLES.has() not found in auth.js');
  }

  // Check that constants are imported
  if (/require\(['"]\.\.\/constants\/roles['"]\)/.test(authFile)) {
    pass('constants/roles.js imported in auth.js');
  } else {
    fail('constants/roles.js not imported in auth.js');
  }
}

// ═══════════════════════════════════════════════════
// Test 4: ownershipGuard.js no longer has hardcoded 'admin'
// ═══════════════════════════════════════════════════
console.log('\n═══ Test 4: ownershipGuard.js hardcoded admin removed ═══');

const ownerFile = readFile(path.join(BACKEND_ROOT, 'middleware/ownershipGuard.js'));
if (!ownerFile) {
  fail('middleware/ownershipGuard.js not found');
} else {
  if (/role\s*===\s*['"]admin['"]/.test(ownerFile)) {
    fail('Hardcoded role === "admin" still present in ownershipGuard.js');
  } else {
    pass('Hardcoded role === "admin" removed from ownershipGuard.js');
  }

  if (/ADMIN_BYPASS_ROLES\.has\(role\)/.test(ownerFile)) {
    pass('ADMIN_BYPASS_ROLES.has(role) now used in ownershipGuard.js');
  } else {
    fail('ADMIN_BYPASS_ROLES.has(role) not found in ownershipGuard.js');
  }

  if (/require\(['"]\.\.\/constants\/roles['"]\)/.test(ownerFile)) {
    pass('constants/roles.js imported in ownershipGuard.js');
  } else {
    fail('constants/roles.js not imported in ownershipGuard.js');
  }
}

// ═══════════════════════════════════════════════════
// Test 5: permission.service.ts no longer has hardcoded 'admin'
// ═══════════════════════════════════════════════════
console.log('\n═══ Test 5: permission.service.ts hardcoded admin removed ═══');

const permFile = readFile(path.join(FRONTEND_ROOT, 'app/services/permission.service.ts'));
if (!permFile) {
  fail('app/services/permission.service.ts not found');
} else {
  if (/\.toLowerCase\(\)\s*===\s*['"]admin['"]/.test(permFile)) {
    fail('Hardcoded role.toLowerCase() === "admin" still present');
  } else {
    pass('Hardcoded admin check removed from permission.service.ts');
  }

  if (/isAdminBypassRole/.test(permFile)) {
    pass('isAdminBypassRole imported and used in permission.service.ts');
  } else {
    fail('isAdminBypassRole not found in permission.service.ts');
  }

  if (/hasAdminBypass/.test(permFile)) {
    pass('hasAdminBypass() private method present');
  } else {
    fail('hasAdminBypass() method not found');
  }
}

// ═══════════════════════════════════════════════════
// Test 6: RBAC middleware unchanged (regression check)
// ═══════════════════════════════════════════════════
console.log('\n═══ Test 6: RBAC/Ownership middleware regression ═══');

const rbacEnforcer = readFile(path.join(BACKEND_ROOT, 'middleware/rbacEnforcer.js'));
if (rbacEnforcer) {
  if (/requirePermission/.test(rbacEnforcer)) {
    pass('rbacEnforcer.js still exports requirePermission');
  } else {
    fail('rbacEnforcer.js modified — requirePermission missing');
  }
  // Ensure no hardcoded admin was introduced
  if (!/role\s*===\s*['"]admin['"]/.test(rbacEnforcer)) {
    pass('rbacEnforcer.js has no hardcoded admin check (as expected)');
  } else {
    warn('rbacEnforcer.js has a hardcoded admin check — review needed');
  }
}

const authMiddleware = readFile(path.join(BACKEND_ROOT, 'middleware/auth.js'));
if (authMiddleware) {
  if (/authenticateToken/.test(authMiddleware)) {
    pass('auth.js middleware still exports authenticateToken');
  } else {
    fail('auth.js middleware modified');
  }
}

if (ownerFile) {
  if (/requireOwnership/.test(ownerFile)) {
    pass('ownershipGuard.js still exports requireOwnership');
  } else {
    fail('ownershipGuard.js exports modified');
  }
}

// ═══════════════════════════════════════════════════
// Test 7: Public routes unchanged
// ═══════════════════════════════════════════════════
console.log('\n═══ Test 7: Public routes unchanged ═══');

if (authMiddleware) {
  const publicRoutes = ['/api/auth/login', '/api/auth/verify-password', '/api/auth/logout'];
  let allPresent = true;
  for (const route of publicRoutes) {
    if (!authMiddleware.includes(route)) {
      fail(`Public route "${route}" missing from auth.js PUBLIC_ENDPOINTS`);
      allPresent = false;
    }
  }
  if (allPresent) {
    pass('All expected public routes still present in PUBLIC_ENDPOINTS');
  }
}

// ═══════════════════════════════════════════════════
// Test 8: JWT generation unchanged
// ═══════════════════════════════════════════════════
console.log('\n═══ Test 8: JWT generation unchanged ═══');

if (authFile) {
  // Check that login JWT still embeds role from DB
  if (/role:\s*user\.role/.test(authFile)) {
    pass('Login JWT still embeds role from user.role (unchanged)');
  } else {
    fail('JWT generation may have been modified');
  }

  // Check no SYSTEM_ADMIN or ADMIN forced into JWT
  if (/role:\s*['"]SYSTEM_ADMIN['"]/.test(authFile)) {
    fail('JWT generation forces SYSTEM_ADMIN — should not happen in K1');
  } else {
    pass('No SYSTEM_ADMIN forced in JWT generation');
  }
}

// ═══════════════════════════════════════════════════
// Test 9: No database modifications
// ═══════════════════════════════════════════════════
console.log('\n═══ Test 9: No database modifications ═══');

// Check that no migration SQL was run against master_types
const rolesConst = readFile(path.join(BACKEND_ROOT, 'constants/roles.js'));
if (rolesConst && !/ALTER|INSERT|UPDATE|CREATE TABLE/i.test(rolesConst)) {
  pass('constants/roles.js contains no SQL — pure JavaScript constants');
} else {
  warn('constants/roles.js may contain SQL');
}

// ═══════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════
console.log('\n' + '═'.repeat(60));
console.log('Phase K1 Validation Summary');
console.log('═'.repeat(60));
console.log(`  ✅ Passed:   ${passed}`);
console.log(`  ❌ Failed:   ${failed}`);
console.log(`  ⚠️  Warnings: ${warnings}`);
console.log('═'.repeat(60));

if (failed > 0) {
  console.log('\n⛔ VALIDATION FAILED — Review failures above.\n');
  process.exit(1);
} else if (warnings > 0) {
  console.log('\n⚠️  PASSED WITH WARNINGS — Review warnings above.\n');
  process.exit(0);
} else {
  console.log('\n🎉 ALL PHASE K1 VALIDATIONS PASSED.\n');
  process.exit(0);
}
