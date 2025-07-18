import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MasterCodeService } from '../../services/mastercode.service';
import { MasterTypeService } from '../../services/mastertype.service';

@Component({
  selector: 'master-type',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    ToastModule
  ],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Master Type</div>
      <p-table
        #dt
        [value]="types"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['key', 'value', 'description', 'status']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add Type" icon="pi pi-plus" class="p-button" (click)="addRow()"></button>
            <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
            <span class="ml-auto">
              <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search keyword" />
            </span>
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th>
              <div class="flex justify-between items-center">
                Key
                <p-columnFilter type="text" field="key" display="menu" placeholder="Search by key"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Value
                <p-columnFilter type="text" field="value" display="menu" placeholder="Search by value"></p-columnFilter>
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
        <ng-template pTemplate="body" let-type let-rowIndex="rowIndex">
          <tr>
            <td>
              <ng-container *ngIf="type.isNew; else keyText">
                <p-dropdown
                  [options]="masterCodeOptions"
                  [(ngModel)]="type.key"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Key"
                  appendTo="body"
                ></p-dropdown>
              </ng-container>
              <ng-template #keyText>{{ type.key }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="type.isNew; else valueText">
                <input pInputText [(ngModel)]="type.value" />
              </ng-container>
              <ng-template #valueText>{{ type.value }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="type.isNew; else descText">
                <input pInputText [(ngModel)]="type.description" />
              </ng-container>
              <ng-template #descText>{{ type.description }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="type.isEditing || type.isNew; else statusText">
                <p-dropdown
                  [options]="statuses"
                  [(ngModel)]="type.status"
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
                    'text-green-700 bg-green-100': type.status === 'Active',
                    'text-red-700 bg-red-100': type.status === 'Inactive'
                  }"
                >
                  {{ type.status }}
                </span>
              </ng-template>
            </td>
            <td>
              <div class="flex items-center space-x-[8px]">
                <button
                  pButton
                  icon="pi pi-pencil"
                  class="p-button-sm"
                  (click)="editRow(type)"
                  title="Edit"
                  *ngIf="!type.isEditing && !type.isNew"
                ></button>
                <button
                  pButton
                  icon="pi pi-check"
                  class="p-button-sm"
                  (click)="saveRow(type)"
                  title="Save"
                  *ngIf="type.isEditing || type.isNew"
                ></button>
                <button
                *ngIf="type.isNew"
                  pButton
                  icon="pi pi-trash"
                  class="p-button-sm"
                  severity="danger"
                  (click)="deleteRow(type)"
                  title="Delete"
                ></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="paginatorleft" let-state>
          <div class="text-sm text-gray-600">
            Total Types: {{ state.totalRecords }}
          </div>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [],
})
export class MasterTypeComponent implements OnInit {
  types: any[] = [];
  activeTypes: any[] = [];
  masterCodeOptions: any[] = [];
  statuses = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  constructor(
    private masterCodeService: MasterCodeService,
    private masterTypeService: MasterTypeService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    // Load master code options for the key dropdown
    this.masterCodeService.getMasters().subscribe((codes: any[]) => {
      this.masterCodeOptions = (codes || []).map(c => ({ label: c.code, value: c.code }));
    });
    this.refreshList();
  }

  refreshList() {
    this.masterTypeService.getAll().subscribe(types => {
      this.types = (types || []).map((t: any) => ({
        ...t,
        isEditing: false,
        isNew: false
      }));
      this.activeTypes = this.types.filter((t: any) => t.status === 'Active');
    });
  }

  addRow() {
    const newRow = {
      id: null,
      key: '',
      value: '',
      description: '',
      status: 'Active',
      isEditing: false,
      isNew: true
    };
    this.types = [newRow, ...this.types];
  }

  saveRow(type: any) {
    if (type.isNew) {
      this.masterTypeService.create(type).subscribe({
        next: (created) => {
          Object.assign(type, created, { isNew: false, isEditing: false });
          this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Type saved successfully' });
          this.refreshList();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Save failed' });
        }
      });
    } else {
      this.masterTypeService.update(type.id, type).subscribe({
        next: (updated) => {
          Object.assign(type, updated, { isEditing: false });
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Type updated' });
          this.refreshList();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed' });
        }
      });
    }
  }

  editRow(type: any) {
    this.types.forEach(t => t.isEditing = false);
    type.isEditing = true;
    type.isNew = false;
  }

  deleteRow(type: any) {
    if (type.id) {
      this.masterTypeService.delete(type.id).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Type deleted' });
          this.refreshList();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' });
        }
      });
    } else {
      this.types = this.types.filter(t => t !== type);
    }
  }

  clear(table: any) {
    table.clear();
  }

  onGlobalFilter(table: any, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }

  getActiveTypes() {
    return this.activeTypes;
  }
}
