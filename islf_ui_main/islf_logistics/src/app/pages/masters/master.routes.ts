import { Routes } from '@angular/router';
import {  MasterCodeComponent } from './mastercode';
import { MasterTypeComponent } from './mastertype';
import { MasterLocationComponent } from './masterlocation';
import { MasterUOMComponent } from './masteruom';
import { MasterItemComponent } from './masteritem';
import { MasterVesselComponent } from './mastervessel';
import { CustomerComponent } from './customer';


export default [

   
    { path: 'master_code', component: MasterCodeComponent, data: { breadcrumb: 'Masters   >>>   Master Code',title: 'Master_Code - ISLF' } },
    { path: 'master_type', component: MasterTypeComponent, data: {breadcrumb: 'Masters   >>>   Master Type',title: 'Master_Type - ISLF' } },
    {path:'location', component: MasterLocationComponent, data: {breadcrumb: 'Masters   >>>   Location',title: 'Location - ISLF' } },
    {path:'uom',component:MasterUOMComponent, data: {breadcrumb: 'Masters   >>>   Unit of Measure',title: 'UOM - ISLF' } },
    {path:'master_item',component:MasterItemComponent, data: {breadcrumb: 'Masters   >>>   Master Item',title: 'Master_Item - ISLF' } },
    {path:'vessel',component:MasterVesselComponent, data:{breadcrumb: 'Masters   >>>   Vessel',title:'Vessel - ISLF'}},
    {path:'customer',component:CustomerComponent, data:{breadcrumb: 'Masters   >>>   Customer',title:'Customer - ISLF'}}

] as Routes; 


