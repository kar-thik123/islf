const fs = require('fs');
const path = require('path');

const uiDir = 'd:/ISLF_project/ISLF/islf_ui_main/islf_logistics/src/app/pages';

const mapping = {
  'masterTypes/basisType.ts': { module: 'Master Types', subModule: 'Basis' },
  'masterTypes/cargoType.ts': { module: 'Master Types', subModule: 'Cargo Type' },
  'masterTypes/carriageType.ts': { module: 'Master Types', subModule: 'Carriage' },
  'masterTypes/chargeType.ts': { module: 'Master Types', subModule: 'Charge Type' },
  'masterTypes/customerType.ts': { module: 'Master Types', subModule: 'Customer' },
  'masterTypes/itemType.ts': { module: 'Master Types', subModule: 'Item' },
  'masterTypes/locationType.ts': { module: 'Master Types', subModule: 'Location' },
  'masterTypes/serviceAreaType.ts': { module: 'Master Types', subModule: 'Service Area' },
  'masterTypes/tariffType.ts': { module: 'Master Types', subModule: 'Tariff Type' },
  'masterTypes/userStatus.ts': { module: 'Master Types', subModule: 'User Status' },
  'masterTypes/vendorType.ts': { module: 'Master Types', subModule: 'Vendor' }
};

function processFile(relPath, modConfig) {
  const file = path.join(uiDir, relPath);
  if (!fs.existsSync(file)) return;

  let content = fs.readFileSync(file, 'utf8');

  // Insert import if not present
  if (!content.includes('HasPermissionDirective')) {
    // Relative path depth. pages/masterTypes is depth 1, so ../../directives
    let prefix = '../../';

    content = content.replace(/(import .* from .*;)/, `$1\nimport { HasPermissionDirective } from '${prefix}directives/has-permission.directive';`);

    content = content.replace(/(imports:\s*\[)([\s\S]*?)(\])/, (match, p1, p2, p3) => {
      const trimmed = p2.trimEnd();
      if (trimmed.endsWith(',')) {
         return `${p1}${p2}\n    HasPermissionDirective\n${p3}`;
      } else {
         return `${p1}${p2},\n    HasPermissionDirective\n${p3}`;
      }
    });
  }

  // Wrap buttons
  // Common action buttons in ISLF: pi-pencil (Edit), pi-trash (Delete), pi-check (Save), pi-plus (Add), label="Add/Save"
  const buttonRegex = /(<button[^>]*?(?:icon="pi pi-pencil"|icon="pi pi-trash"|icon="pi pi-check"|icon="pi pi-plus"|icon="pi pi-download"|icon="pi pi-upload"|label="Save"|label="Export"|label="Import"|label="Add")[^>]*?>[\s\S]*?<\/button>)/gi;

  content = content.replace(buttonRegex, (match) => {
    let action = 'write';
    if (match.includes('pi-trash') || match.includes('Delete') || match.includes('deleteRow')) {
      action = 'delete';
    }

    if (match.includes('*appHasPermission')) return match;
    
    return `<ng-container *appHasPermission="{ module: '${modConfig.module}', subModule: '${modConfig.subModule}', action: '${action}' }">\n${match}\n</ng-container>`;
  });

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Processed ${relPath}`);
}

for (const [relPath, config] of Object.entries(mapping)) {
  processFile(relPath, config);
}
