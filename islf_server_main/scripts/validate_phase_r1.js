const fs = require('fs');
const path = require('path');
const { requirePermission, invalidateRolePermissionCache } = require('../middleware/rbacEnforcer');

async function runValidation() {
  console.log("Starting Phase R1 Validation...");

  let passed = true;

  // 1. Verify Cache invalidation exported
  if (typeof invalidateRolePermissionCache !== 'function') {
    console.error("❌ rbacEnforcer.js is missing invalidateRolePermissionCache export.");
    passed = false;
  } else {
    console.log("✅ invalidateRolePermissionCache function found in rbacEnforcer.js.");
  }

  // 2. Verify routes/authorization.js calls invalidateRolePermissionCache
  const authRoute = fs.readFileSync(path.join(__dirname, '../routes/authorization.js'), 'utf8');
  if (!authRoute.includes('invalidateRolePermissionCache(roleName)')) {
    console.error("❌ routes/authorization.js is not calling invalidateRolePermissionCache.");
    passed = false;
  } else {
    console.log("✅ routes/authorization.js correctly invalidates cache after save.");
  }

  // 3. Verify Frontend components use *appHasPermission
  const uiPath = path.join(__dirname, '../../islf_ui_main/islf_logistics/src/app/pages');
  const filesToCheck = [
    { name: 'numberseries.ts', relativePath: 'setup/numberseries.ts' },
    { name: 'numberseriesrelation.ts', relativePath: 'setup/numberseriesrelation.ts' },
    { name: 'mastertype.ts', relativePath: 'masters/mastertype.ts' },
    { name: 'userlist.ts', relativePath: 'setup/userManagement/userlist.ts' }
  ];

  for (const file of filesToCheck) {
    const fullPath = path.join(uiPath, file.relativePath);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ File not found: ${fullPath}`);
      passed = false;
      continue;
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    if (!content.includes('*appHasPermission')) {
      console.error(`❌ ${file.name} does not use *appHasPermission.`);
      passed = false;
    } else if (!content.includes('HasPermissionDirective')) {
      console.error(`❌ ${file.name} does not import HasPermissionDirective.`);
      passed = false;
    } else {
      console.log(`✅ ${file.name} correctly implements action-level RBAC enforcement.`);
    }
  }

  if (passed) {
    console.log("\n✅ Phase R1 Validation Passed! All checks successful.");
    process.exit(0);
  } else {
    console.error("\n❌ Phase R1 Validation Failed. See errors above.");
    process.exit(1);
  }
}

runValidation().catch(console.error);
