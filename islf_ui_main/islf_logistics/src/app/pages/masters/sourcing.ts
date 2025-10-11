import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
import { SourceService } from '@/services/sourcing.service';
import { MasterUOMService, MasterUOM } from '../../services/master-uom.service';
import { ContainerCodeService } from '@/services/containercode.service';
import { MasterItemService } from '@/services/master-item.service';
import { CurrencyCodeService } from '@/services/currencycode.service';
import { forkJoin, Subscription, of } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';
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
import { MasterTypeComponent } from './mastertype';
import { MasterLocationComponent } from './masterlocation';
import { MasterItemComponent } from './masteritem';
import { CompanyManagementComponent } from '../setup/Company/company_management';
import { CompanyService } from '@/services/company.service';
import { DepartmentService } from '@/services/department.service';
import { ServiceTypeService } from '@/services/servicetype.service';
import { MappingService } from '@/services/mapping.service';
import { NumberSeriesService } from '@/services/number-series.service';
import { NumberSeriesRelationService } from '@/services/number-series-relation.service';
import { CheckboxModule } from 'primeng/checkbox';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ChargeTypeMasterComponent } from './chargetype';
import { ServiceAreaService } from '@/services/service-area.service';
import { ServiceAreaComponent } from './servicearea';
import { SourceSalesService } from '@/services/source-sales.service';
import { SourceSalesComponent } from './sourceSales';


