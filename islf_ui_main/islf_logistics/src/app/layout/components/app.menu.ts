import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppMenuitem } from './app.menuitem';

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
            icon: 'pi pi-spin pi-cog',
            items: [
              {
                label: 'Company Mgmt',
                icon: 'pi pi-building',
                routerLink: ['/setup/company_management'],
              },
              {
                label: 'No. Series',
                icon: 'pi pi-sort-numeric-up',
                routerLink: ['/setup/number_series'],
              },
              {
                label: 'No. Series Relation',
                icon: 'pi pi-link',
                routerLink: ['/setup/number_relation'],
              },
              {
                label: 'No. Series Mapping',
                icon: 'pi pi-map',
                routerLink: ['/setup/mapping'],
              },
              {
                label: 'IT Setup',
                icon: 'pi pi-sliders-h',
                routerLink: ['/setup/it_setup'],
              },
              {
                label: 'User Mgmt',
                icon: 'pi pi-user',
                routerLink: ['/setup/user_management'],
              },
            ],
          },
        ],
      },
      {
        items: [
          {
            label: 'Logs',
            icon: 'pi pi-book',
            items: [
              {
                label: 'Auth Logs',
                icon: 'pi pi-list',
                routerLink: ['/logs/auth_logs'],
              },
            ],
          },
        ],
      },
      {
        items: [
          {
            label: 'Masters',
            icon: 'pi pi-database',
            items: [
              {
                label: 'Master Code',
                icon: 'pi pi-sliders-h',
                routerLink: ['/master/master_code'],
              },
              {
                label: 'Master Type',
                icon: 'pi pi-sliders-h',
                routerLink: ['/master/master_type'],
              },
            ],
          },
        ],
      },
      
    ];
  }
}
