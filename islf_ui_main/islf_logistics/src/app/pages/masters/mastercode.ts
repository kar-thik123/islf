import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { MasterCodeService } from '../../services/mastercode.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

interface PageFieldOption {
  label: string;
  value: string;
  fields: { label: string; value: string }[];
}

@Component({
  selector: 'master-code',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    MultiSelectModule,
    InputSwitchModule,
    ToastModule,
    IconFieldModule,
    InputIconModule
  ],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Master Code</div>
      <p-table
        #dt
        [value]="masters"
        dataKey="code"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['code', 'description', 'reference', 'status']"
        responsiveLayout="scroll"
      >
        <!-- 🔍 Global Filter + Clear -->
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add Master" icon="pi pi-plus" class="p-button" (click)="addRow()"></button>
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
        <ng-template pTemplate="header">
          <tr>
            <th>
              <div class="flex justify-between items-center">
                Code
                <p-columnFilter type="text" field="code" display="menu" placeholder="Search by code"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Description
                <p-columnFilter type="text" field="description" display="menu" placeholder="Search by description"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Reference
                <p-columnFilter type="text" field="reference" display="menu" placeholder="Search by reference"></p-columnFilter>
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
        <ng-template pTemplate="body" let-master let-rowIndex="rowIndex">
          <tr>
            <td>
              <ng-container *ngIf="master.isNew; else codeText">
                <input pInputText [(ngModel)]="master.code" />
              </ng-container>
              <ng-template #codeText>{{ master.code }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="master.isNew || master.isEditing; else descText">
                <input pInputText [(ngModel)]="master.description" />
              </ng-container>
              <ng-template #descText>{{ master.description }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="master.isNew || master.isEditing; else refText">
                <p-multiselect
                  [options]="referenceTreeOptions"
                  [(ngModel)]="master.reference"
                  placeholder="Select Reference"
                  optionLabel="label"
                  optionValue="value"
                  filter
                  [style]="{ width: '100%' }"
                  appendTo="body"
                ></p-multiselect>
              </ng-container>
              <ng-template #refText>{{ master.reference }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="master.isEditing || master.isNew; else statusText">
                <p-dropdown
                  [options]="statuses"
                  [(ngModel)]="master.status"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Status"
                  appendTo="body"
                ></p-dropdown>
              </ng-container>
              <ng-template #statusText>
                <span
                    class="text-sm font-semibold px-3 py-1 rounded-full"
                    [ngClass]="{
                      'text-green-700 bg-green-100': master.status === 'Active',
                      'text-red-700 bg-red-100': master.status === 'Inactive',
                    }"
                  >
                    {{ master.status }}
                  </span>

              </ng-template>
            </td>
            <td>
              <div class="flex items-center space-x-[8px]">
                <button
                  pButton
                  icon="pi pi-pencil"
                  class="p-button-sm"
                  (click)="editRow(master)"
                  title="Edit"
                  *ngIf="!master.isEditing && !master.isNew"
                ></button>
                <button
                  pButton
                  icon="pi pi-check"
                  class="p-button-sm"
                  (click)="saveRow(master)"
                  title="Save"
                  *ngIf="master.isEditing || master.isNew"
                ></button>
                <button
                *ngIf="master.isNew"
                  pButton
                  icon="pi pi-trash"
                  class="p-button-sm"
                  severity="danger"
                  (click)="deleteRow(master)"
                  title="Delete"
                ></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <!-- 📊 Total Masters Count -->
        <ng-template pTemplate="paginatorleft" let-state>
          <div class="text-sm text-gray-600">
            Total Masters: {{ state.totalRecords }}
          </div>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [],
})
export class MasterCodeComponent implements OnInit {
  masters: any[] = [];
  activeCodes: any[] = [];

  statuses = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  referenceTreeOptions= [
    {label: 'User / Status', value: 'User / Status'},
    {label: 'User / Role', value: 'User / Role'},
    {label: 'User / Designation', value: 'User / Designation'}
  ];

  constructor(
    private router: Router,
    private masterService: MasterCodeService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.refreshList();
  
  }

  refreshList() {
    this.masterService.getMasters().subscribe((res: any) => {
      this.masters = (res || []).map((item: any) => ({
        ...item,
        isEditing: false,
        isNew: false
      }));
      this.activeCodes = this.masters.filter((c: any) => c.status === 'Active');
    });
  }

  getActiveCodes() {
    return this.activeCodes;
  }

  addRow() {
    const newRow = {
      id: null,
      code: '',
      description: '',
      reference: '',
      status: 'Active',
      isEditing: true,
      isNew: true
    };
    this.masters = [newRow, ...this.masters];
  }

  saveRow(master: any) {
    // If adding a new row, save all fields
    if (master.isNew) {
      const referenceValue = master.reference;
        
      // Check for existing active code for this reference
      const existingActive = this.masters.find((item: any) =>
        item !== master && // Exclude the current new row from the check
        item.reference &&
        item.status && item.status.trim().toLowerCase() === 'active' &&
        item.reference.trim().toLowerCase() === (referenceValue || '').trim().toLowerCase()
      );
      if (existingActive) {
        this.messageService.add({ severity: 'warn', summary: 'Not Allowed', detail: 'An active code for this reference already exists. Please deactivate it before creating a new one.' });
        return;
      }
      this.masterService.createMaster({
        code: master.code,
        description: master.description,
        reference: referenceValue,
        status: master.status
      }).subscribe({
        next: (res) => {
          Object.assign(master, res, { isEditing: false, isNew: false });
          this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Master saved successfully' });
          this.refreshList();
        },
        error: (err) => {
          console.error('Failed to save master', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Save failed' });
        }
      });
    } else {
      // Update existing record
      const referenceValue = master.reference;

      this.masterService.updateMaster(master.code, {
        description: master.description,
        reference: referenceValue,
        status: master.status
      }).subscribe({
        next: () => {
          master.isEditing = false;
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Master updated successfully' });
          this.refreshList();
        },
        error: (err) => {
          console.error('Failed to update master', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed' });
        }
      });
    }
  }

  editRow(master: any) {
    this.masters.forEach(m => m.isEditing = false);
    master.isEditing = true;
    master.isNew = false;
  }

  deleteRow(master: any) {
    if (master.code && !master.isNew) {
      this.masterService.deleteMaster(master.code).subscribe({
        next: () => {
          this.masters = this.masters.filter(m => m !== master);
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Master deleted' });
          this.refreshList();
        },
        error: (err) => {
          console.error('Failed to delete master', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' });
        }
      });
    } else {
      this.masters = this.masters.filter(m => m !== master);
      this.refreshList();
    }
  }

  clear(table: any) {
    table.clear();
  }

  onGlobalFilter(table: any, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }
}
