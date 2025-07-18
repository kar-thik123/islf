import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
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
    FormsModule,
    DropdownModule,
    UserCreateComponent
  ],
  template: `
    <div class="card">
      <div class="font-semibold text-xl mb-4">User Management </div>
      <!-- ✅ Add User button -->

      <p-table
        #dt
        [value]="users"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5,10,20,50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['full_name', 'employee_id', 'designation', 'joining_date', 'status']"
        responsiveLayout="scroll"
      >
        <!-- 🔍 Global Filter + Clear -->
        <ng-template #caption>
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
             <button pButton type="button" label="Add User" icon="pi pi-plus" class="p-button" (click)="navigateToCreateUser()"></button>
            <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
            <p-iconfield iconPosition="left" class="ml-auto">
              <p-inputicon>
                <i class="pi pi-search"></i>
              </p-inputicon>
              <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search keyword" />
            </p-iconfield>
          </div>
        </ng-template>

        <!-- 🧾 Table Headers with Filters -->
        <ng-template #header>
          <tr>
            <th>
              <div class="flex justify-between items-center">
                Full Name
                <p-columnFilter type="text" field="full_name" display="menu" placeholder="Search by name"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Employee ID
                <p-columnFilter type="text" field="employee_id" display="menu" placeholder="Search by ID"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Designation
                <p-columnFilter type="text" field="designation" display="menu" placeholder="Search by designation"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Joining Date
                <p-columnFilter type="date" field="joining_date" display="menu" placeholder="MM/DD/YYYY"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Status
                <p-columnFilter field="status" matchMode="equals" display="menu">
                  <ng-template #filter let-value let-filter="filterCallback">
                    <p-dropdown
                      [ngModel]="value"
                      [options]="statuses"
                      (onChange)="filter($event.value)"
                      placeholder="Any"
                      styleClass="w-full"
                      optionLabel="label"
                    >
                      <ng-template let-option pTemplate="item">
                        <span class="font-semibold text-sm">{{ option.label }}</span>
                      </ng-template>
                    </p-dropdown>
                  </ng-template>
                </p-columnFilter>
              </div>
            </th>
            <th style="min-width: 80px;">Action</th>
          </tr>
        </ng-template>

        <!-- 👤 Table Body -->
        <ng-template #body let-user>
          <tr>
            <td>{{ user.full_name }}</td>
            <td>{{ user.employee_id }}</td>
            <td>{{ user.designation }}</td>
            <td>{{ user.joining_date | date: 'MM/dd/yyyy' }}</td>
            <td>
              <span class="text-sm font-semibold px-3 py-1 rounded-full"
              [ngClass]="{
                
                'text-green-600 bg-green-100': user.status === 'Active',
                'text-red-600 bg-red-100': user.status === 'Inactive',
                'text-blue-600 bg-blue-100': user.status !== 'Active' && user.status !== 'Inactive'
              }">
                {{ user.status }}
              </span>
            </td>
            <td>
              <div class="flex justify-center items-center h-full">
              <button
                pButton
                icon="pi pi-pencil"
                class="p-button-sm"
                (click)="editUser(user)"
                title="Edit"
              ></button>
              </div>
            </td>
          </tr>
        </ng-template>

        <!-- 📊 Total Users Count -->
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
  statuses = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {
    this.userService.getUsers().subscribe((res) => {
      this.users = res.users || [];
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
  }

  navigateToCreateUser() {
    this.router.navigate(['setup/create_user']);
  }

  editUser(user: any) {
    if (user?.id) {
      this.router.navigate(['setup/create_user', user.id]);
    }
  }
}
