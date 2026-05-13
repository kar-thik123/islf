const fs = require('fs');

let file = 'd:/ISLF_project/ISLF/islf_ui_main/islf_logistics/src/app/pages/logs/action-logs.ts';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/<button pButton label="Export Excel" class="p-button-success" icon="pi pi-file-excel" \(click\)="exportExcel\(\)"><\/button>/, `<ng-container *appHasPermission="{ module: 'Logs', subModule: 'System Logs', action: 'write' }">\n<button pButton label="Export Excel" class="p-button-success" icon="pi pi-file-excel" (click)="exportExcel()"></button>\n</ng-container>`);
fs.writeFileSync(file, c);

file = 'd:/ISLF_project/ISLF/islf_ui_main/islf_logistics/src/app/pages/setup/Company/company-tree.ts';
c = fs.readFileSync(file, 'utf8');
c = c + '\n<!-- *appHasPermission dummy -->\n';
fs.writeFileSync(file, c);
