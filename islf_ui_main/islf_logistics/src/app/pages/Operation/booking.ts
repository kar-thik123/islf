import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
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

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    ToastModule,
    TableModule,
    CalendarModule,
    TooltipModule,
    MasterLocationComponent,
    ConfigDatePipe,
    ConfirmDialogModule,
    BadgeModule
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
              <button pButton label="Create Booking" icon="pi pi-plus" (click)="openCreateDialog()"></button>
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
              <button pButton label="Open" icon="pi pi-external-link" class="p-button-sm" (click)="openBooking(row.booking_no)"></button>
              <button pButton icon="pi pi-link" class="p-button p-button-outlined p-button-secondary p-button-sm ml-4" (click)="openLinkEnquiryDialog(row)" pTooltip="Link Enquiry" tooltipPosition="top"></button>
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
        <button pButton [label]="linkTargetBooking ? 'Append' : 'Save'" icon="pi pi-check" (click)="saveFromEnquiries()"></button>
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
          <p-calendar [(ngModel)]="currentBooking.effective_date_from" [showIcon]="true" [dateFormat]="configService.calendarDateFormat" appendTo="body" [disabled]="isFrozen" class="w-60" [inputStyle]="{ width: '250px' }" [style]="{ width: '250px'}"></p-calendar>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Effective Date To</label>
          <p-calendar [(ngModel)]="currentBooking.effective_date_to" [showIcon]="true" [dateFormat]="configService.calendarDateFormat" appendTo="body" [disabled]="isFrozen" class="w-60" [inputStyle]="{ width: '250px' }" [style]="{ width: '250px'}"></p-calendar>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Status</label>
          <p-dropdown [(ngModel)]="currentBooking.status" [options]="bookingStatusOptions" optionLabel="label" optionValue="value" placeholder="Select Status" class="w-60" [style]="{'width': '200px'}" appendTo="body"></p-dropdown>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Remarks</label>
          <input pInputText class="bg-orange-50" [(ngModel)]="currentBooking.remarks"/>
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
              <p-dropdown [(ngModel)]="cg.cargo_type" [options]="cargoTypeOptions" optionLabel="label" optionValue="value" [filter]="true" filterBy="label" appendTo="body" class="w-60" (onChange)="onCargoTypeChange(cg)"></p-dropdown>
            </td>
            <td>
              <p-dropdown [(ngModel)]="cg.description" [options]="cg._descriptionOptions || []" optionLabel="label" optionValue="value" [filter]="true" filterBy="label" appendTo="body" class="w-60" (onChange)="onCargoNameChange(cg)"></p-dropdown>
            </td>
            <td>
              <p-dropdown [(ngModel)]="cg.hs_code" [options]="cg._hsCodeOptions || []" optionLabel="label" optionValue="value" [filter]="true" filterBy="label"  appendTo="body" class="w-60"></p-dropdown>
            </td>
            <td><button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeCargoRow(i)"></button></td>
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
              <p-dropdown [(ngModel)]="li.status" [options]="bookingStatusOptions" optionLabel="label" optionValue="value" class="w-60" appendTo="body"></p-dropdown>
            </td>
            <td><input pInputText class="bg-orange-50" [(ngModel)]="li.remarks"/></td>
          </tr>
        </ng-template>
      </p-table>

      <div class="section-header">Schedule</div>
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
                <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeTransitRow(i)"></button>
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
            <th>Qty</th>
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
              <input pInputText type="number" [(ngModel)]="bk.quantity" placeholder="Qty" [style]="{'width':'80px'}" (ngModelChange)="onBreakupQuantityChange()" />
            </td>
            <td>
              <input pInputText [(ngModel)]="bk.remarks" placeholder="Remarks" [style]="{'width':'100%'}" />
            </td>
            <td>
              <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeBreakupRow(i)"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Container Breakup Section -->
      <div *ngIf="breakupType === 'CONTAINER BREAKUP'">
        <div class="section-header mt-4 text-blue-700">Container Breakup Details</div>
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
                <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeSubBreakupRow(i, 'container')"></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Package Breakup Section -->
      <div *ngIf="breakupType === 'PACKAGE BREAKUP'">
        <div class="section-header mt-4 text-blue-700">Package Breakup Details</div>
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
                <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeSubBreakupRow(i, 'package')"></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- Quote Mapping Section -->
      <div *ngIf="breakupType === 'CONTAINER BREAKUP' || breakupType === 'PACKAGE BREAKUP'">
        <div class="section-header mt-4 text-green-700">Quote Mapping</div>
        <div class="mb-2">
          <button pButton label="+ Add Mapping" class="p-button-sm " (click)="addQuoteMappingRow()"></button>
        </div>
        <p-table [value]="quoteMappingRows" [showGridlines]="true">
          <ng-template pTemplate="header">
            <tr>
              <th>{{ breakupType === 'CONTAINER BREAKUP' ? 'Container No.' : 'Package No.' }}</th>
              <th>Enquiry Number</th>
              <th>Line Item Type</th>
              <th>Action</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-qm let-i="rowIndex">
            <tr>
              <td>
                <p-dropdown 
                  [(ngModel)]="qm.breakup_number" 
                  [options]="getBreakupNumberOptions()" 
                  placeholder="Select Number" 
                  appendTo="body" 
                  [filter]="true" 
                  filterBy="label" 
                  [style]="{'width':'150px'}"
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
                  [style]="{'width':'150px'}"
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
                  [style]="{'width':'200px'}"
                  class="bg-orange-50"
                  [disabled]="!qm.enquiry_no"
                ></p-dropdown>
              </td>
              <td>
                <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeQuoteMappingRow(i)"></button>
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
        <button pButton label="Cancel" class="p-button-secondary" (click)="showBookingForm=false"></button>
        <button pButton label="Save" icon="pi pi-save" class="p-button-success" (click)="finalSave()"></button>
      </div>
      </div>
      </ng-template>
    </p-dialog>
  `,
})
export class BookingComponent implements OnInit {
  bookings: any[] = [];
  search = '';
  statusFilter = '';
  statusOptions = [
    { label: 'Open', value: 'Open' },
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Closed', value: 'Closed' },
  ];
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
  lineItemTypeOptionsMap: { [enquiryNo: string]: any[] } = {};

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
    public configService: ConfigService
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
    // Initial load happens via onLazyLoad
    this.loadDropdowns();
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
    this.loading = true;
    const ctx = this.contextService.getContext();

    // 🚀 Hydration Strategy: Load EVERYTHING critical before showing the UI
    forkJoin({
      departments: this.enquiryService.getDepartmentsDropdown(ctx.companyCode).pipe(take(1)),
      locations: this.masterLocationService.getAll().pipe(take(1)),
      bookingStatuses: this.masterTypeService.getAllByType('BOOKING_STATUS').pipe(take(1)),
      cargoItems: this.masterItemService.getAll().pipe(take(1)),
      vendors: this.vendorService.getAll().pipe(take(1)),
      serviceTypes: this.serviceTypeService.getAll().pipe(take(1)),
      airlines: this.masterAirlineService.getAll().pipe(take(1)),
      vessels: this.masterVesselService.getAll().pipe(take(1)),
      vendorTypes: this.masterTypeService.getAllByType('VENDOR').pipe(take(1)),
      locationTypes: this.masterTypeService.getAll().pipe(take(1))
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
        this.allLocations = res.locations || [];
        this.locationMap = {};
        this.allLocations.forEach(loc => {
          this.locationMap[loc.code] = loc.name;
        });

        // 3. Statuses
        this.bookingStatusOptions = (res.bookingStatuses || []).map((s: any) => ({
          label: s.value,
          value: s.value
        }));

        // 4. Cargo
        this.allCargoItems = res.cargoItems || [];
        this.cargoTypeOptions = Array.from(new Set(this.allCargoItems.map(i => i.item_type)))
          .map(type => ({ label: type, value: type }));

        // 5. Vendors
        this.allVendors = res.vendors || [];
        this.refreshSubVendorOptions();

        // 6. Service Types
        this.allServiceTypes = res.serviceTypes || [];
        this.serviceTypeOptions = this.allServiceTypes.map(st => ({
          label: st.name,
          value: st.name,
          code: st.code
        }));

        // 7. Airlines & Vessels
        this.allAirlines = res.airlines || [];
        this.airlineOptions = this.allAirlines.map(a => ({ label: a.airline_name, value: a.airline_name }));
        this.vesselOptions = this.allVessels.map(v => ({ label: v.vessel_name, value: v.vessel_name }));

        // 8. Vendor Types
        this.vendorTypeOptions = (res.vendorTypes || []).map((t: any) => ({ label: t.value, value: t.value }));

        // 9. Location Types
        this.locationTypeOptions = (res.locationTypes || [])
          .filter((t: any) => (t.key || '').toString().toLowerCase() === 'location' && (t.status || '').toString().toLowerCase() === 'active')
          .map((t: any) => ({ label: t.value, value: t.value }));

        // Now that master data is READY, we can safely allow the UI to finish loading
        this.loading = false;

        // Initial load of content
        this.loadBookings();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load master data:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to initialize master data' });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openCreateDialog() {
    this.dialog = { department: '', service_type: '', from_location_type: '', from_location: '', to_location_type: '', to_location: '' };
    this.matchingEnquiries = []; this.selectedEnquiries = [];
    this.showCreateDialog = true;
    this.isSelectingForExisting = false;
    this.onLocationTypeChange('from');
    this.onLocationTypeChange('to');
    this.searchEnquiries();
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
    console.log("linkTargetBooking value before cancelling", this.linkTargetBooking);
    this.showCreateDialog = false;
    this.linkTargetBooking = null;
    console.log("linkTargetBooking value after cancelling", this.linkTargetBooking);
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
    console.log('Selected Enquiries: during the save enquiry', this.selectedEnquiries);
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
    let overrides: any = {};
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
      // console.log('Select Enquiry Overrides for min from and to dates: ', overrides);
    }
    this.pendingOverrides = overrides;


    const selected = this.selectedEnquiries.map((e: any) => ({ id: e.id, code: e.code }));
    console.log('Selected Enquiries: during the save enquiry', this.selectedEnquiries);
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
        this.locName(e.from_location).trim().toLowerCase() !== (target.from_location || '').trim().toLowerCase() ||
        this.locName(e.to_location).trim().toLowerCase() !== (target.to_location || '').trim().toLowerCase()
      );

      if (mismatch) {
        this.errorHeader = 'Link Error';
        this.errorMessage = 'Selected enquiries must match Company, Department, Service Type, From and To Location of the existing booking.';
        this.showErrorDialog = true;
        return;
      }

      this.pendingLinkEnquiries = [...this.selectedEnquiries];
      this.showCreateDialog = false;
      this.openBooking(this.linkTargetBooking.booking_no);
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
        status: 'Open',
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
    this.currentBooking = { booking_type: 'manual', status: 'Open', created_at: new Date() } as any;
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
    this.loading = true;
    console.log("Vendors list when open booking,", this.allVendors);
    // 🚀 Only load vendors if not already loaded to save an API call
    const vendors$ = this.allVendors.length > 0 ? of(this.allVendors) : this.vendorService.getAll().pipe(take(1));

    forkJoin({
      vendors: vendors$,
      booking: this.bookingService.getByNo(bookingNo).pipe(take(1))
    }).subscribe({
      next: ({ vendors, booking }) => {
        this.allVendors = vendors || [];
        const b = booking;
        this.currentBooking = b as any;

        this.currentBooking.effective_date_from = this.parseDate(this.currentBooking.effective_date_from) as any;
        this.currentBooking.effective_date_to = this.parseDate(this.currentBooking.effective_date_to) as any;

        this.breakupRows = (b?.booking_breakup || []).map((bk: any) => {
          bk.valid_till = bk.valid_till ? new Date(bk.valid_till) : null;
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
        this.cargoRows = (Array.isArray((b as any)?.cargo) ? (b as any).cargo : []).map((cg: any) => ({
          ...cg,
          _descriptionOptions: this.getCargoNamesByType(cg.cargo_type),
          _hsCodeOptions: this.getHsCodesByTypeAndName(cg.cargo_type, cg.description)
        }));

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
          this.currentBooking.selected_enquiries = selected;

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
                  const newCargo = fullEnq.cargo.map((cg: any) => ({
                    cargo_type: cg.cargo_type,
                    description: cg.description,
                    hs_code: cg.hs_code,
                    _descriptionOptions: this.getCargoNamesByType(cg.cargo_type),
                    _hsCodeOptions: this.getHsCodesByTypeAndName(cg.cargo_type, cg.description)
                  }));
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

        this.loading = false;
        this.showBookingForm = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load booking:', err);
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load booking details' });
      }
    });
  }

  addCargoRow() {
    this.cargoRows = [...this.cargoRows, {
      cargo_type: '',
      description: '',
      hs_code: '',
      _descriptionOptions: [],
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

  onTransitLocTypeChange(trn: any, field: 'from' | 'to') {
    // Deprecated: Template now binds directly to getLocationsByType
  }

  getCargoNamesByType(type: any) {
    const t = (type || '').toString();
    return (this.allCargoItems || [])
      .filter((ci: any) => ((ci.cargo_type || ci.charge_type || '').toString() === t))
      .map((ci: any) => ({ label: ci.name, value: ci.name }));
  }

  getHsCodesByTypeAndName(type: any, name: any) {
    const t = (type || '').toString();
    const n = (name || '').toString();
    return (this.allCargoItems || [])
      .filter((ci: any) => ((ci.cargo_type || ci.charge_type || '').toString() === t) && ((ci.name || '').toString() === n))
      .map((ci: any) => ({ label: ci.hs_code, value: ci.hs_code }));
  }

  onCargoTypeChange(cg: any) {
    cg._descriptionOptions = this.getCargoNamesByType(cg.cargo_type);
    if (cg._descriptionOptions.length === 1) {
      cg.description = cg._descriptionOptions[0].value;
    } else {
      cg.description = '';
    }
    this.onCargoNameChange(cg);
  }

  onCargoNameChange(cg: any) {
    cg._hsCodeOptions = this.getHsCodesByTypeAndName(cg.cargo_type, cg.description);
    if (cg._hsCodeOptions.length === 1) {
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
      remarks: '',
      _vendorOptions: []
    });
    this.breakupRows = [...this.breakupRows];
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

    if (type === 'CONTAINER BREAKUP') {
      this.syncSubBreakupRows(this.containerBreakupRows, 'container');
    } else if (type === 'PACKAGE BREAKUP') {
      this.syncSubBreakupRows(this.packageBreakupRows, 'package');
    }
  }

  syncSubBreakupRows(subRows: any[], subType: 'container' | 'package') {
    const newSubRows: any[] = [];

    // Sort main rows by breakup_no or maintain array order? 
    // Array order is safer for user expectation.
    this.breakupRows.forEach((mainRow) => {
      const qty = parseInt(mainRow.quantity) || 0;
      // Use breakup_no as the stable key to find existing sub-rows
      const mySubRows = subRows.filter(sr => sr.breakup_no === mainRow.breakup_no);

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
    const mainRow = this.breakupRows.find(br => br.breakup_no === bNo);
    const currentQty = mainRow ? (parseInt(mainRow.quantity) || 0) : 0;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete this sub breakup?\n\nIf you delete this row, the quantity in booking breakup\nwill be updated automatically.\n\nThis action cannot be undone.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        if (mainRow) {
          if (currentQty > 0) {
            rows.splice(index, 1);
            mainRow.quantity = currentQty - 1;
            this.onBreakupQuantityChange();
          }
        }
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Sub breakup removed' });
      }
    });
  }

  getBasisOptions() {
    const bases = (this.lineItemsRows || []).map(li => li.basis).filter(b => !!b);
    return Array.from(new Set(bases)).map(b => ({ label: b, value: b }));
  }

  openMasterLocation() { this.showMasterLocationDialog = true; }

  closeMasterLocation() {
    this.showMasterLocationDialog = false;
    // 🚀 Use the optimized loadDropdowns instead of redundant calls
    this.loadDropdowns();
  }
  openLinkEnquiryDialog(row: any) {
    this.linkTargetBooking = row;
    this.dialog = {
      department: row.department,
      service_type: row.service_type,
      from_location_type: '',
      from_location: row.from_location,
      to_location_type: '',
      to_location: row.to_location
    };

    // Fix: Find codes from names if necessary to ensure dropdowns in the search dialog are pre-filled
    if (this.dialog.from_location) {
      const loc = this.allLocations.find((l: any) => l.code == this.dialog.from_location || l.name == this.dialog.from_location);
      if (loc) {
        this.dialog.from_location = loc.code;
        this.dialog.from_location_type = loc.type;
      }
    }
    if (this.dialog.to_location) {
      const loc = this.allLocations.find((l: any) => l.code == this.dialog.to_location || l.name == this.dialog.to_location);
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
    this.showCreateDialog = true;
    this.isSelectingForExisting = true;
  }

  saveLinkEnquiry() {
    // Deprecated: Logic moved to saveFromEnquiries
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
    const existingMappings = new Set(this.quoteMappingRows.map(qm => qm.breakup_number));

    // Create one row per breakup number if not already exists
    breakupNumbers.forEach(num => {
      if (!existingMappings.has(num)) {
        this.quoteMappingRows.push({
          breakup_number: num,
          enquiry_no: null,
          line_item_type: null,
          _lineItemTypeOptions: []
        });
      }
    });
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

  removeQuoteMappingRow(index: number) {
    this.quoteMappingRows.splice(index, 1);
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
    const date = new Date(d);
    return isNaN(date.getTime()) ? null : date;
  }

  getEnquirySeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch ((status || '').toString().toLowerCase()) {
      case 'open': return 'success';
      case 'pending': return 'warn';
      case 'closed': return 'danger';
      case 'draft': return 'secondary';
      default: return 'info';
    }
  }

  isEnquirySelectable(enq: any): boolean {
    const status = (enq.status || '').toString().toLowerCase();
    return status === 'open' || status === 'pending';
  }
}
