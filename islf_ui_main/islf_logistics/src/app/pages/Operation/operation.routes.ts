import { Routes } from '@angular/router';
import { EnquiryComponent } from './enquiry';
import { BookingComponent } from './booking';

export default [

   
    { path: 'enquiry', component: EnquiryComponent, data: { breadcrumb: 'Operation   >>>   Enquiry',title: 'Enquiry - ISLF' } },
    { path: 'booking', component: BookingComponent, data: { breadcrumb: 'Operation   >>>   Booking',title: 'Booking - ISLF' } },
    
    
] as Routes;


