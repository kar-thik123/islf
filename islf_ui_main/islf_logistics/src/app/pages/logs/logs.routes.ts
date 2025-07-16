import { Routes } from '@angular/router';
import { LogsComponent } from './logs';

export default [

   
    { path: 'auth_logs', component: LogsComponent, data: { breadcrumb: 'Logs >>> Authentication Logs', title: 'Auth_Logs - ISLF' } },

] as Routes; 


