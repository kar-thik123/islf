import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, forkJoin, of, BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { take, tap, catchError, takeUntil, distinctUntilChanged, startWith, map } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';

import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabViewModule } from 'primeng/tabview';
import { BookingService, BookingRecord } from '../../services/booking.service';
import { EnquiryService } from '../../services/enquiry.service';
import { ServiceTypeService } from '../../services/servicetype.service';
import { ContextService } from '../../services/context.service';
import { MasterLocationService } from '../../services/master-location.service';
import { MasterLocationComponent } from '../../pages/masters/masterlocation';
import { MasterTypeService } from '../../services/mastertype.service';
import { MasterItemService, MasterItem } from '../../services/master-item.service';
import { VendorService } from '../../services/vendor.service';
import { MasterAirlineService } from '../../services/master-airline.service';
import { MasterVesselService } from '../../services/master-vessel.service';
import { ConfigService } from '../../services/config.service';
import { ConfigDatePipe } from '../../pipes/config-date.pipe';
import { TextareaModule } from 'primeng/textarea';
import { MasterCacheService } from '../../services/master-cache.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    DropdownModule,
    DialogModule,
    ToastModule,
    TableModule,
    CalendarModule,
    TooltipModule,
    RadioButtonModule,
    MasterLocationComponent,
    ConfigDatePipe,
    ConfirmDialogModule,
    BadgeModule,
    TabViewModule,
    InputNumberModule,

  
    HasPermissionDirective
],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog appendTo="body"></p-confirmDialog>
    
    <p-dialog [(visible)]="showErrorDialog" [header]="errorHeader" [modal]="true" [style]="{width: '450px'}" appendTo="body">
      <div class="flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-red-500 text-2xl"></i>
        <span class="text-lg">{{ errorMessage }}</span>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="OK" class="p-button-text" (click)="showErrorDialog = false"></button>
      </ng-template>
    </p-dialog>
    
    <p-dialog [(visible)]="showSubVendorTypeDialog" header="Select Vendor Type" [modal]="true" [style]="{'width':'300px'}" appendTo="body">
      <div class="flex flex-col gap-3">
        <label class="font-semibold">Vendor Type</label>
        <p-dropdown [options]="vendorTypeOptions" placeholder="Select Type" (onChange)="confirmSubVendorType($event.value)" appendTo="body" [filter]="true" [style]="{'width':'100%'}"></p-dropdown>
      </div>
    </p-dialog>

    <div class="card">
      <div class="font-semibold text-xl mb-4">Booking Dashboard</div>
      <p-table #dt [value]="bookings" [lazy]="true" (onLazyLoad)="loadBookings($event)" [totalRecords]="totalRecords" [paginator]="true" [rows]="configService.getSystemConfig().maxRecordsPerPage" [rowsPerPageOptions]="[5, 10, 20, 50]" dataKey="booking_no" [showGridlines]="true" [globalFilterFields]="['booking_no','customer_name','company_name','department','service_type','from_location','to_location','status']">
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <div class="flex gap-2">
              <ng-container *appHasPermission="{ module: 'Operations', subModule: 'Booking', action: 'write' }">
<button pButton label="Create Booking" icon="pi pi-plus" (click)="openCreateDialog()"></button>
</ng-container>
            </div>
            <div class="flex gap-2">
              <span class="p-input-icon-left">
                <input pInputText type="text" (input)="dt.filterGlobal($any($event.target).value, 'contains')" placeholder="Search..." />
              </span>
            </div>
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
          <th>
              <div class="flex justify-between items-center">Date
                <p-columnFilter field="created_at" matchMode="contains" display="menu"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">Booking No
                <p-columnFilter field="booking_no" matchMode="contains" display="menu"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">Customer
                <p-columnFilter field="company_name" matchMode="contains" display="menu"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">Department
                <p-columnFilter field="department" matchMode="contains" display="menu"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">Service Type
                <p-columnFilter field="service_type" matchMode="contains" display="menu"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">From
                <p-columnFilter field="from_location" matchMode="contains" display="menu"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">To
                <p-columnFilter field="to_location" matchMode="contains" display="menu"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">Status
                <p-columnFilter field="status" matchMode="equals" display="menu"></p-columnFilter>
              </div>
            </th>
            
            <th>Action</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr>
            <td>{{ row.created_at | configDate }}</td>
            <td>{{ row.booking_no }}</td>
            <td>{{ row.company_name }}</td>
            <td>{{ row.department }}</td>
            <td>{{ row.service_type }}</td>
            <td>{{ locName(row.from_location) }}</td>
            <td>{{ locName(row.to_location) }}</td>
            <td>
              <span [ngClass]="getStatusClass(row.status)">
                {{ row.status }}
              </span>
            </td>
            
            <td>
            <div style="display:flex;gap:6px;justify-content:center">
              <ng-container *appHasPermission="{ module: 'Operations', subModule: 'Booking', action: 'write' }">
<button pButton  icon="pi pi-pencil" class="p-button-sm" (click)="openBooking(row.booking_no)" pTooltip="Edit Booking" tooltipPosition="top"></button>
</ng-container>
              <button pButton icon="pi pi-link" class="p-button-sm" (click)="openLinkEnquiryDialog(row)" pTooltip="Link Enquiry" tooltipPosition="top"></button>
            </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog header="Create Booking" [(visible)]="showCreateDialog" [modal]="true" [style]="{width: '95vw', maxWidth: '95vw'}" [contentStyle]="{height: '70vh'}">
      <div class="border-2 border-slate-200 rounded-lg p-4 bg-slate-50 mb-3">
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12 md:col-span-6 lg:col-span-6">
            <label class="block mb-1 font-medium text-slate-700">Department</label>
            <p-dropdown [options]="departmentOptions" [(ngModel)]="dialog.department" (ngModelChange)="onDepartmentChange(); searchEnquiries()" [filter]="true" filterBy="label" placeholder="Select Department" [style]="{'width':'100%'}" appendTo="body"></p-dropdown>
          </div>
          <div class="col-span-12 md:col-span-6 lg:col-span-6">
            <label class="block mb-1 font-medium text-slate-700">Service Type</label>
            <p-dropdown [options]="serviceTypeOptions" [(ngModel)]="dialog.service_type" (ngModelChange)="searchEnquiries()" [filter]="true" filterBy="label" placeholder="Select Service Type" [style]="{'width':'100%'}" appendTo="body"></p-dropdown>
          </div>
          <div class="col-span-12 lg:col-span-6 flex gap-3">
            <div class="w-1/3">
              <label class="block mb-1 font-medium text-slate-700">From Location Type</label>
              <p-dropdown [options]="locationTypeOptions" [(ngModel)]="dialog.from_location_type" (onChange)="onLocationTypeChange('from'); searchEnquiries()" placeholder="Type" [showClear]="true" [style]="{'width':'100%'}" appendTo="body"></p-dropdown>
            </div>
            <div class="w-2/3">
              <label class="block mb-1 font-medium text-slate-700">From Location</label>
              <p-dropdown [options]="fromLocationOptions" [(ngModel)]="dialog.from_location" (ngModelChange)="searchEnquiries()" [filter]="true" filterBy="label" placeholder="Select From" [style]="{'width':'100%'}" appendTo="body"></p-dropdown>
            </div>
          </div>
          <div class="col-span-12 lg:col-span-6 flex gap-3">
            <div class="w-1/3">
               <label class="block mb-1 font-medium text-slate-700">To Location Type</label>
               <p-dropdown [options]="locationTypeOptions" [(ngModel)]="dialog.to_location_type" (onChange)="onLocationTypeChange('to'); searchEnquiries()" placeholder="Type" [showClear]="true" [style]="{'width':'100%'}" appendTo="body"></p-dropdown>
            </div>
            <div class="w-2/3">
              <label class="block mb-1 font-medium text-slate-700">To Location</label>
              <p-dropdown [options]="toLocationOptions" [(ngModel)]="dialog.to_location" (ngModelChange)="searchEnquiries()" [filter]="true" filterBy="label" placeholder="Select To" [style]="{'width':'100%'}" appendTo="body"></p-dropdown>
            </div>
          </div>
        </div>
        <div class="flex justify-end mt-3">
          <button pButton label="Clear Filters" icon="pi pi-filter-slash" class="p-button-outlined p-button-secondary p-button-sm" (click)="clearFilters()"></button>
        </div>
      </div>

      <div class="mt-3" *ngIf="matchingEnquiries.length">
        <p-table [value]="matchingEnquiries" selectionMode="multiple" [(selection)]="selectedEnquiries" dataKey="code" [showGridlines]="true">
          <ng-template pTemplate="header">
            <tr>
              <th style="width:3rem"></th>
              <th>Code</th>
              <th>Customer</th>
              <th>Department</th>
              <th>Service Type</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Dates</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-enq>
            <tr [pSelectableRow]="enq" [pSelectableRowDisabled]="!isEnquirySelectable(enq)">
              <td>
                <p-tableCheckbox [value]="enq" [disabled]="!isEnquirySelectable(enq)"></p-tableCheckbox>
              </td>
              <td>{{ enq.code }}</td>
              <td>{{ enq.company_name }}</td>
              <td>{{ enq.department }}</td>
              <td>{{ enq.service_type }}</td>
              <td>{{ locName(enq.from_location) }}</td>
              <td>{{ locName(enq.to_location) }}</td>
              <td><p-badge [value]="enq.status" [severity]="getEnquirySeverity(enq.status)"></p-badge></td>
              <td>{{ enq.effective_date_from | configDate }} → {{ enq.effective_date_to | configDate }}</td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <ng-template pTemplate="footer">
        <ng-container *appHasPermission="{ module: 'Operations', subModule: 'Booking', action: 'write' }">
<button pButton [label]="linkTargetBooking ? 'Append' : 'Save'" icon="pi pi-check" (click)="saveFromEnquiries()"></button>
</ng-container>
        <button pButton label="Cancel" class="p-button-secondary" (click)="onCreateBookingCancel()"></button>
      </ng-template>
    </p-dialog>



    <p-dialog header="Add Booking" [(visible)]="showBookingForm" [modal]="true" [draggable]="false" [resizable]="false" [closeOnEscape]="true" [style]="{ width: '98vw', height: '95vh' }" [contentStyle]="{ overflow: 'auto', height: '100%' }">
      <ng-template pTemplate="content">
      <div class="p-fluid form-grid dialog-body-padding">
      <div class="section-header">General Booking Details</div>
      <div class="grid grid-cols-12 gap-4 mb-6">
        <div class="col-span-3">
          <label class="block mb-1">Booking No</label>
          <input pInputText class="bg-yellow-50 w-60" [readonly]="true" [(ngModel)]="currentBooking.booking_no"/>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Enquiry Type</label>
          <div class="flex gap-1">
            <ng-container *ngIf="currentBooking.booking_type === 'manual' || !currentBooking.booking_type">
              <p-dropdown [options]="enquiryTypeOptions" [(ngModel)]="currentBooking.enquiry_type" placeholder="Select Type" class="w-60" appendTo="body"></p-dropdown>
            </ng-container>
            <ng-container *ngIf="currentBooking.booking_type === 'from_enquiry'">
              <input pInputText class="bg-yellow-50" [readonly]="true" [(ngModel)]="currentBooking.enquiry_type"/>
            </ng-container>
          </div>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Company Name</label>
          <input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="currentBooking.company_name"/>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Source / Sales Person</label>
          <input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="currentBooking.source_sales_person"/>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Department</label>
          <input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="currentBooking.department"/>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Service Type</label>
          <input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="currentBooking.service_type"/>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">From Location</label>
          <input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="currentBooking.from_location"/>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">To Location</label>
          <input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="currentBooking.to_location"/>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Effective Date From</label>
          <p-calendar [(ngModel)]="currentBooking.effective_date_from" [showIcon]="true" [dateFormat]="configService.calendarDateFormat" appendTo="body" class="w-60" [inputStyle]="{ width: '250px' }" [style]="{ width: '250px'}"></p-calendar>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Effective Date To</label>
          <p-calendar [(ngModel)]="currentBooking.effective_date_to" [showIcon]="true" [dateFormat]="configService.calendarDateFormat" appendTo="body" class="w-60" [inputStyle]="{ width: '250px' }" [style]="{ width: '250px'}"></p-calendar>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Status</label>
          <p-dropdown [(ngModel)]="currentBooking.status" [options]="bookingStatusOptions" optionLabel="label" optionValue="value" placeholder="Select Status" class="w-60" [style]="{'width': '200px'}" appendTo="body"></p-dropdown>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Remarks</label>
          <textarea pInputTextarea [rows]="3" class="w-full" [(ngModel)]="currentBooking.remarks" placeholder="Enter remarks"></textarea>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Date</label>
          <input pInputText [value]="currentBooking.created_at | configDate" readonly class="bg-gray-100 w-60" />
        </div>
      </div>

      <div class="section-header">Cargo List</div>
      <div class="mb-2">
        <button pButton label="+ Add Cargo" class="p-button-sm" (click)="addCargoRow()"></button>
      </div>
      <p-table [value]="cargoRows" [showGridlines]="true">
        <ng-template pTemplate="header">
          <tr>
            <th>Cargo Type</th>
            <th>Cargo Name</th>
            <th>HS Code</th>
            <th></th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-cg let-i="rowIndex">
          <tr>
            <td>
               <p-dropdown [(ngModel)]="cg.cargo_type" [options]="cargoTypeOptions" optionLabel="label" optionValue="value" [filter]="true" filterBy="label" appendTo="body" class="w-60" [style]="{'width':'200px'}" (onChange)="onCargoTypeChange(cg)" [disabled]="!!getInheritedCargoType() || i > 0"></p-dropdown>
            </td>
            <td>
              <p-dropdown [(ngModel)]="cg.description" [options]="cg._descriptionOptions || []" optionLabel="label" optionValue="value" [filter]="true" filterBy="label" appendTo="body" class="w-60" [style]="{'width':'250px'}" (onChange)="onCargoNameChange(cg)"></p-dropdown>
            </td>
            <td>
              <p-dropdown [(ngModel)]="cg.hs_code" [options]="cg._hsCodeOptions || []" optionLabel="label" optionValue="value" [filter]="true" filterBy="label"  appendTo="body" class="w-60" [style]="{'width':'150px'}"></p-dropdown>
            </td>
            <td><ng-container *appHasPermission="{ module: 'Operations', subModule: 'Booking', action: 'delete' }">
