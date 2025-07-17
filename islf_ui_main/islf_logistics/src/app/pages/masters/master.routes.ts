import { Routes } from '@angular/router';
import {  MasterCodeComponent } from './mastercode';
import { MasterTypeComponent } from './mastertype';


export default [

   
    { path: 'master_code', component: MasterCodeComponent, data: { breadcrumb: 'Masters   >>>   Master Code',title: 'Master_Code - ISLF' } },
    { path: 'master_type', component: MasterTypeComponent, data: {breadcrumb: 'Masters   >>>   Master Type',title: 'Master_Type - ISLF' } },
    

] as Routes; 


