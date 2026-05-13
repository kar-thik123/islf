const fs = require('fs');
const path = require('path');

function getBackendStats() {
  const mainFile = 'd:/ISLF_project/ISLF/islf_server_main/main.js';
  const content = fs.readFileSync(mainFile, 'utf8');
  
  const appUseRegex = /app\.use\(['"]\/api\/([^'"]+)['"],\s*(.*?)\)/g;
  let match;
  let protectedRoutes = 0;
  let totalRoutes = 0;
  let unprotectedList = [];
  
  while ((match = appUseRegex.exec(content)) !== null) {
    totalRoutes++;
    const path = match[1];
    const middleware = match[2];
    if (middleware.includes('requirePermission')) {
      protectedRoutes++;
    } else {
      unprotectedList.push(path);
    }
  }
  
  return {
    totalRoutes,
    protectedRoutes,
    unprotectedList: unprotectedList.filter(u => u !== 'auth' && u !== 'public' && u !== 'password' && u !== 'user/me') // Ignore public/auth
  };
}

function getFrontendStats() {
  const uiDir = 'd:/ISLF_project/ISLF/islf_ui_main/islf_logistics/src/app/pages';
  let totalFiles = 0;
  let protectedFiles = 0;
  let unprotectedFiles = [];
  
  function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const stat = fs.statSync(path.join(dir, file));
      if (stat.isDirectory()) {
        walk(path.join(dir, file));
      } else if (file.endsWith('.ts')) {
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        // Check if there are actionable buttons
        const buttonRegex = /(<button[^>]*?(?:icon="pi pi-pencil"|icon="pi pi-trash"|icon="pi pi-check"|icon="pi pi-plus"|icon="pi pi-download"|label="Save"|label="Export"|label="Add")[^>]*?>[\s\S]*?<\/button>)/gi;
        
        if (buttonRegex.test(content)) {
          totalFiles++;
          if (content.includes('*appHasPermission')) {
            protectedFiles++;
          } else {
            unprotectedFiles.push(path.join(dir, file).replace(uiDir, ''));
          }
        }
      }
    }
  }
  walk(uiDir);
  return { totalFiles, protectedFiles, unprotectedFiles };
}

const b = getBackendStats();
const f = getFrontendStats();

console.log(JSON.stringify({ backend: b, frontend: f }, null, 2));