<button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeCargoRow(i)"></button>
</ng-container></td>
          </tr>
        </ng-template>
      </p-table>

      <div class="section-header">Carriage List</div>
      <p-table [value]="carriageRows" [showGridlines]="true">
        <ng-template pTemplate="header">
          <tr>
            <th>Carriage</th>
            <th>Location Type</th>
            <th>Location</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-cr>
          <tr>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="cr.carriage"/></td>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="cr.location_type"/></td>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="cr.location"/></td>
          </tr>
        </ng-template>
      </p-table>

      <div class="section-header">Line Items (Booking Details)</div>
      <div class="mb-2">
       <button pButton icon="pi pi-link" label="Link Enquiry" class="p-button-sm" (click)="openLinkEnquiryDialog(currentBooking)"></button>
      </div>
      <p-table [value]="lineItemsRows" [showGridlines]="true">
        <ng-template pTemplate="header">
          <tr>
            <th>EnqNo</th>
            <th>EnqExp</th>
            <th>Type</th>
            <th>Service Area</th>
            <th>Basis</th>
            <th>From</th>
            <th>To</th>
            <th>Sourced Vendor</th>
            <th>Status</th>
            <th>Remarks</th>
            <th>Preview</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-li>
          <tr>
            <td><input pInputText class="bg-gray-50" [readonly]="true" [(ngModel)]="li.enq_no"/></td>
            <td><input pInputText class="bg-gray-50" [readonly]="true" [value]="li.enq_exp | configDate"/></td>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="li.type"/></td>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="li.service_area"/></td>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="li.basis"/></td>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="li.from_location"/></td>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="li.to_location"/></td>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="li.sourced_vendor"/></td>
            <td>
              <p-dropdown [(ngModel)]="li.status" [options]="bookingStatusOptions" optionLabel="label" optionValue="value" [style]="{'width':'120px'}" appendTo="body"></p-dropdown>
            </td>
            <td><textarea pInputTextarea [rows]="1" [autoResize]="true" [style]="{'width':'300px'}" [(ngModel)]="li.remarks" placeholder="Remarks"></textarea></td>
            <td>
              <button pButton icon="pi pi-eye" class="p-button-outlined p-button-rounded p-button-sm" (click)="openEnquiryPreview(li)" pTooltip="View Sourcing & Tariff Preview" tooltipPosition="left"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <div class="section-header">Schedule</div>
      
      <!-- Enquiry Preview Dialog -->
      <p-dialog [(visible)]="showEnquiryPreviewDialog" [header]="'Enquiry Preview: ' + (selectedEnquiryForPreview?.code || '')" [modal]="true" [style]="{width: '85vw'}" [maximizable]="true" appendTo="body">
        <div *ngIf="loadingPreview" class="flex justify-content-center p-5">
          <i class="pi pi-spin pi-spinner text-4xl"></i>
        </div>

        <div *ngIf="!loadingPreview && selectedEnquiryForPreview" class="p-fluid">
          
          <div class="bg-blue-50 p-3 rounded mb-3 border border-blue-100 flex gap-4 flex-wrap">
            <div class="flex-1">
              <label class="font-semibold text-sm text-gray-600 block">Service Area</label>
              <span class="font-medium text-lg text-blue-800">{{ selectedEnquiryLineItem?.service_area || 'N/A' }}</span>
            </div>
            <div class="flex-1">
               <label class="font-semibold text-sm text-gray-600 block">Type</label>
               <span class="font-medium">{{ selectedEnquiryLineItem?.type || 'N/A' }}</span>
            </div>
             <div class="flex-1">
               <label class="font-semibold text-sm text-gray-600 block">Basis</label>
               <span class="font-medium">{{ selectedEnquiryLineItem?.basis || 'N/A' }}</span>
            </div>
             <div class="flex-1">
               <label class="font-semibold text-sm text-gray-600 block">Customer</label>
               <span class="font-medium">{{ selectedEnquiryForPreview.customer_name }}</span>
            </div>
          </div>

          <p-tabView>
            <p-tabPanel header="Selected Sourcing">
              <div *ngIf="!groupedSourcingData || groupedSourcingData.length === 0" class="text-center p-4 text-gray-500 bg-gray-50 rounded">
                No sourcing charges selected for this line item.
              </div>
              
              <div *ngFor="let group of groupedSourcingData" class="mb-5">
                <div class="bg-gray-100 px-3 py-2 border-l-4 border-blue-500 font-bold text-blue-800 mb-2">
                  Route: {{ group.route }}
                </div>
                <p-table [value]="group.charges" [showGridlines]="true" styleClass="p-datatable-sm">
                  <ng-template pTemplate="header">
                    <tr>
                      <th>Charge Name</th>
                      <th>Basis</th>
                      <th>Currency</th>
                      <th class="text-right">Charges</th>
                      <th class="text-right">GST/VAT</th>
                      <th>Sell Rate Currency</th>
                      <th class="text-right">Sell Rate</th>
                      <th class="text-right">GST/VAT</th>
                      <th class="text-right">Total Sell</th>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="body" let-charge>
                    <tr>
                      <td>{{ chargeCodeToName.get(charge.charge_name || charge.name) || charge.charge_name || charge.name }}</td>
                      <td>{{ charge.basis }}</td>
                      <td>{{ charge.currency }}</td>
                      <td class="text-right">{{ charge.charges | number:'1.2-2' }}</td>
                      <td class="text-right">{{ charge.gst_vat ? charge.gst_vat + '%' : '' }}</td>
                      <td>{{ charge.sell_rate_currency || charge.currency }}</td>
                      <td class="text-right">{{ charge.sell_rate | number:'1.2-2' }}</td>
                      <td class="text-right">{{ (charge.sell_rate_gst || charge.sell_rate_gst_vat || charge.sell_gst_vat) ? (charge.sell_rate_gst || charge.sell_rate_gst_vat || charge.sell_gst_vat) + '%' : '' }}</td>
                      <td class="text-right font-semibold">{{ calculateRowTotal(charge) | number:'1.2-2' }}</td>
                    </tr>
                  </ng-template>
                </p-table>
                <div class="mt-2 p-2 bg-gray-50 text-sm  text-gray-600 border border-gray-100" *ngIf="group.remarks && group.remarks.length > 0">
                  <strong>Remarks:</strong> {{ group.remarks.join('; ') }}
                </div>
              </div>

              <div class="flex justify-end mt-4 p-3 bg-blue-50 border border-blue-100 rounded" *ngIf="previewSourcingCharges && previewSourcingCharges.length > 0">
                <span class="font-bold mr-4">Total Sell Amount:</span>
                <span class="font-bold text-green-700 text-lg">{{ calculateTotalSell(previewSourcingCharges) }}</span>
              </div>
            </p-tabPanel>

            <p-tabPanel header="Selected Tariff">
              <div *ngIf="!groupedTariffData || groupedTariffData.length === 0" class="text-center p-4 text-gray-500 bg-gray-50 rounded">
                No tariff charges selected for this line item.
              </div>

              <div *ngFor="let group of groupedTariffData" class="mb-5">
                <div class="bg-gray-100 px-3 py-2 border-l-4 border-blue-500 font-bold text-blue-800 mb-2">
                  Route: {{ group.route }}
                </div>
                <p-table [value]="group.charges" [showGridlines]="true" styleClass="p-datatable-sm">
                  <ng-template pTemplate="header">
                    <tr>
                      <th>Charge Name</th>
                      <th>Basis</th>
                      <th>Currency</th>
                      <th class="text-right">Charges</th>
                      <th class="text-right">GST/VAT</th>
                      <th>Sell Rate Currency</th>
                      <th class="text-right">Sell Rate</th>
                      <th class="text-right">GST/VAT</th>
                      <th class="text-right">Total Sell</th>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="body" let-charge>
                    <tr>
                      <td>{{ chargeCodeToName.get(charge.charge_name || charge.name) || charge.charge_name || charge.name }}</td>
                      <td>{{ charge.basis }}</td>
                      <td>{{ charge.currency }}</td>
                      <td class="text-right">{{ charge.charges | number:'1.2-2' }}</td>
                      <td class="text-right">{{ charge.gst_vat ? charge.gst_vat + '%' : '' }}</td>
                      <td>{{ charge.sell_rate_currency || charge.currency }}</td>
                      <td class="text-right">{{ charge.sell_rate | number:'1.2-2' }}</td>
                      <td class="text-right">{{ (charge.sell_rate_gst || charge.sell_rate_gst_vat || charge.sell_gst_vat) ? (charge.sell_rate_gst || charge.sell_rate_gst_vat || charge.sell_gst_vat) + '%' : '' }}</td>
                      <td class="text-right font-semibold">{{ calculateRowTotal(charge) | number:'1.2-2' }}</td>
                    </tr>
                  </ng-template>
                </p-table>
                <div class="mt-2 p-2 bg-gray-50 text-sm text-gray-600 border border-gray-100" *ngIf="group.remarks && group.remarks.length > 0">
                  <strong>Remarks:</strong> {{ group.remarks.join('; ') }}
                </div>
              </div>

              <div class="flex justify-end mt-4 p-3 bg-blue-50 border border-blue-100 rounded" *ngIf="previewTariffCharges && previewTariffCharges.length > 0">
                <span class="font-bold mr-4">Total Sell Amount:</span>
                <span class="font-bold text-green-700 text-lg">{{ calculateTotalTariff(previewTariffCharges) }}</span>
              </div>
            </p-tabPanel>
          </p-tabView>
        </div>
        <ng-template pTemplate="footer">
            <button pButton label="Close" icon="pi pi-times" (click)="showEnquiryPreviewDialog = false"></button>
        </ng-template>
      </p-dialog>

      <div class="mb-4">
        <div class="flex items-center mb-2">
          <button pButton label="+ Add Transit" class="p-button-sm" (click)="addTransit()"></button>
        </div>
        <p-table [value]="scheduleRows" [showGridlines]="true">
          <ng-template pTemplate="header">
            <tr>
              <th>Transit Count</th>
              <th>From Location Type</th>
              <th>From Location</th>
              <th>To Location Type</th>
              <th>To Location</th>
              <th>Vessel / Airline</th>
              <th>Voyage / Flight No</th>
              <th>ETD</th>
              <th>ETA</th>
              <th>Action</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-trn let-i="rowIndex">
            <tr>
              <td>{{ i + 1 }}</td>
              <td>
                <div class="flex gap-2 items-center">
                  <p-dropdown [(ngModel)]="trn.from_location_type" [options]="locationTypeOptions" optionLabel="label" optionValue="value" [filter]="true" filterBy="label" appendTo="body" class="w-60"></p-dropdown>
                  <button pButton icon="pi pi-ellipsis-h" class="p-button-sm" (click)="openMasterLocation()"></button>
                </div>
              </td>
              <td>
                <p-dropdown [(ngModel)]="trn.from_location" [options]="getLocationsByType(trn.from_location_type)" optionLabel="label" optionValue="value" [filter]="true" filterBy="label" appendTo="body" class="w-60"></p-dropdown>
              </td>
              <td>
                <div class="flex gap-2 items-center">
                  <p-dropdown [(ngModel)]="trn.to_location_type" [options]="locationTypeOptions" optionLabel="label" optionValue="value" [filter]="true" filterBy="label" appendTo="body" class="w-60"></p-dropdown>
                  <button pButton icon="pi pi-ellipsis-h" class="p-button-sm" (click)="openMasterLocation()"></button>
                </div>
              </td>
              <td>
                <p-dropdown [(ngModel)]="trn.to_location" [options]="getLocationsByType(trn.to_location_type)" optionLabel="label" optionValue="value" [filter]="true" filterBy="label" appendTo="body" class="w-60"></p-dropdown>
              </td>
              <td>
                <p-dropdown 
                  *ngIf="getScheduleType() === 'Airline'"
                  [(ngModel)]="trn.vessel_airline" 
                  [options]="airlineOptions" 
                  optionLabel="label" 
                  optionValue="value" 
                  [filter]="true" 
                  filterBy="label" 
                  appendTo="body" 
                  class="w-60"
                  (onChange)="onAirlineChange(trn)"
                ></p-dropdown>
                <p-dropdown 
                  *ngIf="getScheduleType() === 'Vessel'"
                  [(ngModel)]="trn.vessel_airline" 
                  [options]="vesselOptions" 
                  optionLabel="label" 
                  optionValue="value" 
                  [filter]="true" 
                  filterBy="label" 
                  appendTo="body" 
                  class="w-60"
                ></p-dropdown>
                <input *ngIf="getScheduleType() !== 'Airline' && getScheduleType() !== 'Vessel'" pInputText class="bg-orange-50" [(ngModel)]="trn.vessel_airline"/>
              </td>
              <td>
                <p-dropdown 
                  *ngIf="getScheduleType() === 'Airline'"
                  [(ngModel)]="trn.voyage_flight_no" 
                  [options]="trn._flightNoOptions || []" 
                  optionLabel="label" 
                  optionValue="value" 
                  [filter]="true" 
                  filterBy="label" 
                  appendTo="body" 
                  class="w-60"
                ></p-dropdown>
                <input *ngIf="getScheduleType() !== 'Airline'" pInputText class="bg-orange-50" [(ngModel)]="trn.voyage_flight_no"/>
              </td>
              <td>
                <p-calendar [(ngModel)]="trn.etd" [showIcon]="true" [dateFormat]="configService.calendarDateFormat" appendTo="body" class="w-60" [inputStyle]="{ width: '100%' }" [style]="{ width: '100%' }"></p-calendar>
              </td>
              <td>
                <p-calendar [(ngModel)]="trn.eta" [showIcon]="true" [dateFormat]="configService.calendarDateFormat" appendTo="body" class="w-60" [inputStyle]="{ width: '100%' }" [style]="{ width: '100%' }"></p-calendar>
              </td>
              <td>
                <ng-container *appHasPermission="{ module: 'Operations', subModule: 'Booking', action: 'delete' }">
<button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeTransitRow(i)"></button>
</ng-container>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <div class="section-header">Booking Breakup</div>
      <div class="mb-2">
        <button pButton label="+ Add Breakup" class="p-button-sm" (click)="addBreakupRow()"></button>
      </div>
      <p-table [value]="breakupRows" [showGridlines]="true">
        <ng-template pTemplate="header">
          <tr>
            <th>S.No.</th>
            <th>Vendor Type</th>
            <th>Vendor Name</th>
            <th>Bkg Reference No</th>
            <th>Basis</th>
            <th>Bkg Validity</th>
            <th style="width: 120px;">Qty</th>
            <th>Remarks</th>
            <th>Action</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-bk let-i="rowIndex">
          <tr>
            <td>
              <input pInputText [(ngModel)]="bk.breakup_no" placeholder="No" [style]="{'width':'80px'}" (ngModelChange)="onBreakupQuantityChange()" />
            </td>
            <td>
              <p-dropdown [(ngModel)]="bk.vendor_type" [options]="vendorTypeOptions" placeholder="Select Type" (onChange)="onBreakupVendorTypeChange(bk, true); onBreakupQuantityChange()" appendTo="body" [filter]="true" filterBy="label" [style]="{'width':'150px'}"></p-dropdown>
            </td>
            <td>
              <p-dropdown [(ngModel)]="bk.vendor_name" [options]="bk._vendorOptions || []" placeholder="Select Vendor" (onChange)="onBreakupQuantityChange()" appendTo="body" [filter]="true" filterBy="label" [style]="{'width':'200px'}"></p-dropdown>
            </td>
            <td>
              <input pInputText [(ngModel)]="bk.booking_ref_no" placeholder="Ref No" class="w-full" (ngModelChange)="onBreakupQuantityChange()" />
            </td>
            <td>
              <p-dropdown [(ngModel)]="bk.basis" [options]="getBasisOptions()" placeholder="Select Basis" (onChange)="onBreakupQuantityChange()" appendTo="body" [style]="{'width':'120px'}"></p-dropdown>
            </td>
            <td>
              <p-calendar [(ngModel)]="bk.valid_till" [showIcon]="true" [dateFormat]="configService.calendarDateFormat" appendTo="body" [style]="{'width':'150px'}"></p-calendar>
            </td>
            <td>
              <p-inputNumber [(ngModel)]="bk.quantity" placeholder="Qty" [style]="{'width':'100%'}" (ngModelChange)="onBreakupQuantityChange()" [min]="bk.min_qty || 0" [showButtons]="true" (onBlur)="lockMinQty(bk)"></p-inputNumber>
            </td>
            <td>
              <textarea pInputTextarea [rows]="1" [autoResize]="true" [(ngModel)]="bk.remarks" placeholder="Remarks" class="w-full"></textarea>
            </td>
            <td>
              <ng-container *appHasPermission="{ module: 'Operations', subModule: 'Booking', action: 'delete' }">
<button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeBreakupRow(i)"></button>
</ng-container>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Container Breakup Section -->
      <div *ngIf="breakupType === 'CONTAINER BREAKUP'">
        <div class="section-header mt-4 text-blue-700">Container Breakup Details</div>
        <div class="mb-2 mt-2" *ngIf="breakupRows.length > 0">
          <button pButton label="Bulk Entry" icon="pi pi-table" class="p-button-sm p-button-outlined" (click)="openBulkEntryDialog()"></button>
        </div>
        <p-table [value]="containerBreakupRows" [showGridlines]="true">
          <ng-template pTemplate="header">
            <tr>
              <th colspan="8" class="bg-gray-50">
                <div class="flex justify-between items-center px-2 py-1">
                  <span>Container Breakup Details</span>
                  <button *ngIf="currentBooking.sub_breakup_vendor_type" pButton label="Change Vendor Type" icon="pi pi-refresh" class="p-button-outlined p-button-warning p-button-sm" (click)="changeSubVendorType()"></button>
                </div>
              </th>
            </tr>
            <tr>
              <th>Breakup No.</th>
              <th>Vendor Name</th>
              <th>Ref No.</th>
              <th>Basis</th>
              <th>Container No.</th>
              <th>Pickup/Handover Date</th>
              <th>Empty Yard</th>
              <th>Action</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-cb let-i="rowIndex">
            <tr>
              <td><input pInputText [ngModel]="cb.breakup_no" [style]="{'width':'80px'}" class="bg-gray-50" readonly /></td>
              <td><input pInputText [ngModel]="cb.vendor_name" class="bg-gray-50" readonly /></td>
              <td><input pInputText [ngModel]="cb.booking_ref_no" class="bg-gray-50" readonly /></td>
              <td><input pInputText [ngModel]="cb.basis" class="bg-gray-50" readonly /></td>
              <td><input pInputText [(ngModel)]="cb.container_no" placeholder="Container No" class="bg-orange-50" (ngModelChange)="initializeQuoteMappings()"/></td>
              <td>
                <p-calendar [(ngModel)]="cb.pickup_handover_date" [showIcon]="true" [dateFormat]="configService.calendarDateFormat" appendTo="body" [style]="{'width':'50%'}" class="bg-orange-50"></p-calendar>
              </td>
              <td>
                <p-dropdown [(ngModel)]="cb.empty_yard" [options]="subVendorOptions" placeholder="Select Vendor" (onShow)="triggerSubVendorTypeSelection()" appendTo="body" [filter]="true" filterBy="label" [style]="{'width':'100%'}" class="bg-orange-50"></p-dropdown>
              </td>
              <td>
                <ng-container *appHasPermission="{ module: 'Operations', subModule: 'Booking', action: 'delete' }">
<button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeSubBreakupRow(i, 'container')"></button>
</ng-container>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Package Breakup Section -->
      <div *ngIf="breakupType === 'PACKAGE BREAKUP'">
        <div class="section-header mt-4 text-blue-700">Package Breakup Details</div>
        <div class="mb-2 mt-2" *ngIf="breakupRows.length > 0">
          <button pButton label="Bulk Entry" icon="pi pi-table" class="p-button-sm p-button-outlined" (click)="openBulkEntryDialog()"></button>
        </div>
        <p-table [value]="packageBreakupRows" [showGridlines]="true">
          <ng-template pTemplate="header">
            <tr>
              <th colspan="12" class="bg-gray-50">
                <div class="flex justify-between items-center px-2 py-1">
                  <span>Package Breakup Details</span>
                  <button *ngIf="currentBooking.sub_breakup_vendor_type" pButton label="Change Vendor Type" icon="pi pi-refresh" class="p-button-outlined p-button-warning p-button-sm" (click)="changeSubVendorType()"></button>
                </div>
              </th>
            </tr>
            <tr>
              <th>Breakup No.</th>
              <th>Vendor Name</th>
              <th>Ref No.</th>
              <th>Basis</th>
              <th>Pkg No.</th>
              <th>L(cm)</th>
              <th>W(cm)</th>
              <th>H(cm)</th>
              <th>Wt(kgs)</th>
              <th>Handover Date</th>
              <th>Carting</th>
              <th>Action</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-pb let-i="rowIndex">
            <tr>
              <td><input pInputText [ngModel]="pb.breakup_no" [style]="{'width':'80px'}" class="bg-gray-50" readonly /></td>
              <td><input pInputText [ngModel]="pb.vendor_name" class="bg-gray-50" readonly /></td>
              <td><input pInputText [ngModel]="pb.booking_ref_no" class="bg-gray-50" readonly /></td>
              <td><input pInputText [ngModel]="pb.basis" class="bg-gray-50" readonly /></td>
              <td><input pInputText [(ngModel)]="pb.package_no" placeholder="Pkg No" class="bg-orange-50" (ngModelChange)="initializeQuoteMappings()"/></td>
              <td><input pInputText type="number" [(ngModel)]="pb.length_cm" [style]="{'width':'70px'}" class="bg-orange-50" /></td>
              <td><input pInputText type="number" [(ngModel)]="pb.width_cm" [style]="{'width':'70px'}" class="bg-orange-50" /></td>
              <td><input pInputText type="number" [(ngModel)]="pb.height_cm" [style]="{'width':'70px'}" class="bg-orange-50" /></td>
              <td><input pInputText type="number" [(ngModel)]="pb.weight_kgs" [style]="{'width':'70px'}" class="bg-orange-50" /></td>
              <td>
                <p-calendar [(ngModel)]="pb.handover_date" [showIcon]="true" [dateFormat]="configService.calendarDateFormat" appendTo="body" [style]="{'width':'100%'}" class="bg-orange-50"></p-calendar>
              </td>
              <td>
                <p-dropdown [(ngModel)]="pb.carting" [options]="subVendorOptions" placeholder="Select Vendor" (onShow)="triggerSubVendorTypeSelection()" appendTo="body" [filter]="true" filterBy="label" [style]="{'width':'100%'}" class="bg-orange-50"></p-dropdown>
              </td>
              <td>
                <ng-container *appHasPermission="{ module: 'Operations', subModule: 'Booking', action: 'delete' }">
