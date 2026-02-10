import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { AppMenuitem } from './app.menuitem';
import { last } from 'rxjs';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `
    <ul class="layout-menu">
      <ng-container *ngFor="let item of model; let i = index">
        <li
          app-menuitem
          *ngIf="!item.separator"
          [item]="item"
          [index]="i"
          [root]="true"
        ></li>
        <li *ngIf="item.separator" class="menu-separator"></li>
      </ng-container>
    </ul>
  `,
})
export class AppMenu {
  model: any[] = [];

  ngOnInit() {
    this.model = [
      {
        items: [
          {
            label: 'Settings',
            icon: 'fa-solid fa-cog',
            items: [
              {
                label: 'Company Mgmt',
                icon: 'fa-solid fa-building',
                routerLink: ['/settings/company_management'],
              },
              {
                label: 'No. Series',
                icon: 'fa-solid fa-sort-numeric-up',
                routerLink: ['/settings/number_series'],
              },
              {
                label: 'No. Series Relation',
                icon: 'fa-solid fa-link',
                routerLink: ['/settings/number_relation'],
              },
              {
                label: 'No. Series Mapping',
                icon: 'fa-solid fa-sliders-h',
                routerLink: ['/settings/mapping'],
              },
              {
                label: 'IT Setup',
                icon: 'fa-solid fa-sliders-h',
                routerLink: ['/settings/it_setup'],
              },

              {
                label: 'User Mgmt',
                icon: 'fa-solid fa-user',
                routerLink: ['/settings/user_management'],
              },
              {
                label: 'Carriage Direction',
                icon: 'fa-solid fa-sort-numeric-up',
                routerLink: ['/settings/carriage_direction'],
              },
            ],
          },
        ],
      },
      {
        items: [
          {
            label: 'Logs',
            icon: 'fa-solid fa-book',
            items: [
              {
                label: 'Auth Logs',
                icon: 'fa-solid fa-shield-halved',
                routerLink: ['/logs/auth_logs'],
              },
              {
                label: 'Masters Logs',
                icon: 'fa-solid fa-database',
                routerLink: ['/logs/masters_logs'],
              },
              {
                label: 'Master Type Logs',
                icon: 'fa-solid fa-tags',
                routerLink: ['/logs/master_types_logs'],
              },
              {
                label: 'Operations Logs',
                icon: 'fa-solid fa-briefcase',
                routerLink: ['/logs/operations_logs'],
              },
              {
                label: 'Setup Logs',
                icon: 'fa-solid fa-cog',
                routerLink: ['/logs/setup_logs'],
              },
              {
                label: 'System Logs',
                icon: 'fa-solid fa-code',
                routerLink: ['/logs/system_logs'],
              },
            ],
          },
        ],
      },
      {
        items: [
          {
            label: 'Masters',
            icon: 'fa-solid fa-brain',
            items: [
              {
                label: 'Master Code',
                icon: 'fa-solid fa-code',
                routerLink: ['/master/master_code'],
              },
              {
                label: 'Master Type',
                icon: 'fa-solid fa-sliders-h',
                routerLink: ['/master/master_type'],
              },
              {
                label: 'Customer',
                icon: 'fa-solid fa-people-roof',
                routerLink: ['/master/customer'],
              },
              {
                label: 'Vendor',
                icon: 'fa-solid fa-building',
                routerLink: ['/master/vendor'],
              },

              {
                label: 'Location',
                icon: 'fa-solid fa-location-dot',
                routerLink: ['/master/location'],
              },
              {
                label: 'Vessel',
                icon: 'fa-solid fa-ship',
                routerLink: ['/master/vessel'],
              },
              {
                label: 'Airline',
                icon: 'fa-solid fa-plane',
                routerLink: ['/master/airline'],
              },
              {
                label: 'Unit of Measure',
                icon: 'fa-solid fa-scale-unbalanced',
                routerLink: ['/master/uom'],
              },
              {
                label: 'Basis',
                icon: 'fa-solid fa-scale-unbalanced',
                routerLink: ['/master/basis'],
              },
              {
                label: 'Master Item',
                icon: 'fa-solid fa-box',
                routerLink: ['/master/master_item'],
              },
              {
                label: 'Cargo ',
                icon: 'fa-solid fa-dolly',
                routerLink: ['/master/cargo'],
              },
              {
                label: 'Charges',
                icon: 'fa-solid fa-receipt',
                routerLink: ['/master/charges'],
              },
              {
                label: 'Currency Code',
                icon: 'fa-solid fa-money-bill',
                routerLink: ['/master/currency_code'],
              },
              {
                label: 'Container',
                icon: 'fa-solid fa-box',
                routerLink: ['/master/container'],
              },
              {
                label: 'GST Setup',
                icon: 'fa-solid fa-money-check-dollar',
                routerLink: ['/master/gst_setup'],
              },
              {
                label: 'Local Tariff',
                icon: 'fa-solid fa-percent',
                routerLink: ['/master/tariff'],
              },
              {
                label: 'Sourcing',
                icon: 'fa-solid fa-globe',
                routerLink: ['/master/sourcing'],
              },
              {
                label: 'Service Area',
                icon: 'fa-solid fa-map-marked-alt',
                routerLink: ['/master/service_area'],
              },
              {
                label: 'Source Sales',
                icon: 'fa-solid fa-users',
                routerLink: ['/master/source_sales'],
              },
            ],
          },
        ],
      },
      {
        items: [
          {
            label: 'Master Types',
            icon: 'fa-solid fa-th-list',
            items: [
              {
                label: 'User Status',
                icon: 'fa-solid fa-user-check',
                routerLink: ['/masterTypes/user_status'],
              },
              {
                label: 'Tariff Type',
                icon: 'fa-solid fa-percent',
                routerLink: ['/masterTypes/tariff_type'],
              },
              {
                label: 'Customer',
                icon: 'fa-solid fa-people-roof',
                routerLink: ['/masterTypes/customer'],
              },
              {
                label: 'Vendor',
                icon: 'fa-solid fa-building',
                routerLink: ['/masterTypes/vendor'],
              },
              {
                label: 'Cargo Type',
                icon: 'fa-solid fa-dolly',
                routerLink: ['/masterTypes/cargo_type'],
              },
              {
                label: 'Charge Type',
                icon: 'fa-solid fa-receipt',
                routerLink: ['/masterTypes/charge_type'],
              },
              {
                label: 'Basis',
                icon: 'fa-solid fa-scale-unbalanced',
                routerLink: ['/masterTypes/basis'],
              },
              {
                label: 'Service Area',
                icon: 'fa-solid fa-map-marked-alt',
                routerLink: ['/masterTypes/service_area'],
              },
              {
                label: 'Item',
                icon: 'fa-solid fa-box',
                routerLink: ['/masterTypes/item'],
              },
              {
                label: 'Location',
                icon: 'fa-solid fa-location-dot',
                routerLink: ['/masterTypes/location'],
              },
              {
                label: 'Carriage',
                icon: 'fa-solid fa-truck',
                routerLink: ['/masterTypes/carriage'],
              },
            ],
          },
        ],
      },
      {
        items: [
          {
            label: 'Search',
            icon: 'fa-solid fa-search',
            items: [
              {
                label: 'Tariff',
                icon: 'fa-solid fa-percent',
                routerLink: ['/master/tariff_view'],
              },
            ],
          },
        ],
      },
      {
        items: [
          {
            label: 'Operations',
            icon: 'fa-solid fa-briefcase',
            items: [
              {
                label: 'Enquiry',
                icon: 'fa-solid fa-question',
                routerLink: ['/operation/enquiry'],
              },
              {
                label: 'Booking',
                icon: 'fa-solid fa-clipboard-check',
                routerLink: ['/operation/booking'],
              }
            ],
          },
        ],
      },
    ];
  }
}
