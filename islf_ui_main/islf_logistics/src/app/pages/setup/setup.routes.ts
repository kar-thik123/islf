import { Routes } from '@angular/router';
import { CompanyManagementComponent } from './Company/company_management';
import { NumberSeriesComponent } from './numberseries';
import { NumberSeriesRelationComponent } from './numberseriesrelation';
import { mappingComponent } from './mapping';
import { ITSetupComponent } from './itsetup';


export default [

   
    { path: 'company_management', component: CompanyManagementComponent, data: { title: 'Company_Management - ISLF' } },
    {path:'number_series',component:NumberSeriesComponent, data:{title: 'Number_Series- ISLF'}},
    {path:'number_relation',component:NumberSeriesRelationComponent, data:{title: 'Number_Relation- ISLF'}},
    {path:'mapping',component:mappingComponent},
    { path: 'it_setup', component: ITSetupComponent, data: { title: 'IT Setup - ISLF' } },
    

] as Routes; 