<button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeSubBreakupRow(i, 'package')"></button>
</ng-container>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Quote Mapping Section -->
      <div *ngIf="breakupType === 'CONTAINER BREAKUP' || breakupType === 'PACKAGE BREAKUP'">
        <div class="section-header mt-4 text-green-700 flex justify-between items-center">
          <span>Quote Mapping</span>
          
        </div>

        <p-dialog [(visible)]="showBulkApplyDialog" header="Bulk Apply" [modal]="true" [style]="{width: '450px'}" appendTo="body">
          <div class="grid grid-cols-12 gap-3 pt-2">
            <div class="col-span-12">
              <p class="text-sm text-gray-500 mb-2">Select criteria to apply to existing Quote Mapping rows.</p>
            </div>
            <div class="col-span-12">
              <label class="block text-sm font-medium text-slate-700 mb-1">Number</label>
              <p-dropdown [(ngModel)]="bulkApplyQuote.breakup_number" [options]="breakupNumberOptions" placeholder="Select" appendTo="body" [filter]="true" filterBy="label" [style]="{'width':'100%'}"></p-dropdown>
            </div>
            <div class="col-span-12">
              <label class="block text-sm font-medium text-slate-700 mb-1">Enquiry No</label>
              <p-dropdown [(ngModel)]="bulkApplyQuote.enquiry_no" [options]="enquiryOptions" placeholder="Select" (onChange)="onBulkEnquiryChange()" appendTo="body" [filter]="true" filterBy="label" [style]="{'width':'100%'}"></p-dropdown>
            </div>
            <div class="col-span-12">
              <label class="block text-sm font-medium text-slate-700 mb-1">Line Item Type</label>
              <p-dropdown [(ngModel)]="bulkApplyQuote.line_item_type" [options]="bulkApplyQuote._lineItemTypeOptions || []" placeholder="Select" appendTo="body" [filter]="true" filterBy="label" [style]="{'width':'100%'}" [disabled]="!bulkApplyQuote.enquiry_no"></p-dropdown>
            </div>
            <div class="col-span-6 bg-blue-50 p-2 rounded">
              <label class="block text-sm font-medium text-slate-700 mb-1">From Row</label>
              <p-dropdown [(ngModel)]="bulkApplyQuote.from_row" [options]="getQuoteMappingRowOptions()" appendTo="body" [style]="{'width':'100%'}" placeholder="Select"></p-dropdown>
            </div>
            <div class="col-span-6 bg-blue-50 p-2 rounded">
              <label class="block text-sm font-medium text-slate-700 mb-1">To Row</label>
              <p-dropdown [(ngModel)]="bulkApplyQuote.to_row" [options]="getQuoteMappingRowOptions()" appendTo="body" [style]="{'width':'100%'}" placeholder="Select"></p-dropdown>
            </div>
          </div>
          <ng-template pTemplate="footer">
            <button pButton label="Cancel" class="p-button-text" icon="pi pi-times" (click)="showBulkApplyDialog = false"></button>
            <ng-container *appHasPermission="{ module: 'Operations', subModule: 'Booking', action: 'write' }">
<button pButton label="Apply" class="p-button-sm" icon="pi pi-check" (click)="applyBulkQuoteMapping(); showBulkApplyDialog = false"></button>
</ng-container>
          </ng-template>
        </p-dialog>

        <div class="mb-2">
          <button pButton label="+ Add Mapping" class="p-button-sm " (click)="addQuoteMappingRow()"></button>
          <button pButton label="Bulk Apply" icon="pi pi-bolt" style="margin-left:8px" class="p-button-sm p-button-outlined ml-2" (click)="showBulkApplyDialog = true"></button>
        </div>
        <p-table [value]="quoteMappingRows" [showGridlines]="true">
        
          <ng-template pTemplate="header">
          
             <tr>
              <th style="width: 220px;">{{ breakupType === 'CONTAINER BREAKUP' ? 'Container No.' : 'Package No.' }}</th>
              <th style="width: 220px;">Enquiry Number</th>
              <th style="width: 270px;">Line Item Type</th>
              <th style="width: 80px;">Action</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-qm let-i="rowIndex">
            <tr>
              <td>
                <p-dropdown 
                  [(ngModel)]="qm.breakup_number" 
                  [options]="breakupNumberOptions" 
                  placeholder="Select Number" 
                  appendTo="body" 
                  [filter]="true" 
                  filterBy="label" 
                   [scrollHeight]="'300px'"
                  [style]="{'width':'200px'}"
                  class="bg-orange-50"
                ></p-dropdown>
              </td>
              <td>
                <p-dropdown 
                  [(ngModel)]="qm.enquiry_no" 
                  [options]="enquiryOptions" 
                  placeholder="Select Enquiry" 
                  (onChange)="onEnquiryChange(qm)" 
                  appendTo="body" 
                  [filter]="true" 
                  filterBy="label" 
                   [scrollHeight]="'300px'"
                  [style]="{'width':'200px'}"
                  class="bg-orange-50"
                ></p-dropdown>
              </td>
              <td>
                <p-dropdown 
                  [(ngModel)]="qm.line_item_type" 
                  [options]="qm._lineItemTypeOptions || []" 
                  placeholder="Select Type" 
                  appendTo="body" 
                  [filter]="true" 
                  filterBy="label" 
                   [scrollHeight]="'300px'"
                  [style]="{'width':'250px'}"
                  class="bg-orange-50"
                  [disabled]="!qm.enquiry_no"
                ></p-dropdown>
              </td>
              <td>
                <ng-container *appHasPermission="{ module: 'Operations', subModule: 'Booking', action: 'delete' }">
<button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeQuoteMappingRow(i)"></button>
</ng-container>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <p-dialog header="Location" [(visible)]="showMasterLocationDialog" [modal]="true" [style]="{width: '85vw'}" [contentStyle]="{height: '70vh'}" [draggable]="false" [resizable]="false">
        <master-location (onSave)="loadDropdowns()"></master-location>
        <ng-template pTemplate="footer">
          <button pButton label="Close" class="p-button-secondary" (click)="closeMasterLocation()"></button>
        </ng-template>
      </p-dialog>
      <div class="flex justify-end gap-2 mt-4">
        <button pButton icon="pi pi-times" label="Cancel" class="p-button-text" (click)="showBookingForm=false"></button>
        <ng-container *appHasPermission="{ module: 'Operations', subModule: 'Booking', action: 'write' }">
<button pButton label="Save" icon="pi pi-save" class="p-button-sm" (click)="finalSave()"></button>
</ng-container>
      </div>
      </div>
      </ng-template>
    </p-dialog>

    <!-- Bulk Entry Dialog -->
    <p-dialog 
      [header]="activeBulkEntryType === 'container' ? 'Container Breakup Bulk Entry' : 'Package Breakup Bulk Entry'" 
      [(visible)]="showBulkEntryDialog" 
      [modal]="true" 
      [draggable]="false" 
      [resizable]="false" 
      [style]="{ width: '800px' }"
      [contentStyle]="{ overflow: 'auto' }">
      <ng-template pTemplate="content">
        <div class="p-fluid">
          <!-- Breakup Number Selector -->
          <div *ngIf="breakupRows.length > 1" class="grid grid-cols-12 gap-4 mb-4 p-4 bg-yellow-50 rounded border-2 border-yellow-300">
            <div class="col-span-12">
              <h4 class="text-lg font-semibold mb-2">Select Booking Breakup</h4>
              <p class="text-sm text-gray-600 mb-2">Choose which booking breakup's rows to update</p>
            </div>
            <div class="col-span-12">
              <label class="block mb-1">Breakup No.</label>
              <p-dropdown 
                [(ngModel)]="selectedBreakupNo" 
                [options]="getBreakupNoOptions()" 
                placeholder="Select Breakup No." 
                (onChange)="onBreakupNoChange()"
                appendTo="body"
                [scrollHeight]="'200px'"
                [style]="{'width':'100%'}">
              </p-dropdown>
            </div>
          </div>

          <!-- Range Selector -->
          <div class="grid grid-cols-12 gap-4 mb-4 p-4 bg-blue-50 rounded">
            <div class="col-span-12">
              <h4 class="text-lg font-semibold mb-2">Select Range</h4>
            </div>
            <div class="col-span-6">
              <label class="block mb-1">From Row</label>
              <p-dropdown 
                [(ngModel)]="bulkEntryRange.from" 
                [options]="getRangeOptions()" 
                placeholder="Select From" 
                appendTo="body"
                [scrollHeight]="'200px'"
                [style]="{'width':'100%'}">
              </p-dropdown>
            </div>
            <div class="col-span-6">
              <label class="block mb-1">To Row</label>
              <p-dropdown 
                [(ngModel)]="bulkEntryRange.to" 
                [options]="getRangeOptions()" 
                placeholder="Select To" 
                appendTo="body"
                [scrollHeight]="'200px'"
                [style]="{'width':'100%'}">
              </p-dropdown>
            </div>
          </div>

          <!-- New Common Fields (Booking Breakup Details) -->
          <div class="grid grid-cols-12 gap-4 mb-4 p-4 bg-gray-50 rounded border border-gray-200">
             <div class="col-span-12">
               <h4 class="text-lg font-semibold mb-2">Booking Breakup Details</h4>
             </div>
             <!-- Breakup No (Assign to specific breakup) -->
             <div class="col-span-6">
                <label class="block mb-1">Breakup No.</label>
                 <p-dropdown 
                   [(ngModel)]="bulkEntryForm.breakup_no" 
                   [options]="getBreakupNoOptions()" 
                   placeholder="Select Breakup No" 
                   appendTo="body" 
                   [filter]="true" 
                   filterBy="label"
                   [scrollHeight]="'200px'"
                   [style]="{'width':'100%'}">
                 </p-dropdown>
             </div>
             
             <div class="col-span-6">
                <label class="block mb-1">Vendor Name</label>
                <!-- Existing Vendor Names from Breakup Rows -->
                <p-dropdown 
                   [(ngModel)]="bulkEntryForm.vendor_name" 
                   [options]="getUniqueVendorNames()" 
                   placeholder="Select Vendor" 
                   appendTo="body" 
                   [filter]="true" 
                   filterBy="label" 
                   [scrollHeight]="'200px'"
                   [style]="{'width':'100%'}">
                </p-dropdown>
             </div>
             
             <div class="col-span-6">
                <label class="block mb-1">Ref No.</label>
                <p-dropdown 
                   [(ngModel)]="bulkEntryForm.booking_ref_no" 
                   [options]="getUniqueRefNos()" 
                   placeholder="Select Ref No" 
                   appendTo="body" 
                   [filter]="true" 
                   filterBy="label" 
                   [scrollHeight]="'200px'"
                   [style]="{'width':'100%'}">
                </p-dropdown>
             </div>

             <div class="col-span-6">
                <label class="block mb-1">Basis</label>
                <p-dropdown 
                   [(ngModel)]="bulkEntryForm.basis" 
                   [options]="getUniqueBasis()" 
                   placeholder="Select Basis" 
                   appendTo="body" 
                   [scrollHeight]="'200px'"
                   [style]="{'width':'100%'}">
                </p-dropdown>
             </div>
          </div>

          <!-- Container Breakup Form -->
          <div *ngIf="activeBulkEntryType === 'container'" class="grid grid-cols-12 gap-4">
            <div class="col-span-12">
              <h4 class="text-lg font-semibold mb-2">Container Details</h4>
            </div>
            <div class="col-span-12">
              <label class="block mb-1">Container No.</label>
              <input pInputText [(ngModel)]="bulkEntryForm.container_no" placeholder="Enter Container No." class="w-full" />
            </div>
            <div class="col-span-12">
              <label class="block mb-1">Pickup/Handover Date</label>
              <p-calendar 
                [(ngModel)]="bulkEntryForm.pickup_handover_date" 
                [showIcon]="true" 
                [dateFormat]="configService.calendarDateFormat" 
                appendTo="body" 
                [style]="{'width':'100%'}">
              </p-calendar>
            </div>

            <!-- Empty Yard (Two-Step Vendor Selection) -->
            <div class="col-span-12 p-3 bg-blue-50 rounded border border-blue-100">
               <h5 class="font-medium mb-2">Empty Yard Details</h5>
               <div class="grid grid-cols-2 gap-4">
                 <div>
                    <label class="block mb-1">Vendor Type</label>
                    <p-dropdown [(ngModel)]="bulkEntryForm.empty_yard_vendor_type" [options]="vendorTypeOptions" placeholder="Select Type" (onChange)="onBulkEmptyYardTypeChange()" appendTo="body" [scrollHeight]="'200px'" [style]="{'width':'100%'}"></p-dropdown>
                 </div>
                 <div>
                    <label class="block mb-1">Vendor Name</label>
                    <p-dropdown 
                      [(ngModel)]="bulkEntryForm.empty_yard" 
                      [options]="bulkEntryForm._emptyYardVendorOptions || []" 
                      placeholder="Select Vendor" 
                      appendTo="body" 
                      [filter]="true" 
                      filterBy="label" 
                      [scrollHeight]="'200px'"
                      [style]="{'width':'100%'}">
                    </p-dropdown>
                 </div>
               </div>
            </div>

          </div>

          <!-- Package Breakup Form -->
          <div *ngIf="activeBulkEntryType === 'package'" class="grid grid-cols-12 gap-4">
            <div class="col-span-12">
              <h4 class="text-lg font-semibold mb-2">Package Details</h4>
            </div>

            <!-- Package Number Generation Section -->
             <div class="col-span-12 p-3 bg-indigo-50 rounded border border-indigo-100">
               <label class="block mb-2 font-medium">Package Number Mode</label>
               
               <div class="flex flex-col gap-3 mb-3">
                 <div class="flex align-items-center">
                   <p-radioButton 
                     inputId="pkgModeSame" 
                     name="pkgMode" 
                     value="same" 
                     [(ngModel)]="bulkEntryForm.package_no_mode">
                   </p-radioButton>
                   <label for="pkgModeSame" class="ml-2 cursor-pointer">Same Package No</label>
                 </div>
                 <div class="flex align-items-center">
                   <p-radioButton 
                     inputId="pkgModeSeq" 
                     name="pkgMode" 
                     value="sequence" 
                     [(ngModel)]="bulkEntryForm.package_no_mode">
                   </p-radioButton>
                   <label for="pkgModeSeq" class="ml-2 cursor-pointer">Generate Sequence</label>
                 </div>
               </div>

               <div *ngIf="bulkEntryForm.package_no_mode === 'same'">
                  <label class="block mb-1">Package No.</label>
                  <input pInputText [(ngModel)]="bulkEntryForm.package_no" placeholder="Enter Package No." class="w-full" />
               </div>

               <div *ngIf="bulkEntryForm.package_no_mode === 'sequence'" class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block mb-1">First Package No (e.g. pck1)</label>
                    <input pInputText [(ngModel)]="bulkEntryForm.pkg_seq_first" placeholder="e.g. pck1" class="w-full" />
                  </div>
                  <div>
                    <label class="block mb-1">Next Package No (e.g. pck2)</label>
                    <input pInputText [(ngModel)]="bulkEntryForm.pkg_seq_next" placeholder="e.g. pck2" class="w-full" />
                  </div>
                  <div class="col-span-2 text-xs text-gray-500">
                    System will automatically detect prefix and increment.
                  </div>
               </div>
             </div>

            <div class="col-span-6">
              <label class="block mb-1">Length (cm)</label>
              <input pInputText type="number" [(ngModel)]="bulkEntryForm.length_cm" placeholder="Length" class="w-full" />
            </div>
            <div class="col-span-6">
              <label class="block mb-1">Width (cm)</label>
              <input pInputText type="number" [(ngModel)]="bulkEntryForm.width_cm" placeholder="Width" class="w-full" />
            </div>
            <div class="col-span-6">
              <label class="block mb-1">Height (cm)</label>
              <input pInputText type="number" [(ngModel)]="bulkEntryForm.height_cm" placeholder="Height" class="w-full" />
            </div>
            <div class="col-span-6">
              <label class="block mb-1">Weight (kgs)</label>
              <input pInputText type="number" [(ngModel)]="bulkEntryForm.weight_kgs" placeholder="Weight" class="w-full" />
            </div>
            
            <div class="col-span-12">
              <label class="block mb-1">Handover Date</label>
              <p-calendar 
                [(ngModel)]="bulkEntryForm.handover_date" 
                [showIcon]="true" 
                [dateFormat]="configService.calendarDateFormat" 
                appendTo="body" 
                [style]="{'width':'100%'}">
              </p-calendar>
            </div>

            <!-- Carting (Two-Step Vendor Selection) -->
            <div class="col-span-12 p-3 bg-green-50 rounded border border-green-100">
               <h5 class="font-medium mb-2">Carting Details</h5>
               <div class="grid grid-cols-2 gap-4">
                 <div>
                    <label class="block mb-1">Vendor Type</label>
                    <p-dropdown [(ngModel)]="bulkEntryForm.carting_vendor_type" [options]="vendorTypeOptions" placeholder="Select Type" (onChange)="onBulkCartingTypeChange()" appendTo="body" [scrollHeight]="'200px'" [style]="{'width':'100%'}"></p-dropdown>
                 </div>
                 <div>
                    <label class="block mb-1">Vendor Name</label>
                    <p-dropdown 
                      [(ngModel)]="bulkEntryForm.carting" 
                      [options]="bulkEntryForm._cartingVendorOptions || []" 
                      placeholder="Select Vendor" 
                      appendTo="body" 
                      [filter]="true" 
                      filterBy="label" 
                      [scrollHeight]="'200px'"
                      [style]="{'width':'100%'}">
                    </p-dropdown>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <button pButton label="Cancel" class="p-button-secondary" (click)="closeBulkEntryDialog()"></button>
        <ng-container *appHasPermission="{ module: 'Operations', subModule: 'Booking', action: 'write' }">
