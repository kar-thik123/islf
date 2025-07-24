import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CurrencyCodeService } from '../../services/currencycode.service';

@Component({
  selector: 'currency-code',
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
      <div class="font-semibold text-xl mb-4">Currency Code</div>
      <p-table
        #dt
        [value]="currencies"
        dataKey="code"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['code', 'description', 'status']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add Currency" icon="pi pi-plus" class="p-button" (click)="addRow()"></button>
            <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search keyword" class="ml-auto" />
          </div>
        </ng-template>
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
        <ng-template pTemplate="body" let-currency let-rowIndex="rowIndex">
          <tr>
            <td>
              <ng-container *ngIf="currency.isNew; else codeText">
                <input pInputText [(ngModel)]="currency.code" />
              </ng-container>
              <ng-template #codeText>{{ currency.code }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="currency.isNew || currency.isEditing; else descText">
                <input pInputText [(ngModel)]="currency.description" />
              </ng-container>
              <ng-template #descText>{{ currency.description }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="currency.isEditing || currency.isNew; else statusText">
                <p-dropdown
                  [options]="statuses"
                  [(ngModel)]="currency.status"
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
                    'text-green-700 bg-green-100': currency.status === 'Active',
                    'text-red-700 bg-red-100': currency.status === 'Inactive',
                  }"
                >
                  {{ currency.status }}
                </span>
              </ng-template>
            </td>
            <td>
              <div class="flex items-center space-x-[8px]">
                <button
                  pButton
                  icon="pi pi-pencil"
                  class="p-button-sm"
                  (click)="editRow(currency)"
                  title="Edit"
                  *ngIf="!currency.isEditing && !currency.isNew"
                ></button>
                <button
                  pButton
                  icon="pi pi-check"
                  class="p-button-sm"
                  (click)="saveRow(currency)"
                  title="Save"
                  *ngIf="currency.isEditing || currency.isNew"
                ></button>
                <button
                  *ngIf="currency.isNew"
                  pButton
                  icon="pi pi-trash"
                  class="p-button-sm"
                  severity="danger"
                  (click)="deleteRow(currency)"
                  title="Delete"
                ></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="paginatorleft" let-state>
          <div class="text-sm text-gray-600">
            Total Currencies: {{ state.totalRecords }}
          </div>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [],
})
export class CurrencyCodeComponent implements OnInit {
  currencies: any[] = [];
  statuses = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  constructor(
    private currencyService: CurrencyCodeService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    this.currencyService.getCurrencies().subscribe((res: any) => {
      this.currencies = (res || []).map((item: any) => ({
        ...item,
        isEditing: false,
        isNew: false
      }));
    });
  }

  addRow() {
    const newRow = {
      id: null,
      code: '',
      description: '',
      status: 'Active',
      isEditing: true,
      isNew: true
    };
    this.currencies = [newRow, ...this.currencies];
  }

  saveRow(currency: any) {
    if (currency.isNew) {
      this.currencyService.createCurrency({
        code: currency.code,
        description: currency.description,
        status: currency.status
      }).subscribe({
        next: (res) => {
          Object.assign(currency, res, { isEditing: false, isNew: false });
          this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Currency saved successfully' });
          this.refreshList();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Save failed' });
        }
      });
    } else {
      this.currencyService.updateCurrency(currency.code, {
        description: currency.description,
        status: currency.status
      }).subscribe({
        next: () => {
          currency.isEditing = false;
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Currency updated successfully' });
          this.refreshList();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed' });
        }
      });
    }
  }

  editRow(currency: any) {
    this.currencies.forEach(c => c.isEditing = false);
    currency.isEditing = true;
    currency.isNew = false;
  }

  deleteRow(currency: any) {
    if (currency.code && !currency.isNew) {
      this.currencyService.deleteCurrency(currency.code).subscribe({
        next: () => {
          this.currencies = this.currencies.filter(c => c !== currency);
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Currency deleted' });
          this.refreshList();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' });
        }
      });
    } else {
      this.currencies = this.currencies.filter(c => c !== currency);
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