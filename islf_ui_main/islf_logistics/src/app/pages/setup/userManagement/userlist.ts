import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Router } from '@angular/router';
import { UserCreateComponent } from './usercreate';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'user-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    IconField,
    InputIcon,
    UserCreateComponent
  ],
  template: `
    <div class="card">
      <p-table
        #dt
        [value]="users"
        [paginator]="true"
        [rows]="10"
        [showCurrentPageReport]="true"
        responsiveLayout="scroll"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        [rowsPerPageOptions]="[10, 25, 50]"
        [globalFilterFields]="['full_name', 'employee_id', 'designation', 'joining_date', 'status']"
        (onRowClick)="onRowClick($event)"
      >
        <ng-template #caption>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <p-icon-field class="w-full sm:w-80 order-1 sm:order-none">
              <p-inputicon class="pi pi-search" />
              <input
                pInputText
                type="text"
                (input)="onGlobalFilter(dt, $event)"
                placeholder="Global Search"
                class="w-full"
              />
            </p-icon-field>
            <button
              (click)="navigateToCreateUser()"
              pButton
              outlined
              class="w-full sm:w-auto flex-order-0 sm:flex-order-1"
              icon="pi pi-user-plus"
              label="Add New"
            ></button>
          </div>
        </ng-template>

        <ng-template #header>
          <tr>
            <th pSortableColumn="full_name" class="white-space-nowrap" style="width: 25%">
              <span class="flex items-center gap-2">
                Full Name <p-sortIcon field="full_name"></p-sortIcon>
              </span>
            </th>
            <th pSortableColumn="employee_id" class="white-space-nowrap" style="width: 15%">
              <span class="flex items-center gap-2">
                Employee ID <p-sortIcon field="employee_id"></p-sortIcon>
              </span>
            </th>
            <th pSortableColumn="designation" class="white-space-nowrap" style="width: 20%">
              <span class="flex items-center gap-2">
                Designation <p-sortIcon field="designation"></p-sortIcon>
              </span>
            </th>
            <th pSortableColumn="joining_date" class="white-space-nowrap" style="width: 20%">
              <span class="flex items-center gap-2">
                Join Date <p-sortIcon field="joining_date"></p-sortIcon>
              </span>
            </th>
            <th pSortableColumn="status" class="white-space-nowrap" style="width: 15%">
              <span class="flex items-center gap-2">
                Status <p-sortIcon field="status"></p-sortIcon>
              </span>
            </th>
            <th style="width: 80px;">Action</th>
          </tr>
        </ng-template>

        <ng-template #body let-user>
          <tr>
            <td>{{ user.full_name }}</td>
            <td>{{ user.employee_id }}</td>
            <td>{{ user.designation }}</td>
            <td>{{ user.joining_date | date: 'MM/dd/yyyy' }}</td>
            <td>
              <span
                [ngClass]="{
                  'text-green-600 font-semibold': user.status === 'Active',
                  'text-red-600 font-semibold': user.status === 'Inactive'
                }"
              >
                {{ user.status }}
              </span>
            </td>
            <td>
              <button
                pButton
                icon="pi pi-pencil"
                class="p-button-sm p-button-text"
                (click)="editUser(user)"
                title="Edit"
              ></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="paginatorleft" let-state>
          <div class="text-sm text-gray-600">
            Total Users: {{ state.totalRecords }}
          </div>
        </ng-template>
      </p-table>
    </div>
  `
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  selectedUser: any;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {
    this.userService.getUsers().subscribe((res) => {
      this.users = res.users || [];
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  navigateToCreateUser() {
    this.router.navigate(['setup/create_user']);
  }

  onRowClick(event: any) {
    console.log('Row click event:', event);
    const user = event.data || event.rowData;
    if (user && user.id) {
      this.router.navigate(['setup/create_user', user.id]);
    }
  }

  editUser(user: any) {
    if (user && user.id) {
      this.router.navigate(['setup/create_user', user.id]);
    }
  }
}
