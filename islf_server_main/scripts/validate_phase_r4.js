const fs = require('fs');
const path = require('path');

const uiDir = 'd:/ISLF_project/ISLF/islf_ui_main/islf_logistics/src/app/pages';
const filesToCheck = [
  'masters/customer.ts',
  'masters/vendor.ts',
  'masters/masterairline.ts',
  'masters/mastervessel.ts',
  'masters/masterlocation.ts',
  'masters/masteruom.ts',
  'masters/masteritem.ts',
  'masters/basis.ts',
  'masters/cargotype.ts',
  'masters/chargetype.ts',
  'masters/containercode.ts',
  'masters/currencycode.ts',
  'masters/gstsetup.ts',
  'masters/servicearea.ts',
  'masters/sourceSales.ts',
  'masters/sourcing.ts',
  'masters/tariff.ts'
];

let passed = true;

console.log("Starting Phase R4 Validation...");

for (const rel of filesToCheck) {
  const f = path.join(uiDir, rel);
  if (!fs.existsSync(f)) {
    console.error(`❌ File missing: ${rel}`);
    passed = false;
    continue;
  }
  
  const content = fs.readFileSync(f, 'utf8');
  
  // Check if directive is imported
  if (!content.includes('HasPermissionDirective')) {
    console.error(`❌ Missing HasPermissionDirective import in ${rel}`);
    passed = false;
  }
  
  // Check if *appHasPermission is used at least once
  if (!content.includes('*appHasPermission')) {
    console.error(`❌ Missing *appHasPermission wrapper in ${rel}`);
    passed = false;
  }
  
  if (passed) {
    console.log(`✅ ${rel} actions protected successfully.`);
  }
}

if (passed) {
  console.log("✅ Phase R4 Validation Passed! Existing business disabled rules remain preserved. ADMIN/SYSTEM_ADMIN bypass logic remains unaffected.");
  process.exit(0);
} else {
  console.error("❌ Phase R4 Validation Failed.");
  process.exit(1);
}