<button pButton label="Apply" icon="pi pi-check" (click)="submitBulkEntry()"></button>
</ng-container>
      </ng-template>
    </p-dialog>
  `,
})
export class BookingComponent implements OnInit, OnDestroy {
  isLoadingDialogData = false;
  private destroy$ = new Subject<void>();
  private selectedBookingTrigger$ = new BehaviorSubject<any>(null);

  bookings: any[] = [];
  search = '';
  statusFilter = '';
  bookingStatusOptions: any[] = [];

  showCreateDialog = false;
  showErrorDialog = false;
  errorMessage = '';
  errorHeader = 'Error';
  dialog: any = { department: '', service_type: '', from_location: '', to_location: '' };
  departmentOptions: any[] = [];
  departmentOptionsRaw: any[] = [];
  serviceTypeOptions: any[] = [];
  allServiceTypes: any[] = [];
  fromLocationOptions: any[] = [];
  toLocationOptions: any[] = [];
  locationMap: { [code: string]: string } = {};
  allLocations: any[] = [];
  locationTypeOptions: any[] = [];
  showMasterLocationDialog = false;
  matchingEnquiries: any[] = [];
  selectedEnquiries: any[] = [];
  showLinkDialog = false;
  linkTargetBooking: any = null;
  linkedEnquiryCodes: Set<string> = new Set();
  pendingLinkEnquiries: any[] = [];
  pendingOverrides: any = {};

  totalRecords: number = 0;
  loading: boolean = false;

  showBookingForm = false;
  currentBooking: BookingRecord = { booking_type: 'manual', status: 'Open' } as any;
  isFrozen = false;
  cargoRows: any[] = [];
  carriageRows: any[] = [];
  lineItemsRows: any[] = [];
  scheduleRows: any[] = [];
  breakupRows: any[] = [];
  containerBreakupRows: any[] = [];
  packageBreakupRows: any[] = [];
  showSubVendorTypeDialog = false;
  showBulkApplyDialog = false;
  subVendorOptions: any[] = [];
  vendorTypeOptions: any[] = [];
  yesNoOptions = [{ label: 'YES', value: 'YES' }, { label: 'NO', value: 'NO' }];
  enquiryTypeOptions = [{ label: 'Direct', value: 'Direct' }, { label: 'Nominee', value: 'Nominee' }];
  allCargoItems: MasterItem[] = [];

  cargoTypeOptions: any[] = [];
  allVendors: any[] = [];
  isSelectingForExisting = false;

  allAirlines: any[] = [];
  airlineOptions: any[] = [];
  allVessels: any[] = [];
  vesselOptions: any[] = [];

  // Quote Mapping State
  quoteMappingRows: any[] = [];
  enquiryOptions: any[] = [];
  breakupNumberOptions: any[] = [];
  lineItemTypeOptionsMap: { [enquiryNo: string]: any[] } = {};

  bulkApplyQuote: any = {
    breakup_number: null,
    enquiry_no: null,
    line_item_type: null,
    from_row: 1,
    to_row: 1,
    _lineItemTypeOptions: []
  };

  // Bulk Entry State
  showBulkEntryDialog = false;
  bulkEntryForm: any = {};
  bulkEntryRange: { from: number, to: number } = { from: 1, to: 1 };
  activeBulkEntryType: 'container' | 'package' | null = null;
  selectedBreakupNo: string | null = null;

  // Enquiry Preview Properties
  showEnquiryPreviewDialog = false;
  loadingPreview = false;
  selectedEnquiryForPreview: any = null;
  selectedEnquiryLineItem: any = null;
  selectedSourcingVendor: any = null;
  previewSourcingCharges: any[] = [];
  previewTariffCharges: any[] = [];
  previewSourcingRemarks: string = '';
  previewTariffRemarks: string = '';
  groupedSourcingData: any[] = [];
  groupedTariffData: any[] = [];

  get locationMapReverse(): { [name: string]: string } {
    const rev: any = {};
    Object.keys(this.locationMap).forEach(code => {
      rev[this.locationMap[code]] = code;
    });
    return rev;
  }
  chargeCodeToName: Map<string, string> = new Map();
  basisMasterOptions: any[] = [];

  constructor(
    private bookingService: BookingService,
    private enquiryService: EnquiryService,
    private contextService: ContextService,
    private serviceTypeService: ServiceTypeService,
    private masterLocationService: MasterLocationService,
    private masterTypeService: MasterTypeService,
    private masterItemService: MasterItemService,
    private vendorService: VendorService,
    private masterAirlineService: MasterAirlineService,
    private masterVesselService: MasterVesselService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    public configService: ConfigService,
    private masterCache: MasterCacheService
  ) { }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold';
      case 'Closed':
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold';
      case 'Confirmed':
      case 'Active':
        return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold';
      default:
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold';
    }
  }

  ngOnInit() {
    this.loadChargeTypeNames().subscribe();
    // Load grid immediately so user sees something
    this.loadBookings();
    
    // Setup reactive dropdown listeners
    this.setupReactiveDropdowns();
    
    // 🚀 Restore Global Pre-warming
    this.loadDropdowns();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Implements Reactive Dropdown Stabilization for Booking.
   */
  private setupReactiveDropdowns() {
    // 1. Service Type (Depends on Department)
    combineLatest([
      this.masterCache.getServiceTypes().pipe(startWith([])),
      this.selectedBookingTrigger$.pipe(distinctUntilChanged())
    ]).pipe(takeUntil(this.destroy$)).subscribe(([serviceTypes, booking]) => {
      this.allServiceTypes = serviceTypes || [];
      this.onDepartmentChange();
      this.cdr.detectChanges();
    });

    // 2. Locations
    this.masterCache.getLocations().pipe(takeUntil(this.destroy$)).subscribe(locations => {
      this.allLocations = (locations || []).filter(l => this.masterLocationService.isActiveLocation(l));
      this.locationMap = {};
      this.allLocations.forEach(l => this.locationMap[l.code] = l.name);
      this.cdr.detectChanges();
    });
  }

  loadBookings(event?: any) {
    // If we're already loading master data, don't trigger lazy load yet
    // unless it's a pagination event
    if (!event && this.loading) return;

    this.loading = true;
    const page = event ? (event.first / event.rows) + 1 : 1;
    const limit = event ? event.rows : this.configService.getSystemConfig().maxRecordsPerPage;

    this.bookingService.getAll(page, limit, this.search, this.statusFilter).subscribe({
      next: (res) => {
        this.bookings = res?.data || [];
        this.totalRecords = res?.total || 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.bookings = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadDropdowns() {
    // Do NOT set this.loading = true here.
    // We want the grid to load independently. Master data can arrive later.

    // 🚀 Cache-First Hydration Strategy: Load from MasterCacheService
    forkJoin({
      departments: this.masterCache.getDepartments().pipe(take(1)),
      locations: this.masterCache.getLocations().pipe(take(1)),
      bookingStatuses: this.masterCache.getMasterTypes('BOOKING_STATUS').pipe(take(1)),
      cargoItems: this.masterCache.getItems().pipe(take(1)),
      vendors: this.masterCache.getVendors().pipe(take(1)),
      serviceTypes: this.masterCache.getServiceTypes().pipe(take(1)),
      airlines: this.masterCache.getAirlines().pipe(take(1)),
      vessels: this.masterCache.getVessels().pipe(take(1)),
      vendorTypes: this.masterCache.getMasterTypes('VENDOR').pipe(take(1)),
      locationTypes: this.masterCache.getAllMasterTypes().pipe(take(1)),
      basisMaster: this.masterCache.getBasis().pipe(take(1))
    }).subscribe({
      next: (res) => {
        // 1. Departments
        this.departmentOptionsRaw = res.departments || [];
        this.departmentOptions = (res.departments || []).map((d: any) => ({
          label: d.name,
          value: d.name,
          code: d.code
        }));

        // 2. Locations Map (CRITICAL for locName pipe/function)
        // Filter only active locations
        this.allLocations = (res.locations || []).filter((loc: any) => this.masterLocationService.isActiveLocation(loc));
        this.locationMap = {};
        this.allLocations.forEach(loc => {
          this.locationMap[loc.code] = loc.name;
        });

        // 3. Statuses
        this.bookingStatusOptions = (res.bookingStatuses || [])
          .filter((s: any) => (s.status || '').toString().toLowerCase() === 'active')
          .map((s: any) => ({
            label: s.value,
            value: s.value
          }));

        // 4. Cargo
        // Filter only active cargo items
        this.allCargoItems = (res.cargoItems || []).filter((item: any) => item.active === true || (item.status || '').toString().toLowerCase() === 'active');
        this.cargoTypeOptions = (res.locationTypes || [])
          .filter((t: any) => (t.key || '').toString().toLowerCase() === 'cargo_type' && (t.status || '').toString().toLowerCase() === 'active')
          .map((t: any) => ({ label: t.value, value: t.value }));

        // 5. Vendors
        // Filter only active vendors
        this.allVendors = (res.vendors || []).filter((v: any) => (v.status || '').toString().toLowerCase() === 'active');
        this.refreshSubVendorOptions();

        // 6. Service Types
        // Filter only active service types
        this.allServiceTypes = (res.serviceTypes || []).filter((st: any) => (st.status || '').toString().toLowerCase() === 'active');
        this.serviceTypeOptions = this.allServiceTypes.map(st => ({
          label: st.name,
          value: st.name,
          code: st.code
        }));

        // 7. Airlines & Vessels
        // Filter only active airlines
        this.allAirlines = (res.airlines || []).filter((a: any) => a.active === true);
        this.airlineOptions = this.allAirlines.map(a => ({ label: a.airline_name, value: a.airline_name }));

        // Filter only active vessels
        this.allVessels = (res.vessels || []).filter((v: any) => v.active === true);
        this.vesselOptions = this.allVessels.map(v => ({ label: v.vessel_name, value: v.vessel_name }));

        // 8. Vendor Types
        this.vendorTypeOptions = (res.vendorTypes || [])
          .filter((t: any) => (t.status || '').toString().toLowerCase() === 'active')
          .map((t: any) => ({ label: t.value, value: t.value }));

        // 9. Location Types
        this.locationTypeOptions = (res.locationTypes || [])
          .filter((t: any) => (t.key || '').toString().toLowerCase() === 'location' && (t.status || '').toString().toLowerCase() === 'active')
          .map((t: any) => ({ label: t.value, value: t.value }));

        // 10. Basis Master fallback
        this.basisMasterOptions = (res.basisMaster || [])
          .filter((b: any) => (b.status || '').toString().toLowerCase() === 'active')
          .map((b: any) => ({ label: b.code, value: b.code }));

        // Masters are ready
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load master data:', err);
        // Do not block UI on error
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to initialize master data' });
        this.cdr.detectChanges();
      }
    });
  }

  openCreateDialog() {
    this.isLoadingDialogData = true;
    this.dialog = { department: '', service_type: '', from_location_type: '', from_location: '', to_location_type: '', to_location: '' };
    this.matchingEnquiries = []; 
    this.selectedEnquiries = [];
    this.linkedEnquiryCodes.clear();
    this.isSelectingForExisting = false;

    // Load ALL required masters BEFORE showing the dialog
    forkJoin({
      depts: this.masterCache.getDepartments().pipe(take(1)),
      locations: this.masterCache.getLocations().pipe(take(1)),
      serviceTypes: this.masterCache.getServiceTypes().pipe(take(1)),
      locationTypes: this.masterCache.getAllMasterTypes().pipe(take(1), map((types: any[]) => types.filter((t: any) => t.key === 'LOCATION')))
    }).subscribe({
      next: (results: any) => {
        this.isLoadingDialogData = false;
        this.showCreateDialog = true;
        
        // Setup initial options
        this.allLocations = results.locations || [];
        this.allServiceTypes = results.serviceTypes || [];
        this.departmentOptionsRaw = results.depts || [];
        this.departmentOptions = (results.depts || []).map((d: any) => ({ label: d.name, value: d.name }));
        this.locationTypeOptions = results.locationTypes.map((t: any) => ({ label: t.value, value: t.value }));
        
        this.selectedBookingTrigger$.next(this.dialog);
        this.onLocationTypeChange('from');
        this.onLocationTypeChange('to');
        this.searchEnquiries();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingDialogData = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load master data' });
      }
    });
  }

  openEnquirySelection() {
    this.dialog = { department: '', service_type: '', from_location_type: '', from_location: '', to_location_type: '', to_location: '' };
    this.matchingEnquiries = []; this.selectedEnquiries = [];
    this.showCreateDialog = true;
    this.isSelectingForExisting = true;
    this.onLocationTypeChange('from');
    this.onLocationTypeChange('to');
    this.searchEnquiries();
  }

  onLocationTypeChange(field: 'from' | 'to') {
    const type = field === 'from' ? this.dialog.from_location_type : this.dialog.to_location_type;
    let opts: any[] = [];
    if (!type) {
      opts = this.allLocations.map((l: any) => ({ label: l.name, value: l.code }));
    } else {
      opts = this.allLocations
        .filter((l: any) => (l.type || '').toString() === type)
        .map((l: any) => ({ label: l.name, value: l.code }));
    }
    if (field === 'from') this.fromLocationOptions = opts;
    else this.toLocationOptions = opts;
  }

  onDepartmentChange() {
    const name = this.dialog.department || '';
    const found = (this.departmentOptionsRaw || []).find((d: any) => (d.name || '').toString().trim().toLowerCase() === name.toString().trim().toLowerCase());
    const deptCode = found ? found.code : '';

    // Filter service types by department
    if (deptCode) {
      const filteredServiceTypes = this.allServiceTypes.filter((st: any) =>
        st.department_code === deptCode || !st.department_code
      );
      this.serviceTypeOptions = filteredServiceTypes.map((st: any) => ({
        label: st.name,
        value: st.name
      }));
    } else {
      // Show all service types if no department selected
      this.serviceTypeOptions = this.allServiceTypes.map((st: any) => ({
        label: st.name,
        value: st.name
      }));
    }

    this.searchEnquiries();
  }

  clearFilters() {
    this.dialog = { department: '', service_type: '', from_location_type: '', from_location: '', to_location_type: '', to_location: '' };
    this.onLocationTypeChange('from');
    this.onLocationTypeChange('to');
    this.searchEnquiries();
  }

  searchEnquiries() {
    const criteria = { ...this.dialog };
    this.bookingService.searchEnquiries(criteria).subscribe({
      next: (rows) => { this.matchingEnquiries = rows || []; },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to search enquiries' }); }
    });
  }

  // on closing the create booking dialog
  onCreateBookingCancel() {
    this.showCreateDialog = false;
    this.linkTargetBooking = null;
    this.linkedEnquiryCodes.clear();
  }

  // on creating booking from enquiries
  saveFromEnquiries() {
    // Booking Initial Validation
    if (this.selectedEnquiries.length > 1) {
      const first = this.selectedEnquiries[0];
      const mismatch = this.selectedEnquiries.some(e =>
        e.company_name !== first.company_name ||
        e.department !== first.department ||
        e.service_type !== first.service_type ||
        e.from_location !== first.from_location ||
        e.to_location !== first.to_location
      );

      if (mismatch) {
        this.errorHeader = 'Validation Error';
        this.errorMessage = 'All selected enquiries must have matching Company, Department, Service Type, From Location, and To Location.';
        this.showErrorDialog = true;
        return;
      }
    }
    // Carriage Validation
    const carriageTypes = ['Place of Receipt', 'Port of Loading', 'Final Destination', 'Place of Delivery', 'Port of Discharge'];
    for (const type of carriageTypes) {
      const uniqueValues = new Set<string>();
      for (const enq of this.selectedEnquiries) {
        const item = (enq.carriage_map || []).find((c: any) => c.carriage === type);
        const loc = item?.location?.toString().trim();
        if (loc) uniqueValues.add(loc.toLowerCase());
      }
      if (uniqueValues.size > 1) {
        this.errorHeader = 'Carriage Conflict';
        this.errorMessage = `Selected enquiries have conflicting values for ${type}. Please ensure they match or are empty.`;
        this.showErrorDialog = true;
        return;
      }
    }
    // Calculate overrides (earliest effective date from, oldest effective date to)
    let overrides: any = { status: 'Active' };
    if (this.selectedEnquiries.length > 0) {
      // Calculate earliest Effective Date From
      const fromDates = this.selectedEnquiries
        .map((e: any) => e.effective_date_from ? new Date(e.effective_date_from).getTime() : null)
        .filter((t: number | null) => t !== null && !isNaN(t)) as number[];

      if (fromDates.length > 0) {
        overrides.effective_date_from = this.formatDate(new Date(Math.min(...fromDates)));
      }

      // Calculate Oldest Effective Date To
      const toDates = this.selectedEnquiries
        .map((e: any) => e.effective_date_to ? new Date(e.effective_date_to).getTime() : null)
        .filter((t: number | null) => t !== null && !isNaN(t)) as number[];

      if (toDates.length > 0) {
        overrides.effective_date_to = this.formatDate(new Date(Math.max(...toDates)));
      }
    }
    this.pendingOverrides = overrides;


    const selected = this.selectedEnquiries.map((e: any) => ({ id: e.id, code: e.code }));
    // Check for Link Mode (Existing Booking)
    if (this.linkTargetBooking) {
      if (selected.length === 0) {
        this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No enquiry selected' });
        return;
      }

      // Validating against target booking
      const target = this.linkTargetBooking;
      const mismatch = this.selectedEnquiries.some(e =>
        (e.company_name || '').trim().toLowerCase() !== (target.company_name || '').trim().toLowerCase() ||
        (e.department || '').trim().toLowerCase() !== (target.department || '').trim().toLowerCase() ||
        (e.service_type || '').trim().toLowerCase() !== (target.service_type || '').trim().toLowerCase() ||
        this.locName(e.from_location).trim().toLowerCase() !== this.locName(target.from_location).trim().toLowerCase() ||
        this.locName(e.to_location).trim().toLowerCase() !== this.locName(target.to_location).trim().toLowerCase()
      );

      if (mismatch) {
        this.errorHeader = 'Link Error';
        this.errorMessage = 'Selected enquiries must match Company, Department, Service Type, From and To Location of the existing booking.';
        this.showErrorDialog = true;
        return;
      }

      this.pendingLinkEnquiries = [...this.selectedEnquiries];
      this.showCreateDialog = false;

      // If the booking details form is already open for the target booking, merge in-memory.
      // This prevents discarding other unsaved changes or prior local appends.
      if (this.showBookingForm && this.currentBooking && String(this.currentBooking.booking_no) === String(this.linkTargetBooking.booking_no)) {
        this.appendPendingEnquiriesDirectly(selected);
      } else {
        this.openBooking(this.linkTargetBooking.booking_no);
      }
      this.linkTargetBooking = null;
      return;
    }

    if (selected.length === 0) {
      if (!this.dialog.department || !this.dialog.service_type || !this.dialog.from_location || !this.dialog.to_location) {
        this.errorHeader = 'Missing Fields';
        this.errorMessage = 'Please select Department, Service Type, From and To Location';
        this.showErrorDialog = true;
        return;
      }
      const manual: BookingRecord = {
        booking_type: 'manual',
        department: this.dialog.department,
        service_type: this.dialog.service_type,
        from_location: this.locName(this.dialog.from_location),
        to_location: this.locName(this.dialog.to_location),
        status: 'Active',
      } as any;
      this.bookingService.createManualBooking(manual).subscribe({
        next: (res) => {
          this.showCreateDialog = false;
          this.loadBookings();
          this.isFrozen = false;
          const bkNo = (res && res.booking_no) ? String(res.booking_no) : '';
          if (bkNo) this.openBooking(bkNo);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: `Manual booking ${bkNo || ''} created` });
        },
        error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create manual booking' }); }
      });
      return;
    }

    this.bookingService.createFromEnquiries(this.dialog, selected, overrides).subscribe({
      next: (res) => {
        this.showCreateDialog = false;
        this.loadBookings();
        this.isFrozen = true;
        const bkNo = (res && res.booking_no) ? String(res.booking_no) : '';
        if (bkNo) this.openBooking(bkNo);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `Booking ${bkNo || ''} created` });
      },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create booking' }); }
    });
  }

  createManual() {
    this.isFrozen = false;
    this.currentBooking = { booking_type: 'manual', status: 'Active', created_at: new Date() } as any;
    this.showBookingForm = true;
  }

  finalSave() {
    const payload = {
      ...this.currentBooking,
      effective_date_from: this.formatDate(this.currentBooking.effective_date_from),
      effective_date_to: this.formatDate(this.currentBooking.effective_date_to),
      cargo: this.cargoRows,
      carriage_map: this.carriageRows,
      line_items: this.lineItemsRows.map((li, index) => ({
        ...li,
        s_no: index + 1
      })),
      schedules: this.scheduleRows.map(s => ({
        ...s,
        etd: this.formatDate(s.etd),
        eta: this.formatDate(s.eta)
      })),
      booking_breakup: this.breakupRows.map(bk => {
        const rowData = { ...bk };
        if (this.breakupType === 'CONTAINER BREAKUP') {
          rowData.container_breakup = this.containerBreakupRows
            .filter(cb => cb.breakup_no === bk.breakup_no)
            .map(cb => ({ ...cb, pickup_handover_date: this.formatDate(cb.pickup_handover_date) }));
        } else if (this.breakupType === 'PACKAGE BREAKUP') {
          rowData.package_breakup = this.packageBreakupRows
            .filter(pb => pb.breakup_no === bk.breakup_no)
            .map(pb => ({ ...pb, handover_date: this.formatDate(pb.handover_date) }));
        }
        return rowData;
      })
    } as BookingRecord;

    // if (this.isFrozen) { this.showBookingForm = false; return; }

    if (payload.id) {
      this.bookingService.updateBooking(payload.id, payload).subscribe({
        next: (res) => {
          this.saveQuoteMappings();
          this.showBookingForm = false;
          this.loadBookings();
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: `Booking ${res.booking_no} updated` });
        },
        error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update booking' }); }
      });
    } else {
      this.bookingService.createManualBooking(payload).subscribe({
        next: (res) => {
          this.currentBooking.booking_no = res.booking_no;
          this.saveQuoteMappings();
          this.showBookingForm = false;
          this.loadBookings();
          this.messageService.add({ severity: 'success', summary: 'Saved', detail: `Booking ${res.booking_no} created` });
        },
        error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save booking' }); }
      });
    }
  }

  getBookingModeLabel(type: string | undefined): string {
    if (type === 'from_enquiry') return 'From Enquiry';
    if (type === 'manual') return 'Manual';
    return type || '';
  }
  openBooking(bookingNo: string) {
    this.isLoadingDialogData = true;
    
    // 1. Prepare observables for all required masters
    const mastersObs = forkJoin({
      vendors: this.masterCache.getVendors().pipe(take(1)),
      depts: this.masterCache.getDepartments().pipe(take(1)),
      locations: this.masterCache.getLocations().pipe(take(1)),
      serviceTypes: this.masterCache.getServiceTypes().pipe(take(1)),
      customers: this.masterCache.getCustomers().pipe(take(1)),
      currencies: this.masterCache.getCurrencies().pipe(take(1)),
      basis: this.masterCache.getBasis().pipe(take(1)),
      items: this.masterCache.getItems().pipe(take(1)),
      containers: this.masterCache.getContainers().pipe(take(1)),
      locationTypes: this.masterCache.getAllMasterTypes().pipe(take(1), map((types: any[]) => types.filter((t: any) => t.key === 'LOCATION'))),
      cargoMasterTypes: this.masterCache.getAllMasterTypes().pipe(take(1), map((types: any[]) => types.filter((t: any) => t.key === 'CARGO_TYPE'))),
      vendorTypes: this.masterCache.getMasterTypes('VENDOR').pipe(take(1)),
      bookingStatuses: this.masterCache.getMasterTypes('BOOKING_STATUS').pipe(take(1)),
      airlines: this.masterCache.getAirlines().pipe(take(1)),
      vessels: this.masterCache.getVessels().pipe(take(1))
    });

    const bookingObs = this.bookingService.getByNo(bookingNo).pipe(take(1));

    // 2. Wait for EVERYTHING
    combineLatest([bookingObs, mastersObs]).subscribe({
      next: ([booking, results]: [any, any]) => {
        this.isLoadingDialogData = false;
        
        // Setup masters
        this.allVendors = results.vendors || [];
        this.allLocations = results.locations || [];
        this.allServiceTypes = results.serviceTypes || [];
        this.departmentOptions = (results.depts || []).map((d: any) => ({ label: d.name, value: d.name }));
        this.locationTypeOptions = results.locationTypes.map((t: any) => ({ label: t.value, value: t.value }));

        // Fix Cargo
        this.allCargoItems = (results.items || []).filter((item: any) => item.active === true || (item.status || '').toString().toLowerCase() === 'active');
        this.cargoTypeOptions = (results.cargoMasterTypes || [])
          .filter((t: any) => (t.status || '').toString().toLowerCase() === 'active')
          .map((t: any) => ({ label: t.value, value: t.value }));

        // Fix Sub-charges
        this.vendorTypeOptions = (results.vendorTypes || [])
          .filter((t: any) => (t.status || '').toString().toLowerCase() === 'active')
          .map((t: any) => ({ label: t.value, value: t.value }));
        this.allAirlines = (results.airlines || []).filter((a: any) => a.active === true);
        this.airlineOptions = this.allAirlines.map((a: any) => ({ label: a.airline_name, value: a.airline_name }));
        this.allVessels = (results.vessels || []).filter((v: any) => v.active === true);
        this.vesselOptions = this.allVessels.map((v: any) => ({ label: v.vessel_name, value: v.vessel_name }));
        this.bookingStatusOptions = (results.bookingStatuses || [])
          .filter((s: any) => (s.status || '').toString().toLowerCase() === 'active')
          .map((s: any) => ({ label: s.value, value: s.value }));
        this.basisMasterOptions = (results.basis || [])
          .filter((b: any) => (b.status || '').toString().toLowerCase() === 'active')
          .map((b: any) => ({ label: b.code, value: b.code }));

        const b = booking;
        this.currentBooking = b as any;

        this.currentBooking.effective_date_from = this.parseDate(this.currentBooking.effective_date_from) as any;
        this.currentBooking.effective_date_to = this.parseDate(this.currentBooking.effective_date_to) as any;

        this.breakupRows = (b?.booking_breakup || []).map((bk: any) => {
          bk.valid_till = bk.valid_till ? new Date(bk.valid_till) : null;
          bk.min_qty = bk.quantity;
          this.onBreakupVendorTypeChange(bk, false);
          return bk;
        });

        this.refreshSubVendorOptions();

        // Initialize sub-breakups
        this.containerBreakupRows = [];
        this.packageBreakupRows = [];
        this.breakupRows.forEach((bk) => {
          if (Array.isArray(bk.container_breakup)) {
            bk.container_breakup.forEach((cb: any) => {
              cb.breakup_no = bk.breakup_no;
              cb.pickup_handover_date = cb.pickup_handover_date ? new Date(cb.pickup_handover_date) : null;
              this.containerBreakupRows.push(cb);
            });
          }
          if (Array.isArray(bk.package_breakup)) {
            bk.package_breakup.forEach((pb: any) => {
              pb.breakup_no = bk.breakup_no;
              pb.handover_date = pb.handover_date ? new Date(pb.handover_date) : null;
              this.packageBreakupRows.push(pb);
            });
          }
        });

        this.isFrozen = (b as any)?.booking_type === 'from_enquiry';

        // Init Cargo Rows and their pre-calculated options
        const inheritedCargo = (b as any)?.enquiry_cargo_type || 
                               (this.selectedEnquiries && this.selectedEnquiries.length > 0 ? this.selectedEnquiries[0].cargo_type : '') ||
                               (Array.isArray((b as any)?.cargo) ? (b as any).cargo.find((cg: any) => cg.cargo_type)?.cargo_type : '') || '';
        this.cargoRows = (Array.isArray((b as any)?.cargo) ? (b as any).cargo : []).map((cg: any) => {
          const rowCargoType = cg.cargo_type || inheritedCargo;
          return {
            ...cg,
            cargo_type: rowCargoType,
            _descriptionOptions: this.getCargoNamesByType(rowCargoType),
            _hsCodeOptions: this.getHsCodesByTypeAndName(rowCargoType, cg.description)
          };
        });

        if (this.cargoRows.length === 0 && inheritedCargo) {
          this.cargoRows = [{
            cargo_type: inheritedCargo,
            description: '',
            hs_code: '',
            _descriptionOptions: this.getCargoNamesByType(inheritedCargo),
            _hsCodeOptions: []
          }];
        }

        this.carriageRows = Array.isArray((b as any)?.carriage_map) ? (b as any).carriage_map : [];
        const rawItems = Array.isArray((b as any)?.line_items) ? (b as any).line_items : [];

        // Initialize Schedule Rows
        this.scheduleRows = [];
        const scheds = (b as any)?.schedules || [];
        if (Array.isArray(scheds)) {
          this.scheduleRows = scheds.map((s: any) => ({
            ...s,
            etd: this.parseDate(s.etd),
            eta: this.parseDate(s.eta),
            _flightNoOptions: [] // Will be populated by onAirlineChange if needed
          }));
          // Pre-populate flight options for airlines
          this.scheduleRows.forEach(s => {
            if (this.getScheduleType() === 'Airline') this.onAirlineChange(s);
          });
        }

        const toLabel = (code: any) => this.locationMap[(code || '').toString()] || code || '';
        // Map location codes to display names and sourced vendor
        const vendorCards = Array.isArray((b as any)?.vendor_details) ? (b as any).vendor_details : ((b as any)?.vendor_details ? [(b as any).vendor_details] : []);
        this.lineItemsRows = rawItems.map((li: any) => {
          const svc = li.service_area || li.type || '';
          const match = vendorCards.find((vc: any) => (vc.service_area || '').toString().trim().toLowerCase() === (svc || '').toString().trim().toLowerCase());
          const validVendor = vendorCards.find((vc: any) => {
            const lookup = (li.sourced_vendor || '').toString().trim().toLowerCase();
            return (vc.vendor_no || '').toString().trim().toLowerCase() === lookup ||
              (vc.vendor_code || '').toString().trim().toLowerCase() === lookup ||
              (vc.code || '').toString().trim().toLowerCase() === lookup;
          });
          const vendorName = validVendor?.vendor_type || validVendor?.vendor_name || li.sourced_vendor || (match && (match.vendor_name || match.vendor || match.vendor_code)) || (vendorCards[0]?.vendor_name) || '';

          return {
            ...li,
            from_location: toLabel(li.from_location || li.line_from_location || li.line_from_location_name || ''),
            to_location: toLabel(li.to_location || li.line_to_location || li.line_to_location_name || ''),
            sourced_vendor: vendorName,
            status: li.status || 'Active'
          };
        });

        this.carriageRows = (this.carriageRows || []).map((cr: any) => ({
          ...cr,
          location: toLabel(cr.location || '')
        }));

        // Deduplicate Carriage Rows
        const uniqueKeys = new Set();
        this.carriageRows = this.carriageRows.filter(cr => {
          const key = `${cr.carriage}-${cr.location_type}-${cr.location}`;
          if (uniqueKeys.has(key)) return false;
          uniqueKeys.add(key);
          return true;
        });

        this.currentBooking.from_location = toLabel((b as any)?.from_location || '');
        this.currentBooking.to_location = toLabel((b as any)?.to_location || '');


        if (this.pendingLinkEnquiries.length > 0) {
          // this.currentBooking.booking_type = 'from_enquiry'; // Removed to prevents creation of new booking
          const selected = this.pendingLinkEnquiries.map((e: any) => ({ id: e.id, code: e.code }));
          const existingSelections = this.currentBooking.selected_enquiries || [];
          const existingCodes = new Set(existingSelections.map((e: any) => e.code));
          const newSelections = selected.filter((s: any) => !existingCodes.has(s.code));
          this.currentBooking.selected_enquiries = [...existingSelections, ...newSelections];

          // Apply overrides if any
          if (this.pendingOverrides) {
            if (this.pendingOverrides.effective_date_from) {
              this.currentBooking.effective_date_from = this.parseDate(this.pendingOverrides.effective_date_from) as any;
            }
            if (this.pendingOverrides.effective_date_to) {
              this.currentBooking.effective_date_to = this.parseDate(this.pendingOverrides.effective_date_to) as any;
            }
            // Clear overrides after use
            this.pendingOverrides = {};
          }

          // Map first enquiry details to booking
          if (this.pendingLinkEnquiries.length > 0) {
            const observables = this.pendingLinkEnquiries.map(e => this.enquiryService.getByCode(e.code).pipe(take(1)));

            forkJoin(observables).subscribe((fullEnquiries: any[]) => {
              if (fullEnquiries.length > 0 && !this.currentBooking.enquiry_cargo_type) {
                this.currentBooking.enquiry_cargo_type = fullEnquiries[0].cargo_type;
              }

              // Update any existing cargo rows that are missing cargo_type
              const inherited = this.getInheritedCargoType();
              if (inherited) {
                this.cargoRows = this.cargoRows.map(row => {
                  if (!row.cargo_type) {
                    return {
                      ...row,
                      cargo_type: inherited,
                      _descriptionOptions: this.getCargoNamesByType(inherited)
                    };
                  }
                  return row;
                });
              }

              fullEnquiries.forEach((fullEnq: any) => {
                // Append Line Items
                if (Array.isArray(fullEnq.line_items)) {
                  const enqVendorCards = fullEnq.vendor_cards || [];
                  const newItems = fullEnq.line_items.map((li: any) => {
                    const sourcingSummary = Array.isArray(li.enquiry_summary) ? li.enquiry_summary.find((s: any) => s.summary_type === 'sourcing') : null;
                    const validVendor = enqVendorCards.find((vc: any) => {
                      const lookup = (li.sourced_vendor || '').toString().trim().toLowerCase();
                      return (vc.vendor_no || '').toString().trim().toLowerCase() === lookup ||
                        (vc.vendor_code || '').toString().trim().toLowerCase() === lookup ||
                        (vc.code || '').toString().trim().toLowerCase() === lookup;
                    });
                    let vendorName = validVendor?.vendor_name || (sourcingSummary ? sourcingSummary.vendor_name : (li.sourced_vendor || ''));
                    if (vendorName && this.allVendors.length > 0) {
                      const lookup = vendorName.toString().trim().toLowerCase();
                      const masterVendor = this.allVendors.find((v: any) => (v.vendor_no || '').toString().trim().toLowerCase() === lookup || (v.code || '').toString().trim().toLowerCase() === lookup);
                      if (masterVendor) vendorName = masterVendor.name || masterVendor.name2 || masterVendor.vendor_name || vendorName;
                    }
                    return {
                      type: li.type,
                      service_area: li.service_area,
                      basis: li.basis,
                      from_location: this.locName(li.line_from_location || li.from_location),
                      to_location: this.locName(li.line_to_location || li.to_location),
                      sourced_vendor: vendorName,
                      basis_qty: li.basis_qty,
                      booking_ref: '',
                      valid_till: this.parseDate(li.valid_till),
                      status: 'Active',
                      remarks: li.remarks,
                      schedule: 'NO',
                      enq_no: fullEnq.code,
                      enq_exp: fullEnq.effective_date_to
                    };
                  });
                  this.lineItemsRows = [...this.lineItemsRows, ...newItems];
                }

                // Append Cargo
                if (Array.isArray(fullEnq.cargo)) {
                  const newCargo = fullEnq.cargo.map((cg: any) => {
                    const rowCargoType = cg.cargo_type || fullEnq.cargo_type || this.getInheritedCargoType() || '';
                    return {
                      cargo_type: rowCargoType,
                      description: cg.description,
                      hs_code: cg.hs_code,
                      _descriptionOptions: this.getCargoNamesByType(rowCargoType),
                      _hsCodeOptions: this.getHsCodesByTypeAndName(rowCargoType, cg.description)
                    };
                  });
                  this.cargoRows = [...this.cargoRows, ...newCargo];
                }

                // Append Carriage Map
                if (Array.isArray(fullEnq.carriage_map)) {
                  const newCarriage = fullEnq.carriage_map.map((cm: any) => ({
                    carriage: cm.carriage,
                    location_type: cm.location_type,
                    location: this.locName(cm.location)
                  }));
                  this.carriageRows = [...this.carriageRows, ...newCarriage];
                }
              });

              // Re-run Carriage Deduplication
              const uniqueKeys = new Set();
              this.carriageRows = this.carriageRows.filter(cr => {
                const key = `${cr.carriage}-${cr.location_type}-${cr.location}`;
                if (uniqueKeys.has(key)) return false;
                uniqueKeys.add(key);
                return true;
              });

              // Auto-populate default cargo row if empty
              const finalInherited = this.getInheritedCargoType();
              if (this.cargoRows.length === 0 && finalInherited) {
                this.cargoRows = [{
                  cargo_type: finalInherited,
                  description: '',
                  hs_code: '',
                  _descriptionOptions: this.getCargoNamesByType(finalInherited),
                  _hsCodeOptions: []
                }];
              }

              // Append selected enquiries to current booking list
              const currentIds = new Set((this.currentBooking.selected_enquiries || []).map((e: any) => e.code));
              const newSelections = selected.filter((s: any) => !currentIds.has(s.code));
              this.currentBooking.selected_enquiries = [...(this.currentBooking.selected_enquiries || []), ...newSelections];

              this.pendingLinkEnquiries = [];
              this.messageService.add({ severity: 'success', summary: 'Enquiries Linked', detail: 'New enquiries appended successfully.' });
            });
          } else {
            this.messageService.add({ severity: 'info', summary: 'Enquiry Linked', detail: 'Please review and save changes' });
          }
        }

        // Initialize Quote Mapping
        this.loadEnquiryOptions();
        this.loadQuoteMappings();
        this.initializeQuoteMappings();

        this.isLoadingDialogData = false;
        this.showBookingForm = true;
        this.selectedBookingTrigger$.next(this.currentBooking); // Trigger reactive filters
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load booking:', err);
        this.isLoadingDialogData = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load booking details' });
      }
    });
  }

  appendPendingEnquiriesDirectly(selected: any[]) {
    if (this.pendingLinkEnquiries.length > 0) {
      this.isLoadingDialogData = true;
      const observables = this.pendingLinkEnquiries.map(e => this.enquiryService.getByCode(e.code).pipe(take(1)));

      forkJoin(observables).subscribe({
        next: (fullEnquiries: any[]) => {
          this.isLoadingDialogData = false;
          if (fullEnquiries.length > 0 && !this.currentBooking.enquiry_cargo_type) {
            this.currentBooking.enquiry_cargo_type = fullEnquiries[0].cargo_type;
          }

          // Update any existing cargo rows that are missing cargo_type
          const inherited = this.getInheritedCargoType();
          if (inherited) {
            this.cargoRows = this.cargoRows.map(row => {
              if (!row.cargo_type) {
                return {
                  ...row,
                  cargo_type: inherited,
                  _descriptionOptions: this.getCargoNamesByType(inherited)
                };
              }
              return row;
            });
          }

          fullEnquiries.forEach((fullEnq: any) => {
            // Append Line Items
            if (Array.isArray(fullEnq.line_items)) {
              const enqVendorCards = fullEnq.vendor_cards || [];
              const newItems = fullEnq.line_items.map((li: any) => {
                const sourcingSummary = Array.isArray(li.enquiry_summary) ? li.enquiry_summary.find((s: any) => s.summary_type === 'sourcing') : null;
                const validVendor = enqVendorCards.find((vc: any) => {
                  const lookup = (li.sourced_vendor || '').toString().trim().toLowerCase();
                  return (vc.vendor_no || '').toString().trim().toLowerCase() === lookup ||
                    (vc.vendor_code || '').toString().trim().toLowerCase() === lookup ||
                    (vc.code || '').toString().trim().toLowerCase() === lookup;
                });
                let vendorName = validVendor?.vendor_name || (sourcingSummary ? sourcingSummary.vendor_name : (li.sourced_vendor || ''));
                if (vendorName && this.allVendors.length > 0) {
                  const lookup = vendorName.toString().trim().toLowerCase();
                  const masterVendor = this.allVendors.find((v: any) => (v.vendor_no || '').toString().trim().toLowerCase() === lookup || (v.code || '').toString().trim().toLowerCase() === lookup);
                  if (masterVendor) vendorName = masterVendor.name || masterVendor.name2 || masterVendor.vendor_name || vendorName;
                }
                return {
                  type: li.type,
                  service_area: li.service_area,
                  basis: li.basis,
                  from_location: this.locName(li.line_from_location || li.from_location),
                  to_location: this.locName(li.line_to_location || li.to_location),
                  sourced_vendor: vendorName,
                  basis_qty: li.basis_qty,
                  booking_ref: '',
                  valid_till: this.parseDate(li.valid_till),
                  status: 'Active',
                  remarks: li.remarks,
                  schedule: 'NO',
                  enq_no: fullEnq.code,
                  enq_exp: fullEnq.effective_date_to
                };
              });
              this.lineItemsRows = [...this.lineItemsRows, ...newItems];
            }

            // Append Cargo
            if (Array.isArray(fullEnq.cargo)) {
              const newCargo = fullEnq.cargo.map((cg: any) => {
                const rowCargoType = cg.cargo_type || fullEnq.cargo_type || this.getInheritedCargoType() || '';
                return {
                  cargo_type: rowCargoType,
                  description: cg.description,
                  hs_code: cg.hs_code,
                  _descriptionOptions: this.getCargoNamesByType(rowCargoType),
                  _hsCodeOptions: this.getHsCodesByTypeAndName(rowCargoType, cg.description)
                };
              });
              this.cargoRows = [...this.cargoRows, ...newCargo];
            }

            // Append Carriage Map
            if (Array.isArray(fullEnq.carriage_map)) {
              const newCarriage = fullEnq.carriage_map.map((cm: any) => ({
                carriage: cm.carriage,
                location_type: cm.location_type,
                location: this.locName(cm.location)
              }));
              this.carriageRows = [...this.carriageRows, ...newCarriage];
            }
          });

          // Re-run Carriage Deduplication
          const uniqueKeys = new Set();
          this.carriageRows = this.carriageRows.filter(cr => {
            const key = `${cr.carriage}-${cr.location_type}-${cr.location}`;
            if (uniqueKeys.has(key)) return false;
            uniqueKeys.add(key);
            return true;
          });

          // Auto-populate default cargo row if empty
          const finalInherited = this.getInheritedCargoType();
          if (this.cargoRows.length === 0 && finalInherited) {
            this.cargoRows = [{
              cargo_type: finalInherited,
              description: '',
              hs_code: '',
              _descriptionOptions: this.getCargoNamesByType(finalInherited),
              _hsCodeOptions: []
            }];
          }

          // Append selected enquiries to current booking list
          const currentIds = new Set((this.currentBooking.selected_enquiries || []).map((e: any) => e.code));
          const newSelections = selected.filter((s: any) => !currentIds.has(s.code));
          this.currentBooking.selected_enquiries = [...(this.currentBooking.selected_enquiries || []), ...newSelections];

          this.pendingLinkEnquiries = [];

          // Apply overrides if any
          if (this.pendingOverrides) {
            if (this.pendingOverrides.effective_date_from) {
              this.currentBooking.effective_date_from = this.parseDate(this.pendingOverrides.effective_date_from) as any;
            }
            if (this.pendingOverrides.effective_date_to) {
              this.currentBooking.effective_date_to = this.parseDate(this.pendingOverrides.effective_date_to) as any;
            }
            // Clear overrides after use
            this.pendingOverrides = {};
          }

          // Initialize Quote Mapping
          this.loadEnquiryOptions();
          this.initializeQuoteMappings();

          this.selectedBookingTrigger$.next(this.currentBooking); // Trigger reactive filters
          this.cdr.detectChanges();

          this.messageService.add({ severity: 'success', summary: 'Enquiries Linked', detail: 'New enquiries appended successfully.' });
        },
        error: (err) => {
          this.isLoadingDialogData = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to retrieve enquiry details' });
          console.error(err);
        }
      });
    }
  }

  getInheritedCargoType(): string {
    console.log('DEBUG [getInheritedCargoType] currentBooking:', this.currentBooking);
    console.log('DEBUG [getInheritedCargoType] selectedEnquiries:', this.selectedEnquiries);
    console.log('DEBUG [getInheritedCargoType] cargoRows:', this.cargoRows);
    if (this.currentBooking?.enquiry_cargo_type) {
      console.log('DEBUG [getInheritedCargoType] Resolved via currentBooking.enquiry_cargo_type:', this.currentBooking.enquiry_cargo_type);
      return this.currentBooking.enquiry_cargo_type;
    }
    if (this.selectedEnquiries && this.selectedEnquiries.length > 0) {
      console.log('DEBUG [getInheritedCargoType] Resolved via selectedEnquiries:', this.selectedEnquiries[0].cargo_type);
      return this.selectedEnquiries[0].cargo_type || '';
    }
    if (this.cargoRows && this.cargoRows.length > 0) {
      const firstWithCargoType = this.cargoRows.find(r => r.cargo_type);
      if (firstWithCargoType) {
        console.log('DEBUG [getInheritedCargoType] Resolved via cargoRows:', firstWithCargoType.cargo_type);
        return firstWithCargoType.cargo_type;
      }
    }
    console.log('DEBUG [getInheritedCargoType] Resolved to empty string');
    return '';
  }

  addCargoRow() {
    const inherited = this.getInheritedCargoType();
    this.cargoRows = [...this.cargoRows, {
      cargo_type: inherited,
      description: '',
      hs_code: '',
      _descriptionOptions: inherited ? this.getCargoNamesByType(inherited) : [],
      _hsCodeOptions: []
    }];
  }

  removeCargoRow(i: number) {
    this.cargoRows.splice(i, 1);
    this.cargoRows = [...this.cargoRows];
  }

  locName(code: any) {
    const key = (code || '').toString();
    return this.locationMap[key] || key;
  }

  getLocationsByType(type: any) {
    const t = (type || '').toString().trim().toLowerCase();
    if (!t) return [];

    return (this.allLocations || [])
      .filter((l: any) => (l.type || '').toString().trim().toLowerCase() === t)
      .map((l: any) => ({ label: l.name, value: l.code }));
  }

  getCargoNamesByType(type: any) {
    const t = (type || '').toString();
    return (this.allCargoItems || [])
      .filter((ci: any) => ((ci.charge_type || ci.cargo_type || ci.item_type || '').toString() === t))
      .map((ci: any) => ({ label: ci.name, value: ci.name }));
  }

  getHsCodesByTypeAndName(type: any, name: any) {
    const t = (type || '').toString();
    const n = (name || '').toString();
    return (this.allCargoItems || [])
      .filter((ci: any) => ((ci.charge_type || ci.cargo_type || ci.item_type || '').toString() === t) && ((ci.name || '').toString() === n))
      .map((ci: any) => ({ label: ci.hs_code, value: ci.hs_code }));
  }

  onCargoTypeChange(cg: any) {
    const selectedType = cg.cargo_type;
    this.cargoRows.forEach((row) => {
      row.cargo_type = selectedType;
      row._descriptionOptions = this.getCargoNamesByType(selectedType);
      if (row.description) {
        const isValid = row._descriptionOptions.some((o: any) => o.value === row.description);
        if (!isValid) {
          row.description = '';
          row.hs_code = '';
          row._hsCodeOptions = [];
        }
      }
    });
    this.cargoRows = [...this.cargoRows];
  }

  onCargoNameChange(cg: any) {
    cg._hsCodeOptions = this.getHsCodesByTypeAndName(cg.cargo_type, cg.description);
    if (cg._hsCodeOptions.length > 0) {
      cg.hs_code = cg._hsCodeOptions[0].value;
    } else {
      cg.hs_code = '';
    }
    this.cargoRows = [...this.cargoRows];
  }

  addBreakupRow() {
    const nextNo = this.breakupRows.length > 0
      ? Math.max(...this.breakupRows.map(r => parseInt(r.breakup_no) || 0)) + 1
      : 1;
    this.breakupRows.push({
      breakup_no: nextNo.toString(),
      vendor_type: '',
      vendor_name: '',
      booking_ref_no: '',
      basis: '',
      valid_till: null,
      quantity: null,
      min_qty: null,
      remarks: '',
      _vendorOptions: []
    });
    this.breakupRows = [...this.breakupRows];
  }

  lockMinQty(row: any) {
    if (row.quantity !== null && row.quantity !== undefined && row.min_qty === null) {
      row.min_qty = row.quantity;
    }
  }

  removeBreakupRow(index: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this booking breakup?\n\nThis will also delete all related sub breakups\nThis action cannot be undone.',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this.breakupRows.splice(index, 1);
        this.breakupRows = [...this.breakupRows];
        this.onBreakupQuantityChange();
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Booking breakup removed' });
      }
    });
  }

  getVendorsByType(type: any) {
    const t = (type || '').toString().toLowerCase();
    if (!t) return [];
    return (this.allVendors || [])
      .filter((v: any) => (v.type || '').toString().toLowerCase() === t)
      .map((v: any) => ({ label: v.name2 || v.name || v.vendor_name, value: v.name2 || v.name || v.vendor_name }));
  }

  onBreakupVendorTypeChange(row: any, isUserChange: boolean = false) {
    row._vendorOptions = this.getVendorsByType(row.vendor_type);
    if (isUserChange) {
      row.vendor_name = '';
    }
  }

  triggerSubVendorTypeSelection() {
    if (!this.currentBooking.sub_breakup_vendor_type) {
      this.showSubVendorTypeDialog = true;
    }
  }

  confirmSubVendorType(type: string) {
    this.currentBooking.sub_breakup_vendor_type = type;
    this.refreshSubVendorOptions();
    this.showSubVendorTypeDialog = false;
  }

  changeSubVendorType() {
    this.confirmationService.confirm({
      message: '⚠ Changing vendor type will clear all selected vendor names. Do you want to continue?',
      header: 'Confirm Change Vendor Type',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'YES',
      rejectLabel: 'NO',
      accept: () => {
        // Clear all vendor selections in sub breakup rows
        this.containerBreakupRows.forEach(row => row.empty_yard = '');
        this.packageBreakupRows.forEach(row => row.carting = '');

        // Reset stored vendor type
        this.currentBooking.sub_breakup_vendor_type = '';

        // Refresh options and show selection popup again
        this.refreshSubVendorOptions();
        this.showSubVendorTypeDialog = true;
      }
    });
  }

  refreshSubVendorOptions() {
    const type = this.currentBooking.sub_breakup_vendor_type;
    if (!type) {
      this.subVendorOptions = [];
      return;
    }
    const t = type.toLowerCase();
    this.subVendorOptions = (this.allVendors || [])
      .filter((v: any) => (v.type || '').toString().toLowerCase() === t)
      .map((v: any) => ({ label: v.name2 || v.name || v.vendor_name, value: v.name2 || v.name || v.vendor_name }));
  }

  get breakupType(): string {
    if (!this.currentBooking?.service_type || !this.allServiceTypes) return '';
    const stValue = this.currentBooking.service_type;
    const st = this.allServiceTypes.find(s => s.name === stValue || s.code === stValue);
    return st?.booking_breakup || '';
  }

  onBreakupQuantityChange() {
    const type = this.breakupType;
    if (!type) {
      this.containerBreakupRows = [];
      this.packageBreakupRows = [];
      return;
    }

    const rows = type === 'CONTAINER BREAKUP' ? this.containerBreakupRows : this.packageBreakupRows;
    this.breakupRows.forEach(bk => {
      // Use == for loose equality as breakup_no can be string or numeric
      const currentCount = rows.filter(r => r.breakup_no == bk.breakup_no).length;

      // Prevent manual reduction below current count
      if (bk.quantity < currentCount) bk.quantity = currentCount;

      // Ensure quantity doesn't go below min_qty
      if (bk.min_qty !== null && bk.min_qty !== undefined && bk.quantity < bk.min_qty) {
        bk.quantity = bk.min_qty;
      }
    });

    if (type === 'CONTAINER BREAKUP') {
      this.syncSubBreakupRows([...this.containerBreakupRows], 'container');
    } else if (type === 'PACKAGE BREAKUP') {
      this.syncSubBreakupRows([...this.packageBreakupRows], 'package');
    }
    this.cdr.detectChanges();
  }

  syncSubBreakupRows(subRows: any[], subType: 'container' | 'package') {
    const newSubRows: any[] = [];

    // Sort main rows by breakup_no or maintain array order? 
    // Array order is safer for user expectation.
    this.breakupRows.forEach((mainRow) => {
      const qty = parseInt(mainRow.quantity) || 0;
      // Use breakup_no as the stable key to find existing sub-rows
      const mySubRows = subRows.filter(sr => sr.breakup_no == mainRow.breakup_no);

      for (let i = 0; i < qty; i++) {
        const existing = mySubRows[i];

        if (existing) {
          existing.vendor_name = mainRow.vendor_name;
          existing.booking_ref_no = mainRow.booking_ref_no;
          existing.basis = mainRow.basis;
          newSubRows.push(existing);
        } else {
          const newRow: any = {
            breakup_no: mainRow.breakup_no,
            vendor_name: mainRow.vendor_name,
            booking_ref_no: mainRow.booking_ref_no,
            basis: mainRow.basis
          };
          if (subType === 'container') {
            newRow.container_no = '';
            newRow.pickup_handover_date = null;
            newRow.empty_yard = '';
          } else {
            newRow.package_no = '';
            newRow.length_cm = 0;
            newRow.width_cm = 0;
            newRow.height_cm = 0;
            newRow.weight_kgs = 0;
            newRow.handover_date = null;
            newRow.carting = '';
          }
          newSubRows.push(newRow);
        }
      }
    });

    if (subType === 'container') this.containerBreakupRows = newSubRows;
    else this.packageBreakupRows = newSubRows;

    // Trigger quote mapping update
    this.initializeQuoteMappings();
  }

  removeSubBreakupRow(index: number, type: 'container' | 'package') {
    const rows = type === 'container' ? this.containerBreakupRows : this.packageBreakupRows;
    const row = rows[index];
    const bNo = row.breakup_no;
    const mainRow = this.breakupRows.find(br => br.breakup_no == bNo);
    const currentQty = mainRow ? (parseInt(mainRow.quantity) || 0) : 0;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete this sub breakup?\n\nIf you delete this row, the quantity in booking breakup\nwill be updated automatically.\n\nThis action cannot be undone.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        if (mainRow && currentQty > 0) {
          rows.splice(index, 1);
          mainRow.quantity = currentQty - 1;

          // Update min_qty as well when explicitly deleting
          if (mainRow.min_qty !== null && mainRow.min_qty !== undefined) {
            mainRow.min_qty = mainRow.quantity;
          }

          // Re-assign array references to trigger Angular change detection
          this.breakupRows = [...this.breakupRows];
          if (type === 'container') {
            this.containerBreakupRows = [...this.containerBreakupRows];
          } else {
            this.packageBreakupRows = [...this.packageBreakupRows];
          }

          this.onBreakupQuantityChange();
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Sub breakup removed' });
        }
      }
    });
  }

  getBasisOptions() {
    const bases = (this.lineItemsRows || []).map(li => li.basis).filter(b => !!b);
    if (bases.length > 0) {
      return Array.from(new Set(bases)).map(b => ({ label: b, value: b }));
    }
    // Fallback to master data if no enquiry line items provide basis
    return this.basisMasterOptions;
  }

  openMasterLocation() { this.showMasterLocationDialog = true; }

  closeMasterLocation() {
    this.showMasterLocationDialog = false;
    // 🚀 Use the optimized loadDropdowns instead of redundant calls
    this.loadDropdowns();
  }

  openLinkEnquiryDialog(row: any) {
    this.linkTargetBooking = row;
    this.isLoadingDialogData = true;

    forkJoin({
      depts: this.masterCache.getDepartments().pipe(take(1)),
      locations: this.masterCache.getLocations().pipe(take(1)),
      serviceTypes: this.masterCache.getServiceTypes().pipe(take(1)),
      locationTypes: this.masterCache.getAllMasterTypes().pipe(take(1), map((types: any[]) => types.filter((t: any) => t.key === 'LOCATION')))
    }).subscribe({
      next: (results: any) => {
        this.isLoadingDialogData = false;
        
        // Setup initial options
        this.allLocations = results.locations || [];
        this.allServiceTypes = results.serviceTypes || [];
        this.departmentOptionsRaw = results.depts || [];
        this.departmentOptions = (results.depts || []).map((d: any) => ({ label: d.name, value: d.name }));
        this.locationTypeOptions = results.locationTypes.map((t: any) => ({ label: t.value, value: t.value }));

        this.dialog = {
          department: row.department,
          service_type: row.service_type,
          from_location_type: '',
          from_location: row.from_location,
          to_location_type: '',
          to_location: row.to_location
        };

        // Fix: Find codes from names if necessary to ensure dropdowns in the search dialog are pre-filled
        const resolveLocationCode = (val: string) => {
          if (!val) return null;
          let matched = this.allLocations.find((l: any) => l.code === val);
          if (matched) return matched;
          const matches = this.allLocations.filter((l: any) => l.name === val);
          if (matches.length > 0) {
            const portMatch = matches.find((l: any) => l.type !== 'COUNTRY');
            return portMatch || matches[0];
          }
          return null;
        };

        if (this.dialog.from_location) {
          const loc = resolveLocationCode(this.dialog.from_location);
          if (loc) {
            this.dialog.from_location = loc.code;
            this.dialog.from_location_type = loc.type;
          }
        }
        if (this.dialog.to_location) {
          const loc = resolveLocationCode(this.dialog.to_location);
          if (loc) {
            this.dialog.to_location = loc.code;
            this.dialog.to_location_type = loc.type;
          }
        }

        this.onLocationTypeChange('from');
        this.onLocationTypeChange('to');
        this.onDepartmentChange();

        this.matchingEnquiries = [];
        this.selectedEnquiries = [];
        this.linkedEnquiryCodes.clear();
        this.showCreateDialog = true;
        this.isSelectingForExisting = true;

        // Fetch booking details to get already-linked enquiries
        if (row.booking_no) {
          this.bookingService.getByNo(row.booking_no).subscribe({
            next: (booking: any) => {
              // Extract enquiry codes from line items
              const lineItems = booking?.line_items || [];
              lineItems.forEach((li: any) => {
                if (li.enq_no) {
                  // Handle both string and object formats
                  const enqCode = typeof li.enq_no === 'object' ? li.enq_no.code : li.enq_no;
                  if (enqCode) {
                    this.linkedEnquiryCodes.add(enqCode.toString());
                  }
                }
              });
              // Now search for enquiries after we have the linked codes
              this.searchEnquiries();
            },
            error: (err) => {
              console.error('Failed to fetch booking details:', err);
              // Still search enquiries even if fetch fails
              this.searchEnquiries();
            }
          });
        } else {
          // If no booking_no, just search enquiries
          this.searchEnquiries();
        }
      },
      error: () => {
        this.isLoadingDialogData = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load master data' });
      }
    });
  }

  addLineItemRow() { this.lineItemsRows = [...this.lineItemsRows, { enq_no: '', enq_exp: '', type: '', service_area: '', basis: '', from_location: '', to_location: '', sourced_vendor: '', status: 'Active', remarks: '' }]; }

  addTransit() {
    this.scheduleRows = [...this.scheduleRows, {
      from_location_type: '',
      from_location: '',
      to_location_type: '',
      to_location: '',
      vessel_airline: '',
      voyage_flight_no: '',
      etd: null,
      eta: null,
      _fromLocationOptions: [],
      _toLocationOptions: [],
      _flightNoOptions: []
    }];
  }

  removeTransitRow(idx: number) {
    this.scheduleRows = this.scheduleRows.filter((_, i) => i !== idx);
  }

  getScheduleType(): string {
    if (!this.currentBooking?.service_type) return 'Vessel';
    const stValue = this.currentBooking.service_type;
    const found = this.allServiceTypes.find((st: any) => st.name === stValue || st.code === stValue);
    return found?.schedule_type || 'Vessel';
  }

  onAirlineChange(trn: any) {
    if (!trn.vessel_airline) return;
    const airline = this.allAirlines.find(a => a.airline_name === trn.vessel_airline);
    if (airline && airline.airline_no) {
      trn._flightNoOptions = [{ label: airline.airline_no, value: airline.airline_no }];
      if (!trn.voyage_flight_no) {
        trn.voyage_flight_no = airline.airline_no;
      }
    } else {
      trn._flightNoOptions = [];
    }
  }

  private formatDate(date: any): string | null {
    if (!date) return null;
    let d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // =====================================================
  // QUOTE MAPPING METHODS
  // =====================================================

  initializeQuoteMappings() {
    const breakupNumbers = this.getBreakupNumbersList();
    const breakupNumbersSet = new Set(breakupNumbers);

    // Remove stale mappings (rows with a breakup_number that no longer exists)
    // BUT preserve rows with null breakup_number (manually added empty rows)
    this.quoteMappingRows = this.quoteMappingRows.filter(qm =>
      !qm.breakup_number || breakupNumbersSet.has(qm.breakup_number)
    );

    const existingMappingsSet = new Set(this.quoteMappingRows.map(qm => qm.breakup_number).filter(val => !!val));

    // Add missing rows for new container/package numbers
    breakupNumbers.forEach(num => {
      if (!existingMappingsSet.has(num)) {
        this.quoteMappingRows.push({
          breakup_number: num,
          enquiry_no: null,
          line_item_type: null,
          _lineItemTypeOptions: []
        });
      }
    });

    // Update stable options for dropdowns to prevent instability
    this.breakupNumberOptions = breakupNumbers.map(num => ({ label: num, value: num }));

    this.cdr.detectChanges();
  }

  getBreakupNumbersList(): string[] {
    if (this.breakupType === 'CONTAINER BREAKUP') {
      return this.containerBreakupRows
        .map(cb => cb.container_no)
        .filter(no => no && no.trim() !== '');
    } else if (this.breakupType === 'PACKAGE BREAKUP') {
      return this.packageBreakupRows
        .map(pb => pb.package_no)
        .filter(no => no && no.trim() !== '');
    }
    return [];
  }

  getBreakupNumberOptions(): any[] {
    const numbers = this.getBreakupNumbersList();
    return numbers.map(num => ({ label: num, value: num }));
  }

  loadEnquiryOptions() {
    // Extract enquiries from selected_enquiries
    let selectedEnquiries: any[] = [];
    const val = this.currentBooking.selected_enquiries;

    if (Array.isArray(val)) {
      selectedEnquiries = val;
    } else if (typeof val === 'string') {
      try {
        selectedEnquiries = JSON.parse(val || '[]');
      } catch (e) {
        console.error('Error parsing selected_enquiries:', e);
        selectedEnquiries = [];
      }
    }

    this.enquiryOptions = selectedEnquiries.map((enq: any) => ({
      label: enq.code,
      value: enq.code,
      id: enq.id
    }));
  }

  async onEnquiryChange(qm: any) {
    if (!qm.enquiry_no) {
      qm._lineItemTypeOptions = [];
      qm.line_item_type = null;
      return;
    }

    // Check cache first
    if (this.lineItemTypeOptionsMap[qm.enquiry_no]) {
      qm._lineItemTypeOptions = this.lineItemTypeOptionsMap[qm.enquiry_no];
      return;
    }

    // Fetch line item types for selected enquiry
    try {
      const types = await this.bookingService.getEnquiryLineItemTypes(
        this.currentBooking.booking_no!,
        qm.enquiry_no
      ).toPromise();

      qm._lineItemTypeOptions = (types || []).map((t: any) => ({
        label: t.type,
        value: t.type
      }));

      // Cache for reuse
      this.lineItemTypeOptionsMap[qm.enquiry_no] = qm._lineItemTypeOptions;
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load line item types'
      });
    }
  }

  addQuoteMappingRow() {
    this.quoteMappingRows.push({
      breakup_number: null,
      enquiry_no: null,
      line_item_type: null,
      _lineItemTypeOptions: []
    });
  }


  getQuoteMappingRowOptions(): any[] {
    const total = this.quoteMappingRows.length;
    const options = [];
    for (let i = 1; i <= total; i++) {
      options.push({ label: i.toString(), value: i });
    }
    return options;
  }

  async onBulkEnquiryChange() {
    if (!this.bulkApplyQuote.enquiry_no) {
      this.bulkApplyQuote._lineItemTypeOptions = [];
      this.bulkApplyQuote.line_item_type = null;
      return;
    }

    if (this.lineItemTypeOptionsMap[this.bulkApplyQuote.enquiry_no]) {
      this.bulkApplyQuote._lineItemTypeOptions = this.lineItemTypeOptionsMap[this.bulkApplyQuote.enquiry_no];
      return;
    }

    try {
      const types = await this.bookingService.getEnquiryLineItemTypes(
        this.currentBooking.booking_no!,
        this.bulkApplyQuote.enquiry_no
      ).toPromise();

      this.bulkApplyQuote._lineItemTypeOptions = (types || []).map((t: any) => ({
        label: t.type,
        value: t.type
      }));

      this.lineItemTypeOptionsMap[this.bulkApplyQuote.enquiry_no] = this.bulkApplyQuote._lineItemTypeOptions;
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load line item types' });
    }
  }

  applyBulkQuoteMapping() {
    const { breakup_number, enquiry_no, line_item_type, from_row, to_row } = this.bulkApplyQuote;
    if (!breakup_number && !enquiry_no && !line_item_type) {
      this.messageService.add({ severity: 'warn', summary: 'Missing Fields', detail: 'Please select at least one value to apply' });
      return;
    }

    const start = Math.max(1, from_row) - 1;
    const end = Math.min(this.quoteMappingRows.length, to_row);

    if (start >= this.quoteMappingRows.length || start < 0 || start >= end) {
      this.messageService.add({ severity: 'warn', summary: 'Invalid Range', detail: 'Please check From and To row numbers' });
      return;
    }

    for (let i = start; i < end; i++) {
      const row = this.quoteMappingRows[i];
      if (breakup_number) row.breakup_number = breakup_number;
      if (enquiry_no) {
        row.enquiry_no = enquiry_no;
        row._lineItemTypeOptions = this.bulkApplyQuote._lineItemTypeOptions;
      }
      if (line_item_type) row.line_item_type = line_item_type;
    }

    this.messageService.add({ severity: 'success', summary: 'Applied', detail: `Bulk values applied to rows ${start + 1} to ${end}` });
    this.cdr.detectChanges();
  }

  removeQuoteMappingRow(index: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this quote mapping row?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this.quoteMappingRows.splice(index, 1);
        this.quoteMappingRows = [...this.quoteMappingRows];
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Quote mapping row removed' });
      }
    });
  }

  loadQuoteMappings() {
    if (!this.currentBooking.booking_no) return;

    this.bookingService.getQuoteMappings(this.currentBooking.booking_no).subscribe({
      next: (mappings) => {
        this.quoteMappingRows = mappings.map(m => ({
          id: m.id,
          breakup_number: m.breakup_number,
          enquiry_no: m.enquiry_no,
          line_item_type: m.line_item_type,
          _lineItemTypeOptions: []
        }));

        // Load line item type options for each mapping
        this.quoteMappingRows.forEach(qm => {
          if (qm.enquiry_no) {
            this.onEnquiryChange(qm);
          }
        });
      },
      error: (err) => {
        console.error('Failed to load quote mappings:', err);
      }
    });
  }

  async saveQuoteMappings() {
    if (!this.currentBooking.booking_no) return;

    // Filter out incomplete mappings
    const validMappings = this.quoteMappingRows
      .filter(qm => qm.breakup_number && qm.enquiry_no && qm.line_item_type)
      .map(qm => ({
        breakup_type: this.breakupType === 'CONTAINER BREAKUP' ? 'CONTAINER' : 'PACKAGE',
        breakup_number: qm.breakup_number,
        enquiry_no: qm.enquiry_no,
        line_item_type: qm.line_item_type
      }));

    try {
      await this.bookingService.saveQuoteMappings(
        this.currentBooking.booking_no,
        validMappings
      ).toPromise();

      /* this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Quote mappings saved successfully'
      }); */
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.error?.error || 'Failed to save quote mappings'
      });
    }
  }

  private parseDate(d: any): Date | null {
    if (!d) return null;
    if (d instanceof Date) return d;
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  getEnquirySeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch ((status || '').toString().toLowerCase()) { // Keep original logic for case-insensitivity and default
      case 'open': return 'success';
      case 'pending': return 'warn';
      case 'closed': return 'danger';
      case 'draft': return 'secondary';
      default: return 'info';
    }
  }

  isEnquirySelectable(enq: any): boolean {
    // Check if enquiry is already linked to the current booking
    if (this.linkTargetBooking && this.linkedEnquiryCodes.has(enq.code)) {
      return false;
    }

    // Check if enquiry is appended locally but not yet saved
    if (this.lineItemsRows && this.lineItemsRows.some((li: any) => li.enq_no === enq.code)) {
      return false;
    }

    // Check if enquiry matches the first selected enquiry's attributes
    if (!this.selectedEnquiries || this.selectedEnquiries.length === 0) return true;
    const first = this.selectedEnquiries[0];
    return enq.company_name === first.company_name &&
      enq.department === first.department &&
      enq.service_type === first.service_type &&
      enq.from_location === first.from_location &&
      enq.to_location === first.to_location;
  }

  // Bulk Entry Methods
  openBulkEntryDialog() {
    const type = this.breakupType;
    if (type === 'CONTAINER BREAKUP') {
      this.activeBulkEntryType = 'container';
    } else if (type === 'PACKAGE BREAKUP') {
      this.activeBulkEntryType = 'package';
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Bulk entry is only available for Container or Package breakup types' });
      return;
    }

    // Set default breakup number (first one if multiple exist)
    if (this.breakupRows.length > 0) {
      this.selectedBreakupNo = this.breakupRows[0].breakup_no;
    } else {
      this.selectedBreakupNo = null;
    }

    const totalRows = this.getTotalSubBreakupRows();
    if (totalRows === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No breakup rows available. Please add quantity to breakup rows first.' });
      return;
    }

    // Initialize form and range
    this.bulkEntryForm = { package_no_mode: 'same' };
    this.bulkEntryRange = { from: 1, to: totalRows };
    this.showBulkEntryDialog = true;
  }

  getTotalSubBreakupRows(): number {
    if (this.activeBulkEntryType === 'container') {
      return this.getFilteredSubBreakupRows(this.containerBreakupRows).length;
    } else if (this.activeBulkEntryType === 'package') {
      return this.getFilteredSubBreakupRows(this.packageBreakupRows).length;
    }
    return 0;
  }

  getFilteredSubBreakupRows(rows: any[]): any[] {
    // If only one breakup or no breakup selected, return all rows
    if (this.breakupRows.length <= 1 || !this.selectedBreakupNo) {
      return rows;
    }
    // Filter rows by selected breakup number
    return rows.filter(row => row.breakup_no === this.selectedBreakupNo);
  }

  getRangeOptions(): any[] {
    const total = this.getTotalSubBreakupRows();
    const options = [];
    for (let i = 1; i <= total; i++) {
      options.push({ label: i.toString(), value: i });
    }
    return options;
  }

  getBreakupNoOptions(): any[] {
    return this.breakupRows.map(row => ({
      label: row.breakup_no.toString(),
      value: row.breakup_no
    }));
  }

  onBreakupNoChange() {
    // Reset range when breakup number changes
    const totalRows = this.getTotalSubBreakupRows();
    this.bulkEntryRange = { from: 1, to: totalRows };
  }

  onBulkVendorTypeChange() {
    this.bulkEntryForm._vendorOptions = this.getVendorsByType(this.bulkEntryForm.vendor_type);
    this.bulkEntryForm.vendor_name = ''; // Reset selection
  }

  onBulkCartingTypeChange() {
    const type = this.bulkEntryForm.carting_vendor_type;
    if (!type) {
      this.bulkEntryForm._cartingVendorOptions = [];
      this.bulkEntryForm.carting = ''; // Reset selection
      return;
    }
    const t = type.toLowerCase();
    this.bulkEntryForm._cartingVendorOptions = (this.allVendors || [])
      .filter((v: any) => (v.type || '').toString().toLowerCase() === t)
      .map((v: any) => ({ label: v.name2 || v.name || v.vendor_name, value: v.name2 || v.name || v.vendor_name }));
    this.bulkEntryForm.carting = ''; // Reset selection
  }

  onBulkEmptyYardTypeChange() {
    const type = this.bulkEntryForm.empty_yard_vendor_type;
    if (!type) {
      this.bulkEntryForm._emptyYardVendorOptions = [];
      this.bulkEntryForm.empty_yard = ''; // Reset selection
      return;
    }
    const t = type.toLowerCase();
    this.bulkEntryForm._emptyYardVendorOptions = (this.allVendors || [])
      .filter((v: any) => (v.type || '').toString().toLowerCase() === t)
      .map((v: any) => ({ label: v.name2 || v.name || v.vendor_name, value: v.name2 || v.name || v.vendor_name }));
    this.bulkEntryForm.empty_yard = ''; // Reset selection
  }

  // Helper methods for bulk entry dropdowns
  getUniqueVendorNames(): any[] {
    const unique = new Set(this.breakupRows.map(r => r.vendor_name).filter(v => v));
    return Array.from(unique).map(v => ({ label: v, value: v }));
  }

  getUniqueRefNos(): any[] {
    const unique = new Set(this.breakupRows.map(r => r.booking_ref_no).filter(v => v));
    return Array.from(unique).map(v => ({ label: v, value: v }));
  }

  getUniqueBasis(): any[] {
    const unique = new Set(this.breakupRows.map(r => r.basis).filter(v => v));
    return Array.from(unique).map(v => ({ label: v, value: v }));
  }

  submitBulkEntry() {
    // Validate range
    if (this.bulkEntryForm.package_no_mode === 'sequence') {
      if (!this.bulkEntryForm.pkg_seq_first || !this.bulkEntryForm.pkg_seq_next) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill First and Next Package No for sequence generation' });
        return;
      }
    }

    if (this.bulkEntryRange.from > this.bulkEntryRange.to) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'From row must be less than or equal to To row' });
      return;
    }

    const totalRows = this.getTotalSubBreakupRows();
    if (this.bulkEntryRange.from < 1 || this.bulkEntryRange.to > totalRows) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: `Range must be between 1 and ${totalRows}` });
      return;
    }

    // Get the filtered rows for the selected breakup
    const allRows = this.activeBulkEntryType === 'container' ? this.containerBreakupRows : this.packageBreakupRows;
    const filteredRows = this.getFilteredSubBreakupRows(allRows);

    // Identify range indices
    const fromIndex = this.bulkEntryRange.from - 1;
    const toIndex = this.bulkEntryRange.to - 1;

    // 1. OVERWRITE PROTECTION CHECK
    // Check if ANY field we are trying to update already has a value in the target rows
    const fieldsToCheck: { field: string, label: string, value: any }[] = [];

    // Common Fields
    if (this.hasValue(this.bulkEntryForm.booking_ref_no)) fieldsToCheck.push({ field: 'booking_ref_no', label: 'Ref No', value: this.bulkEntryForm.booking_ref_no });
    if (this.hasValue(this.bulkEntryForm.basis)) fieldsToCheck.push({ field: 'basis', label: 'Basis', value: this.bulkEntryForm.basis });
    if (this.hasValue(this.bulkEntryForm.vendor_name)) fieldsToCheck.push({ field: 'vendor_name', label: 'Vendor Name', value: this.bulkEntryForm.vendor_name });
    if (this.hasValue(this.bulkEntryForm.breakup_no)) fieldsToCheck.push({ field: 'breakup_no', label: 'Breakup No', value: this.bulkEntryForm.breakup_no });

    // Container Fields
    if (this.activeBulkEntryType === 'container') {
      if (this.hasValue(this.bulkEntryForm.container_no)) fieldsToCheck.push({ field: 'container_no', label: 'Container No', value: this.bulkEntryForm.container_no });
      if (this.hasValue(this.bulkEntryForm.pickup_handover_date)) fieldsToCheck.push({ field: 'pickup_handover_date', label: 'Pickup Date', value: this.bulkEntryForm.pickup_handover_date });
      if (this.hasValue(this.bulkEntryForm.empty_yard)) fieldsToCheck.push({ field: 'empty_yard', label: 'Empty Yard', value: this.bulkEntryForm.empty_yard });
    }

    // Package Fields
    if (this.activeBulkEntryType === 'package') {
      // For Package No, we check if user provided a specific value OR if sequence mode is on
      const isPkgMode = this.bulkEntryForm.package_no_mode;
      if ((isPkgMode === 'same' && this.hasValue(this.bulkEntryForm.package_no)) || (isPkgMode === 'sequence')) {
        fieldsToCheck.push({ field: 'package_no', label: 'Package No', value: 'SEQUENCE_OR_VALUE' });
      }
      if (this.hasValue(this.bulkEntryForm.length_cm)) fieldsToCheck.push({ field: 'length_cm', label: 'Length', value: this.bulkEntryForm.length_cm });
      if (this.hasValue(this.bulkEntryForm.width_cm)) fieldsToCheck.push({ field: 'width_cm', label: 'Width', value: this.bulkEntryForm.width_cm });
      if (this.hasValue(this.bulkEntryForm.height_cm)) fieldsToCheck.push({ field: 'height_cm', label: 'Height', value: this.bulkEntryForm.height_cm });
      if (this.hasValue(this.bulkEntryForm.weight_kgs)) fieldsToCheck.push({ field: 'weight_kgs', label: 'Weight', value: this.bulkEntryForm.weight_kgs });
      if (this.hasValue(this.bulkEntryForm.handover_date)) fieldsToCheck.push({ field: 'handover_date', label: 'Handover Date', value: this.bulkEntryForm.handover_date });
      if (this.hasValue(this.bulkEntryForm.carting)) fieldsToCheck.push({ field: 'carting', label: 'Carting', value: this.bulkEntryForm.carting });
    }

    let hasOverwriteRisk = false;
    for (let i = fromIndex; i <= toIndex; i++) {
      const row = filteredRows[i];
      if (!row) continue;

      for (const check of fieldsToCheck) {
        const existingVal = row[check.field];
        // Check if existing value is non-empty
        if (existingVal !== null && existingVal !== undefined && existingVal !== '') {
          hasOverwriteRisk = true;
          break;
        }
      }
      if (hasOverwriteRisk) break;
    }

    if (hasOverwriteRisk) {
      this.confirmationService.confirm({
        message: '⚠ Some selected rows already contain data.\nApplying bulk entry will overwrite existing values.\nDo you want to continue?',
        header: 'Confirm Overwrite',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Yes, Overwrite',
        rejectLabel: 'Cancel',
        accept: () => {
          this.executeBulkApply(filteredRows, fromIndex, toIndex);
        }
      });
    } else {
      this.executeBulkApply(filteredRows, fromIndex, toIndex);
    }
  }

  hasValue(val: any): boolean {
    return val !== undefined && val !== null && val !== '';
  }

  executeBulkApply(filteredRows: any[], fromIndex: number, toIndex: number) {
    let updatedCount = 0;

    // SEQUENCE GENERATION SETUP
    let seqPrefix = '';
    let seqNextNum = 0;
    let seqIncrement = 1;
    let seqWidth = 0; // for padding if needed

    if (this.activeBulkEntryType === 'package' && this.bulkEntryForm.package_no_mode === 'sequence') {
      const first = this.bulkEntryForm.pkg_seq_first || '';
      const second = this.bulkEntryForm.pkg_seq_next || '';

      // Regex to split alpha prefix and numeric part
      // Matches "pck1" -> ["pck", "1"], "pkg_005" -> ["pkg_", "005"]
      // Looks for numbers at the END of the string
      const regex = /^(.*?)(\d+)$/;
      const match1 = first.match(regex);
      const match2 = second.match(regex);

      if (match1 && match2) {
        const prefix1 = match1[1];
        const numPart1 = match1[2];
        const num1 = parseInt(numPart1, 10);

        const prefix2 = match2[1];
        const numPart2 = match2[2];
        const num2 = parseInt(numPart2, 10);

        if (prefix1 === prefix2) {
          seqPrefix = prefix1;
          seqIncrement = num2 - num1;
          seqNextNum = num1;
          seqWidth = numPart1.length; // Preserve leading zeros length if possible
        } else {
          // Fallback: prefixes don't match, just use raw values? 
          // Currently system requirement says "detect prefix... then generate".
          // If detection fails, maybe just assign first value? 
          // Let's default to no-op or simple increment if valid number found
          seqNextNum = NaN;
        }
      } else {
        // Cannot detect pattern
        seqNextNum = NaN;
      }
    }

    // SET SUB-BREAKUP VENDOR TYPE (for carting/empty yard)
    // This must be set BEFORE applying vendor names so the dropdown options are populated
    if (this.hasValue(this.bulkEntryForm.carting_vendor_type)) {
      this.currentBooking.sub_breakup_vendor_type = this.bulkEntryForm.carting_vendor_type;
      this.refreshSubVendorOptions();
    } else if (this.hasValue(this.bulkEntryForm.empty_yard_vendor_type)) {
      this.currentBooking.sub_breakup_vendor_type = this.bulkEntryForm.empty_yard_vendor_type;
      this.refreshSubVendorOptions();
    }

    for (let i = fromIndex; i <= toIndex; i++) {
      const row = filteredRows[i];
      if (!row) continue;

      // Apply Common Fields
      if (this.hasValue(this.bulkEntryForm.booking_ref_no)) row.booking_ref_no = this.bulkEntryForm.booking_ref_no;
      if (this.hasValue(this.bulkEntryForm.basis)) row.basis = this.bulkEntryForm.basis;
      if (this.hasValue(this.bulkEntryForm.vendor_name)) row.vendor_name = this.bulkEntryForm.vendor_name;
      if (this.hasValue(this.bulkEntryForm.breakup_no)) row.breakup_no = this.bulkEntryForm.breakup_no;

      // Container Fields
      if (this.activeBulkEntryType === 'container') {
        if (this.hasValue(this.bulkEntryForm.container_no)) row.container_no = this.bulkEntryForm.container_no;
        if (this.hasValue(this.bulkEntryForm.pickup_handover_date)) row.pickup_handover_date = this.bulkEntryForm.pickup_handover_date;
        if (this.hasValue(this.bulkEntryForm.empty_yard)) row.empty_yard = this.bulkEntryForm.empty_yard;
      }

      // Package Fields
      else if (this.activeBulkEntryType === 'package') {
        // Package No Logic
        if (this.bulkEntryForm.package_no_mode === 'same') {
          if (this.hasValue(this.bulkEntryForm.package_no)) row.package_no = this.bulkEntryForm.package_no;
        } else if (this.bulkEntryForm.package_no_mode === 'sequence') {
          if (!isNaN(seqNextNum)) {
            // Pad with zeros to match original width if number string was shorter than width (e.g. 001 -> 1)
            const numStr = seqNextNum.toString();
            // If original had leading zeros (e.g. 005), try to maintain? 
            // Simple padding logic:
            const padded = numStr.padStart(seqWidth, '0');
            row.package_no = seqPrefix + padded;

            seqNextNum += seqIncrement;
          } else {
            // Fallback if sequence logic failed? just leave it or use first value?
            // Safe to do nothing if invalid
          }
        }

        if (this.hasValue(this.bulkEntryForm.length_cm)) row.length_cm = this.bulkEntryForm.length_cm;
        if (this.hasValue(this.bulkEntryForm.width_cm)) row.width_cm = this.bulkEntryForm.width_cm;
        if (this.hasValue(this.bulkEntryForm.height_cm)) row.height_cm = this.bulkEntryForm.height_cm;
        if (this.hasValue(this.bulkEntryForm.weight_kgs)) row.weight_kgs = this.bulkEntryForm.weight_kgs;
        if (this.hasValue(this.bulkEntryForm.handover_date)) row.handover_date = this.bulkEntryForm.handover_date;
        if (this.hasValue(this.bulkEntryForm.carting)) row.carting = this.bulkEntryForm.carting;
      }
      updatedCount++;
    }

    // Trigger change detection
    if (this.activeBulkEntryType === 'container') {
      this.containerBreakupRows = [...this.containerBreakupRows];
    } else {
      this.packageBreakupRows = [...this.packageBreakupRows];
    }

    // Trigger quote mapping update
    this.initializeQuoteMappings();

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `Bulk update applied to ${updatedCount} row(s)`
    });
    this.closeBulkEntryDialog();
  }

  closeBulkEntryDialog() {
    this.showBulkEntryDialog = false;
    this.bulkEntryForm = {};
    this.bulkEntryRange = { from: 1, to: 1 };
    this.activeBulkEntryType = null;
    this.selectedBreakupNo = null;
  }

  // Enquiry Preview Methods
  openEnquiryPreview(lineItem: any) {
    if (!lineItem.enq_no) {
      this.messageService.add({ severity: 'warn', summary: 'Info', detail: 'No Enquiry Number linked to this line item.' });
      return;
    }

    this.loadingPreview = true;
    this.showEnquiryPreviewDialog = true;
    this.selectedEnquiryForPreview = null;
    this.selectedEnquiryLineItem = null;
    this.selectedSourcingVendor = null;
    this.previewSourcingCharges = [];
    this.previewTariffCharges = [];
    this.previewSourcingRemarks = '';
    this.previewTariffRemarks = '';

    // Extract Enquiry Code (handle cases where enq_no might be an object or have different format)
    const enqCode = (typeof lineItem.enq_no === 'object') ? lineItem.enq_no.code : lineItem.enq_no;

    // Use getEnquiryPreviewByCode matching Enquiry Component logic to ensure we get populated vendor data
    this.enquiryService.getEnquiryPreviewByCode(enqCode).subscribe({
      next: (response: any) => {
        const previewData = response;
        this.selectedEnquiryForPreview = previewData; // Structure might be different but code/customer_name usually at top level

        // Find matching line item in the preview response
        // We match by Service Area
        const bookingServiceArea = (lineItem.service_area || lineItem.type || '').toString().trim().toLowerCase();

        // In preview response, line_items usually contain sourcing_vendors and tariff_vendors directly
        this.selectedEnquiryLineItem = (previewData.line_items || []).find((eli: any) =>
          (eli.service_area || eli.type || '').toString().trim().toLowerCase() === bookingServiceArea
        );

        if (this.selectedEnquiryLineItem) {
          // Grouping logic for Sourcing
          this.groupedSourcingData = this.groupVendorsByRoute(this.selectedEnquiryLineItem.sourcing_vendors || []);
          // Grouping logic for Tariff
          this.groupedTariffData = this.groupVendorsByRoute(this.selectedEnquiryLineItem.tariff_vendors || []);

          // Legacy flat arrays for safety/compatibility (used for totals calculation if template isn't fully updated)
          this.previewSourcingCharges = [];
          (this.selectedEnquiryLineItem.sourcing_vendors || []).forEach((sv: any) => {
            const charges = sv.sub_charges || sv.charges || sv.sourcing_charges || [];
            if (Array.isArray(charges)) {
              charges.forEach((c: any) => this.previewSourcingCharges.push({ ...c, vendor_name: sv.vendor_name }));
            }
          });

          this.previewTariffCharges = [];
          (this.selectedEnquiryLineItem.tariff_vendors || []).forEach((tv: any) => {
            const charges = tv.sub_charges || tv.charges || tv.tariff_charges || [];
            if (Array.isArray(charges)) {
              charges.forEach((c: any) => this.previewTariffCharges.push({ ...c, vendor_name: tv.vendor_name }));
            }
          });
        }

        this.loadingPreview = false;
      },
      error: (err) => {
        console.error('Failed to load enquiry for preview:', err);
        this.loadingPreview = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch enquiry details.' });
      }
    });
  }

  groupVendorsByRoute(vendors: any[]) {
    if (!vendors || vendors.length === 0) return [];

    const routeGroups = new Map<string, any>();

    vendors.forEach((vendor: any) => {
      const fromLoc = this.getLocationName(vendor.from_location);
      const toLoc = this.getLocationName(vendor.to_location);
      const routeKey = `${fromLoc} → ${toLoc}`;

      if (!routeGroups.has(routeKey)) {
        routeGroups.set(routeKey, {
          route: routeKey,
          fromLoc,
          toLoc,
          charges: [],
          remarks: []
        });
      }

      const group = routeGroups.get(routeKey);
      if (vendor.remarks) group.remarks.push(vendor.remarks);

      const subCharges = vendor.sub_charges || vendor.charges || vendor.sourcing_charges || vendor.tariff_charges || [];
      if (Array.isArray(subCharges)) {
        subCharges.forEach((sc: any) => {
          group.charges.push({
            ...sc,
            vendor_name: vendor.vendor_name
          });
        });
      }
    });

    return Array.from(routeGroups.values());
  }

  getLocationName(code: string): string {
    if (!code) return '';
    return this.locationMap[code] || code;
  }

  getVendorName(vendorId: any): string {
    if (!vendorId) return '';
    const vendorIdStr = vendorId.toString();
    // Try to find the vendor in allVendors
    const vendor = (this.allVendors || []).find((v: any) =>
      (v.id?.toString() === vendorIdStr) || (v.code?.toString() === vendorIdStr) || (v.vendor_name === vendorIdStr)
    );
    return vendor ? vendor.vendor_name : vendorIdStr;
  }

  calculateRowTotal(charge: any): number {
    if (!charge) return 0;
    const rate = parseFloat(charge.sell_rate || 0);
    const gst = parseFloat(charge.sell_rate_gst || charge.sell_rate_gst_vat || charge.sell_gst_vat || 0);
    return rate + (rate * gst / 100);
  }

  calculateTotalSell(charges: any[]): string {
    if (!charges || charges.length === 0) return '0.00';

    const totals = new Map<string, number>();

    charges.forEach(charge => {
      const currency = charge.sell_rate_currency || charge.currency || '';
      const sellRate = parseFloat(charge.sell_rate || 0);
      const gst = parseFloat(charge.sell_rate_gst || charge.sell_rate_gst_vat || charge.sell_gst_vat || 0);
      const total = sellRate + (sellRate * gst / 100);

      if (currency) {
        const currentTotal = totals.get(currency) || 0;
        totals.set(currency, currentTotal + total);
      }
    });

    const parts: string[] = [];
    totals.forEach((value, key) => {
      // Simple formatter
      parts.push(`${key} ${value.toFixed(2)}`);
    });

    return parts.length > 0 ? parts.join(' + ') : '0.00';
  }

  calculateTotalTariff(charges: any[]): string {
    if (!charges || charges.length === 0) return '0.00';

    const totals = new Map<string, number>();

    charges.forEach(charge => {
      // Use sell_rate_currency or currency
      const currency = charge.sell_rate_currency || charge.currency || '';
      const rate = parseFloat(charge.sell_rate || 0);
      const gst = parseFloat(charge.sell_rate_gst || charge.sell_rate_gst_vat || charge.sell_gst_vat || 0);
      const total = rate + (rate * gst / 100);

      if (currency) {
        const currentTotal = totals.get(currency) || 0;
        totals.set(currency, currentTotal + total);
      }
    });

    const parts: string[] = [];
    totals.forEach((value, key) => {
      parts.push(`${key} ${value.toFixed(2)}`);
    });

    return parts.length > 0 ? parts.join(' + ') : '0.00';
  }
  loadChargeTypeNames() {
    // Determine mapping source. Using MasterItemService as it likely contains Charge codes.
    return this.masterItemService.getAll().pipe(
      tap((items: any[]) => {
        // Map generic master items (Charges)
        (items || []).forEach((item) => {
          if (item.code && item.name) {
            this.chargeCodeToName.set(item.code, item.name);
          }
        });

        // Also fallback to MasterTypeService
        this.masterTypeService.getAll().subscribe(types => {
          (types || [])
            .filter((t) => t.status?.toLowerCase() === 'active' && t.key?.toLowerCase() === 'charge_type')
            .forEach((t) => {
              if (t.value) this.chargeCodeToName.set(t.value, t.description || t.value);
            });
        });
      }),
      catchError((error: any) => {
        console.error('Error loading charge type names', error);
        return of([]);
      })
    );
  }
}
