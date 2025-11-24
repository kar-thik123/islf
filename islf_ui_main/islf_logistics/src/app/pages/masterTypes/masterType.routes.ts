import { Routes } from '@angular/router';
import { userStatusComponent } from './userStatus';
import { tariffTypeComponent } from './tariffType';
import { customerComponent } from './customerType';
import { vendorComponent } from './vendorType'; 
import { cargoTypeComponent } from './cargoType';
import { chargeTypeComponent } from './chargeType';
import { basisTypeComponent } from './basisType';
import { serviceAreaTypeComponent } from './serviceAreaType';
import { itemTypeComponent } from './itemType';
import { locationTypeComponent } from './locationType';
import { carriageTypeComponent } from './carriageType';

export default [
  {
    path: 'user_status',
    component: userStatusComponent,
    data: {
      breadcrumb: 'Master Types   >>>   User Status',
      title: 'User_Status - ISLF',
    },
  },
  {
    path: 'tariff_type',
    component: tariffTypeComponent,
    data: {
      breadcrumb: 'Master Types   >>>   Tariff Type',
      title: 'Tariff_Type - ISLF',
    },
  },
  {
    path: 'customer',
    component: customerComponent,
    data: {
      breadcrumb: 'Master Types   >>>   Customer',
      title: 'Customer - ISLF',
    },
  },
  {
    path: 'vendor',
    component: vendorComponent,
    data: {
      breadcrumb: 'Master Types   >>>   Vendor',
      title: 'Vendor - ISLF',
    },
  },
  {
    path: 'cargo_type',
    component: cargoTypeComponent,
    data: {
      breadcrumb: 'Master Types   >>>   Cargo Type',
      title: 'Cargo_Type - ISLF',
    },
  },
  {
    path: 'charge_type',
    component: chargeTypeComponent,
    data: {
      breadcrumb: 'Master Types   >>>   Charge Type',
      title: 'Charge_Type - ISLF',
    },
  },
  {
    path: 'basis',
    component: basisTypeComponent,
    data: {
      breadcrumb: 'Master Types   >>>   Basis',
      title: 'Basis - ISLF',
    },
  },
  {
    path: 'service_area',
    component: serviceAreaTypeComponent,
    data: {
      breadcrumb: 'Master Types   >>>   Service Area',
      title: 'Service_Area - ISLF',
    },
  },
  {
    path: 'item_type',
    component: itemTypeComponent,
    data: {
      breadcrumb: 'Master Types   >>>   Item Type',
      title: 'Item Type - ISLF',
    },
  },
  {
    path: 'location',
    component: locationTypeComponent,
    data: {
      breadcrumb: 'Master Types   >>>   Location',
      title: 'Location - ISLF',
    },
  },
  {
    path: 'carriage',
    component: carriageTypeComponent,
    data: {
      breadcrumb: 'Master Types   >>>   carriage',
      title: 'Carriage - ISLF',
    },
  },
];
