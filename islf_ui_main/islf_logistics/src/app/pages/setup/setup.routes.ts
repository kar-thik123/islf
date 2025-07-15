import { Routes } from '@angular/router';
import { CompanyManagementComponent } from './Company/company_management';
import { NumberSeriesComponent } from './numberseries';
import { NumberSeriesRelationComponent } from './numberseriesrelation';
import { mappingComponent } from './mapping';
import { ITSetupComponent } from './itsetup';
import {  UserListComponent } from './userManagement/userlist';
import { Title } from '@angular/platform-browser';
import {  UserCreateComponent } from './userManagement/usercreate';


export default [

   
    { path: 'company_management', component: CompanyManagementComponent, data: { title: 'Company_Management - ISLF' } },
    {path:'number_series',component:NumberSeriesComponent, data:{title: 'Number_Series- ISLF'}},
    {path:'number_relation',component:NumberSeriesRelationComponent, data:{title: 'Number_Relation- ISLF'}},
    {path:'mapping',component:mappingComponent},
    {path: 'it_setup', component: ITSetupComponent, data: { title: 'IT Setup - ISLF' } },
    {path:'user_management',component:UserListComponent,data:{title:'User_management - ISLF'}},
    {path:'create_user',component:UserCreateComponent,data:{title:'Create_User - ISLF'}},
    {path:'create_user/:id',component:UserCreateComponent,data:{title:'Edit_User - ISLF'}}

    

] as Routes; 


