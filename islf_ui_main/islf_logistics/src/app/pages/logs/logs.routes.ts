import { Routes } from '@angular/router';

export default [
    { path: 'auth_logs', loadComponent: () => import('./action-logs').then(m => m.ActionLogsComponent), data: { breadcrumb: 'Logs >>> Auth Logs', title: 'Auth Logs - ISLF', domain: 'auth' } },
    { path: 'masters_logs', loadComponent: () => import('./action-logs').then(m => m.ActionLogsComponent), data: { breadcrumb: 'Logs >>> Masters Logs', title: 'Masters Logs - ISLF', domain: 'masters' } },
    { path: 'master_types_logs', loadComponent: () => import('./action-logs').then(m => m.ActionLogsComponent), data: { breadcrumb: 'Logs >>> Master Type Logs', title: 'Master Type Logs - ISLF', domain: 'master_types' } },
    { path: 'operations_logs', loadComponent: () => import('./action-logs').then(m => m.ActionLogsComponent), data: { breadcrumb: 'Logs >>> Operations Logs', title: 'Operations Logs - ISLF', domain: 'operations' } },
    { path: 'setup_logs', loadComponent: () => import('./action-logs').then(m => m.ActionLogsComponent), data: { breadcrumb: 'Logs >>> Setup Logs', title: 'Setup Logs - ISLF', domain: 'setup' } },
    { path: 'system_logs', loadComponent: () => import('./system-logs').then(m => m.SystemLogsComponent), data: { breadcrumb: 'Logs >>> System Logs', title: 'System Logs - ISLF' } },
] as Routes; 