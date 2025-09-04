import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { MasterCodeService } from '../../services/mastercode.service';
import { MasterTypeService } from '../../services/mastertype.service';
import { MasterLocationService } from '../../services/master-location.service';
import { TariffService, Tariff } from '../../services/tariff.service';
import { MasterUOMService, MasterUOM } from '../../services/master-uom.service';
import { ContainerCodeService } from '@/services/containercode.service';
import { MasterItemService } from '@/services/master-item.service';
import { CurrencyCodeService } from '@/services/currencycode.service';
import { forkJoin, Subscription } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { VendorService } from '@/services/vendor.service';
import { ContextService } from '../../services/context.service';
import { CurrencyCodeComponent } from './currencycode';
import { ContainerCodeComponent } from './containercode';
import { VendorComponent } from './vendor';
import { MasterUOMComponent } from './masteruom';
import { ConfigService } from '../../services/config.service';
import { BasisService } from '@/services/basis.service';
import { BasisComponent } from './basis';
import { CompanyManagementComponent } from '../setup/Company/company_management';
import { CompanyService } from '@/services/company.service';
import { DepartmentService } from '@/services/department.service';
import { ServiceTypeService } from '@/services/servicetype.service';
import { MappingService } from '@/services/mapping.service';
import { NumberSeriesService } from '@/services/number-series.service';
import { NumberSeriesRelationService } from '@/services/number-series-relation.service';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-tariff',
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
    DialogModule,
    CalendarModule,
    CurrencyCodeComponent,
    ContainerCodeComponent,
    CheckboxModule,
    VendorComponent,
    MasterUOMComponent,
    BasisComponent
  ],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Tariff Master</div>

      <p-table
        #dt
        [value]="tariffs"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['code','vendorType', 'mode', 'shippingType', 'cargoType','tariffType','unitOfMeasure','itemName', 'status']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <div class="flex gap-2">
              <button pButton type="button" label="Create Tariff" icon="pi pi-plus" (click)="addRow()"></button>
              <button pButton type="button" label="Import" icon="pi pi-download"  (click)="importData()"></button>
              <button pButton type="button" label="Export" icon="pi pi-upload" (click)="exportData()"></button>
            </div>
            <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
            <span class="ml-auto">
              <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search keyword" class="w-full" />
            </span>
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
                Vendor Type
                <p-columnFilter type="text" field="vendorType" display="menu" placeholder="Search by vendor type"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Mode
                <p-columnFilter type="text" field="mode" display="menu" placeholder="Search by mode"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Shipping Type
                <p-columnFilter type="text" field="shippingType" display="menu" placeholder="Search by shipping type"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Cargo Type
                <p-columnFilter type="text" field="cargoType" display="menu" placeholder="Search by cargo type"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Tariff Type
                <p-columnFilter type="text" field="tariffType" display="menu" placeholder="Search by tariff type"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Unit Of Measure
                <p-columnFilter type="text" field="basis" display="menu" placeholder="Search by unit"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Item Name
                <p-columnFilter type="text" field="itemName" display="menu" placeholder="Search by item"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Status
                <p-columnFilter field="status" matchMode="equals" display="menu">
                  <ng-template #filter let-value let-filter="filterCallback">
                    <p-dropdown
                      [ngModel]="value"
                      [options]="statusOptions"
                      (onChange)="filter($event.value)"
                      placeholder="Any"
                      styleClass="w-full"
                      optionLabel="label"
                      optionValue="value"
                    >
                      <ng-template let-option pTemplate="item">
                        <span class="font-semibold text-sm">{{ option.label }}</span>
                      </ng-template>
                    </p-dropdown>
                  </ng-template>
                </p-columnFilter>
              </div>
            </th>
            <th>Action</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-tariff>
          <tr [ngClass]="{'mandatory-row': tariff.isMandatory, 'expired-row': getTariffStatus(tariff) === 'Expired'}">
            <td>{{ tariff.code }}</td>
            <td>{{ tariff.vendorType }}</td>
            <td>{{ tariff.mode }}</td>
            <td>{{ tariff.shippingType }}</td>
            <td>{{ tariff.cargoType }}</td>
            <td>{{ tariff.tariffType }}</td>
            <td>{{ tariff.basis }}</td>
            <td>{{ tariff.itemName }}</td>
            <td>
              <span [ngClass]="getStatusClass(getTariffStatus(tariff))">
                {{ getTariffStatus(tariff) }}
              </span>
            </td>
            <td>
              <button pButton icon="pi pi-pencil" (click)="editRow(tariff)" class="p-button-sm"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="paginatorleft" let-state>
          Total Tariffs: {{ state.totalRecords }}
        </ng-template>
      </p-table>
    </div>
    
    <!-- Hidden file input for import -->
    <input #fileInput type="file" accept=".csv,.xlsx,.xls" style="display: none" (change)="onFileSelected($event)" />
    
    <p-dialog
      header="{{ selectedTariff?.isNew ? 'Add' : 'Edit' }} Tariff"
      [(visible)]="isDialogVisible"
      [modal]="true"
      [style]="{ width: '1500px' }"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      (onHide)="hideDialog()"
    >
      <ng-template pTemplate="content">
        <div *ngIf="selectedTariff" class="p-fluid form-sections dialog-body-padding">
             <!-- 1. Vendor Information -->
          <h3 class="section-header">1. Vendor Information</h3>
          <div class="grid grid-cols-12 gap-4 mb-6">
          <div class="col-span-12 md:col-span-4">
              <label class="block font-semibold mb-1">Service Type (Shipping Type)</label>
              <p-dropdown [options]="shippingTypeOptions" [(ngModel)]="selectedTariff.shippingType" (ngModelChange)="onFieldChange('shippingType', selectedTariff.shippingType)" [ngClass]="getFieldErrorClass('shippingType')" [ngStyle]="getFieldErrorStyle('shippingType')" placeholder="Select Shipping Type" [filter]="true" filterBy="label" [showClear]="true" class="w-full"></p-dropdown>
              <small *ngIf="fieldErrors['shippingType']" class="p-error">{{ fieldErrors['shippingType'] }}</small>
            </div>
            <div class="col-span-12 md:col-span-4">
              <label class="block font-semibold mb-1">Vendor Type</label>
              <p-dropdown [options]="vendorTypeOptions" [(ngModel)]="selectedTariff.vendorType" (ngModelChange)="onVendorTypeChange()" placeholder="Select Vendor Type" [filter]="true" filterBy="label" [showClear]="true" class="w-full"></p-dropdown>
            </div>
            <div class="col-span-12 md:col-span-4">
              <label class="block font-semibold mb-1">Vendor Name</label>
              <div class="flex gap-2">
                <p-dropdown 
                  [options]="vendorOptions" 
                  [(ngModel)]="selectedTariff.vendorName" 
                  (ngModelChange)="onFieldChange('vendorName', selectedTariff.vendorName)" 
                  [ngClass]="getFieldErrorClass('vendorName')" 
                  [ngStyle]="getFieldErrorStyle('vendorName')" 
                  placeholder="Select Vendor" 
                  optionLabel="label"
                  optionValue="value"
                  [filter]="true"
                  filterBy="label"
                  class="flex-1">
                </p-dropdown>
                <button pButton 
                  [icon]="masterDialogLoading['vendor'] ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-h'" 
                  class="p-button-sm" 
                  [disabled]="masterDialogLoading['vendor']"
                  (click)="openMaster('vendor')"></button>
              </div>
              <small *ngIf="fieldErrors['vendorName']" class="p-error">{{ fieldErrors['vendorName'] }}</small>
            </div>
          </div>
          <!-- 2. General Information -->
          <h3 class="section-header">2. General Information</h3>
          <div class="grid grid-cols-12 gap-4 mb-6">
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Code <span class="text-red-500">*</span></label>
              <input pInputText [(ngModel)]="selectedTariff.code" (ngModelChange)="onFieldChange('code', selectedTariff.code)" [ngClass]="getFieldErrorClass('code')" [ngStyle]="getFieldErrorStyle('code')" [disabled]="!isManualSeries || !selectedTariff.isNew" [placeholder]="isManualSeries ? 'Enter tariff code' : mappedTariffSeriesCode || 'Auto-generated'" class="w-full"/>
              <small *ngIf="fieldErrors['code']" class="p-error">{{ fieldErrors['code'] }}</small>
            </div>
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Department (Mode) <span class="text-red-500">*</span></label>
              <p-dropdown [options]="modeOptions" [(ngModel)]="selectedTariff.mode" (ngModelChange)="onFieldChange('mode', selectedTariff.mode)" [ngClass]="getFieldErrorClass('mode')" [ngStyle]="getFieldErrorStyle('mode')" placeholder="Select Mode" [filter]="true" filterBy="label" [showClear]="true" class="w-full"></p-dropdown>
              <small *ngIf="fieldErrors['mode']" class="p-error">{{ fieldErrors['mode'] }}</small>
            </div>
            
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Cargo Type</label>
              <p-dropdown [options]="cargoTypeOptions" [(ngModel)]="selectedTariff.cargoType" (ngModelChange)="onFieldChange('cargoType', selectedTariff.cargoType)" [ngClass]="getFieldErrorClass('cargoType')" [ngStyle]="getFieldErrorStyle('cargoType')" placeholder="Select Cargo Type" [filter]="true" filterBy="label" [showClear]="true" class="w-full"></p-dropdown>
              <small *ngIf="fieldErrors['cargoType']" class="p-error">{{ fieldErrors['cargoType'] }}</small>
            </div>
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Tariff Type</label>
              <p-dropdown [options]="tariffTypeOptions" [(ngModel)]="selectedTariff.tariffType" (ngModelChange)="onFieldChange('tariffType', selectedTariff.tariffType)" [ngClass]="getFieldErrorClass('tariffType')" [ngStyle]="getFieldErrorStyle('tariffType')" placeholder="Select Tariff Type" [filter]="true" filterBy="label" [showClear]="true" class="w-full"></p-dropdown>
              <small *ngIf="fieldErrors['tariffType']" class="p-error">{{ fieldErrors['tariffType'] }}</small>
            </div>
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Container Type</label>
              <div class="flex gap-2">
                <p-dropdown [options]="containerTypeOptions" [(ngModel)]="selectedTariff.containerType" (ngModelChange)="onFieldChange('containerType', selectedTariff.containerType)" [ngClass]="getFieldErrorClass('containerType')" [ngStyle]="getFieldErrorStyle('containerType')" placeholder="Select Container Type" class="flex-1" [filter]="true" filterBy="label" [showClear]="true"></p-dropdown>
                <button pButton 
                  [icon]="masterDialogLoading['containerType'] ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-h'" 
                  class="p-button-sm" 
                  [disabled]="masterDialogLoading['containerType']"
                  (click)="openMaster('containerType')"></button>
              </div>
              <small *ngIf="fieldErrors['containerType']" class="p-error">{{ fieldErrors['containerType'] }}</small>
            </div>
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Item Name</label>
              <p-dropdown [options]="itemNameOptions" [(ngModel)]="selectedTariff.itemName" (ngModelChange)="onFieldChange('itemName', selectedTariff.itemName)" [ngClass]="getFieldErrorClass('itemName')" [ngStyle]="getFieldErrorStyle('itemName')" placeholder="Select Item Name" [filter]="true" filterBy="label" [showClear]="true" class="w-full"></p-dropdown>
              <small *ngIf="fieldErrors['itemName']" class="p-error">{{ fieldErrors['itemName'] }}</small>
            </div>
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Basis</label>
              <div class="flex gap-2">
                <p-dropdown [options]="basisOptions" [(ngModel)]="selectedTariff.basis" (ngModelChange)="onFieldChange('basis', selectedTariff.basis)" [ngClass]="getFieldErrorClass('basis')" [ngStyle]="getFieldErrorStyle('basis')" placeholder="Select Basis" class="flex-1" [filter]="true" filterBy="label" [showClear]="true"></p-dropdown>
                <button pButton 
                  [icon]="masterDialogLoading['basis'] ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-h'" 
                  class="p-button-sm" 
                  [disabled]="masterDialogLoading['basis']"
                  (click)="openMaster('basis')"></button>
              </div>
              <small *ngIf="fieldErrors['basis']" class="p-error">{{ fieldErrors['basis'] }}</small>
            </div>
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Currency</label>
              <div class="flex gap-2">
                <p-dropdown [options]="currencyOptions" [(ngModel)]="selectedTariff.currency" (ngModelChange)="onFieldChange('currency', selectedTariff.currency)" [ngClass]="getFieldErrorClass('currency')" [ngStyle]="getFieldErrorStyle('currency')" placeholder="Select Currency" class="flex-1" [filter]="true" filterBy="label" [showClear]="true"></p-dropdown>
                <button pButton 
                  [icon]="masterDialogLoading['currency'] ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-h'" 
                  class="p-button-sm" 
                  [disabled]="masterDialogLoading['currency']"
                  (click)="openMaster('currency')"></button>
              </div>
              <small *ngIf="fieldErrors['currency']" class="p-error">{{ fieldErrors['currency'] }}</small>
            </div>
          </div>

          <!-- 3. Location Details -->
          <h3 class="section-header">3. Location Details</h3>
          <div class="grid grid-cols-12 gap-4 mb-6">
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Location Type From</label>
              <p-dropdown [options]="locationTypeOptions" [(ngModel)]="selectedTariff.locationTypeFrom" (ngModelChange)="onLocationTypeFromChange()" placeholder="Select Location Type From" [filter]="true" filterBy="label" [showClear]="true" optionLabel="label" optionValue="value" class="w-full"></p-dropdown>
            </div>
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">From</label>
              <p-dropdown appendTo="body" [options]="fromLocationOptions" [(ngModel)]="selectedTariff.from" (ngModelChange)="onFieldChange('from', selectedTariff.from)" [ngClass]="getFieldErrorClass('from')" [ngStyle]="getFieldErrorStyle('from')" placeholder="Select From Location" [filter]="true" filterBy="label" [showClear]="true" class="w-full"></p-dropdown>
              <small *ngIf="fieldErrors['from']" class="p-error">{{ fieldErrors['from'] }}</small>
            </div>
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Location Type To</label>
              <p-dropdown appendTo="body" [options]="locationTypeOptions" [(ngModel)]="selectedTariff.locationTypeTo" (ngModelChange)="onLocationTypeToChange()" placeholder="Select Location Type To" [filter]="true" filterBy="label" [showClear]="true" optionLabel="label" optionValue="value" class="w-full"></p-dropdown>
            </div>
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">To</label>
              <p-dropdown appendTo="body" [options]="toLocationOptions" [(ngModel)]="selectedTariff.to" (ngModelChange)="onFieldChange('to', selectedTariff.to)" [ngClass]="getFieldErrorClass('to')" [ngStyle]="getFieldErrorStyle('to')" placeholder="Select To Location" [filter]="true" filterBy="label" [showClear]="true" class="w-full"></p-dropdown>
              <small *ngIf="fieldErrors['to']" class="p-error">{{ fieldErrors['to'] }}</small>
            </div>
          </div>

       

          <!-- 4. Validity Period -->
          <h3 class="section-header">4. Charges & Validity Period</h3>
          <div class="grid grid-cols-12 gap-4 mb-6">
             <div class="col-span-12 md:col-span-2">
              <label class="block font-semibold mb-1">Charges</label>
              <input pInputText type="number" [(ngModel)]="selectedTariff.charges" (ngModelChange)="onFieldChange('charges', selectedTariff.charges)" [ngClass]="getFieldErrorClass('charges')" [ngStyle]="getFieldErrorStyle('charges')" class="w-full"/>
              <small *ngIf="fieldErrors['charges']" class="p-error">{{ fieldErrors['charges'] }}</small>
            </div>
            <div class="col-span-12 md:col-span-2">
              <label class="block font-semibold mb-1">Freight Charge Type</label>
              <p-dropdown appendTo="body" [options]="freightChargeTypeOptions" [(ngModel)]="selectedTariff.freightChargeType" placeholder="Select Freight Charge Type" [filter]="true" filterBy="label" [showClear]="true" class="w-full"></p-dropdown>
            </div>
           
            <div class="col-span-12 md:col-span-2">
              <label class="block font-semibold mb-1">Effective Date</label>
              <p-calendar [(ngModel)]="selectedTariff.effectiveDate" dateFormat="dd-mm-yy" showIcon="true" appendTo="body" class="w-full"></p-calendar>
            </div>
            <div class="col-span-12 md:col-span-2">
              <label class="block font-semibold mb-1">Period Start Date</label>
              <p-calendar [(ngModel)]="selectedTariff.periodStartDate" dateFormat="dd-mm-yy" showIcon="true" appendTo="body" class="w-full"></p-calendar>
            </div>
            <div class="col-span-12 md:col-span-2">
              <label class="block font-semibold mb-1">Period End Date</label>
              <p-calendar [(ngModel)]="selectedTariff.periodEndDate" dateFormat="dd-mm-yy" showIcon="true" appendTo="body" class="w-full"></p-calendar>
            </div>
            <div class="col-span-12 md:col-span-2 flex items-center">
            <p-checkbox 
                [(ngModel)]="selectedTariff.isMandatory" 
                binary="true" 
                inputId="mandatory">
            </p-checkbox>   
            <label for="mandatory" class="font-semibold">Mandatory</label>
          </div>
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2 px-3 pb-2">
          <button pButton label="Cancel" icon="pi pi-times" class="p-button-outlined p-button-secondary" (click)="hideDialog()"></button>
          <button pButton label="{{ selectedTariff?.isNew ? 'Add' : 'Update' }}" icon="pi pi-check" (click)="saveRow()" [disabled]="!isFormValid"></button>
        </div>
      </ng-template>
    </p-dialog>
    
    <!-- Currency Code Dialog -->
    <p-dialog
      header="Currency Code Master"
      [(visible)]="showCurrencyDialog"
      [modal]="true"
      [style]="{ width: '900px' }"
      [baseZIndex]="10000"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterDialog('currency')"
    >
      <ng-template pTemplate="content">
        <currency-code></currency-code>
      </ng-template>
    </p-dialog>

    <!-- Container Code Dialog -->
    <p-dialog
      header="Container Code Master"
      [(visible)]="showContainerDialog"
      [modal]="true"
      [style]="{ width: '900px' }"
      [baseZIndex]="10000"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterDialog('container')"
    >
      <ng-template pTemplate="content">
        <container-code></container-code>
      </ng-template>
    </p-dialog>
     
    <!-- Vendor Master Dialog -->
    <p-dialog
      header="Vendor Master"
      [(visible)]="showVendorDialog"
      [modal]="true"
      [style]="{ width: '1200px' }"
      [baseZIndex]="10000"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterDialog('vendor')"
    >
      <ng-template pTemplate="content">
        <vendor-master></vendor-master>
      </ng-template>
    </p-dialog>
    
    <!-- Basis Dialog -->
    <p-dialog
      header="Basis Code Master"
      [(visible)]="showBasisDialog"
      [modal]="true"
      [style]="{ width: '900px' }"
      [baseZIndex]="10000"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterDialog('basis')"
    >
      <ng-template pTemplate="content">
        <basis-code></basis-code>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .form-sections {
      padding: 1.5rem;
    }

    .section-header {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .text-red-500 {
      color: #ef4444;
    }

    .p-error {
      margin-top: 0.25rem;
      font-size: 0.875rem;
      color: #dc2626;
    }

    .dialog-body-padding {
      padding: 0;
    }

    .p-button-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }

    .mandatory-row {
      background-color: #fef3c7 !important;
    }

    .mandatory-row:hover {
      background-color: #fde68a !important;
    }

 

    .status-expired {
      color: #dc2626;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      background-color: #fee2e2;
    }

    .status-active {
      color: #059669;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      background-color: #d1fae5;
    }

    .status-default {
      color: #6b7280;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      background-color: #f3f4f6;
    }
  `]
})
export class TariffComponent implements OnInit, OnDestroy {
  private contextSubscription: Subscription | undefined;
  tariffs: any[] = [];

  statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Expired', value: 'Expired' }
  ];

getTariffStatus(tariff: { periodEndDate?: string | Date }): string {
  if (!tariff.periodEndDate) {
    return 'Active';
  }

  // Current time in UTC
  const nowUtc = new Date();

  // End date in UTC
  const endDateUtc = new Date(tariff.periodEndDate);

  // Set end date to the end of the day in UTC (23:59:59.999)
  endDateUtc.setUTCHours(23, 59, 59, 999);

  // Compare timestamps (milliseconds since epoch)
  if (nowUtc.getTime() > endDateUtc.getTime()) {
    return 'Expired';
  }

  return 'Active';
}

  getStatusClass(status: string): string {
    switch (status) {
      case 'Expired':
        return 'status-expired';
      case 'Active':
        return 'status-active';
      default:
        return 'status-default';
    }
  }
  modeOptions: any[] = [];
  shippingTypeOptions: any[] = [];
  cargoTypeOptions: any[] = [];
  tariffTypeOptions: any[] = [];
  basisOptions: any[] = [];
  containerTypeOptions: any[] = [];
  itemNameOptions: any[] = [];
  currencyOptions: any[] = [];
  locationOptions: any[] = [];
  locationTypeOptions: any[] = [];  // New property
  fromLocationOptions: any[] = [];  // New property
  toLocationOptions: any[] = [];    // New property
  allLocations: any[] = [];         // New property to store all locations
  containerCodeOptions: any[] = [];
  currencyCodeOptions: any[] = [];
  itemCodeOptions: any[] = [];
  uomOptions: any[]=[];
  
  // Number series properties
  isManualSeries: boolean = false;
  mappedTariffSeriesCode: string = '';
  
  vendorTypeOptions: any[] = [];
  vendorOptions: any[] = [];
  allVendors: any[] = []; // Add this property to store all vendors
  freightChargeTypeOptions = [
    { label: 'Default', value: 'Default' },
    { label: 'Sell Freight Rate', value: 'Sell Freight Rate' },
    { label: 'Buy Freight Rate', value: 'Buy Freight Rate' }
  ];
  isDialogVisible = false;
  selectedTariff: any = null;
  originalTariffData: any = null; // Backup of original data for cancel functionality
  showCurrencyDialog = false;
  showContainerDialog = false;
  showVendorDialog = false;
  showBasisDialog = false;
  masterDialogLoading: { [key: string]: boolean } = {};
    mandatoryOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];
// ... existing code ...


  // Field validation states
  fieldErrors: { [key: string]: string } = {};
  isFormValid = false;

  constructor(
    private messageService: MessageService,
    private masterCodeService: MasterCodeService,
    private masterTypeService: MasterTypeService,
    private masterLocationService: MasterLocationService,
    private tariffService: TariffService,
    private masterUOMService: MasterUOMService,
    private containerCodeService: ContainerCodeService,
    private masterItemService: MasterItemService,
    private currencyCodeService: CurrencyCodeService,
    private vendorService: VendorService,
    private configService: ConfigService,
    private contextService: ContextService,
    private basisService: BasisService,
    private departmentService: DepartmentService,
    private serviceTypeService: ServiceTypeService,
    private mappingService: MappingService,
    private numberSeriesService: NumberSeriesService,
    private numberSeriesRelationService: NumberSeriesRelationService,
    private cdr: ChangeDetectorRef
  ) {}

  // Validation methods
  validateField(fieldName: string, value: any): string {
    switch (fieldName) {
      case 'code':
        // Skip validation if auto-generation is enabled (not manual series)
        if (!this.isManualSeries) {
          return '';
        }
        if (!value || value.toString().trim() === '') {
          return 'Code is required';
        }
        if (this.selectedTariff?.isNew && this.isCodeDuplicate(value)) {
          return 'Code already exists';
        }
        break;
      case 'mode':
        if (!value) {
          return 'Mode is required';
        }
        break;
      // All other fields are now optional - no validation required
      case 'shippingType':
      case 'cargoType':
      case 'tariffType':
      case 'basis':
      case 'containerType':
      case 'itemName':
      case 'currency':
      case 'from':
      case 'to':
      case 'partyType':
      case 'partyName':
      case 'charges':
        // These fields are optional - no validation needed
        break;
    }
    return '';
  }

  onFieldChange(fieldName: string, value: any) {
    const error = this.validateField(fieldName, value);
    if (error) {
      this.fieldErrors[fieldName] = error;
    } else {
      delete this.fieldErrors[fieldName];
    }
    this.updateFormValidity();
  }
    onLocationTypeFromChange() {
    // Clear the from location when location type changes
    if (this.selectedTariff) {
      this.selectedTariff.from = '';
      this.fieldErrors['from'] = '';
      
      // Filter from locations based on selected location type
      this.filterFromLocations();
    }
  }

  onLocationTypeToChange() {
    // Clear the to location when location type changes
    if (this.selectedTariff) {
      this.selectedTariff.to = '';
      this.fieldErrors['to'] = '';
      
      // Filter to locations based on selected location type
      this.filterToLocations();
    }
  }

  filterFromLocations() {
    console.log('Filtering from locations for type:', this.selectedTariff?.locationTypeFrom);
    console.log('All locations:', this.allLocations.length);
    
    if (this.selectedTariff?.locationTypeFrom) {
      // Debug: Log all location types to see what's available
      const availableTypes = [...new Set(this.allLocations.map(l => l.type))];
      console.log('Available location types in data:', availableTypes);
      
      const filteredLocations = this.allLocations.filter(l => {
        console.log(`Comparing location type '${l.type}' with selected '${this.selectedTariff.locationTypeFrom}'`);
        return l.type === this.selectedTariff.locationTypeFrom;
      });
      console.log('Filtered from locations:', filteredLocations.length);
      
      // If no exact match, try case-insensitive comparison
      if (filteredLocations.length === 0) {
        const caseInsensitiveFiltered = this.allLocations.filter(l => 
          l.type?.toLowerCase() === this.selectedTariff.locationTypeFrom?.toLowerCase()
        );
        console.log('Case-insensitive filtered locations:', caseInsensitiveFiltered.length);
        
        this.fromLocationOptions = caseInsensitiveFiltered.map(l => ({
          label: `${l.code} - ${l.name}`,
          value: l.code
        }));
      } else {
        this.fromLocationOptions = filteredLocations.map(l => ({
          label: `${l.code} - ${l.name}`,
          value: l.code
        }));
      }
    } else {
      // If no location type selected, show all locations formatted as CODE - NAME
      this.fromLocationOptions = this.allLocations.map(l => ({
        label: `${l.code} - ${l.name}`,
        value: l.code
      }));
    }
    console.log('From location options:', this.fromLocationOptions.length);
  }

  filterToLocations() {
    console.log('Filtering to locations for type:', this.selectedTariff?.locationTypeTo);
    console.log('All locations:', this.allLocations.length);
    
    if (this.selectedTariff?.locationTypeTo) {
      // Debug: Log all location types to see what's available
      const availableTypes = [...new Set(this.allLocations.map(l => l.type))];
      console.log('Available location types in data:', availableTypes);
      
      const filteredLocations = this.allLocations.filter(l => {
        console.log(`Comparing location type '${l.type}' with selected '${this.selectedTariff.locationTypeTo}'`);
        return l.type === this.selectedTariff.locationTypeTo;
      });
      console.log('Filtered to locations:', filteredLocations.length);
      
      // If no exact match, try case-insensitive comparison
      if (filteredLocations.length === 0) {
        const caseInsensitiveFiltered = this.allLocations.filter(l => 
          l.type?.toLowerCase() === this.selectedTariff.locationTypeTo?.toLowerCase()
        );
        console.log('Case-insensitive filtered locations:', caseInsensitiveFiltered.length);
        
        this.toLocationOptions = caseInsensitiveFiltered.map(l => ({
          label: `${l.code} - ${l.name}`,
          value: l.code
        }));
      } else {
        this.toLocationOptions = filteredLocations.map(l => ({
          label: `${l.code} - ${l.name}`,
          value: l.code
        }));
      }
    } else {
      // If no location type selected, show all locations formatted as CODE - NAME
      this.toLocationOptions = this.allLocations.map(l => ({
        label: `${l.code} - ${l.name}`,
        value: l.code
      }));
    }
    console.log('To location options:', this.toLocationOptions.length);
  }
  updateFormValidity() {
    // Only code and mode are required fields
    const requiredFields = ['mode'];
    
    // Add code validation only if manual series is enabled and it's a new record
    if (this.isManualSeries && this.selectedTariff?.isNew) {
      requiredFields.push('code');
    }

    this.isFormValid = requiredFields.every(field => {
      const fieldValue = this.selectedTariff?.[field];
      const hasError = this.fieldErrors[field];
      const isEmpty = !fieldValue || fieldValue.toString().trim() === '';
      
     
      
      return !hasError && !isEmpty;
    });
    
     }

  isCodeDuplicate(code: string): boolean {
    if (!this.selectedTariff?.isNew) return false;
    const codeValue = code.trim().toLowerCase();
    return this.tariffs.some(t => 
      (t.code || '').trim().toLowerCase() === codeValue
    );
  }

  getFieldErrorClass(fieldName: string): string {
    return this.fieldErrors[fieldName] ? 'p-invalid' : '';
  }

  getFieldErrorStyle(fieldName: string): { [key: string]: string } {
    return this.fieldErrors[fieldName] ? { 'border-color': '#f44336' } : {};
  }

  ngOnInit() {
    console.log('TariffComponent ngOnInit - Initial load');
    // Load data immediately
    this.loadAllData();
    this.loadMappedTariffSeriesCode();

    // Subscribe to context changes to reload data
    this.contextSubscription = this.contextService.context$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((context) => {
      console.log('🔄 Context changed in TariffComponent:', {
        previous: this.contextService.getContext(),
        new: context,
        timestamp: new Date().toISOString()
      });
      
      // Increased delay to ensure context is fully propagated
      setTimeout(() => {
        console.log('⏰ Starting data reload after context change...');
        const currentContext = this.contextService.getContext();
        console.log('📊 Current context during reload:', currentContext);
        
        this.loadAllData();
        this.loadMappedTariffSeriesCode();
        
        // Force change detection to update the UI
        this.cdr.detectChanges();
        console.log('✅ Data reload and change detection completed');
      }, 500); // Increased from 100ms to 500ms
    });
  }

  ngOnDestroy() {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }
  }

  private loadAllData() {
    console.log('Loading all tariff master data...');
    forkJoin({
      modes: this.loadModeOptions(),
      shippingTypes: this.loadShippingTypeOptions(),
      cargoTypes: this.loadCargoTypeOptions(),
      tariffTypes: this.loadTariffTypeOptions(),
      locations: this.loadLocationOptions(),
      locationTypes: this.loadLocationTypeOptions(),
      basis: this.loadBasisOptions(),
      containers: this.loadContainersOptions(),
      currencies: this.loadCurrencyOptions(),
      items: this.loadItemOptions(),
      vendorTypes: this.loadVendorTypeOptions(),
      vendors: this.loadVendorOptions()
    }).subscribe({
      next: () => {
        console.log('All master data loaded, now loading tariff list...');
        this.refreshList();
        this.loadMappedTariffSeriesCode();
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load master data' });
      }
    });
  }

  // Updated method to load unique department names (mode options) with case-insensitive deduplication
  loadModeOptions() {
    const context = this.contextService.getContext();
    
    // Use context-aware method instead of getAll()
    const departmentObservable = context.branchCode 
      ? this.departmentService.getByBranch(context.branchCode)
      : this.departmentService.getAll();
    
    return departmentObservable.pipe(
      tap((departments: any[]) => {
        console.log('Departments loaded for context:', context, departments);
        
        // Get unique department names with case-insensitive deduplication
        const uniqueNames = new Map<string, string>();
        (departments || [])
          .filter(d => !d.status || d.status === 'Active' || d.status === 'active' || d.status === '' || d.status === null)
          .forEach(d => {
            if (d.name && d.name.trim()) {
              const lowerName = d.name.trim().toLowerCase();
              if (!uniqueNames.has(lowerName)) {
                uniqueNames.set(lowerName, d.name.trim());
              }
            }
          });
        
        this.modeOptions = Array.from(uniqueNames.values())
          .map(name => ({ label: name, value: name }))
          .sort((a, b) => a.label.localeCompare(b.label));
        
        console.log('Mode options:', this.modeOptions);
      })
    );
  }

  // Updated method to load unique service type values with case-insensitive deduplication
  loadShippingTypeOptions() {
    const context = this.contextService.getContext();
    
    // Use context-aware method instead of getAll()
    const serviceTypeObservable = context.departmentCode 
      ? this.serviceTypeService.getByDepartment(context.departmentCode)
      : this.serviceTypeService.getAll();
    
    return serviceTypeObservable.pipe(
      tap((serviceTypes: any[]) => {
        console.log('Service types loaded for context:', context, serviceTypes);
        
        // Get unique service type names with case-insensitive deduplication
        const uniqueNames = new Map<string, string>();
        (serviceTypes || [])
          .filter(st => st.status === 'active')
          .forEach(st => {
            if (st.name && st.name.trim()) {
              const lowerName = st.name.trim().toLowerCase();
              if (!uniqueNames.has(lowerName)) {
                uniqueNames.set(lowerName, st.name.trim());
              }
            }
          });
        
        this.shippingTypeOptions = Array.from(uniqueNames.values())
          .map(name => ({ label: name, value: name }))
          .sort((a, b) => a.label.localeCompare(b.label));
        
        console.log('Shipping type options:', this.shippingTypeOptions);
      })
    );
  }
  loadCargoTypeOptions() {
    return this.masterTypeService.getAll().pipe(
      // @ts-ignore
      tap((types: any[]) => {
      this.cargoTypeOptions = (types || [])
        .filter(t => t.key === 'CARGO_TYPE' && t.status === 'Active')
        .map(t => ({ label: t.value, value: t.value }));
      })
    );
  }
  loadTariffTypeOptions() {
    return this.masterTypeService.getAll().pipe(
      // @ts-ignore
      tap((types: any[]) => {
      this.tariffTypeOptions = (types || [])
        .filter(t => t.key === 'TARIFF_TYPE' && t.status === 'Active')
        .map(t => ({ label: t.value, value: t.value }));
      })
    );
  }
  loadLocationTypeOptions() {
    return this.masterTypeService.getAll().pipe(
      tap((types: any[]) => {
        this.locationTypeOptions = types
          .filter(t => t.key === 'LOCATION' && t.status === 'Active')
          .map(t => ({ label: t.value, value: t.value }));
        
        // Debug: Log the location type options
        console.log('Location type options:', this.locationTypeOptions);
      })
    );
  }

  loadLocationOptions() {
    return this.masterLocationService.getAll().pipe(
      tap((locations: any[]) => {
        this.allLocations = locations.filter(l => l.active);
        console.log('Loaded all locations:', this.allLocations.length);
        
        // Debug: Log the first few locations to see their structure
        if (this.allLocations.length > 0) {
          console.log('Sample location data:', this.allLocations.slice(0, 3));
          console.log('Available location types in data:', [...new Set(this.allLocations.map(l => l.type))]);
        }
        
        // Keep the existing logic for backward compatibility
        const uniqueCities = Array.from(new Set((locations || [])
          .filter(l => l.active && l.city)
          .map(l => l.city.trim())
          .filter(Boolean)));
        this.locationOptions = uniqueCities.map(city => ({ label: city, value: city }));
        
        // Initialize filtered location options with all locations formatted as CODE - NAME
        this.fromLocationOptions = this.allLocations.map(l => ({
          label: `${l.code} - ${l.name}`,
          value: l.code
        }));
        this.toLocationOptions = this.allLocations.map(l => ({
          label: `${l.code} - ${l.name}`,
          value: l.code
        }));
      })
    );
  }
loadBasisOptions() {
    return this.basisService.getBasis().pipe(
      tap((basis: any[]) => {
        this.basisOptions = (basis || [])
          .filter(b => b.status === 'Active')
          .map(b => ({ label: `${b.code} - ${b.description}`, value: b.code }));
      })
    );
  }
  loadContainersOptions() {
    return this.containerCodeService.getContainers().pipe(
      // @ts-ignore
      tap((containerCodes: any[]) => {
      this.containerTypeOptions = (containerCodes || [])
        .filter(c =>c.status==='Active')
        .map(c => ({ label: c.code, value: c.code }));
      })
    );
  }
  loadCurrencyOptions() {
    return this.currencyCodeService.getCurrencies().pipe(
      // @ts-ignore
      tap((currencyCodes: any[]) => {
      this.currencyOptions = (currencyCodes || [])
        .filter(c => c.status === 'Active')
        .map(c => ({ label: c.code, value: c.code }));
      })
    );
  }
  loadItemOptions() {
    return this.masterItemService.getAll().pipe(
      // @ts-ignore
      tap((items: any[]) => {
        this.itemNameOptions = (items || [])
          .filter(i => i.item_type === 'CHARGE' && i.active)
          .map(i => ({ label: `${i.code} - ${i.name}`, value: i.code }));
      })
    );
  }
  
  loadVendorTypeOptions() {
    return this.masterTypeService.getAll().pipe(
      tap((types: any[]) => {
        this.vendorTypeOptions = (types || [])
          .filter(t => t.key === 'VENDOR' && t.status === 'Active')
          .map(t => ({ label: t.value, value: t.value }));
        console.log('Vendor type options loaded:', this.vendorTypeOptions);
      })
    );
  }

  loadVendorOptions() {
    return this.vendorService.getAll().pipe(
      tap((vendors: any[]) => {
        // Store all vendors for filtering
        this.allVendors = vendors || [];
        
        // Initially show all vendors
        this.vendorOptions = this.allVendors
          .map(v => ({
            label: `${v.vendor_no} - ${v.name2}`,
            value: v.vendor_no,
            vendorType: v.type // Include vendor type for filtering
          }));
      })
    );
  }

  // Helper to map code to label for table display
  getLabel(options: any[], value: string): string {
    const found = options.find(opt => opt.value === value);
    return found ? found.label : value;
  }

  refreshList() {
    const context = this.contextService.getContext();
    console.log('🔄 Refreshing tariff list with context:', context);
    
    this.tariffService.getAll().subscribe({
      next: (data) => {
        console.log('📊 Tariff data loaded successfully:', {
          recordCount: data.length,
          context: context,
          sampleData: data.slice(0, 2) // Show first 2 records for debugging
        });
        
        this.tariffs = data.map((tariff: any) => {
          const mappedTariff = {
            ...tariff,
            shippingType: tariff.shipping_type,
            cargoType: tariff.cargo_type,
            containerType: tariff.container_type,
            itemName: tariff.item_name,
            from: tariff.from_location,
            to: tariff.to_location,
            vendorType: tariff.vendor_type,
            vendorName: tariff.vendor_name,
            locationTypeFrom: tariff.location_type_from,
            locationTypeTo: tariff.location_type_to,
            tariffType: tariff.tariff_type,
            basis: tariff.basis,
            currency: tariff.currency,
            charges: tariff.charges,
            mode: tariff.mode,
            effectiveDate: tariff.effective_date,
            periodStartDate: tariff.period_start_date,
            periodEndDate: tariff.period_end_date,
            freightChargeType: tariff.freight_charge_type,
            isMandatory: tariff.is_mandatory
          };
          // Add status field to each tariff object
          mappedTariff.status = this.getTariffStatus(mappedTariff);
          return mappedTariff;
        });
        
        console.log('✅ Tariff data processing completed, final count:', this.tariffs.length);
        
        // Force change detection after data update
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error loading tariff data:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load tariff data'
        });
        this.tariffs = [];
      }
    });
  }

  loadMappedTariffSeriesCode() {
    const context = this.contextService.getContext();
    console.log('Loading tariff series code for context:', context);
    
    // Use context-based mapping with NumberSeriesRelation
    this.mappingService.findMappingByContext(
      'tariffCode',
      context.companyCode || '',
      context.branchCode || '',
      context.departmentCode || '',
      context.serviceType || undefined
    ).subscribe({
      next: (contextMapping: any) => {
        console.log('Tariff mapping relation response:', contextMapping);
        this.mappedTariffSeriesCode = contextMapping.mapping;
        if (this.mappedTariffSeriesCode) {
          this.numberSeriesService.getAll().subscribe({
            next: (seriesList: any[]) => {
              const found = seriesList.find((s: any) => s.code === this.mappedTariffSeriesCode);
              this.isManualSeries = !!(found && found.is_manual);
              console.log('Tariff series code mapped:', this.mappedTariffSeriesCode, 'Manual:', this.isManualSeries);
            },
            error: (error: any) => {
              console.error('Error loading number series:', error);
              this.isManualSeries = true;
            }
          });
        } else {
          this.isManualSeries = true;
          console.log('No tariff series code mapping found for context');
        }
      },
      error: (error: any) => {
        console.error('Error loading tariff mapping relation:', error);
        // Fallback to generic mapping if context-based mapping fails
        console.log('Falling back to generic mapping method');
        this.mappingService.getMapping().subscribe({
          next: (mapping: any) => {
            console.log('Fallback mapping response:', mapping);
            this.mappedTariffSeriesCode = mapping.tariffCode || '';
            if (this.mappedTariffSeriesCode) {
              this.numberSeriesService.getAll().subscribe({
                next: (seriesList: any[]) => {
                  const found = seriesList.find((s: any) => s.code === this.mappedTariffSeriesCode);
                  this.isManualSeries = !!(found && found.is_manual);
                  console.log('Tariff series code mapped (fallback):', this.mappedTariffSeriesCode, 'Manual:', this.isManualSeries);
                },
                error: (error: any) => {
                  console.error('Error loading number series (fallback):', error);
                  this.isManualSeries = true; // Default to manual if error
                }
              });
            } else {
              this.isManualSeries = true; // Default to manual if no mapping
            }
          },
          error: (error: any) => {
            console.error('Error loading fallback mapping:', error);
            this.isManualSeries = true; // Default to manual if error
          }
        });
      }
    });
  }

  addRow() {
    console.log('Add Tariff button clicked - starting addRow method');
    
    // Get the validation settings
    const config = this.configService.getConfig();
    const tariffFilter = config?.validation?.tariffFilter || '';
    
    console.log('Tariff filter:', tariffFilter);
    
    // Check if we need to validate context
    if (tariffFilter) {
      // Get the current context
      const context = this.contextService.getContext();
      
      console.log('Current context:', context);
      
      // Check if the required context is set based on the filter
      if (tariffFilter.includes('C') && !context.companyCode) {
        console.log('Company context required but not set');
        this.messageService.add({
          severity: 'warn',
          summary: 'Context Required',
          detail: 'Please select a Company before adding a new tariff.'
        });
        this.contextService.showContextSelector();
        return;
      }
      
      if (tariffFilter.includes('B') && !context.branchCode) {
        console.log('Branch context required but not set');
        this.messageService.add({
          severity: 'warn',
          summary: 'Context Required',
          detail: 'Please select a Branch before adding a new tariff.'
        });
        this.contextService.showContextSelector();
        return;
      }
      
      if (tariffFilter.includes('D') && !context.departmentCode) {
        console.log('Department context required but not set');
        this.messageService.add({
          severity: 'warn',
          summary: 'Context Required',
          detail: 'Please select a Department before adding a new tariff.'
        });
        this.contextService.showContextSelector();
        return;
      }
    }

    console.log('Context validation passed - proceeding with add tariff');
    
    // Existing addRow logic
    this.selectedTariff = {
      code: this.isManualSeries ? '' : (this.mappedTariffSeriesCode || ''),
      mode: '',
      shippingType: '',
      cargoType: '',
      tariffType: '',
      basis: '',
      containerType: '',
      itemName: '',
      currency: '',
      locationTypeFrom: '',
      locationTypeTo: '',
      from: '',
      to: '',
      vendorType: '',
      vendorName: '',
      charges: 0,
      freightChargeType: '',
      effectiveDate: '',
      periodStartDate: '',
      periodEndDate: '',
      isNew: true
    };
    this.isDialogVisible = true;
    this.fieldErrors = {};
    
    // Initialize masterDialogLoading state for ellipsis buttons
    this.masterDialogLoading = {};
    
    // Load mapped tariff series code for automatic generation
    this.loadMappedTariffSeriesCode();
    
    // Force immediate change detection to show dialog quickly
    this.cdr.detectChanges();
    
    // Load options using forkJoin
    forkJoin([
      this.loadModeOptions(),
      this.loadShippingTypeOptions(),
      this.loadCargoTypeOptions(),
      this.loadTariffTypeOptions(),
      this.loadLocationOptions(),
      this.loadBasisOptions(),
      this.loadContainersOptions(),
      this.loadCurrencyOptions(),
      this.loadItemOptions(),
      this.loadVendorTypeOptions(),
      this.loadVendorOptions()
    ]).subscribe(() => {
      this.updateFormValidity();
      this.cdr.detectChanges();
    });
  }

  editRow(tariff: any) {
    console.log('Edit Tariff button clicked - starting editRow method');
    
    // Get the validation settings
    const config = this.configService.getConfig();
    const tariffFilter = config?.validation?.tariffFilter || '';
    
    console.log('Tariff filter:', tariffFilter);
    
    // Check if we need to validate context
    if (tariffFilter) {
      // Get the current context
      const context = this.contextService.getContext();
      
      console.log('Current context:', context);
      
      // Check if the required context is set based on the filter
      if (tariffFilter.includes('C') && !context.companyCode) {
        console.log('Company context required but not set');
        this.messageService.add({
          severity: 'warn',
          summary: 'Context Required',
          detail: 'Please select a Company before editing a tariff.'
        });
        this.contextService.showContextSelector();
        return;
      }
      
      if (tariffFilter.includes('B') && !context.branchCode) {
        console.log('Branch context required but not set');
        this.messageService.add({
          severity: 'warn',
          summary: 'Context Required',
          detail: 'Please select a Branch before editing a tariff.'
        });
        this.contextService.showContextSelector();
        return;
      }
      
      if (tariffFilter.includes('D') && !context.departmentCode) {
        console.log('Department context required but not set');
        this.messageService.add({
          severity: 'warn',
          summary: 'Context Required',
          detail: 'Please select a Department before editing a tariff.'
        });
        this.contextService.showContextSelector();
        return;
      }
    }

    console.log('Context validation passed - proceeding with edit tariff');
    
    // Store original data for cancel functionality
    this.originalTariffData = JSON.parse(JSON.stringify(tariff));
    
    this.selectedTariff = { ...tariff, isNew: false, isEdit: true };
    
    // Convert date strings to Date objects for the calendar components
    if (this.selectedTariff.effectiveDate) {
      this.selectedTariff.effectiveDate = new Date(this.selectedTariff.effectiveDate);
    }
    if (this.selectedTariff.periodStartDate) {
      this.selectedTariff.periodStartDate = new Date(this.selectedTariff.periodStartDate);
    }
    if (this.selectedTariff.periodEndDate) {
      this.selectedTariff.periodEndDate = new Date(this.selectedTariff.periodEndDate);
    }
    
    // Filter locations based on existing location types
    this.filterFromLocations();
    this.filterToLocations();
    
    this.isDialogVisible = true;
    this.fieldErrors = {};
    
    // Initialize masterDialogLoading state for ellipsis buttons
    this.masterDialogLoading = {};
    
    // Force immediate change detection to show dialog quickly
    this.cdr.detectChanges();
    
    // Load all options using forkJoin for consistent performance with addRow
    forkJoin([
      this.loadModeOptions(),
      this.loadShippingTypeOptions(),
      this.loadCargoTypeOptions(),
      this.loadTariffTypeOptions(),
      this.loadLocationOptions(),
      this.loadBasisOptions(),
      this.loadContainersOptions(),
      this.loadCurrencyOptions(),
      this.loadItemOptions(),
      this.loadVendorTypeOptions(),
      this.loadVendorOptions()
    ]).subscribe(() => {
      this.updateFormValidity();
      this.cdr.detectChanges();
    });
  }

  saveRow() {
    if (!this.selectedTariff || !this.isFormValid) return;
    const payload: any = { ...this.selectedTariff };
    
    // Clear original data backup since we're saving changes
    this.originalTariffData = null;

    // For automatic series, ensure code is empty so backend generates it (only for new records)
    if (!this.isManualSeries && this.selectedTariff.isNew) {
      payload.code = '';
    }

    if (this.selectedTariff.isNew) {
      this.tariffService.create(payload).subscribe({
        next: (created) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Tariff created' });
          this.refreshList();
          this.hideDialog();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create tariff' });
        }
      });
    } else {
      this.tariffService.update(this.selectedTariff.id, payload).subscribe({
        next: (updated) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Tariff updated' });
          this.refreshList();
          this.hideDialog();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update tariff' });
        },
        complete: () => {
          console.log('Tariff updated successfully');
        }
      });
    }
  }

  hideDialog() {
    // If we were editing and have original data, restore it to the tariffs array
    if (this.selectedTariff && this.selectedTariff.isEdit && this.originalTariffData) {
      const index = this.tariffs.findIndex(t => t.id === this.originalTariffData.id);
      if (index !== -1) {
        this.tariffs[index] = { ...this.originalTariffData };
      }
    }
    
    this.isDialogVisible = false;
    this.selectedTariff = null;
    this.originalTariffData = null;
    // Clear form errors and reset form validity
    this.fieldErrors = {};
    this.isFormValid = false;
    // Force change detection to ensure UI updates
    this.cdr.detectChanges();
  }

  clear(table: any) {
    table.clear();
  }

  onGlobalFilter(table: any, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }

  onVendorTypeChange() {
    if (!this.selectedTariff.vendorType) {
      this.vendorOptions = this.allVendors
        .map(v => ({
          label: `${v.vendor_no} - ${v.name2 || v.name}`, // Use alias (name2) first, fallback to name
          value: v.vendor_no,
          vendorType: v.type
        }));
    } else {
      // Filter vendors by selected type
      this.vendorOptions = this.allVendors
        .filter(v => v.type === this.selectedTariff.vendorType)
        .map(v => ({
          label: `${v.vendor_no} - ${v.name2 || v.name}`, // Use alias (name2) first, fallback to name
          value: v.vendor_no,
          vendorType: v.type
        }));
    }
    
    // Clear vendor selection if current vendor doesn't match the selected type
    if (this.selectedTariff.vendorName) {
      const currentVendor = this.allVendors.find(v => v.vendor_no === this.selectedTariff.vendorName);
      if (currentVendor && currentVendor.type !== this.selectedTariff.vendorType) {
        this.selectedTariff.vendorName = null;
      }
    }
  }
  
  openMaster(type: string) {
    // Prevent multiple clicks and show loading state
    if (this.masterDialogLoading[type]) {
      return;
    }
    
    this.masterDialogLoading[type] = true;
    
    // Open dialog immediately for better user experience
    if (type === 'currency') {
      this.showCurrencyDialog = true;
    } else if (type === 'containerType') {
      this.showContainerDialog = true;
    } else if (type === 'vendor') {
      this.showVendorDialog = true;
    } else if (type === 'basis') {
      this.showBasisDialog = true;
    } else {
      this.messageService.add({ severity: 'info', summary: 'Open Master', detail: `Open ${type} master page` });
    }
    
    // Reset loading state immediately since dialog is now open
    this.masterDialogLoading[type] = false;
    this.cdr.detectChanges();
  }

  closeMasterDialog(type: string) {
    console.log(`Closing master dialog: ${type}`);
    
    // Reset the appropriate dialog visibility
    switch (type) {
      case 'currency':
        this.showCurrencyDialog = false;
        break;
      case 'container':
        this.showContainerDialog = false;
        break;
      case 'vendor':
        this.showVendorDialog = false;
        break;
      case 'basis':
        this.showBasisDialog = false;
        break;
      default:
        console.warn(`Unknown master dialog type: ${type}`);
    }
    
    // Reset loading state if it exists
    if (this.masterDialogLoading[type]) {
      this.masterDialogLoading[type] = false;
    }
    
    // Force change detection to ensure UI updates
    this.cdr.detectChanges();
  }

  importData() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      this.processCsvData(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      this.processExcelData(file);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid File',
        detail: 'Please select a CSV or Excel file'
      });
    }

    // Reset file input
    event.target.value = '';
  }

  processCsvData(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          data.push(row);
        }
      }
      
      this.processImportedData(data);
    };
    reader.readAsText(file);
  }

  processExcelData(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Empty File',
          detail: 'The selected file is empty'
        });
        return;
      }
      
      const headers = jsonData[0] as string[];
      const processedData = [];
      
      for (let i = 1; i < jsonData.length; i++) {
        const row: any = {};
        const values = jsonData[i] as any[];
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        processedData.push(row);
      }
      
      this.processImportedData(processedData);
    };
    reader.readAsArrayBuffer(file);
  }

  processImportedData(data: any[]) {
    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    let validationErrorCount = 0;
    let otherErrorCount = 0;
    
    data.forEach((row, index) => {
      try {
        // Map imported data to tariff object - let backend handle code generation
        const tariff: any = {
          // Only include code if it's provided in the import file for manual series
          // Backend will determine if series is manual/default and handle accordingly
          ...(row['code'] || row['Code'] ? { code: row['code'] || row['Code'] } : {}),
          mode: row['mode'] || row['Mode'] || '',
          shippingType: row['shippingType'] || row['Shipping Type'] || '',
          cargoType: row['cargoType'] || row['Cargo Type'] || '',
          tariffType: row['tariffType'] || row['Tariff Type'] || '',
          basis: row['basis'] || row['Basis'] || '',
          containerType: row['containerType'] || row['Container Type'] || '',
          itemName: row['itemName'] || row['Item Name'] || '',
          currency: row['currency'] || row['Currency'] || '',
          locationTypeFrom: row['locationTypeFrom'] || row['Location Type From'] || '',
          from: row['from'] || row['From'] || '',
          locationTypeTo: row['locationTypeTo'] || row['Location Type To'] || '',
          to: row['to'] || row['To'] || '',
          vendorType: row['vendorType'] || row['Vendor Type'] || '',
          vendorName: row['vendorName'] || row['Vendor Name'] || '',
          effectiveDate: row['effectiveDate'] || row['Effective Date'] || null,
          periodStartDate: row['periodStartDate'] || row['Period Start Date'] || null,
          periodEndDate: row['periodEndDate'] || row['Period End Date'] || null,
          charges: row['charges'] || row['Charges'] || 0,
          freightChargeType: row['freightChargeType'] || row['Freight Charge Type'] || '',
          isMandatory: row['isMandatory'] || row['Mandatory'] === 'Yes' || row['Mandatory'] === true || false
        };
        
        // Validate required fields
        if (!tariff.mode) {
          throw new Error(`Row ${index + 2}: Mode is required`);
        }
        
        // Create the tariff - backend will handle:
        // 1. Context-based mapping lookup
        // 2. Number series relation checking
        // 3. Automatic vs manual series determination
        // 4. Code generation and relation updates
        this.tariffService.create(tariff).subscribe({
          next: () => {
            successCount++;
            if (successCount + errorCount === data.length) {
              this.showImportResults(successCount, errorCount, duplicateCount, validationErrorCount, otherErrorCount);
              this.refreshList();
            }
          },
          error: (error) => {
            console.error(`Error importing row ${index + 2}:`, error);
            errorCount++;
            
            // Categorize the error type
            if (error.error && error.error.error === 'Duplicate tariff found') {
              duplicateCount++;
            } else if (error.status === 400) {
              validationErrorCount++;
            } else {
              otherErrorCount++;
            }
            
            if (successCount + errorCount === data.length) {
              this.showImportResults(successCount, errorCount, duplicateCount, validationErrorCount, otherErrorCount);
              this.refreshList();
            }
          }
        });
      } catch (error) {
        console.error(`Error processing row ${index + 2}:`, error);
        errorCount++;
        validationErrorCount++;
        if (successCount + errorCount === data.length) {
          this.showImportResults(successCount, errorCount, duplicateCount, validationErrorCount, otherErrorCount);
          this.refreshList();
        }
      }
    });
  }

  showImportResults(successCount: number, errorCount: number, duplicateCount: number = 0, validationErrorCount: number = 0, otherErrorCount: number = 0) {
    if (errorCount === 0) {
      this.messageService.add({
        severity: 'success',
        summary: 'Import Successful',
        detail: `Successfully imported ${successCount} tariff(s)`
      });
    } else {
      let errorDetails = [];
      
      if (duplicateCount > 0) {
        errorDetails.push(`${duplicateCount} duplicate record(s)`);
      }
      if (validationErrorCount > 0) {
        errorDetails.push(`${validationErrorCount} validation error(s)`);
      }
      if (otherErrorCount > 0) {
        errorDetails.push(`${otherErrorCount} other error(s)`);
      }
      
      const detailMessage = successCount > 0 
        ? `Imported ${successCount} tariff(s). Failed: ${errorDetails.join(', ')}`
        : `Import failed: ${errorDetails.join(', ')}`;
      
      this.messageService.add({
        severity: 'warn',
        summary: 'Import Completed with Errors',
        detail: detailMessage
      });
    }
  }

  exportData() {
    if (this.tariffs.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Data',
        detail: 'No tariffs to export'
      });
      return;
    }

    // Prepare data for export (excluding code field)
    const exportData = this.tariffs.map(tariff => ({
      'Mode': tariff.mode || '',
      'Shipping Type': tariff.shippingType || '',
      'Cargo Type': tariff.cargoType || '',
      'Tariff Type': tariff.tariffType || '',
      'Basis': tariff.basis || '',
      'Container Type': tariff.containerType || '',
      'Item Name': tariff.itemName || '',
      'Currency': tariff.currency || '',
      'Location Type From': tariff.locationTypeFrom || '',
      'From': tariff.from || '',
      'Location Type To': tariff.locationTypeTo || '',
      'To': tariff.to || '',
      'Vendor Type': tariff.vendorType || '',
      'Vendor Name': tariff.vendorName || '',
      'Effective Date': tariff.effectiveDate || '',
      'Period Start Date': tariff.periodStartDate || '',
      'Period End Date': tariff.periodEndDate || '',
      'Charges': tariff.charges || 0,
      'Freight Charge Type': tariff.freightChargeType || '',
      'Mandatory': tariff.isMandatory ? 'Yes' : 'No'
    }));

    this.exportToCsv(exportData, 'tariffs');
  }

  exportToCsv(data: any[], filename: string) {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Export Successful',
        detail: `Exported ${data.length} tariff(s) to CSV`
      });
    }
  }
}
