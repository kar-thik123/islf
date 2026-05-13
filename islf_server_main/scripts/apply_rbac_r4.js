const fs = require('fs');
const path = require('path');

const uiDir = 'd:/ISLF_project/ISLF/islf_ui_main/islf_logistics/src/app/pages';

const mapping = {
  'masters/customer.ts': { module: 'Masters', subModule: 'Customer' },
  'masters/vendor.ts': { module: 'Masters', subModule: 'Vendor' },
  'masters/masterairline.ts': { module: 'Masters', subModule: 'Airline' },
  'masters/mastervessel.ts': { module: 'Masters', subModule: 'Vessel' },
  'masters/masterlocation.ts': { module: 'Masters', subModule: 'Location' },
  'masters/masteruom.ts': { module: 'Masters', subModule: 'Unit of Measure' },
  'masters/masteritem.ts': { module: 'Masters', subModule: 'Master Item' },
  'masters/basis.ts': { module: 'Masters', subModule: 'Basis' },
  'masters/cargotype.ts': { module: 'Masters', subModule: 'Cargo' },
  'masters/chargetype.ts': { module: 'Masters', subModule: 'Charges' },
  'masters/containercode.ts': { module: 'Masters', subModule: 'Container' },
  'masters/currencycode.ts': { module: 'Masters', subModule: 'Currency Code' },
  'masters/gstsetup.ts': { module: 'Masters', subModule: 'GST Setup' },
  'masters/servicearea.ts': { module: 'Masters', subModule: 'Service Area' },
  'masters/sourceSales.ts': { module: 'Masters', subModule: 'Source Sales' },
  'masters/sourcing.ts': { module: 'Masters', subModule: 'Sourcing' },
  'masters/tariff.ts': { module: 'Masters', subModule: 'Local Tariff' }
};

function processFile(relPath, modConfig) {
  const file = path.join(uiDir, relPath);
  if (!fs.existsSync(file)) return;

  let content = fs.readFileSync(file, 'utf8');

  // Insert import if not present
  if (!content.includes('HasPermissionDirective')) {
    const depth = relPath.split('/').length - 1; // masters/customer.ts => 1 => path: ../../directives/
    let prefix = '';
    for(let i=0; i<=depth; i++) prefix += '../'; 
    // Wait, relPath "masters/customer.ts". pages is depth 0, masters is depth 1. 
    // file is in src/app/pages/masters.
    // directives is in src/app/directives.
    // So to go from src/app/pages/masters to src/app/directives requires ../../directives.
    prefix = '../../';

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