@Component({
  selector: 'app-sourcing',
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
    BasisComponent,
    MasterTypeComponent,
    MasterLocationComponent,
    MasterItemComponent,
    InputSwitchModule,
    ChargeTypeMasterComponent,
    ServiceAreaComponent,
    SourceSalesComponent
  ],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Sourcing Master</div>

      <p-table
        #dt
        [value]="sources"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
         [globalFilterFields]="['code','vendorName', 'mode', 'shippingType', 'cargoType','tariffType','basis','itemName', 'fromLocation', 'toLocation', 'periodStartDateFormatted', 'periodEndDateFormatted', 'charges', 'amount', 'status']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <div class="flex gap-2">
              <button pButton type="button" label="Add Source" icon="pi pi-plus" (click)="addRow()"></button>
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
                Vendor Name
                <p-columnFilter type="text" field="vendorName" display="menu" placeholder="Search by vendor name"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Department
                <p-columnFilter type="text" field="mode" display="menu" placeholder="Search by department"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Service Type
                <p-columnFilter type="text" field="shippingType" display="menu" placeholder="Search by service type"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Cargo Type
                <p-columnFilter type="text" field="cargoType" display="menu" placeholder="Search by cargo type"></p-columnFilter>
              </div>
            </th>
            <!--<th>
              <div class="flex justify-between items-center">
                Tariff Type
                <p-columnFilter type="text" field="tariffType" display="menu" placeholder="Search by tariff type"></p-columnFilter>
              </div>
            </th> -->
            <th>
              <div class="flex justify-between items-center">
                Basis
                <p-columnFilter type="text" field="basis" display="menu" placeholder="Search by basis"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Charge Name
                <p-columnFilter type="text" field="itemName" display="menu" placeholder="Search by charge name"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                From Location
                <p-columnFilter type="text" field="fromLocation" display="menu" placeholder="Search by from location"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                To Location
                <p-columnFilter type="text" field="toLocation" display="menu" placeholder="Search by to location"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                From Date
                <p-columnFilter type="date" field="periodStartDate" display="menu" placeholder="Search by from date"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                To Date
                <p-columnFilter type="date" field="periodEndDate" display="menu" placeholder="Search by to date"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Charges
                <p-columnFilter type="text" field="charges" display="menu" placeholder="Search by charges"></p-columnFilter>
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
        <ng-template pTemplate="body" let-source>
          <tr [ngClass]="{'mandatory-row': source.isMandatory, 'expired-row': getSourceStatus(source) === 'Expired'}">
            <td>{{ source.code }}</td>
            <td>{{ getVendorName(source.vendorName) }}</td>
            <td>{{ source.mode }}</td>
            <td>{{ source.shippingType }}</td>
            <td>{{ source.cargoType }}</td>
      
            <td>{{ source.basis }}</td>
            <td>{{ source.itemName }}</td>
            <td>{{ getLocationName(source.fromLocation) }}</td>
            <td>{{ getLocationName(source.toLocation) }}</td>
            <td>{{ source.periodStartDate | date:'dd/MM/yyyy' }}</td>
            <td>{{ source.periodEndDate | date:'dd/MM/yyyy' }}</td>
            <td>{{ source.charges || source.amount || '-' }}</td>
            <td>
              <span [ngClass]="getStatusClass(getSourceStatus(source))">
                {{ getSourceStatus(source) }}
              </span>
            </td>
            <td>
              <button pButton icon="pi pi-pencil" (click)="editRow(source)" class="p-button-sm"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="paginatorleft" let-state>
          Total Sources: {{ state.totalRecords }}
        </ng-template>
      </p-table>
    </div>
    
    <!-- Hidden file input for import -->
    <input #fileInput type="file" accept=".csv,.xlsx,.xls" style="display: none" (change)="onFileSelected($event)" />
    
    <p-dialog
    header="{{ selectedTariff?.isNew ? 'Add' : 'Edit' }} Source"
    [(visible)]="isDialogVisible"
    [modal]="true"
    [closable]="true"
    [draggable]="false"
    [resizable]="false"
    [closeOnEscape]="true"
    [style]="{ width: '100%', maxWidth: '1500px', height: 'auto' }"
    [contentStyle]="{ overflow: 'visible' }"
    (onHide)="hideDialog()"
    >
      <ng-template pTemplate="content">
        <div *ngIf="selectedTariff" class="p-fluid form-sections dialog-body-padding">
             <!-- 1. Vendor Information -->
          <h3 class="section-header">1. Vendor Information</h3>
          <div class="grid grid-cols-12 gap-4 mb-6">
          <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Department (Mode) <span class="text-red-500">*</span></label>
              <p-dropdown [options]="modeOptions" [(ngModel)]="selectedTariff.mode" (ngModelChange)="onDeptModeChange()" [ngClass]="getFieldErrorClass('mode')" [ngStyle]="getFieldErrorStyle('mode')" placeholder="Select Mode" [filter]="true" filterBy="label" [showClear]="true" class="w-full"></p-dropdown>
              <small *ngIf="fieldErrors['mode']" class="p-error">{{ fieldErrors['mode'] }}</small>
            </div>
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Service Type (Shipping Type)</label>
              <p-dropdown [options]="shippingTypeOptions" [(ngModel)]="selectedTariff.shippingType" (ngModelChange)="onFieldChange('shippingType', selectedTariff.shippingType)" [ngClass]="getFieldErrorClass('shippingType')" [ngStyle]="getFieldErrorStyle('shippingType')" placeholder="Select Shipping Type" [filter]="true" filterBy="label" [showClear]="true" class="w-full"></p-dropdown>
              <small *ngIf="fieldErrors['shippingType']" class="p-error">{{ fieldErrors['shippingType'] }}</small>
            </div>
              <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Service Area</label>
              <div class="flex gap-2">
                <p-dropdown [options]="serviceAreaOptions" [(ngModel)]="selectedTariff.serviceArea" (ngModelChange)="onFieldChange('serviceArea', selectedTariff.serviceArea)" [ngClass]="getFieldErrorClass('serviceArea')" [ngStyle]="getFieldErrorStyle('serviceArea')" placeholder="Select Service Area" class="flex-1" [filter]="true" filterBy="label" [showClear]="true"></p-dropdown>
                <button pButton 
                  [icon]="masterDialogLoading['serviceArea'] ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-h'" 
                  class="p-button-sm" 
                  [disabled]="masterDialogLoading['serviceArea']"
                  (click)="openMaster('serviceArea')"></button>
              </div>
              <small *ngIf="fieldErrors['serviceArea']" class="p-error">{{ fieldErrors['serviceArea'] }}</small>
            </div>
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Vendor Type</label>
              <div class="flex gap-2">
                <p-dropdown [options]="vendorTypeOptions" [(ngModel)]="selectedTariff.vendorType" (ngModelChange)="onVendorTypeChange()" placeholder="Select Vendor Type" [filter]="true" filterBy="label" [showClear]="true" class="flex-1"></p-dropdown>
                <button pButton 
                  [icon]="masterDialogLoading['vendorType'] ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-h'" 
                  class="p-button-sm" 
                  [disabled]="masterDialogLoading['vendorType']"
                  (click)="openMaster('vendorType')"></button>
              </div>
            </div>
            <div class="col-span-12 md:col-span-3">
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
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Source/Sales Person</label>
              <div class="flex gap-2">
                <p-dropdown 
                  [options]="sourceSalesOptions" 
                  [(ngModel)]="selectedTariff.sourceSalesCode" 
                  (ngModelChange)="onSourceSalesChange()" 
                  [ngClass]="getFieldErrorClass('sourceSalesCode')" 
                  [ngStyle]="getFieldErrorStyle('sourceSalesCode')" 
                  placeholder="Select Source/Sales Person" 
                  optionLabel="label"
                  optionValue="value"
                  [filter]="true"
                  filterBy="label"
                  class="flex-1">
                </p-dropdown>
                <button pButton 
                  [icon]="masterDialogLoading['sourceSales'] ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-h'" 
                  class="p-button-sm" 
                  [disabled]="masterDialogLoading['sourceSales']"
                  (click)="openMaster('sourceSales')"></button>
              </div>
              <small *ngIf="fieldErrors['sourceSalesCode']" class="p-error">{{ fieldErrors['sourceSalesCode'] }}</small>
            </div>
          </div>
          <!-- 2. General Information -->
          <h3 class="section-header">2. General Information</h3>
          <div class="grid grid-cols-12 gap-4 mb-6">
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Code <span class="text-red-500">*</span></label>
              <input pInputText [(ngModel)]="selectedTariff.code" (ngModelChange)="onFieldChange('code', selectedTariff.code)" [ngClass]="getFieldErrorClass('code')" [ngStyle]="getFieldErrorStyle('code')" [disabled]="!isManualSeries || !selectedTariff.isNew" [placeholder]="isManualSeries ? 'Enter source code' : mappedTariffSeriesCode || 'Auto-generated'" class="w-full"/>
              <small *ngIf="fieldErrors['code']" class="p-error">{{ fieldErrors['code'] }}</small>
            </div>
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Cargo Type</label>
              <div class="flex gap-2">
                <p-dropdown [options]="cargoTypeOptions" [(ngModel)]="selectedTariff.cargoType" (ngModelChange)="onFieldChange('cargoType', selectedTariff.cargoType)" [ngClass]="getFieldErrorClass('cargoType')" [ngStyle]="getFieldErrorStyle('cargoType')" placeholder="Select Cargo Type" [filter]="true" filterBy="label" [showClear]="true" class="flex-1"></p-dropdown>
                <button pButton 
                  [icon]="masterDialogLoading['cargoType'] ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-h'" 
                  class="p-button-sm" 
                  [disabled]="masterDialogLoading['cargoType']"
                  (click)="openMaster('cargoType')"></button>
              </div>
              <small *ngIf="fieldErrors['cargoType']" class="p-error">{{ fieldErrors['cargoType'] }}</small>
            </div>
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Charge Name</label>
              <div class="flex gap-2">
                <p-dropdown [options]="itemNameOptions" [(ngModel)]="selectedTariff.itemName" (ngModelChange)="onFieldChange('itemName', selectedTariff.itemName)" [ngClass]="getFieldErrorClass('itemName')" [ngStyle]="getFieldErrorStyle('itemName')" placeholder="Select Item Name" [filter]="true" filterBy="label" [showClear]="true" class="flex-1"></p-dropdown>
                <button pButton 
                  [icon]="masterDialogLoading['itemName'] ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-h'" 
                  class="p-button-sm" 
                  [disabled]="masterDialogLoading['itemName']"
                  (click)="openMaster('itemName')"></button>
              </div>
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
          
          </div>
          
          <!-- 3. Location Details -->
          <h3 class="section-header">3. Location Details</h3>
          <div class="grid grid-cols-12 gap-4 mb-6">
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Location Type From</label>
              <div class="flex gap-2">
                <p-dropdown [options]="locationTypeOptions" [(ngModel)]="selectedTariff.locationTypeFrom" (ngModelChange)="onLocationTypeFromChange()" placeholder="Select Location Type From" [filter]="true" filterBy="label" [showClear]="true" optionLabel="label" optionValue="value" class="flex-1"></p-dropdown>
                <button pButton 
                  [icon]="masterDialogLoading['locationTypeFrom'] ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-h'" 
                  class="p-button-sm" 
                  [disabled]="masterDialogLoading['locationTypeFrom']"
                  (click)="openMaster('locationTypeFrom')"></button>
              </div>
            </div>
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">From</label>
              <div class="flex gap-2">
                <p-dropdown appendTo="body" [options]="fromLocationOptions" [(ngModel)]="selectedTariff.from" (ngModelChange)="onFieldChange('from', selectedTariff.from)" [ngClass]="getFieldErrorClass('from')" [ngStyle]="getFieldErrorStyle('from')" placeholder="Select From Location" [filter]="true" filterBy="label" [showClear]="true" class="flex-1"></p-dropdown>
                <button pButton 
                  [icon]="masterDialogLoading['from'] ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-h'" 
                  class="p-button-sm" 
                  [disabled]="masterDialogLoading['from']"
                  (click)="openMaster('from')"></button>
              </div>
              <small *ngIf="fieldErrors['from']" class="p-error">{{ fieldErrors['from'] }}</small>
            </div>
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Location Type To</label>
              <div class="flex gap-2">
                <p-dropdown appendTo="body" [options]="locationTypeOptions" [(ngModel)]="selectedTariff.locationTypeTo" (ngModelChange)="onLocationTypeToChange()" placeholder="Select Location Type To" [filter]="true" filterBy="label" [showClear]="true" optionLabel="label" optionValue="value" class="flex-1"></p-dropdown>
                <button pButton 
                  [icon]="masterDialogLoading['locationTypeTo'] ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-h'" 
                  class="p-button-sm" 
                  [disabled]="masterDialogLoading['locationTypeTo']"
                  (click)="openMaster('locationTypeTo')"></button>
              </div>
            </div>
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">To</label>
              <div class="flex gap-2">
                <p-dropdown appendTo="body" [options]="toLocationOptions" [(ngModel)]="selectedTariff.to" (ngModelChange)="onFieldChange('to', selectedTariff.to)" [ngClass]="getFieldErrorClass('to')" [ngStyle]="getFieldErrorStyle('to')" placeholder="Select To Location" [filter]="true" filterBy="label" [showClear]="true" class="flex-1"></p-dropdown>
                <button pButton 
                  [icon]="masterDialogLoading['to'] ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-h'" 
                  class="p-button-sm" 
                  [disabled]="masterDialogLoading['to']"
                  (click)="openMaster('to')"></button>
              </div>
              <small *ngIf="fieldErrors['to']" class="p-error">{{ fieldErrors['to'] }}</small>
            </div>
          </div>

       

          <!-- 4. Validity Period -->
          <h3 class="section-header">4. Charges & Validity Period</h3>
          <div class="grid grid-cols-12 gap-4 mb-6">
          <div class="col-span-12 md:col-span-2">
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
             <div class="col-span-12 md:col-span-2">
              <label class="block font-semibold mb-1">Charges</label>
              <input pInputText type="number" [(ngModel)]="selectedTariff.charges" (ngModelChange)="onFieldChange('charges', selectedTariff.charges)" [ngClass]="getFieldErrorClass('charges')" [ngStyle]="getFieldErrorStyle('charges')" class="w-full"/>
              <small *ngIf="fieldErrors['charges']" class="p-error">{{ fieldErrors['charges'] }}</small>
            </div>
           
           <!-- <div class="col-span-12 md:col-span-2">
              <label class="block font-semibold mb-1">Effective Date</label>
              <p-calendar [(ngModel)]="selectedTariff.effectiveDate" dateFormat="dd-mm-yy" showIcon="true" appendTo="body" class="w-full" [showTime]="false" [timeOnly]="false"></p-calendar>
            </div> -->
            <div class="col-span-12 md:col-span-2">
              <label class="block font-semibold mb-1">Period Start Date</label>
              <p-calendar [(ngModel)]="selectedTariff.periodStartDate" dateFormat="dd-mm-yy" showIcon="true" appendTo="body" class="w-full" [showTime]="false" [timeOnly]="false"></p-calendar>
            </div>
            <div class="col-span-12 md:col-span-2">
              <label class="block font-semibold mb-1">Period End Date</label>
              <p-calendar [(ngModel)]="selectedTariff.periodEndDate" dateFormat="dd-mm-yy" showIcon="true" appendTo="body" class="w-full" [showTime]="false" [timeOnly]="false"></p-calendar>
            </div>
            <!--<div class="col-span-12 md:col-span-2 flex items-center mt-8 ml-8">
            <p-inputSwitch 
              [(ngModel)]="selectedTariff.isMandatory" 
              inputId="mandatory">
            </p-inputSwitch>
            <label for="mandatory" class="ml-2 font-semibold">Mandatory</label>
          </div> -->

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
    
    
     
    <!-- Vendor Master Dialog -->
    <p-dialog
      header="Vendor Master"
      [(visible)]="showVendorDialog"
      [modal]="true"
      [style]="{ width: 'auto', minWidth: '60vw', maxWidth: '95vw', height: 'auto', maxHeight: '90vh' }"
      [contentStyle]="{ overflow: 'visible' }"
      [baseZIndex]="10000"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterDialog('vendor')"
      [closeOnEscape]="true"
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
      [style]="{ width: 'auto', minWidth: '60vw', maxWidth: '95vw', height: 'auto', maxHeight: '90vh' }"
      [contentStyle]="{ overflow: 'visible' }"
      [baseZIndex]="10000"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterDialog('basis')"
      [closeOnEscape]="true"
    >
      <ng-template pTemplate="content">
        <basis-code></basis-code>
      </ng-template>
    </p-dialog>
      <!-- Currency Code Dialog -->
    <p-dialog
      header="Currency Code Master"
      [(visible)]="showCurrencyDialog"
      [modal]="true"
      [style]="{ width: 'auto', minWidth: '60vw', maxWidth: '95vw', height: 'auto', maxHeight: '90vh' }"
      [contentStyle]="{ overflow: 'visible' }"
      [baseZIndex]="10000"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterDialog('currency')"
      [closeOnEscape]="true"
    >
      <ng-template pTemplate="content">
        <currency-code></currency-code>
      </ng-template>
    </p-dialog>

    <!-- Master Type Dialog -->
    <p-dialog
      [header]="getMasterTypeDialogHeader()"
      [(visible)]="showMasterTypeDialog"
      [modal]="true"
      [style]="{ width: 'auto', minWidth: '60vw', maxWidth: '95vw', height: 'auto', maxHeight: '90vh' }"
      [contentStyle]="{ overflow: 'visible' }"
      [baseZIndex]="10000"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterDialog('masterType')"
      [closeOnEscape]="true"
    >
      <ng-template pTemplate="content">
        <master-type [filterByKey]="masterTypeFilter"></master-type>
      </ng-template>
    </p-dialog>

    <!-- Master Item Dialog -->
    <p-dialog
      header="Item Master"
      [(visible)]="showMasterItemDialog"
      [modal]="true"
      [style]="{ width: 'auto', minWidth: '60vw', maxWidth: '95vw', height: 'auto', maxHeight: '90vh' }"
      [contentStyle]="{ overflow: 'visible' }"
      [baseZIndex]="10000"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterDialog('masterItem')"
      [closeOnEscape]="true"
    >
      <ng-template pTemplate="content">
        <charge-type></charge-type>
      </ng-template>
    </p-dialog>

    <!-- Master Location Dialog -->
    <p-dialog
      header="Location Master"
      [(visible)]="showMasterLocationDialog"
      [modal]="true"
      [style]="{ width: 'auto', minWidth: '60vw', maxWidth: '95vw', height: 'auto', maxHeight: '90vh' }"
      [contentStyle]="{ overflow: 'visible' }"
      [baseZIndex]="10000"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterDialog('masterLocation')"
      [closeOnEscape]="true"
    >
      <ng-template pTemplate="content">
        <master-location></master-location>
      </ng-template>
    </p-dialog>
     <p-dialog
      header="Service Area Master"
      [(visible)]="showServiceAreaDialog"
      [modal]="true"
      [style]="{ width: 'auto', minWidth: '60vw', maxWidth: '95vw', height: 'auto', maxHeight: '90vh' }"
      [contentStyle]="{ overflow: 'visible' }"
      [baseZIndex]="10000"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterDialog('serviceArea')"
      [closeOnEscape]="true"
    >
      <ng-template pTemplate="content">
        <app-service-area *ngIf="showServiceAreaDialog" (onClose)="closeMasterDialog('serviceArea')"></app-service-area>
      </ng-template>
    </p-dialog>
    
    <!-- Source Sales Dialog -->
    <p-dialog
      header="Source Sales Master"
      [(visible)]="showSourceSalesDialog"
      [modal]="true"
      [style]="{ width: 'auto', minWidth: '60vw', maxWidth: '95vw', height: 'auto', maxHeight: '90vh' }"
      [contentStyle]="{ overflow: 'visible' }"
      [baseZIndex]="10000"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterDialog('sourceSales')"
      [closeOnEscape]="true"
    >
      <ng-template pTemplate="content">
        <app-source-sales *ngIf="showSourceSalesDialog"></app-source-sales>
      </ng-template>
    </p-dialog>

  `,
 styles: [`
    .form-sections {
      padding: 1rem;
    }

    .section-header {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e5e7eb;
    }

    /* Fix: remove gap for the first section header */
    .section-header:first-of-type {
      margin-top: 0;
    }

    /* Fix: reduce default dialog padding */
    ::ng-deep .p-dialog .p-dialog-content {
      padding-top: 0.5rem !important;
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
      background-color:rgb(200, 199, 254) !important;
    }

    .mandatory-row:hover {
      background-color:rgb(159, 158, 251) !important;
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
export class SourcingComponent implements OnInit, OnDestroy {
  private contextSubscription: Subscription | undefined;
  tariffs: any[] = [];
  // sources list
  sources: any[] =[];
  

  statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Expired', value: 'Expired' }
  ];

// returns the source staus as Active or Expired in String
getSourceStatus(tariff: { periodEndDate?: string | Date }): string {
  if (!tariff.periodEndDate) {
    return 'Active';
  }

  const nowUtc = new Date();

  // Parse the end date using the helper method
  const endDate = this.parseDate(tariff.periodEndDate);
  if (!endDate) {
    return 'Active'; // If date is invalid, consider it active
  }

  // Set end date to end of day in UTC (23:59:59.999)
  const endDateUtc = new Date(
    Date.UTC(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate(),
      23, 59, 59, 999
    )
  );

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

  // Helper method to parse dates safely without timezone issues
  parseDate(dateValue: any): Date | null {
    if (!dateValue) return null;
    
    // If it's already a Date object, return it
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    // If it's a string, parse it carefully
    if (typeof dateValue === 'string') {
      // Handle different date formats
      if (dateValue.includes('-')) {
        // Handle ISO date strings or DD-MM-YYYY format
        const parts = dateValue.split('-');
        if (parts.length === 3) {
          // Check if it's DD-MM-YYYY or D-M-YYYY format (day and month can be 1 or 2 digits)
          if (parts[2].length === 4 && parts[0].length <= 2 && parts[1].length <= 2) {
            // DD-MM-YYYY or D-M-YYYY format
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
            const year = parseInt(parts[2], 10);
            return new Date(year, month, day);
          } else if (parts[0].length === 4) {
            // YYYY-MM-DD format
            return new Date(dateValue);
          }
        }
      }
      
      // Try parsing as regular date string
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    
    return null;
  }

  // Helper method to format dates for backend (YYYY-MM-DD format)
  formatDateForBackend(date: Date): string {
    if (!date || !(date instanceof Date)) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
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
  allShippingType: any[] = [];
  allDepartments: any[] =[];
  containerCodeOptions: any[] = [];
  currencyCodeOptions: any[] = [];
  itemCodeOptions: any[] = [];
  uomOptions: any[]=[];
  serviceAreaOptions: any[] = [];
  
  // Number series properties
  isManualSeries: boolean = false;
  mappedTariffSeriesCode: string = '';
  
  // Properties for source sales
  sourceSalesOptions: any[] = [];
  showSourceSalesDialog = false;
  
  vendorTypeOptions: any[] = [];
  vendorOptions: any[] = [];
  allVendors: any[] = []; // Add this property to store all vendors
  freightChargeTypeOptions = [
    { label: 'Default', value: 'Default' },
    { label: 'Sell  Rate', value: 'Sell  Rate' },
    { label: 'Buy  Rate', value: 'Buy  Rate' }
  ];
  isDialogVisible = false;
  selectedTariff: any = null;
  originalTariffData: any = null; // Backup of original data for cancel functionality
  showCurrencyDialog = false;
  showContainerDialog = false;
  showVendorDialog = false;
  showBasisDialog = false;
  showMasterTypeDialog = false;
  showMasterItemDialog = false;
  showMasterLocationDialog = false;
  showServiceAreaDialog = false;
  masterTypeFilter = '';
  masterDialogLoading: { [key: string]: boolean } = {
    currency: false,
    container: false,
    vendor: false,
    basis: false,
    masterType: false,
    masterItem: false,
    masterLocation: false,
    serviceArea: false,
    sourceSales: false
  };
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
    private sourceService: SourceService,
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
    private serviceAreaService: ServiceAreaService,
    private sourceSalesService: SourceSalesService,
    private cdr: ChangeDetectorRef,
    private router: Router
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

  onDeptModeChange(){
    console.log("Selected Tariff value from the onDept Mode Change",this.selectedTariff);

    // console.log("locations: from on dept mode change:",this.allLocations);
    console.log("shipping Types from on dept mode change:",this.shippingTypeOptions)
    if(this.selectedTariff){
      this.selectedTariff.shippingType = '';
      this.fieldErrors['shippingType'] = '';

      this.filterServiceType();
    }
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

   filterServiceType(){
    console.log('Filtering service/shipping Type:',this.selectedTariff?.mode);
    console.log("All Service types:",this.allShippingType);
    console.log("All Departments:",this.allDepartments);
    if (this.selectedTariff?.mode) {
      // Debug: Log all location types to see what's available
      const availableTypes = [...new Set(this.allShippingType.map(st => st.name))];
      console.log('Available shipping types in data:', availableTypes);
      console.log("department Name:",)
      const [dept]= this.allDepartments.filter( dept=> dept?.name === this.selectedTariff?.mode)
      console.log("service Type mode code:",dept);
      const filteredServiceTypes = this.allShippingType.filter(st => {
        // console.log(`Comparing shipping type '${st.type}' with selected '${this.selectedTariff.}'`);
        return st.department_code === dept.code;
      });
      console.log('Filtered service Types for the Mode:',this.selectedTariff?.mode,"service type length",  filteredServiceTypes.length,'filtered Service type',filteredServiceTypes);
      
      // If no exact match, try case-insensitive comparison
      if (filteredServiceTypes.length === 0) {
        const caseInsensitiveFiltered = this.allDepartments.filter(dept => 
          dept.name?.toLowerCase() === this.selectedTariff.mode?.toLowerCase()
        );
        console.log('Case-insensitive filtered locations:', caseInsensitiveFiltered.length);
        
        this.shippingTypeOptions = caseInsensitiveFiltered.map(st => ({
          label: `${st.name}`,
          value: st.code
        }));
      } else {
        this.shippingTypeOptions = filteredServiceTypes.map(st => ({
          label: st.name,
          value: st.name
        }));
      }
    } else {
      // If no location type selected, show all locations formatted as CODE - NAME
      this.shippingTypeOptions = this.allShippingType.map(st => ({
        label: `${st.name}`,
        value: st.name
      }));
    }
    console.log('From Shipping Type options:', this.shippingTypeOptions.length);

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
    console.log('Sourcing Component ngOnInit - Initial load');
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
    console.log('Loading all source master data...');
    forkJoin({
      modes: this.loadModeOptions(),
      shippingTypes: this.loadShippingTypeOptions(),
      cargoTypes: this.loadCargoTypeOptions(),
      // tariffTypes: this.loadTariffTypeOptions(),
      locations: this.loadLocationOptions(),
      locationTypes: this.loadLocationTypeOptions(),
      basis: this.loadBasisOptions(),
      // containers: this.loadContainersOptions(),
      // currencies: this.loadCurrencyOptions(),
      items: this.loadItemOptions(),
      vendorTypes: this.loadVendorTypeOptions(),
      vendors: this.loadVendorOptions(),
      serviceAreas: this.loadServiceAreaOptions(),
      sourceSales: this.loadSourceSalesOptions()
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
  getVendorName(vendorCode: string): string {
    if (!vendorCode || !this.allVendors) return vendorCode || '';
    
    const vendor = this.allVendors.find(v => v.vendor_no === vendorCode);
    return vendor ? `
     ${vendor.name2}` : vendorCode;
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

        this.allDepartments = (departments || []).filter( d=> !d.status || d.status ==='Active'|| d.status==='active'|| d.status === null || d.status ==='');

        
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
        this.allShippingType= (serviceTypes||[]).filter(st => st?.status === 'active');
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
          .filter(i => i.item_type === 'CHARGE_TYPE' && i.active)
          .map(i => ({ label: `${i.code} - ${i.name}`, value: i.code }));
          
      })
    );
  }
  
  loadServiceAreaOptions() {
    return this.serviceAreaService.getServiceAreas().pipe(
      tap((serviceAreas: any[]) => {
        this.serviceAreaOptions = (serviceAreas || [])
          .filter(sa => sa.status === 'active')
          .map(sa => ({ label: sa.service_area, value: sa.service_area }));
        console.log('Service area options:', this.serviceAreaOptions);
      }),
      catchError(error => {
        console.error('Error loading service areas:', error);
        return of([]);
      })
    );
  }
  
  loadSourceSalesOptions() {
    return this.sourceSalesService.getSourceSales().pipe(
      tap((sourceSales: any[]) => {
        this.sourceSalesOptions = (sourceSales || [])
          .filter(s => s.status === 'active' || s.status === 'Active')
          .map(s => ({ label: `${s.code} - ${s.name}`, value: s.code }));
        console.log('Source sales options loaded:', this.sourceSalesOptions);
      }),
      catchError(error => {
        console.error('Error loading source sales:', error);
        return of([]);
      })
    );
  }
  
  onSourceSalesChange() {
    if (this.selectedTariff && this.selectedTariff.sourceSalesCode) {
      const selected = this.sourceSalesOptions.find(option => option.value === this.selectedTariff.sourceSalesCode);
      if (selected) {
        this.selectedTariff.sourceSalesPerson = selected.label;
      }
    }
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
            value: v.name2,
            vendorType: v.type // Include vendor type for filtering
          }));

          console.log("Mapped Vendor Options in loadVendorOptions,",this.vendorOptions);
      })
    );
  }
  formatDateForDisplay(date: Date): string {
  if (!date || !(date instanceof Date)) return '';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }
   getLocationName(locationCode: string): string {
    if (!locationCode || !this.allLocations) return locationCode || '';
    
    const location = this.allLocations.find(l => l.code === locationCode);
    return location ? `${location.name}` : locationCode;
  }
  // Helper to map code to label for table display
  getLabel(options: any[], value: string): string {
    const found = options.find(opt => opt.value === value);
    return found ? found.label : value;
  }

  refreshList(){
    const context = this.contextService.getContext();
    console.log('🔄 Refreshing source list with context:', context);

    this.sourceService.getAll().subscribe({
      next: (data) => {
        console.log('📊 Source data loaded Successfully:',{
          recordCount: data.length,
          context: context,
          sampleData: data.slice(0,2)
        });
        
        // mapping the subscribed data to the sources list 
        this.sources = data.map((source: any)=>{
          const mappedSource = {
            ...source,
            mode: source.mode,
            shippingType: source.shipping_type,
            vendorType: source.vendor_type,
            vendorName: source.vendor_name,
            cargoType: source.cargo_type,
            itemName: source.item_name,
            basis: source.basis,
            locationTypeFrom: source.location_type_from,
            fromLocation: source.from_location,
            locationTypeTo: source.location_type_to,
            toLocation: source.to_location,
            charges: source.charges,
            effectiveDate: source.effective_date,
            periodStartDate: source.period_start_date,
            periodEndDate: source.period_end_date,
            isMandatory: source.is_mandatory,
            
          }
           const startDate = this.parseDate(source.period_start_date);
          const endDate = this.parseDate(source.period_end_date);
          
          mappedSource.periodStartDateFormatted = startDate ? this.formatDateForDisplay(startDate) : '';
          mappedSource.periodEndDateFormatted = endDate ? this.formatDateForDisplay(endDate) : '';
          // Adding status key to all source object 
          mappedSource.status = this.getSourceStatus(mappedSource);
          return mappedSource;
        })

        console.log('✅ Source data processing completed, final value:', this.sources);

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error loading tariff data:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load tariff data'
        });
        this.sources = [];
      }
    })    
  }


  // refreshList2() {
  //   const context = this.contextService.getContext();
  //   console.log('🔄 Refreshing tariff list with context:', context);
    
  //   this.tariffService.getAll().subscribe({
  //     next: (data) => {
  //       console.log('📊 Tariff data loaded successfully:', {
  //         recordCount: data.length,
  //         context: context,
  //         sampleData: data.slice(0, 2) // Show first 2 records for debugging
  //       });
        
  //       this.tariffs = data.map((tariff: any) => {
  //         const mappedTariff = {
  //           ...tariff,
  //           shippingType: tariff.shipping_type,
  //           cargoType: tariff.cargo_type,
  //           containerType: tariff.container_type,
  //           itemName: tariff.item_name,
  //           from: tariff.from_location,
  //           to: tariff.to_location,
  //           vendorType: tariff.vendor_type,
  //           vendorName: tariff.vendor_name,
  //           locationTypeFrom: tariff.location_type_from,
  //           locationTypeTo: tariff.location_type_to,
  //           tariffType: tariff.tariff_type,
  //           basis: tariff.basis,
  //           currency: tariff.currency,
  //           charges: tariff.charges,
  //           mode: tariff.mode,
  //           effectiveDate: tariff.effective_date,
  //           periodStartDate: tariff.period_start_date,
  //           periodEndDate: tariff.period_end_date,
  //           freightChargeType: tariff.freight_charge_type,
  //           isMandatory: tariff.is_mandatory
  //         };
  //         // Add status field to each tariff object
  //         mappedTariff.status = this.getTariffStatus(mappedTariff);
  //         return mappedTariff;
  //       });
        
  //       console.log('✅ Tariff data processing completed, final count:', this.tariffs.length);
        
  //       // Force change detection after data update
  //       this.cdr.detectChanges();
  //     },
  //     error: (error) => {
  //       console.error('❌ Error loading tariff data:', error);
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'Error',
  //         detail: 'Failed to load tariff data'
  //       });
  //       this.tariffs = [];
  //     }
  //   });
  // }

  loadMappedTariffSeriesCode() {
    const context = this.contextService.getContext();
    console.log('Loading Source series code for context:', context);
    
    // Use context-based mapping with NumberSeriesRelation
    this.mappingService.findMappingByContext(
      'sourceCode',
      context.companyCode || '',
      context.branchCode || '',
      context.departmentCode || '',
      context.serviceType || undefined
    ).subscribe({
      next: (contextMapping: any) => {
        console.log('source mapping relation response:', contextMapping);
        this.mappedTariffSeriesCode = contextMapping.mapping;
        if (this.mappedTariffSeriesCode) {
          this.numberSeriesService.getAll().subscribe({
            next: (seriesList: any[]) => {
              const found = seriesList.find((s: any) => s.code === this.mappedTariffSeriesCode);
              this.isManualSeries = !!(found && found.is_manual);
              console.log('source series code mapped:', this.mappedTariffSeriesCode, 'Manual:', this.isManualSeries);
            },
            error: (error: any) => {
              console.error('Error loading number series:', error);
              this.isManualSeries = true;
            }
          });
        } else {
          this.isManualSeries = true;
          console.log('No source series code mapping found for context');
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
                  console.log('source series code mapped (fallback):', this.mappedTariffSeriesCode, 'Manual:', this.isManualSeries);
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
    console.log('Add source button clicked - starting addRow method');
    
    // Get the validation settings
    const config = this.configService.getConfig();
    const sourceFilter = config?.validation?.sourceFilter || '';
    
    console.log('source filter:', sourceFilter);
    
    // Check if we need to validate context
    if (sourceFilter) {
      // Get the current context
      const context = this.contextService.getContext();
      
      console.log('Current context:', context);
      
      // Check if the required context is set based on the filter
      if (sourceFilter.includes('C') && !context.companyCode) {
        console.log('Company context required but not set');
        this.messageService.add({
          severity: 'warn',
          summary: 'Context Required',
          detail: 'Please select a Company before adding a new source.'
        });
        this.contextService.showContextSelector();
        return;
      }
      
      if (sourceFilter.includes('B') && !context.branchCode) {
        console.log('Branch context required but not set');
        this.messageService.add({
          severity: 'warn',
          summary: 'Context Required',
          detail: 'Please select a Branch before adding a new source.'
        });
        this.contextService.showContextSelector();
        return;
      }
      
      if (sourceFilter.includes('D') && !context.departmentCode) {
        console.log('Department context required but not set');
        this.messageService.add({
          severity: 'warn',
          summary: 'Context Required',
          detail: 'Please select a Department before adding a new source.'
        });
        this.contextService.showContextSelector();
        return;
      }
    }

    console.log('Context validation passed - proceeding with add source');
    
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
      // this.loadContainersOptions(),
      // this.loadCurrencyOptions(),
      this.loadItemOptions(),
      this.loadVendorTypeOptions(),
      this.loadVendorOptions(),
      this.loadServiceAreaOptions(),
      this.loadSourceSalesOptions()
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
    // Use proper date parsing to avoid timezone issues
    if (this.selectedTariff.effectiveDate) {
      this.selectedTariff.effectiveDate = this.parseDate(this.selectedTariff.effectiveDate);
    }
    if (this.selectedTariff.periodStartDate) {
      this.selectedTariff.periodStartDate = this.parseDate(this.selectedTariff.periodStartDate);
    }
    if (this.selectedTariff.periodEndDate) {
      this.selectedTariff.periodEndDate = this.parseDate(this.selectedTariff.periodEndDate);
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
    
    const payload: any = { ...this.selectedTariff};
    console.log("DEBUG: Saving the source value for the selected source payload",payload);
    
    // Clear original data backup since we're saving changes
    this.originalTariffData = null;

    // Format dates properly before sending to backend
    if (payload.effectiveDate instanceof Date) {
      payload.effectiveDate = this.formatDateForBackend(payload.effectiveDate);
    }
    if (payload.periodStartDate instanceof Date) {
      payload.periodStartDate = this.formatDateForBackend(payload.periodStartDate);
    }
    if (payload.periodEndDate instanceof Date) {
      payload.periodEndDate = this.formatDateForBackend(payload.periodEndDate);
    }

    // For automatic series, ensure code is empty so backend generates it (only for new records)
    if (!this.isManualSeries && this.selectedTariff.isNew) {
      payload.code = '';
    }

    if (this.selectedTariff.isNew) {
      this.sourceService.create(payload).subscribe({
        next: (created) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Source created' });
          this.refreshList();
          this.hideDialog();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to add source' });
        }
      });
    } else {
      this.sourceService.update(this.selectedTariff.id, payload).subscribe({
        next: (updated) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Source updated' });
          this.refreshList();
          this.hideDialog();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update source' });
        },
        complete: () => {
          console.log('Source updated successfully');
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
    } else if (type === 'vendorType') {
      this.masterTypeFilter = 'VENDOR';
      this.showMasterTypeDialog = true;
    } else if (type === 'cargoType') {
      this.masterTypeFilter = 'CARGO_TYPE';
      this.showMasterTypeDialog = true;
    } else if (type === 'tariffType') {
      this.masterTypeFilter = 'TARIFF_TYPE';
      this.showMasterTypeDialog = true;
    } else if (type === 'itemName') {
      this.showMasterItemDialog = true;
    } else if (type === 'locationTypeFrom' || type === 'locationTypeTo') {
      this.masterTypeFilter = 'LOCATION';
      this.showMasterTypeDialog = true;
    } else if (type === 'from' || type === 'to') {
      this.showMasterLocationDialog = true;
    } else if (type === 'serviceArea') {
      this.showServiceAreaDialog = true;
    } else if (type === 'sourceSales') {
      this.showSourceSalesDialog = true;
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
        this.loadCurrencyOptions().subscribe({
          next: () => this.cdr.detectChanges(),
          error: () => this.cdr.detectChanges()
        });
        break;
      case 'container':
        this.showContainerDialog = false;
        this.loadContainersOptions().subscribe({
          next: () => this.cdr.detectChanges(),
          error: () => this.cdr.detectChanges()
        });
        break;
      case 'vendor':
        this.showVendorDialog = false;
        this.loadVendorOptions().subscribe({
          next: () => this.cdr.detectChanges(),
          error: () => this.cdr.detectChanges()
        });
        break;
      case 'basis':
        this.showBasisDialog = false;
        this.loadBasisOptions().subscribe({
          next: () => this.cdr.detectChanges(),
          error: () => this.cdr.detectChanges()
        });
        break;
      case 'masterType':
        this.showMasterTypeDialog = false;
        // Reload the specific master type options that were edited
        const editedType = this.masterTypeFilter;
        if (editedType === 'VENDOR') {
          this.loadVendorTypeOptions().subscribe({ next: () => this.cdr.detectChanges(), error: () => this.cdr.detectChanges() });
        } else if (editedType === 'CARGO_TYPE') {
          this.loadCargoTypeOptions().subscribe({ next: () => this.cdr.detectChanges(), error: () => this.cdr.detectChanges() });
        } else if (editedType === 'TARIFF_TYPE') {
          this.loadTariffTypeOptions().subscribe({ next: () => this.cdr.detectChanges(), error: () => this.cdr.detectChanges() });
        } else if (editedType === 'LOCATION') {
            this.loadLocationTypeOptions().subscribe({ next: () => this.cdr.detectChanges(), error: () => this.cdr.detectChanges() });
          }
          // Force a refresh of the master type component to ensure new rows are displayed
          setTimeout(() => {
            this.masterTypeFilter = '';
            this.cdr.detectChanges();
          }, 100);
        break;
      case 'masterItem':
        this.showMasterItemDialog = false;
        this.loadItemOptions().subscribe({
          next: () => this.cdr.detectChanges(),
          error: () => this.cdr.detectChanges()
        });
        break;
      case 'masterLocation':
        this.showMasterLocationDialog = false;
        // Reload locations so newly added entries appear in From/To dropdowns
        this.loadLocationOptions().subscribe({
          next: () => {
            // Re-apply filters based on current selection
            this.filterFromLocations();
            this.filterToLocations();
            this.cdr.detectChanges();
          },
          error: () => {
            // Even on error, attempt to refresh UI
            this.cdr.detectChanges();
          }
        });
        break;
      case 'serviceArea':
        this.showServiceAreaDialog = false;
        this.loadServiceAreaOptions().subscribe({
          next: () => this.cdr.detectChanges(),
          error: () => this.cdr.detectChanges()
        });
        break;
      case 'sourceSales':
        this.showSourceSalesDialog = false;
        this.loadSourceSalesOptions().subscribe({
          next: () => this.cdr.detectChanges(),
          error: () => this.cdr.detectChanges()
        });
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

  getMasterTypeDialogHeader(): string {
    switch (this.masterTypeFilter) {
      case 'VENDOR':
        return 'Vendor Type Master';
      case 'CARGO_TYPE':
        return 'Cargo Type Master';
      case 'TARIFF_TYPE':
        return 'Tariff Type Master';
      case 'LOCATION':
        return 'Location Type Master';
      default:
        return 'Master Type';
    }
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
        const source: any = {
          // Only include code if it's provided in the import file for manual series
          // Backend will determine if series is manual/default and handle accordingly
          ...(row['code'] || row['Code'] ? { code: row['code'] || row['Code'] } : {}),
          mode: row['mode'] || row['Mode'] || '',
          shippingType: row['shippingType'] || row['Shipping Type'] || '',
          cargoType: row['cargoType'] || row['Cargo Type'] || '',
          basis: row['basis'] || row['Basis'] || '',
          itemName: row['itemName'] || row['Item Name'] || '',
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
          isMandatory: row['isMandatory'] || row['Mandatory'] === 'Yes' || row['Mandatory'] === true || false
        };
        
        // Validate required fields
        if (!source.mode) {
          throw new Error(`Row ${index + 2}: Mode is required`);
        }
        
        // Create the source - backend will handle:
        // 1. Context-based mapping lookup
        // 2. Number series relation checking
        // 3. Automatic vs manual series determination
        // 4. Code generation and relation updates
        this.sourceService.create(source).subscribe({
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
            if (error.error && error.error.error === 'Duplicate source found') {
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
    if (this.sources.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Data',
        detail: 'No sources to export'
      });
      return;
    }

    // Prepare data for export (excluding code field)
    const exportData = this.sources.map(source => {
      console.log("source export data:",source);

      ({
      'Mode': source.mode || '',
      'Shipping Type': source.shippingType || '',
      'Cargo Type': source.cargoType || '',
      'Basis': source.basis || '',
      'Item Name': source.itemName || '',
      'Location Type From': source.locationTypeFrom || '',
      'From': source.from || '',
      'Location Type To': source.locationTypeTo || '',
      'To': source.to || '',
      'Vendor Type': source.vendorType || '',
      'Vendor Name': source.vendorName || '',
      'Effective Date': source.effectiveDate || '',
      'Period Start Date': source.periodStartDate || '',
      'Period End Date': source.periodEndDate || '',
      'Charges': source.charges || 0,
      'Mandatory': source.isMandatory ? 'Yes' : 'No'
    })});

    this.exportToCsv(exportData, 'sources');
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
        detail: `Exported ${data.length} source(s) to CSV`
      });
    }
  }
}