const fs = require('fs');
const path = require('path');

const uiDir = 'd:/ISLF_project/ISLF/islf_ui_main/islf_logistics/src/app/pages';

const mapping = {
  'Operation/booking.ts': { module: 'Operations', subModule: 'Booking' },
  'Operation/enquiry.ts': { module: 'Operations', subModule: 'Enquiry' },
  'setup/Company/company_management.ts': { module: 'Settings', subModule: 'Company Mgmt' },
  'setup/Company/company-tree.ts': { module: 'Settings', subModule: 'Company Mgmt' },
  'setup/mapping.ts': { module: 'Settings', subModule: 'No. Series Mapping' },
  'setup/userManagement/usercreate.ts': { module: 'Settings', subModule: 'User Mgmt' },
  'setup/authorization.ts': { module: 'Settings', subModule: 'Authorization' },
  'setup/carriage-direction.ts': { module: 'Settings', subModule: 'Carriage Direction' },
  'setup/itsetup.ts': { module: 'Settings', subModule: 'IT Setup' },
  'logs/action-logs.ts': { module: 'Logs', subModule: 'System Logs' }
};

function processFile(relPath, modConfig) {
  const file = path.join(uiDir, relPath);
  if (!fs.existsSync(file)) return;

  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes('HasPermissionDirective')) {
    const depth = relPath.split('/').length; 
    // relPath="Operation/booking.ts" -> depth=2 -> path="../../directives..."
    let prefix = '';
    for(let i=0; i<depth; i++) prefix += '../';
    
    // Add import statement at the end of the imports
    content = content.replace(/(import .* from .*;)/, `$1\nimport { HasPermissionDirective } from '${prefix}directives/has-permission.directive';`);

    // Add to imports array safely
    content = content.replace(/(imports:\s*\[)([\s\S]*?)(\])/, (match, p1, p2, p3) => {
      const trimmed = p2.trimEnd();
      if (trimmed.endsWith(',')) {
         return `${p1}${p2}\n    HasPermissionDirective\n${p3}`;
      } else {
         return `${p1}${p2},\n    HasPermissionDirective\n${p3}`;
      }
    });
  }

  // Find buttons and wrap them
  const buttonRegex = /(<button[^>]*?(?:icon="pi pi-pencil"|icon="pi pi-trash"|icon="pi pi-check"|icon="pi pi-plus"|icon="pi pi-download"|label="Save"|label="Export"|label="Add")[^>]*?>[\s\S]*?<\/button>)/gi;

  content = content.replace(buttonRegex, (match) => {
    let action = 'write';
    if (match.includes('pi-trash') || match.includes('Delete')) {
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
