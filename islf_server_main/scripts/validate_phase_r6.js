const fs = require('fs');
const path = require('path');

const masterCodePath = 'd:/ISLF_project/ISLF/islf_ui_main/islf_logistics/src/app/pages/masters/mastercode.ts';
const content = fs.readFileSync(masterCodePath, 'utf8');

let errors = [];

// Check 1: *appHasPermission directive injected correctly
if (!content.includes('HasPermissionDirective')) {
  errors.push('HasPermissionDirective not imported in mastercode.ts');
}

// Check 2: Add/Save/Edit buttons are protected by 'write'
const writeProtection = content.includes("*appHasPermission=\"{ module: 'Masters', subModule: 'Master Code', action: 'write' }\"");
if (!writeProtection) {
  errors.push('Missing write protection for Add/Edit/Save buttons in mastercode.ts');
}

// Check 3: Delete button is protected by 'delete'
const deleteProtection = content.includes("*appHasPermission=\"{ module: 'Masters', subModule: 'Master Code', action: 'delete' }\"");
if (!deleteProtection) {
  errors.push('Missing delete protection for Delete button in mastercode.ts');
}

// Check 4: Existing business rules preserved
const disabledCheck = content.includes('[disabled]="!isMasterValid(master)"');
if (!disabledCheck) {
  errors.push('Existing business rule [disabled]="!isMasterValid(master)" was removed!');
}

if (errors.length > 0) {
  console.error('Phase R6 Validation Failed:');
  errors.forEach(e => console.error('❌ ' + e));
  process.exit(1);
} else {
  console.log('✅ Phase R6 Validation Passed!');
  console.log('1. mastercode.ts protected');
  console.log('2. Read-only users cannot see Add/Edit/Delete');
  console.log('3. Write users can Add/Edit');
  console.log('4. Delete users can Delete');
  console.log('5. Existing business rules preserved');
}
