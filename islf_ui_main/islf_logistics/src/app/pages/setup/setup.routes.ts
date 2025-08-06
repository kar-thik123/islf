import { Routes } from '@angular/router';
import { CompanyManagementComponent } from './Company/company_management';
import { CompanyTreeComponent } from './Company/company-tree';
import { NumberSeriesComponent } from './numberseries';
import { NumberSeriesRelationComponent } from './numberseriesrelation';
import { mappingComponent } from './mapping';
import { ITSetupComponent } from './itsetup';
import {  UserListComponent } from './userManagement/userlist';
import { Title } from '@angular/platform-browser';
import {  UserCreateComponent } from './userManagement/usercreate';


export default [

   
    { path: 'company_management', component: CompanyManagementComponent, data: { breadcrumb: 'Settings >>> Company Management', title: 'Company_Management - ISLF' } },
    { path: 'company_tree', component: CompanyTreeComponent, data: { breadcrumb: 'Settings >>> Company Tree', title: 'Company_Tree - ISLF' } },
    {path:'number_series',component:NumberSeriesComponent, data:{ breadcrumb: 'Settings >>> Number Series',title: 'Number_Series- ISLF'}},
    {path:'number_relation',component:NumberSeriesRelationComponent, data:{ breadcrumb: 'Settings >>> Number Series Relation',title: 'Number_Relation- ISLF'}},
    {path:'mapping',component:mappingComponent, data:{ breadcrumb: 'Settings >>> Mapping',title: 'Mapping - ISLF'}},
    {path: 'it_setup', component: ITSetupComponent, data: { breadcrumb: 'Settings >>> IT Setup', title: 'IT Setup - ISLF' } },
    {path:'user_management',component:UserListComponent,data:{ breadcrumb: 'Settings >>> User management',title:'User_management - ISLF'}},
    {path:'create_user',component:UserCreateComponent,data:{ breadcrumb: 'Settings >>> Create User',title:'Create_User - ISLF'}},
    {path:'create_user/:id',component:UserCreateComponent,data:{ breadcrumb: 'Settings >>> Edit User',title:'Edit_User - ISLF'}}

    

] as Routes; 


