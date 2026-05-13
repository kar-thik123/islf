const fs = require('fs');
const path = require('path');

function scanBackendRoutes() {
  const routesDir = 'd:/ISLF_project/ISLF/islf_server_main/routes';
  let totalEndpoints = 0;
  let protectedEndpoints = 0;
  let bypassEndpoints = 0;
  let unprotectedEndpoints = [];

  const files = fs.readdirSync(routesDir);
  for (const f of files) {
    if (!f.endsWith('.js')) continue;
    const content = fs.readFileSync(path.join(routesDir, f), 'utf8');
    
    // Quick heuristic for endpoints
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.match(/router\.(get|post|put|delete|patch)\(/)) {
        totalEndpoints++;
        if (line.includes('requirePermission')) {
          protectedEndpoints++;
        } else if (line.includes('requireAuth')) {
          bypassEndpoints++;
        } else {
          // Check if middleware is applied at router level or another way
          unprotectedEndpoints.push(`${f}: ${line.trim()}`);
        }
      }
    }
  }
  console.log('Backend Routes:');
  console.log('  Total Endpoints:', totalEndpoints);
  console.log('  Protected by requirePermission:', protectedEndpoints);
  console.log('  Protected by requireAuth only:', bypassEndpoints);
  console.log('  Unprotected Endpoints Count:', unprotectedEndpoints.length);
}

function scanFrontendRoutes() {
  const file = 'd:/ISLF_project/ISLF/islf_ui_main/islf_logistics/src/app/app.routes.ts';
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(/path:\s*['\"].*?['\"]/g) || [];
    const guards = content.match(/canActivate:\s*\[.*?AuthGuard.*?\]/g) || [];
    console.log('\nFrontend Routes:');
    console.log('  Total Paths:', matches.length);
    console.log('  Protected by AuthGuard:', guards.length);
  }
}

function verifyCacheInvalidation() {
  const file = 'd:/ISLF_project/ISLF/islf_server_main/routes/authorization.js';
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    console.log('\nCache Invalidation:');
    console.log('  invalidateRolePermissionCache present:', content.includes('invalidateRolePermissionCache'));
  }
}

function scanFrontendUI() {
  const uiDir = 'd:/ISLF_project/ISLF/islf_ui_main/islf_logistics/src/app/pages';
  let totalFiles = 0;
  let protectedFiles = 0;
  
  function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const stat = fs.statSync(path.join(dir, file));
      if (stat.isDirectory()) {
        walk(path.join(dir, file));
      } else if (file.endsWith('.ts') || file.endsWith('.html')) {
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        if (content.includes('<button') || content.includes('pButton')) {
          totalFiles++;
          if (content.includes('*appHasPermission')) {
            protectedFiles++;
          }
        }
      }
    }
  }
  walk(uiDir);
  console.log('\nFrontend UI Protection:');
  console.log('  Total Files with Buttons:', totalFiles);
  console.log('  Files Protected by *appHasPermission:', protectedFiles);
}

scanBackendRoutes();
scanFrontendRoutes();
verifyCacheInvalidation();
scanFrontendUI();
