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
import { MessageService } from 'primeng/api';
import { BookingService, BookingRecord } from '../../services/booking.service';
import { EnquiryService } from '../../services/enquiry.service';
import { ServiceTypeService } from '../../services/servicetype.service';
import { ContextService } from '../../services/context.service';
import { MasterLocationService } from '../../services/master-location.service';
import { MasterLocationComponent } from '../../pages/masters/masterlocation';
import { MasterTypeService } from '../../services/mastertype.service';
import { MasterItemService, MasterItem } from '../../services/master-item.service';
import { VendorService } from '../../services/vendor.service';

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
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Booking Dashboard</div>
      <p-table #dt [value]="bookings" [lazy]="true" (onLazyLoad)="loadBookings($event)" [totalRecords]="totalRecords" [paginator]="true" [rows]="10" [loading]="loading" dataKey="booking_no" [showGridlines]="true" [globalFilterFields]="['booking_no','customer_name','company_name','department','service_type','from_location','to_location','status']">
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
                <p-columnFilter field="customer_name" matchMode="contains" display="menu"></p-columnFilter>
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
            <td>{{ row.created_at | date:'dd/MM/yyyy' }}</td>
            <td>{{ row.booking_no }}</td>
            <td>{{ row.customer_name }}</td>
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
              <th>Dates</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-enq>
            <tr [pSelectableRow]="enq">
              <td>
                <p-tableCheckbox [value]="enq"></p-tableCheckbox>
              </td>
              <td>{{ enq.code }}</td>
              <td>{{ enq.customer_name }}</td>
              <td>{{ enq.department }}</td>
              <td>{{ enq.service_type }}</td>
              <td>{{ locName(enq.from_location) }}</td>
              <td>{{ locName(enq.to_location) }}</td>
              <td>{{ enq.effective_date_from | date:'dd/MM/yyyy' }} → {{ enq.effective_date_to | date:'dd/MM/yyyy' }}</td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <ng-template pTemplate="footer">
        <button pButton label="Save" icon="pi pi-check" (click)="saveFromEnquiries()"></button>
        <button pButton label="Cancel" class="p-button-secondary" (click)="showCreateDialog=false"></button>
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
            <button pButton icon="pi pi-search" class="p-button-sm" (click)="openEnquirySelection()" pTooltip="Link Enquiry"></button>
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
          <p-calendar [(ngModel)]="currentBooking.effective_date_from" [showIcon]="true" dateFormat="dd/mm/yy" appendTo="body" [disabled]="isFrozen" class="w-60" [inputStyle]="{ width: '250px' }" [style]="{ width: '250px'}"></p-calendar>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Effective Date To</label>
          <p-calendar [(ngModel)]="currentBooking.effective_date_to" [showIcon]="true" dateFormat="dd/mm/yy" appendTo="body" [disabled]="isFrozen" class="w-60" [inputStyle]="{ width: '250px' }" [style]="{ width: '250px'}"></p-calendar>
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
          <input pInputText [value]="currentBooking.created_at | date:'dd/MM/yyyy'" readonly class="bg-gray-100 w-60" />
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
      <p-table [value]="lineItemsRows" [showGridlines]="true">
        <ng-template pTemplate="header">
          <tr>
            <th>Type</th>
            <th>Service Area</th>
            <th>Basis</th>
            <th>From</th>
            <th>To</th>
            <th>Sourced Vendor</th>
            <th>Basis Qty</th>
            <th>Booking Ref</th>
            <th>Valid Till</th>
            <th>Status</th>
            <th>Remarks</th>
            <th>Schedule</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-li>
          <tr>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="li.type"/></td>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="li.service_area"/></td>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="li.basis"/></td>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="li.from_location"/></td>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="li.to_location"/></td>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="li.sourced_vendor"/></td>
            <td><input pInputText class="bg-orange-50" [(ngModel)]="li.basis_qty"/></td>
            <td><input pInputText class="bg-orange-50" [(ngModel)]="li.booking_ref"/></td>
            <td>
              <p-calendar [(ngModel)]="li.valid_till" [showIcon]="true" dateFormat="dd/mm/yy" appendTo="body" class="w-40" [inputStyle]="{ width: '200px' }" [style]="{ width: '250px' }"></p-calendar>
            </td>
            <td>
              <p-dropdown [(ngModel)]="li.status" [options]="bookingStatusOptions" optionLabel="label" optionValue="value" class="w-60" appendTo="body"></p-dropdown>
            </td>
            <td><input pInputText class="bg-orange-50" [(ngModel)]="li.remarks"/></td>
            <td>
              <p-dropdown [options]="yesNoOptions" [(ngModel)]="li.schedule" (onChange)="onLineItemScheduleChange(li)" appendTo="body"></p-dropdown>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <div class="section-header">Schedule</div>
      <div *ngFor="let svc of scheduleServiceKeys()" class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <div class="font-semibold">{{ svc }}</div>
          <button pButton label="+ Add Transit" class="p-button-sm" (click)="addTransit(svc)"></button>
        </div>
        <p-table [value]="scheduleGroups[svc]" [showGridlines]="true">
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
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-trn let-i="rowIndex">
            <tr>
              <td>{{ iToOneBased(trn.transit_count) }}</td>
              <td>
                <div class="flex gap-2 items-center">
                  <p-dropdown [(ngModel)]="trn.from_location_type" [options]="locationTypeOptions" optionLabel="label" optionValue="value" [filter]="true" filterBy="label" appendTo="body" class="w-60" (onChange)="onTransitLocTypeChange(trn, 'from')"></p-dropdown>
                  <button pButton icon="pi pi-ellipsis-h" class="p-button-sm" (click)="openMasterLocation()"></button>
                </div>
              </td>
              <td>
                <p-dropdown [(ngModel)]="trn.from_location" [options]="trn._fromLocationOptions || []" optionLabel="label" optionValue="value" [filter]="true" filterBy="label" appendTo="body" class="w-60"></p-dropdown>
              </td>
              <td>
                <div class="flex gap-2 items-center">
                  <p-dropdown [(ngModel)]="trn.to_location_type" [options]="locationTypeOptions" optionLabel="label" optionValue="value" [filter]="true" filterBy="label" appendTo="body" class="w-60" (onChange)="onTransitLocTypeChange(trn, 'to')"></p-dropdown>
                  <button pButton icon="pi pi-ellipsis-h" class="p-button-sm" (click)="openMasterLocation()"></button>
                </div>
              </td>
              <td>
                <p-dropdown [(ngModel)]="trn.to_location" [options]="trn._toLocationOptions || []" optionLabel="label" optionValue="value" [filter]="true" filterBy="label" appendTo="body" class="w-60"></p-dropdown>
              </td>
              <td><input pInputText class="bg-orange-50" [(ngModel)]="trn.vessel_airline"/></td>
              <td><input pInputText class="bg-orange-50" [(ngModel)]="trn.voyage_flight_no"/></td>
              <td>
                <p-calendar [(ngModel)]="trn.etd" [showIcon]="true" dateFormat="dd/mm/yy" appendTo="body" class="w-60" [inputStyle]="{ width: '100%' }" [style]="{ width: '100%' }"></p-calendar>
              </td>
              <td>
                <p-calendar [(ngModel)]="trn.eta" [showIcon]="true" dateFormat="dd/mm/yy" appendTo="body" class="w-60" [inputStyle]="{ width: '100%' }" [style]="{ width: '100%' }"></p-calendar>
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
  dialog: any = { department: '', service_type: '', from_location: '', to_location: '' };
  departmentOptions: any[] = [];
  departmentOptionsRaw: any[] = [];
  serviceTypeOptions: any[] = [];
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

  totalRecords: number = 0;
  loading: boolean = false;

  showBookingForm = false;
  currentBooking: BookingRecord = { booking_type: 'manual', status: 'Open' } as any;
  isFrozen = false;
  cargoRows: any[] = [];
  carriageRows: any[] = [];
  lineItemsRows: any[] = [];
  scheduleGroups: { [service: string]: any[] } = {};
  yesNoOptions = [{ label: 'YES', value: 'YES' }, { label: 'NO', value: 'NO' }];
  enquiryTypeOptions = [{ label: 'Direct', value: 'Direct' }, { label: 'Nominee', value: 'Nominee' }];
  allCargoItems: MasterItem[] = [];

  cargoTypeOptions: any[] = [];
  allVendors: any[] = [];
  isSelectingForExisting = false;

  constructor(
    private bookingService: BookingService,
    private enquiryService: EnquiryService,
    private contextService: ContextService,
    private serviceTypeService: ServiceTypeService,
    private masterLocationService: MasterLocationService,
    private masterTypeService: MasterTypeService,
    private masterItemService: MasterItemService,
    private vendorService: VendorService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
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
    this.loading = true;
    const page = event ? (event.first / event.rows) + 1 : 1;
    const limit = event ? event.rows : 10;

    // Handle filters if needed, usually passed in event.filters
    // For now keeping simple search/status binding

    this.bookingService.getAll(page, limit, this.search, this.statusFilter).subscribe({
      next: (res) => {
        this.bookings = res?.data || [];
        this.totalRecords = res?.total || 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; }
    });
  }

  loadDropdowns() {
    this.loading = true;
    const ctx = this.contextService.getContext();

    // 🚀 Parallelize core dropdown calls using forkJoin
    forkJoin({
      departments: this.enquiryService.getDepartmentsDropdown(ctx.companyCode).pipe(take(1)),
      locations: this.masterLocationService.getAll().pipe(take(1)),
      bookingStatuses: this.masterTypeService.getAllByType('BOOKING_STATUS').pipe(take(1)),
      cargoItems: this.masterItemService.getAll().pipe(take(1)),
      vendors: this.vendorService.getAll().pipe(take(1))
    }).subscribe({
      next: (res) => {
        // 1. Departments
        this.departmentOptionsRaw = res.departments || [];
        this.departmentOptions = this.departmentOptionsRaw.map((d: any) => ({
          label: d.display_name || d.name,
          value: d.name
        }));

        // 2. Locations (Unified from masterLocationService)
        this.allLocations = res.locations || [];
        const locationOpts = this.allLocations.map((l: any) => ({ label: l.name, value: l.code }));

        this.locationMap = {};
        for (const l of this.allLocations) {
          this.locationMap[l.code] = l.name || l.code;
        }
        this.fromLocationOptions = locationOpts;
        this.toLocationOptions = locationOpts;

        const locTypes = [...new Set(this.allLocations.map((l: any) => l.type))].filter(Boolean);
        this.locationTypeOptions = locTypes.map(t => ({ label: t, value: t }));

        // 3. Booking Statuses
        const statusList = res.bookingStatuses || [];
        this.bookingStatusOptions = statusList.map((r: any) => ({
          label: r.display_name || r.name || r.value || r.code,
          value: r.value || r.name || r.display_name || r.code
        }));

        // 4. Cargo Items
        const cargoItems = (res.cargoItems || []).filter(it =>
          ((it.item_type || '').toString().toUpperCase() === 'CARGO_TYPE')
        );
        this.allCargoItems = cargoItems;
        const cargoTypes = [...new Set(cargoItems.map(ci =>
          (ci.cargo_type || ci.charge_type || '').toString()
        ).filter(Boolean))];
        this.cargoTypeOptions = cargoTypes.map(t => ({ label: t, value: t }));

        // 5. Vendors
        this.allVendors = res.vendors || [];

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load dropdowns:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    // Handle Service Type Options separately as it's a stream
    this.contextService.serviceTypeOptions$.pipe(take(1)).subscribe(opts => {
      this.serviceTypeOptions = opts || [];
      this.cdr.detectChanges();
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
    if (deptCode) {
      this.contextService.loadServiceTypesForDepartment(deptCode);
    }
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

  saveFromEnquiries() {
    const selected = this.selectedEnquiries.map((e: any) => ({ id: e.id, code: e.code }));

    // Check for Link Mode (Existing Booking)
    if (this.linkTargetBooking) {
      if (selected.length === 0) {
        this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No enquiry selected' });
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
        this.messageService.add({ severity: 'error', summary: 'Missing Fields', detail: 'Please select Department, Service Type, From and To Location' });
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
    this.bookingService.createFromEnquiries(this.dialog, selected).subscribe({
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
      line_items: this.lineItemsRows.map(li => ({
        ...li,
        valid_till: this.formatDate(li.valid_till)
      })),
      schedules: this.flattenSchedules().map(s => ({
        ...s,
        etd: this.formatDate(s.etd),
        eta: this.formatDate(s.eta)
      }))
    } as BookingRecord;

    // if (this.isFrozen) { this.showBookingForm = false; return; }

    if (payload.id) {
      this.bookingService.updateBooking(payload.id, payload).subscribe({
        next: (res) => { this.showBookingForm = false; this.loadBookings(); this.messageService.add({ severity: 'success', summary: 'Updated', detail: `Booking ${res.booking_no} updated` }); },
        error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update booking' }); }
      });
    } else {
      this.bookingService.createManualBooking(payload).subscribe({
        next: (res) => { this.showBookingForm = false; this.loadBookings(); this.messageService.add({ severity: 'success', summary: 'Saved', detail: `Booking ${res.booking_no} created` }); },
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

        this.isFrozen = (b as any)?.booking_type === 'from_enquiry';

        // Init Cargo Rows and their pre-calculated options
        this.cargoRows = (Array.isArray((b as any)?.cargo) ? (b as any).cargo : []).map((cg: any) => ({
          ...cg,
          _descriptionOptions: this.getCargoNamesByType(cg.cargo_type),
          _hsCodeOptions: this.getHsCodesByTypeAndName(cg.cargo_type, cg.description)
        }));

        this.carriageRows = Array.isArray((b as any)?.carriage_map) ? (b as any).carriage_map : [];
        const rawItems = Array.isArray((b as any)?.line_items) ? (b as any).line_items : [];

        // Init Schedule Groups and their options
        this.scheduleGroups = {};
        const scheds = (b as any)?.schedules || [];
        if (Array.isArray(scheds)) {
          scheds.forEach((s: any) => {
            const key = s.service || 'SERVICE';
            if (!this.scheduleGroups[key]) this.scheduleGroups[key] = [];
            this.scheduleGroups[key].push({
              ...s,
              etd: this.parseDate(s.etd),
              eta: this.parseDate(s.eta),
              _fromLocationOptions: this.getLocationsByType(s.from_location_type),
              _toLocationOptions: this.getLocationsByType(s.to_location_type)
            });
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
          const vendorName = validVendor?.vendor_name || li.sourced_vendor || (match && (match.vendor_name || match.vendor || match.vendor_code)) || (vendorCards[0]?.vendor_name) || '';

          const key = li.service_area || li.type || 'SERVICE';
          const hasSchedule = (this.scheduleGroups[key] && this.scheduleGroups[key].length > 0) ? 'YES' : 'NO';

          return {
            ...li,
            from_location: toLabel(li.from_location || li.line_from_location || li.line_from_location_name || ''),
            to_location: toLabel(li.to_location || li.line_to_location || li.line_to_location_name || ''),
            sourced_vendor: vendorName,
            valid_till: this.parseDate(li.valid_till),
            schedule: hasSchedule
          };
        });

        this.carriageRows = (this.carriageRows || []).map((cr: any) => ({
          ...cr,
          location: toLabel(cr.location || '')
        }));

        this.currentBooking.from_location = toLabel((b as any)?.from_location || '');
        this.currentBooking.to_location = toLabel((b as any)?.to_location || '');


        if (this.pendingLinkEnquiries.length > 0) {
          // this.currentBooking.booking_type = 'from_enquiry'; // Removed to prevents creation of new booking
          const selected = this.pendingLinkEnquiries.map((e: any) => ({ id: e.id, code: e.code }));
          this.currentBooking.selected_enquiries = selected;
          // Map first enquiry details to booking
          if (this.pendingLinkEnquiries.length === 1) {
            const enq = this.pendingLinkEnquiries[0];
            // Fetch full details since table row might be partial
            this.enquiryService.getByCode(enq.code).subscribe((fullEnq: any) => {
              this.currentBooking.company_name = fullEnq.customer_name;
              this.currentBooking.department = fullEnq.department;
              this.currentBooking.service_type = fullEnq.service_type;
              this.currentBooking.from_location = this.locName(fullEnq.from_location);
              this.currentBooking.to_location = this.locName(fullEnq.to_location);
              this.currentBooking.enquiry_type = fullEnq.enquiry_type;
              this.currentBooking.effective_date_from = this.parseDate(fullEnq.effective_date_from) as any;
              this.currentBooking.effective_date_to = this.parseDate(fullEnq.effective_date_to) as any;
              this.currentBooking.source_sales_person = fullEnq.sales_person;

              // Map Line Items
              if (Array.isArray(fullEnq.line_items)) {
                const enqVendorCards = fullEnq.vendor_cards || [];
                this.lineItemsRows = fullEnq.line_items.map((li: any) => {
                  const sourcingSummary = Array.isArray(li.enquiry_summary) ? li.enquiry_summary.find((s: any) => s.summary_type === 'sourcing') : null;

                  const validVendor = enqVendorCards.find((vc: any) => {
                    const lookup = (li.sourced_vendor || '').toString().trim().toLowerCase();
                    return (vc.vendor_no || '').toString().trim().toLowerCase() === lookup ||
                      (vc.vendor_code || '').toString().trim().toLowerCase() === lookup ||
                      (vc.code || '').toString().trim().toLowerCase() === lookup;
                  });

                  let vendorName = validVendor?.vendor_name || (sourcingSummary ? sourcingSummary.vendor_name : (li.sourced_vendor || ''));

                  // Attempt to resolve vendor name from master list if it's a code
                  if (vendorName && this.allVendors.length > 0) {
                    const lookup = vendorName.toString().trim().toLowerCase();
                    const masterVendor = this.allVendors.find((v: any) => (v.vendor_no || '').toString().trim().toLowerCase() === lookup || (v.code || '').toString().trim().toLowerCase() === lookup);
                    if (masterVendor) vendorName = masterVendor.name || masterVendor.name2 || masterVendor.vendor_name || vendorName;
                  }

                  console.log('DEBUG Vendor Lookup:', {
                    sourced: li.sourced_vendor,
                    validVendor: validVendor,
                    vendorName: vendorName
                  });

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
                    schedule: 'NO'
                  };
                });
              }

              // Map Cargo
              if (Array.isArray(fullEnq.cargo)) {
                this.cargoRows = fullEnq.cargo.map((cg: any) => ({
                  cargo_type: cg.cargo_type,
                  description: cg.description,
                  hs_code: cg.hs_code
                }));
              }

              // Map Carriage List
              if (Array.isArray(fullEnq.carriage_map)) {
                this.carriageRows = fullEnq.carriage_map.map((cm: any) => ({
                  carriage: cm.carriage,
                  location_type: cm.location_type,
                  location: this.locName(cm.location)
                }));
              }
            });
          }

          this.pendingLinkEnquiries = [];
          this.messageService.add({ severity: 'info', summary: 'Enquiry Linked', detail: 'Please review and save changes' });
        }

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

  addTransit(service: string) {
    if (!this.scheduleGroups[service]) this.scheduleGroups[service] = [];
    const cnt = this.scheduleGroups[service].length;
    this.scheduleGroups[service] = [...this.scheduleGroups[service], {
      service,
      transit_count: cnt,
      from_location_type: '',
      from_location: '',
      to_location_type: '',
      to_location: '',
      vessel_airline: '',
      voyage_flight_no: '',
      etd: '',
      eta: '',
      _fromLocationOptions: [],
      _toLocationOptions: []
    }];
  }

  onLineItemScheduleChange(li: any) {
    const key = li.service_area || li.type || 'SERVICE';
    if ((li.schedule || '').toString().toUpperCase() === 'YES') {
      if (!this.scheduleGroups[key] || this.scheduleGroups[key].length === 0) {
        this.addTransit(key);
      }
    } else {
      delete this.scheduleGroups[key];
    }
  }

  scheduleServiceKeys(): string[] {
    const yesServices = new Set(
      this.lineItemsRows
        .filter(li => (li.schedule || '').toString().toUpperCase() === 'YES')
        .map(li => li.service_area || li.type || 'SERVICE')
    );
    return Array.from(yesServices).filter(k => !!this.scheduleGroups[k]);
  }

  flattenSchedules(): any[] {
    const out: any[] = [];
    for (const k of Object.keys(this.scheduleGroups)) for (const t of this.scheduleGroups[k]) out.push({ ...t, service: k });
    return out;
  }

  iToOneBased(v: any) { const n = Number(v ?? 0); return isNaN(n) ? '' : (n + 1); }

  locName(code: any) {
    const key = (code || '').toString();
    return this.locationMap[key] || key;
  }

  getLocationsByType(type: any) {
    const t = (type || '').toString();
    if (!t) return [];
    return (this.allLocations || [])
      .filter((l: any) => (l.type || '').toString() === t)
      .map((l: any) => ({ label: l.name, value: l.code }));
  }

  onTransitLocTypeChange(trn: any, field: 'from' | 'to') {
    if (field === 'from') {
      trn._fromLocationOptions = this.getLocationsByType(trn.from_location_type);
    } else {
      trn._toLocationOptions = this.getLocationsByType(trn.to_location_type);
    }
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
    if (this.dialog.from_location) {
      const loc = this.allLocations.find((l: any) => l.code == this.dialog.from_location);
      if (loc) this.dialog.from_location_type = loc.type;
    }
    if (this.dialog.to_location) {
      const loc = this.allLocations.find((l: any) => l.code == this.dialog.to_location);
      if (loc) this.dialog.to_location_type = loc.type;
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

  addLineItemRow() { this.lineItemsRows = [...this.lineItemsRows, { type: '', service_area: '', basis: '', from_location: '', to_location: '', sourced_vendor: '', basis_qty: '', booking_ref: '', valid_till: '', status: 'Active', remarks: '', schedule: 'NO' }]; }

  private formatDate(date: any): string | null {
    if (!date) return null;
    let d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseDate(d: any): Date | null {
    if (!d) return null;
    const date = new Date(d);
    return isNaN(date.getTime()) ? null : date;
  }
}
