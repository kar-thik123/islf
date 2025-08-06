import { Routes } from '@angular/router';
import { LogsComponent } from './logs';
import { MastersLogsComponent } from './masters-logs';
import { SetupLogsComponent } from './setup-logs';

export default [

   
    { path: 'auth_logs', component: LogsComponent, data: { breadcrumb: 'Logs >>> Authentication Logs', title: 'Auth_Logs - ISLF' } },
    { path: 'masters_logs', component: MastersLogsComponent, data: { breadcrumb: 'Logs >>> Masters Logs', title: 'Masters_Logs - ISLF' } },
    { path: 'setup_logs', component: SetupLogsComponent, data: { breadcrumb: 'Logs >>> Setup Logs', title: 'Setup_Logs - ISLF' } },
   

] as Routes; 