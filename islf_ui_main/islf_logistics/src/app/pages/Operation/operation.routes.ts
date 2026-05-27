import { Routes } from '@angular/router';
import { EnquiryComponent } from './enquiry';
import { BookingComponent } from './booking';
import { JobCardComponent } from './job-card';

export default [

   
    { path: 'enquiry', component: EnquiryComponent, data: { breadcrumb: 'Operation   >>>   Enquiry',title: 'Enquiry - ISLF' } },
    { path: 'booking', component: BookingComponent, data: { breadcrumb: 'Operation   >>>   Booking',title: 'Booking - ISLF' } },
    { path: 'job-card', component: JobCardComponent, data: { breadcrumb: 'Operation   >>>   Job Card',title: 'Job Card - ISLF' } },
    
] as Routes;


