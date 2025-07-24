import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

import { MasterItemService, MasterItem } from '../../services/master-item.service';
import { MasterTypeService } from '../../services/mastertype.service';

interface ItemTypeOption {
  key: string;
  value: string;
  status: string;
}

@Component({
  selector: 'master-item',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    ToastModule,
    DialogModule
  ],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Master Item</div>

      <p-table
        #dt
        [value]="items"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['item_type', 'code', 'name', 'hs_code']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add Item" icon="pi pi-plus" (click)="addRow()"></button>
            <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
            <span class="ml-auto">
              <input pInputText type="text" (input)="onGlobalFilter($event, dt)" placeholder="Search keyword" />
            </span>
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th>
              <div class="flex justify-between items-center">
                Item Type
                <p-columnFilter type="text" field="item_type" display="menu" placeholder="Search by type"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Code
                <p-columnFilter type="text" field="code" display="menu" placeholder="Search by code"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Name
                <p-columnFilter type="text" field="name" display="menu" placeholder="Search by name"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                HS Code
                <p-columnFilter type="text" field="hs_code" display="menu" placeholder="Search by HS code"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Status
                <p-columnFilter field="active" matchMode="equals" display="menu">
                  <ng-template #filter let-value let-filter="filterCallback">
                    <p-dropdown
                      [ngModel]="value"
                      [options]="activeOptions"
                      (onChange)="filter($event.value)"
                      placeholder="Any"
                      styleClass="w-full"
                      optionLabel="label"
                      optionValue="value"
                    ></p-dropdown>
                  </ng-template>
                </p-columnFilter>
              </div>
            </th>
            <th style="min-width: 80px;">Action</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-item>
          <tr>
            <td>{{ item.item_type }}</td>
            <td>{{ item.code }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.hs_code }}</td>
            <td>
              <span
                class="text-sm font-semibold px-3 py-1 rounded-full"
                [ngClass]="{
                  'text-green-700 bg-green-100': item.active,
                  'text-red-700 bg-red-100': !item.active
                }"
              >
                {{ item.active ? 'Active' : 'Inactive' }}
              </span>
            </td>

            <td>
              <button pButton icon="pi pi-pencil" (click)="editRow(item)" class="p-button-sm"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog
      header="{{ selectedItem?.isNew ? 'Add' : 'Edit' }} Item"
      [(visible)]="isDialogVisible"
      [modal]="true"
      [style]="{ width: '600px' }"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      (onHide)="hideDialog()"
    >
      <ng-template pTemplate="content">
        <div *ngIf="selectedItem" class="p-fluid form-grid dialog-body-padding">
          <div class="grid-container">
            <div class="grid-item">
              <label for="item_type">Item Type</label>
              <p-dropdown
                id="item_type"
                [options]="itemTypeOptions"
                [(ngModel)]="selectedItem.item_type"
                optionLabel="value"
                optionValue="value"
                placeholder="Select Item Type"
                [filter]="true"
                [disabled]="!selectedItem.isNew"
              ></p-dropdown>
            </div>
            <div class="grid-item">
              <label for="code">Code</label>
              <input id="code" pInputText [(ngModel)]="selectedItem.code" [disabled]="!selectedItem.isNew" />
            </div>
            <div class="grid-item">
              <label for="name">Name</label>
              <input id="name" pInputText [(ngModel)]="selectedItem.name" />
            </div>
            <div class="grid-item">
              <label for="hs_code">HS Code</label>
              <input id="hs_code" pInputText [(ngModel)]="selectedItem.hs_code" />
            </div>
            <div class="grid-item">
              <label for="active">Status</label>
              <p-dropdown
                appendTo="body"
                id="active"
                [options]="activeOptions"
                [(ngModel)]="selectedItem.active"
                optionLabel="label"
                optionValue="value"
              ></p-dropdown>
            </div>
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2 px-3 pb-2">
          <button pButton label="Cancel" icon="pi pi-times" class="p-button-outlined p-button-secondary" (click)="hideDialog()"></button>
          <button pButton label="{{ selectedItem?.isNew ? 'Add' : 'Update' }}" icon="pi pi-check" (click)="saveRow()"></button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .grid-container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
    .grid-item {
      display: flex;
      flex-direction: column;
    }
    label {
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
  `]
})
export class MasterItemComponent implements OnInit {
  items: MasterItem[] = [];
  itemTypeOptions: ItemTypeOption[] = [];
  activeOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  isDialogVisible = false;
  selectedItem: (MasterItem & { isNew?: boolean }) | null = null;

  constructor(
    private masterItemService: MasterItemService,
    private masterTypeService: MasterTypeService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.refreshList();
    this.masterTypeService.getAll().subscribe((types: ItemTypeOption[]) => {
      this.itemTypeOptions = types.filter(t => t.key === 'Item' && t.status === 'Active');
    });
  }

  onGlobalFilter(event: Event, table: any) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  refreshList() {
    this.masterItemService.getAll().subscribe(data => {
      this.items = data;
    });
  }

  addRow() {
    this.selectedItem = {
      item_type: '',
      code: '',
      name: '',
      hs_code: '',
      active: true,
      isNew: true
    };
    this.isDialogVisible = true;
  }

  editRow(item: MasterItem) {
    this.selectedItem = { ...item, isNew: false };
    this.isDialogVisible = true;
  }

  saveRow() {
    if (!this.selectedItem) return;

    // Validation
    if (!this.selectedItem.item_type || !this.selectedItem.code || !this.selectedItem.name) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Item Type, Code, and Name are required.'
      });
      return;
    }

    if (this.selectedItem.isNew && this.items.some(i => i.code === this.selectedItem?.code)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Duplicate Code',
        detail: 'Item with the same code already exists.'
      });
      return;
    }

    const req = this.selectedItem.isNew
      ? this.masterItemService.create(this.selectedItem)
      : this.masterItemService.update(this.selectedItem.id!, this.selectedItem);

    req.subscribe({
      next: () => {
        const msg = this.selectedItem?.isNew ? 'Item created' : 'Item updated';
        this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });
        this.refreshList();
        this.hideDialog();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Operation failed' });
      }
    });
  }

  hideDialog() {
    this.isDialogVisible = false;
    this.selectedItem = null;
  }

  clear(table: any) {
    table.clear();
  }
}
