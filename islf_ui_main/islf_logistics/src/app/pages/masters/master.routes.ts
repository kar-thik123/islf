import { Routes } from '@angular/router';
import {  MasterCodeComponent } from './mastercode';
import { MasterTypeComponent } from './mastertype';
import { MasterLocationComponent } from './masterlocation';
import { MasterUOMComponent } from './masteruom';
import { MasterItemComponent } from './masteritem';
import { MasterVesselComponent } from './mastervessel';
import { CustomerComponent } from './customer';
import { VendorComponent } from './vendor';
import { CurrencyCodeComponent } from './currencycode';
import { ContainerCodeComponent } from './containercode';   
import { GstSetupComponent } from './gstsetup';
import { TariffComponent } from './tariff';
import { SourcingComponent } from './sourcing';
import { BasisComponent } from './basis';
import { TariffViewComponent } from './tariff-view';

export default [

   
    { path: 'master_code', component: MasterCodeComponent, data: { breadcrumb: 'Masters   >>>   Master Code',title: 'Master_Code - ISLF' } },
    { path: 'master_type', component: MasterTypeComponent, data: {breadcrumb: 'Masters   >>>   Master Type',title: 'Master_Type - ISLF' } },
    {path:'location', component: MasterLocationComponent, data: {breadcrumb: 'Masters   >>>   Location',title: 'Location - ISLF' } },
    {path:'uom',component:MasterUOMComponent, data: {breadcrumb: 'Masters   >>>   Unit of Measure',title: 'UOM - ISLF' } },
    {path:'basis',component:BasisComponent, data: {breadcrumb: 'Masters   >>>   Basis',title: 'Basis - ISLF' } },
    {path:'master_item',component:MasterItemComponent, data: {breadcrumb: 'Masters   >>>   Master Item',title: 'Master_Item - ISLF' } },
    {path:'vessel',component:MasterVesselComponent, data:{breadcrumb: 'Masters   >>>   Vessel',title:'Vessel - ISLF'}},
    {path:'customer',component:CustomerComponent, data:{breadcrumb: 'Masters   >>>   Customer',title:'Customer - ISLF'}},
    {path:'vendor',component:VendorComponent, data:{breadcrumb: 'Masters   >>>   Vendor',title:'Vendor - ISLF'}},
    {path:'currency_code',component:CurrencyCodeComponent, data:{breadcrumb: 'Masters   >>>   Currency Code',title:'Currency Code - ISLF'}},
    {path:'container',component:ContainerCodeComponent, data:{breadcrumb: 'Masters   >>>   Container ',title:'Container - ISLF'}},
    {path:'gst_setup',component:GstSetupComponent, data:{breadcrumb: 'Masters   >>>   GST Setup',title:'GST Setup - ISLF'}},
    {path:'tariff',component:TariffComponent, data:{breadcrumb: 'Masters   >>>   Tariff',title:'Tariff - ISLF'}},
    {path:'sourcing',component:SourcingComponent, data:{breadcrumb: 'Masters   >>>   Sourcing',title:'Sourcing - ISLF'}},
    {path:'tariff_view',component:TariffViewComponent, data:{breadcrumb: 'Masters   >>>   Tariff View',title:'Tariff View - ISLF'}}
] as Routes;


