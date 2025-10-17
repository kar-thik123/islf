import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MenuModule, Menu } from 'primeng/menu';
import { NgSelectComponent, NgOptionComponent } from '@ng-select/ng-select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  VendorService,
  Vendor,
  VendorContact,
} from '../../services/vendor.service';
import { NumberSeriesService } from '@/services/number-series.service';
import { MappingService } from '@/services/mapping.service';
import { MasterTypeComponent } from './mastertype';
import { MasterLocationComponent } from './masterlocation';
import {
  MasterLocationService,
  MasterLocation,
} from '../../services/master-location.service';
import { MasterTypeService } from '../../services/mastertype.service';
import {
  EntityDocumentService,
  EntityDocument,
} from '../../services/entity-document.service';
import { DepartmentService } from '../../services/department.service';
import { ConfigService } from '@/services/config.service';
import { ContextService } from '@/services/context.service';
import {
  AccountDetailsService,
  AccountDetail,
} from '../../services/account-details.service';
// import {} from '@angular/material/'
import { Country, State, City } from 'country-state-city';
import { Subscription } from 'rxjs';

function uniqueCaseInsensitive(arr: string[]): string[] {
  const seen = new Set<string>();
  return arr.filter((val) => {
    if (!val) return false;
    const lower = val.trim().toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });
}

function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

@Component({
  selector: 'vendor-master',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    ToastModule,
    DialogModule,
    ConfirmDialogModule,
    MasterTypeComponent,
    MenuModule,
    Menu,
    MasterLocationComponent,
    NgSelectComponent,
    NgOptionComponent,
  ],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Vendor Master</div>
      <p-table
        #dt
        [value]="vendors"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="[
          'vendor_no',
          'name2',
          'city',
          'country',
          'vat_gst_no',
          'type'
        ]"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div
            class="flex justify-between items-center flex-col sm:flex-row gap-2"
          >
            <button
              pButton
              type="button"
              label="Add Vendor"
              icon="pi pi-plus"
              (click)="addRow()"
            ></button>
            <button
              pButton
              label="Clear"
              class="p-button-outlined"
              icon="pi pi-filter-slash"
              (click)="clear(dt)"
            ></button>
            <span class="ml-auto">
              <input
                pInputText
                type="text"
                (input)="onGlobalFilter($event, dt)"
                placeholder="Search keyword"
              />
            </span>
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th>
              <div class="flex justify-between items-center">
                Vendor No.
                <p-columnFilter
                  type="text"
                  field="vendor_no"
                  display="menu"
                  placeholder="Search by vendor no"
                ></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Alias
                <p-columnFilter
                  type="text"
                  field="name2"
                  display="menu"
                  placeholder="Search by alias"
                ></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                City
                <p-columnFilter
                  type="text"
                  field="city"
                  display="menu"
                  placeholder="Search by city"
                ></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Country
                <p-columnFilter
                  type="text"
                  field="country"
                  display="menu"
                  placeholder="Search by country"
                ></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                VAT/GST No.
                <p-columnFilter
                  type="text"
                  field="vat_gst_no"
                  display="menu"
                  placeholder="Search by VAT/GST No."
                ></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Type
                <p-columnFilter
                  type="text"
                  field="type"
                  display="menu"
                  placeholder="Search by type"
                ></p-columnFilter>
              </div>
            </th>
            <th style="min-width: 80px;">Action</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-vendor>
          <tr>
            <td>{{ vendor.vendor_no }}</td>
            <td>{{ vendor.name2 }}</td>
            <td>{{ vendor.city }}</td>
            <td>{{ vendor.country }}</td>
            <td>{{ vendor.vat_gst_no }}</td>

            <td>{{ vendor.type }}</td>
            <td>
              <div class="flex items-center space-x-[8px]">
                <button
                  pButton
                  icon="pi pi-pencil"
                  (click)="editRow(vendor)"
                  class="p-button-sm"
                ></button>
                <!-- <p-menu #menu [model]="getMenuItems(vendor)" [popup]="true" />
                <p-button
                  class="p-button-sm"
                  (click)="menu.toggle($event)"
                  icon="pi pi-ellipsis-v"
                /> -->
                <button
                  pButton
                  icon="pi pi-clone"
                  (click)="duplicateVendor(vendor)"
                  class="p-button-sm"
                ></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <!-- 📊 Total Vendors Count -->
        <ng-template pTemplate="paginatorleft" let-state>
          <div class="text-sm text-gray-600">
            Total Vendors: {{ state.totalRecords }}
          </div>
        </ng-template>
      </p-table>
    </div>
    <p-dialog
      header="{{
        isDuplicate ? 'Duplicate' : selectedVendor?.isNew ? 'Add' : 'Edit'
      }} Vendor"
      [(visible)]="isDialogVisible"
      [modal]="true"
      [style]="{ width: '1500px' }"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      (onHide)="hideDialog()"
    >
      <!-- Account Detail Form Dialog -->
      <p-dialog
        header="{{ selectedAccountDetail?.id ? 'Edit' : 'Add' }} Account Detail"
        [(visible)]="displayAccountDetailFormDialog"
        [modal]="true"
        [style]="{ width: '600px' }"
        [closable]="false"
        [draggable]="false"
        [resizable]="false"
      >
        <ng-template pTemplate="content">
          <div class="p-fluid form-grid">
            <div class="grid-container">
              <div class="grid-item">
                <label for="beneficiary"
                  >Beneficiary <span class="text-red-500">*</span></label
                >
                <input
                  #beneficiaryInput
                  id="beneficiary"
                  pInputText
                  [(ngModel)]="selectedAccountDetail.beneficiary"
                  (ngModelChange)="
                    onFieldChange('beneficiary', beneficiaryInput.value)
                  "
                  (blur)="onFieldBlur('beneficiary')"
                  required
                />
                <small
                  class="p-error text-red-500 text-xs ml-2"
                  *ngIf="getFieldError('beneficiary')"
                  >{{ getFieldError('beneficiary') }}</small
                >
              </div>
              <div class="grid-item">
                <label for="bank_name"
                  >Bank Name <span class="text-red-500">*</span></label
                >
                <input
                  #bankNameInput
                  id="bank_name"
                  pInputText
                  [(ngModel)]="selectedAccountDetail.bank_name"
                  (ngModelChange)="
                    onFieldChange('bank_name', bankNameInput.value)
                  "
                  (blur)="onFieldBlur('bank_name')"
                  required
                />
                <small
                  class="p-error text-red-500 text-xs ml-2"
                  *ngIf="getFieldError('bank_name')"
                  >{{ getFieldError('bank_name') }}</small
                >
              </div>
              <div class="grid-item">
                <label for="account_number"
                  >Account Number <span class="text-red-500">*</span></label
                >
                <input
                  #accountNumberInput
                  id="account_number"
                  pInputText
                  [(ngModel)]="selectedAccountDetail.account_number"
                  (ngModelChange)="
                    onFieldChange('account_number', accountNumberInput.value)
                  "
                  (blur)="onFieldBlur('account_number')"
                  required
                />
                <small
                  class="p-error text-red-500 text-xs ml-2"
                  *ngIf="getFieldError('account_number')"
                  >{{ getFieldError('account_number') }}</small
                >
              </div>
              <div class="grid-item">
                <label for="account_type">Account Type</label>
                <input
                  id="account_type"
                  pInputText
                  [(ngModel)]="selectedAccountDetail.account_type"
                />
              </div>
              <div class="grid-item">
                <label for="bank_branch_code">Bank Branch Code</label>
                <input
                  id="bank_branch_code"
                  pInputText
                  [(ngModel)]="selectedAccountDetail.bank_branch_code"
                />
              </div>
              <div class="grid-item">
                <label for="rtgs_neft_code">RTGS/NEFT Code</label>
                <input
                  id="rtgs_neft_code"
                  pInputText
                  [(ngModel)]="selectedAccountDetail.rtgs_neft_code"
                />
              </div>
              <div class="grid-item">
                <label for="swift_code">Swift Code</label>
                <input
                  id="swift_code"
                  pInputText
                  [(ngModel)]="selectedAccountDetail.swift_code"
                />
              </div>
              <div class="grid-item">
                <label for="is_primary">Primary Account</label>
                <p-dropdown
                  id="is_primary"
                  [options]="[
                    { label: 'Yes', value: true },
                    { label: 'No', value: false }
                  ]"
                  [(ngModel)]="selectedAccountDetail.is_primary"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Primary Account"
                ></p-dropdown>
              </div>
            </div>
            <div class="grid-item" style="grid-column: 1 / -1;">
              <label for="bank_address">Bank Address</label>
              <textarea
                id="bank_address"
                pInputTextarea
                [(ngModel)]="selectedAccountDetail.bank_address"
                rows="3"
              ></textarea>
            </div>
          </div>
        </ng-template>

        <ng-template pTemplate="footer">
          <div class="flex justify-content-end gap-2">
            <button
              pButton
              label="Cancel"
              icon="pi pi-times"
              class="p-button-outlined p-button-secondary"
              (click)="closeAccountDetailDialog()"
            ></button>
            <button
              pButton
              label="{{ selectedAccountDetail?.id ? 'Update' : 'Add' }}"
              icon="pi pi-check"
              (click)="saveAccountDetail()"
            ></button>
          </div>
        </ng-template>
      </p-dialog>
      <ng-template pTemplate="content">
        <div
          *ngIf="selectedVendor"
          class="p-fluid form-grid dialog-body-padding"
        >
          <!-- General -->
          <div class="section-header">General</div>
          <div class="grid-container">
            <div class="grid-item">
              <label for="vendor_no"
                >Vendor No. <span class="text-red-500">*</span></label
              >
              <input
                #vendorNoInput
                id="vendor_no"
                pInputText
                [(ngModel)]="selectedVendor.vendor_no"
                [disabled]="
                  !isManualSeries || !selectedVendor.isNew || isDuplicate
                "
                (ngModelChange)="
                  updateBillToVendorNameDefault();
                  onFieldChange('vendor_no', vendorNoInput.value)
                "
                (blur)="onFieldBlur('vendor_no')"
                [required]="isManualSeries"
              />
              <small
                class="p-error text-red-500 text-xs ml-2"
                *ngIf="getFieldError('vendor_no')"
                >{{ getFieldError('vendor_no') }}</small
              >
            </div>
            <div class="grid-item">
              <label for="type"
                >Vendor Type <span class="text-red-500">*</span></label
              >
              <ng-select
                *ngIf="isDuplicate; else vendorTypeRef"
                [multiple]="true"
                placeholder="Select Vendor Type(s)"
                [(ngModel)]="selectedVendorTypes"
                [closeOnSelect]="false"
                [items]="duplicationVendorTypeOptions"
                bindLabel="label"
                bindValue="value"
              >
              </ng-select>
              <!-- render this if isDuplicate is false -->
              <ng-template #vendorTypeRef>
                <div class="flex align-items-center gap-2">
                  <p-dropdown
                    id="type"
                    [options]="vendorTypeOptions"
                    [(ngModel)]="selectedVendor.type"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select Vendor Type"
                    (onChange)="onFieldChange('type', $event.value)"
                    (onBlur)="onFieldBlur('type')"
                    required
                    class="flex-1"
                  ></p-dropdown>
                  <button
                    pButton
                    type="button"
                    icon="pi pi-ellipsis-h"
                    class="p-button-sm"
                    (click)="openMaster('vendorType')"
                    [loading]="masterDialogLoading['vendorType']"
                    title="Open Vendor Type Master"
                  ></button>
                </div>
              </ng-template>
              <small
                class="p-error text-red-500 text-xs ml-2"
                *ngIf="getFieldError('type')"
                >{{ getFieldError('type') }}</small
              >
            </div>
            <div class="grid-item">
              <label for="name">Name <span class="text-red-500">*</span></label>
              <input
                #nameInput
                id="name"
                pInputText
                [(ngModel)]="selectedVendor.name"
                [disabled]="isDuplicate"
                (ngModelChange)="
                  updateBillToVendorNameDefault();
                  onFieldChange('name', nameInput.value)
                "
                (blur)="onFieldBlur('name')"
                required
              />
              <small
                class="p-error text-red-500 text-xs ml-2"
                *ngIf="getFieldError('name')"
                >{{ getFieldError('name') }}</small
              >
            </div>
            <div class="grid-item">
              <label>Alias</label>
              <input
                pInputText
                [(ngModel)]="selectedVendor.name2"
                [disabled]="isDuplicate"
              />
            </div>
            <div class="grid-item">
              <label>Blocked</label>
              <p-dropdown
                [options]="blockedOptions"
                [(ngModel)]="selectedVendor.blocked"
                optionLabel="label"
                optionValue="value"
                [disabled]="isDuplicate"
                placeholder="Select Blocked"
              ></p-dropdown>
            </div>
            <div class="grid-item">
              <label for="vat_gst_no"
                >VAT/GST No. <span class="text-red-500">*</span></label
              >
              <input
                #vatGstInput
                id="vat_gst_no"
                pInputText
                [(ngModel)]="selectedVendor.vat_gst_no"
                [disabled]="isDuplicate"
                (ngModelChange)="onFieldChange('vat_gst_no', vatGstInput.value)"
                (blur)="onFieldBlur('vat_gst_no')"
                required
              />
              <small
                class="p-error text-red-500 text-xs ml-2"
                *ngIf="getFieldError('vat_gst_no')"
                >{{ getFieldError('vat_gst_no') }}</small
              >
            </div>
          </div>
          <!-- Address -->
          <div class="section-header">Address</div>
          <div class="grid-container">
            <div class="grid-item">
              <label>Address</label>
              <input
                pInputText
                [(ngModel)]="selectedVendor.address"
                [disabled]="isDuplicate"
              />
            </div>

            <div class="grid-item">
              <label for="country"
                >Country <span class="text-red-500">*</span></label
              >
              <div class="flex gap-1">
                <p-dropdown
                  id="country"
                  [options]="countryOptions"
                  [(ngModel)]="selectedVendor.country"
                  optionLabel="label"
                  [disabled]="isDuplicate"
                  optionValue="value"
                  placeholder="Select Country"
                  [filter]="true"
                  (onChange)="
                    onCountryChange(); onFieldChange('country', $event.value)
                  "
                  (onBlur)="onFieldBlur('country')"
                  required
                  class="flex-1"
                ></p-dropdown>
                <button
                  *ngIf="!isDuplicate"
                  pButton
                  type="button"
                  icon="pi pi-ellipsis-h"
                  class="p-button-sm"
                  (click)="openMaster('state')"
                  style="height: 2.5rem;"
                ></button>
              </div>
              <small
                class="p-error text-red-500 text-xs ml-2"
                *ngIf="getFieldError('country')"
                >{{ getFieldError('country') }}</small
              >
            </div>
            <div class="grid-item">
              <label for="state"
                >State / Province <span class="text-red-500">*</span></label
              >
              <div class="flex gap-1">
                <p-dropdown
                  id="state"
                  [options]="stateOptions"
                  [(ngModel)]="selectedVendor.state"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select State"
                  [filter]="true"
                  (onChange)="
                    onStateChange(); onFieldChange('state', $event.value)
                  "
                  [disabled]="isDuplicate"
                  (onBlur)="onFieldBlur('state')"
                  required
                  class="flex-1"
                ></p-dropdown>
                <button
                  *ngIf="!isDuplicate"
                  pButton
                  type="button"
                  icon="pi pi-ellipsis-h"
                  class="p-button-sm"
                  (click)="openMaster('state')"
                  style="height: 2.5rem;"
                ></button>
              </div>
              <small
                class="p-error text-red-500 text-xs ml-2"
                *ngIf="getFieldError('state')"
                >{{ getFieldError('state') }}</small
              >
            </div>
            <div class="grid-item">
              <label for="city"
                >City / Town <span class="text-red-500">*</span></label
              >
              <div class="flex gap-1">
                <p-dropdown
                  id="city"
                  [options]="cityOptions"
                  [(ngModel)]="selectedVendor.city"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select City"
                  [disabled]="isDuplicate"
                  [filter]="true"
                  (onChange)="onFieldChange('city', $event.value)"
                  (onBlur)="onFieldBlur('city')"
                  required
                  class="flex-1"
                ></p-dropdown>
                <button
                  *ngIf="!isDuplicate"
                  pButton
                  type="button"
                  icon="pi pi-ellipsis-h"
                  class="p-button-sm"
                  (click)="openMaster('state')"
                  style="height: 2.5rem;"
                ></button>
              </div>
              <small
                class="p-error text-red-500 text-xs ml-2"
                *ngIf="getFieldError('city')"
                >{{ getFieldError('city') }}</small
              >
            </div>
            <div class="grid-item">
              <label>Postal Code / Zip Code</label>
              <input
                pInputText
                [(ngModel)]="selectedVendor.postal_code"
                [disabled]="isDuplicate"
              />
            </div>
            <div class="grid-item">
              <label>Website</label>
              <input
                pInputText
                [(ngModel)]="selectedVendor.website"
                [disabled]="isDuplicate"
              />
            </div>
          </div>

          <!-- Invoicing -->
          <div class="section-header">Invoicing</div>
          <div class="grid-container">
            <div class="grid-item">
              <label>Bill-to Vendor Name (Auto):</label>
              <p-dropdown
                [options]="billToVendorOptions"
                [(ngModel)]="selectedVendor.bill_to_vendor_name"
                optionLabel="label"
                optionValue="value"
                [disabled]="isDuplicate"
                placeholder="Select Bill-to Vendor"
                [filter]="true"
                [editable]="true"
              >
              </p-dropdown>
            </div>

            <div class="grid-item">
              <label>Place of Supply</label>
              <div class="flex gap-1">
                <p-dropdown
                  [options]="placeOfSupplyOptions"
                  [(ngModel)]="selectedVendor.place_of_supply"
                  optionLabel="label"
                  optionValue="value"
                  [disabled]="isDuplicate"
                  placeholder="Select Place of Supply"
                  class="flex-1"
                ></p-dropdown>
                <button
                  *ngIf="!isDuplicate"
                  pButton
                  type="button"
                  icon="pi pi-ellipsis-h"
                  class="p-button-sm"
                  (click)="openMaster('state')"
                  style="height: 2.5rem;"
                ></button>
              </div>
            </div>
            <div class="grid-item">
              <label>PAN No.</label>
              <input
                pInputText
                [(ngModel)]="selectedVendor.pan_no"
                [disabled]="isDuplicate"
              />
            </div>
            <div class="grid-item">
              <label>TAN No.</label>
              <input
                pInputText
                [(ngModel)]="selectedVendor.tan_no"
                [disabled]="isDuplicate"
              />
            </div>
          </div>
          <!-- Contact -->
          <div class="section-header">Contact</div>
          <p-table
            [value]="selectedVendor.contacts"
            [showGridlines]="true"
            [responsiveLayout]="'scroll'"
          >
            <ng-template pTemplate="header">
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Mobile</th>
                <th>Landline</th>
                <th>Email</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-contact let-rowIndex="rowIndex">
              <tr>
                <td><input pInputText [(ngModel)]="contact.name" /></td>
                <td><input pInputText [(ngModel)]="contact.department" /></td>
                <td><input pInputText [(ngModel)]="contact.mobile" /></td>
                <td><input pInputText [(ngModel)]="contact.landline" /></td>
                <td><input pInputText [(ngModel)]="contact.email" /></td>
                <td><input pInputText [(ngModel)]="contact.remarks" /></td>
                <td>
                  <button
                    pButton
                    icon="pi pi-trash"
                    class="p-button-danger p-button-sm"
                    (click)="removeContact(rowIndex)"
                  ></button>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="footer">
              <tr *ngIf="!isDuplicate">
                <td colspan="7">
                  <button
                    pButton
                    label="Add Contact"
                    icon="pi pi-plus"
                    (click)="addContact()"
                  ></button>
                </td>
              </tr>
            </ng-template>
          </p-table>
          <!-- Document Upload -->
          <div class="section-header">Document Upload</div>
          <div class="document-upload-section">
            <p-table
              [value]="vendorDocuments"
              [showGridlines]="true"
              [responsiveLayout]="'scroll'"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>DOC. TYPE</th>
                  <th>DOCUMENT NUMBER</th>
                  <th>VALID FROM</th>
                  <th>VALID TILL</th>
                  <th>FILE</th>
                  <th>Action</th>
                </tr>
              </ng-template>
              <ng-template
                pTemplate="body"
                let-document
                let-rowIndex="rowIndex"
              >
                <tr>
                  <td>
                    <div class="flex gap-1">
                      <p-dropdown
                        [options]="documentTypeOptions"
                        [(ngModel)]="document.doc_type"
                        optionLabel="label"
                        [disabled]="isDuplicate"
                        optionValue="value"
                        placeholder="Select Document Type"
                        class="flex-1"
                      ></p-dropdown>
                      <button
                        *ngIf="!isDuplicate"
                        pButton
                        type="button"
                        icon="pi pi-ellipsis-h"
                        class="p-button-sm"
                        (click)="openMaster('documentType')"
                        style="height: 2.5rem;"
                      ></button>
                    </div>
                  </td>
                  <td>
                    <input
                      pInputText
                      [(ngModel)]="document.document_number"
                      placeholder="Document Number"
                    />
                  </td>
                  <td>
                    <input
                      pInputText
                      type="date"
                      [(ngModel)]="document.valid_from"
                    />
                  </td>
                  <td>
                    <input
                      pInputText
                      type="date"
                      [(ngModel)]="document.valid_till"
                    />
                  </td>
                  <td>
                    <input
                      type="file"
                      (change)="onFileSelected($event, rowIndex)"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                      class="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                    />
                    <small *ngIf="document.file_name" class="text-gray-600">{{
                      document.file_name
                    }}</small>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <button
                        pButton
                        icon="pi pi-eye"
                        class="p-button-sm p-button-outlined"
                        (click)="viewDocument(document)"
                        *ngIf="document.id"
                        pTooltip="View Document"
                      ></button>
                      <button
                        pButton
                        icon="pi pi-download"
                        class="p-button-sm p-button-outlined"
                        (click)="downloadDocument(document)"
                        *ngIf="document.id || !isDuplicate"
                        pTooltip="Download Document"
                      ></button>
                      <button
                        pButton
                        icon="pi pi-trash"
                        class="p-button-danger p-button-sm"
                        (click)="removeDocument(rowIndex)"
                        pTooltip="Delete Document"
                      ></button>
                    </div>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="footer">
                <tr *ngIf="!isDuplicate">
                  <td colspan="6">
                    <button
                      [disabled]="isDuplicate"
                      pButton
                      label="Add Document"
                      icon="pi pi-plus"
                      (click)="addDocument()"
                    ></button>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </div>
        <!-- Account Details -->
        <div class="section-header">Account Details</div>
        <div class="account-details-section">
          <p-table
            [value]="vendorAccountDetails"
            [showGridlines]="true"
            [responsiveLayout]="'scroll'"
          >
            <ng-template pTemplate="header">
              <tr>
                <th>BENEFICIARY</th>
                <th>BANK NAME</th>
                <th>ACCOUNT NUMBER</th>
                <th>ACCOUNT TYPE</th>
                <th>BANK BRANCH CODE</th>
                <th>RTGS/NEFT CODE</th>
                <th>SWIFT CODE</th>
                <th>Action</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-account let-rowIndex="rowIndex">
              <tr
                [class.bg-yellow-50]="account.is_primary"
                [class.border-l-2]="account.is_primary"
                [class.border-yellow-400]="account.is_primary"
                [class.font-semibold]="account.is_primary"
              >
                <td>
                  <div class="flex items-center">
                    <i
                      class="pi pi-star text-yellow-500 mr-2"
                      *ngIf="account.is_primary"
                    ></i>
                    {{ account.beneficiary }}
                  </div>
                </td>
                <td>{{ account.bank_name }}</td>
                <td>{{ account.account_number }}</td>
                <td>{{ account.account_type }}</td>
                <td>{{ account.bank_branch_code }}</td>
                <td>{{ account.rtgs_neft_code }}</td>
                <td>{{ account.swift_code }}</td>
                <td>
                  <button
                    pButton
                    icon="pi pi-pencil"
                    class="p-button-text p-button-sm mr-1"
                    (click)="
                      openAccountDetailFormDialog(
                        'vendor',
                        selectedVendor?.vendor_no || '',
                        account
                      )
                    "
                  ></button>
                  <button
                    pButton
                    icon="pi pi-trash"
                    class="p-button-text p-button-sm p-button-danger"
                    (click)="deleteAccountDetail(account)"
                  ></button>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="footer">
              <tr *ngIf="!isDuplicate">
                <td colspan="8">
                  <button
                    pButton
                    label="Add Account Detail"
                    icon="pi pi-plus"
                    (click)="
                      openAccountDetailFormDialog(
                        'vendor',
                        selectedVendor?.vendor_no || ''
                      )
                    "
                  ></button>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2 px-3 pb-2">
          <button
            pButton
            label="Cancel"
            icon="pi pi-times"
            class="p-button-outlined p-button-secondary"
            (click)="hideDialog()"
          ></button>
          <button
            pButton
            label="{{
              isDuplicate
                ? 'Duplicate'
                : selectedVendor?.isNew
                ? 'Add'
                : 'Update'
            }}"
            icon="pi pi-check"
            (click)="saveRow()"
            [disabled]="!isFormValid()"
          ></button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Document Viewer Dialog -->
    <p-dialog
      [(visible)]="isDocumentViewerVisible"
      [modal]="true"
      [style]="{ width: '90vw', height: '90vh' }"
      [maximizable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="hideDocumentViewer()"
    >
      <ng-template pTemplate="header">
        <div class="flex align-items-center justify-content-between w-full">
          <h5 class="m-0">
            <i class="pi pi-file mr-2"></i>
            {{ selectedDocument?.file_name }}
          </h5>
          <div class="flex gap-2">
            <button
              pButton
              icon="pi pi-download"
              class="p-button-sm p-button-outlined"
              (click)="downloadDocument(selectedDocument!)"
              pTooltip="Download Document"
            ></button>
            <button
              pButton
              icon="pi pi-times"
              class="p-button-sm p-button-outlined"
              (click)="hideDocumentViewer()"
              pTooltip="Close"
            ></button>
          </div>
        </div>
      </ng-template>

      <ng-template pTemplate="content">
        <div
          class="document-viewer-container"
          style="height: calc(90vh - 120px); overflow: auto;"
        >
          <!-- Image files -->
          <img
            *ngIf="
              selectedDocument?.mime_type?.startsWith('image/') &&
              documentViewerUrl
            "
            [src]="documentViewerUrl"
            [alt]="selectedDocument?.file_name"
            style="max-width: 100%; max-height: 100%; object-fit: contain;"
          />

          <!-- PDF files -->
          <div
            *ngIf="selectedDocument?.mime_type === 'application/pdf'"
            style="height: 100%; display: flex; flex-direction: column;"
          >
            <!-- PDF Loading State -->
            <div
              *ngIf="!pdfLoaded"
              class="flex align-items-center justify-content-center"
              style="height: 100%; flex-direction: column; gap: 1rem;"
            >
              <i
                class="pi pi-spin pi-spinner"
                style="font-size: 2rem; color: #6c757d;"
              ></i>
              <p class="text-muted">Loading PDF...</p>
              <button
                pButton
                label="Open PDF in New Tab"
                icon="pi pi-external-link"
                (click)="openDocumentInNewTab()"
                class="p-button-outlined"
              ></button>
            </div>

            <!-- PDF Viewer -->
            <iframe
              *ngIf="
                selectedDocument?.mime_type === 'application/pdf' &&
                safeDocumentViewerUrl &&
                pdfLoaded
              "
              [src]="safeDocumentViewerUrl"
              style="width: 100%; height: 100%; border: none;"
              (load)="onPdfLoad()"
              (error)="onPdfError()"
            >
            </iframe>

            <!-- PDF Error State -->
            <div
              *ngIf="pdfError"
              class="flex align-items-center justify-content-center"
              style="height: 100%; flex-direction: column; gap: 1rem;"
            >
              <i
                class="pi pi-exclamation-triangle"
                style="font-size: 4rem; color: #dc3545;"
              ></i>
              <h4>PDF Loading Failed</h4>
              <p class="text-muted">Unable to display PDF in browser.</p>
              <div class="flex gap-2">
                <button
                  pButton
                  label="Download PDF"
                  icon="pi pi-download"
                  (click)="downloadDocument(selectedDocument!)"
                  class="p-button-primary"
                ></button>
                <button
                  pButton
                  label="Open in New Tab"
                  icon="pi pi-external-link"
                  (click)="openDocumentInNewTab()"
                  class="p-button-outlined"
                ></button>
              </div>
            </div>
          </div>

          <!-- Text files -->
          <div
            *ngIf="
              selectedDocument?.mime_type === 'text/plain' && documentViewerUrl
            "
            style="padding: 1rem; background: white; height: 100%; overflow: auto;"
          >
            <pre
              style="margin: 0; white-space: pre-wrap; font-family: monospace;"
              >{{ documentViewerUrl }}</pre
            >
          </div>

          <!-- Office Documents and other files - Enhanced viewer -->
          <div
            *ngIf="
              !selectedDocument?.mime_type?.startsWith('image/') &&
              selectedDocument?.mime_type !== 'application/pdf' &&
              selectedDocument?.mime_type !== 'text/plain' &&
              documentViewerUrl
            "
            style="height: 100%; display: flex; flex-direction: column;"
          >
            <!-- Try Microsoft Office Online Viewer first -->
            <iframe
              *ngIf="getSafeOfficeViewerUrl()"
              [src]="getSafeOfficeViewerUrl()"
              style="width: 100%; height: 100%; border: none;"
            >
            </iframe>

            <!-- Fallback for unsupported files -->
            <div
              *ngIf="!getSafeOfficeViewerUrl()"
              class="flex align-items-center justify-content-center"
              style="height: 100%; flex-direction: column; gap: 1rem;"
            >
              <i
                class="pi pi-file"
                style="font-size: 4rem; color: #6c757d;"
              ></i>
              <h4>Document Preview</h4>
              <p class="text-muted">
                This file type requires download for viewing.
              </p>
              <button
                pButton
                label="Download File"
                icon="pi pi-download"
                (click)="downloadDocument(selectedDocument!)"
                class="p-button-primary"
              ></button>
            </div>
          </div>

          <!-- Loading state -->
          <div
            *ngIf="!documentViewerUrl"
            class="flex align-items-center justify-content-center"
            style="height: 100%;"
          >
            <div class="text-center">
              <i
                class="pi pi-spin pi-spinner"
                style="font-size: 2rem; color: #6c757d;"
              ></i>
              <p class="mt-2 text-muted">Loading document...</p>
            </div>
          </div>
        </div>
      </ng-template>
    </p-dialog>
    <!-- Master Type Dialog -->
    <p-dialog
      header="Vendor Type Master"
      [(visible)]="masterDialogVisible['vendorType']"
      [modal]="true"
      [style]="{
        width: 'auto',
        minWidth: '60vw',
        maxWidth: '95vw',
        height: 'auto',
        maxHeight: '90vh'
      }"
      [contentStyle]="{ overflow: 'visible' }"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterDialog('vendorType')"
    >
      <master-type [filterByKey]="'VENDOR'"></master-type>
    </p-dialog>

    <!-- Master Location Dialog -->
    <p-dialog
      header="Location Master"
      [(visible)]="masterDialogVisible['state']"
      [modal]="true"
      [style]="{
        width: 'auto',
        minWidth: '60vw',
        maxWidth: '95vw',
        height: 'auto',
        maxHeight: '90vh'
      }"
      [contentStyle]="{ overflow: 'visible' }"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterDialog('state')"
    >
      <master-location></master-location>
    </p-dialog>

    <!-- Document Type Master Dialog -->
    <p-dialog
      header="Document Type Master"
      [(visible)]="masterDialogVisible['documentType']"
      [modal]="true"
      [style]="{
        width: 'auto',
        minWidth: '60vw',
        maxWidth: '95vw',
        height: 'auto',
        maxHeight: '90vh'
      }"
      [contentStyle]="{ overflow: 'visible' }"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterDialog('documentType')"
    >
      <master-type [filterByKey]="'VEN_DOC_TYPE'"></master-type>
    </p-dialog>
  `,
  styles: [
    `
      .grid-container {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
      }
      .grid-item {
        display: flex;
        flex-direction: column;
      }
      .section-header {
        font-weight: bold;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
        font-size: 1.1rem;
      }
      label {
        margin-bottom: 0.5rem;
        font-weight: 500;
      }
      .document-upload-section {
        margin-top: 1rem;
      }
      .document-header {
        background-color: #f8f9fa;
        padding: 0.75rem;
        border-radius: 0.375rem;
        margin-bottom: 1rem;
      }
      .document-header h4 {
        margin: 0;
        font-weight: bold;
        color: #374151;
      }
      .flex {
        display: flex;
      }
      .gap-1 {
        gap: 0.25rem;
      }
      .text-gray-600 {
        color: #6b7280;
      }
      .text-xs {
        font-size: 0.75rem;
      }
      .ml-2 {
        margin-left: 0.5rem;
      }
      ::ng-deep .custom-popup-menu .p-menu {
        min-width: 150px;
        max-width: 200px;
        width: fit-content;
        overflow: auto;
        z-index: 1000 !important; /* ensures it stays above modals or tables */
        background-color: white;
        border-radius: 4px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      }
    `,
  ],
})
export class VendorComponent implements OnInit, OnDestroy {
  vendors: Vendor[] = [];
  isDuplicate: boolean = false;
  vendorTypeOptions: any[] = [];
  duplicationVendorTypeOptions: any[] = [];
  selectedVendorType: string = '';
  selectedVendorTypes: string[] = [];
  selectedVendorRecords: Vendor[] = [];
  blockedOptions = [
    { label: 'Recieve', value: 'Recieve' },
    { label: 'All', value: 'All' },
  ];
  countryOptions: any[] = [];
  stateOptions: any[] = [];
  cityOptions: any[] = [];
  billToVendorOptions: any[] = [];
  placeOfSupplyOptions: any[] = [];
  mappedVendorSeriesCode: string | null = null;
  isManualSeries: boolean = false;
  isDialogVisible = false;
  selectedVendor: (Vendor & { isNew?: boolean }) | null = null;
  allLocations: MasterLocation[] = [];
  fieldErrors: { [key: string]: string } = {};
  touchedFields: { [key: string]: boolean } = {};
  vendorDocuments: (EntityDocument & { file?: File })[] = [];
  documentUploadPath: string = '/uploads/documents/vendor';
  documentTypeOptions: any[] = [];
  departmentOptions: any[] = [];

  // Account Details properties
  vendorAccountDetails: AccountDetail[] = [];
  displayAccountDetailFormDialog = false;
  selectedAccountDetail: AccountDetail = {} as AccountDetail;
  accountDetailFormError = '';
  accountDetailFields = [
    { key: 'beneficiary', label: 'Beneficiary', required: true },
    { key: 'bank_name', label: 'Bank Name', required: true },
    { key: 'account_number', label: 'Account Number', required: true },
    { key: 'account_type', label: 'Account Type', required: false },
    { key: 'bank_branch_code', label: 'Bank Branch Code', required: false },
    { key: 'rtgs_neft_code', label: 'RTGS/NEFT Code', required: false },
    { key: 'swift_code', label: 'Swift Code', required: false },
    { key: 'bank_address', label: 'Bank Address', required: false },
  ];

  // Document viewer dialog
  isDocumentViewerVisible = false;
  selectedDocument: EntityDocument | null = null;
  documentViewerUrl: string = '';
  safeDocumentViewerUrl: SafeResourceUrl | null = null;
  pdfLoaded: boolean = false;
  pdfError: boolean = false;
  private contextSubscription: Subscription | null = null;
  // Master dialog properties
  masterDialogVisible: { [key: string]: boolean } = {
    vendorType: false,
    state: false,
    documentType: false,
  };
  masterDialogLoading: { [key: string]: boolean } = {
    vendorType: false,
    state: false,
    documentType: false,
  };

  // Account Details Methods
  loadAccountDetails(entityType: string, entityCode: string) {
    this.accountDetailsService.getByEntity(entityType, entityCode).subscribe({
      next: (details) => {
        this.vendorAccountDetails = details;
      },
      error: (error) => {
        console.error('Error loading account details:', error);
        this.vendorAccountDetails = [];
      },
    });
  }

  openAccountDetailFormDialog(
    entityType: string,
    entityCode: string,
    accountDetail?: AccountDetail
  ) {
    this.selectedAccountDetail = accountDetail
      ? { ...accountDetail }
      : {
          id: undefined,
          entity_type: entityType,
          entity_code: entityCode,
          beneficiary: '',
          bank_name: '',
          account_number: '',
          account_type: '',
          bank_branch_code: '',
          rtgs_neft_code: '',
          swift_code: '',
          bank_address: '',
          is_primary: false,
        };
    this.displayAccountDetailFormDialog = true;
  }

  closeAccountDetailDialog() {
    this.displayAccountDetailFormDialog = false;
    this.selectedAccountDetail = {} as AccountDetail;
    this.accountDetailFormError = '';
  }

  saveAccountDetail() {
    if (!this.selectedAccountDetail) return;

    // Validate required fields
    if (
      !this.selectedAccountDetail.beneficiary ||
      !this.selectedAccountDetail.bank_name ||
      !this.selectedAccountDetail.account_number
    ) {
      this.accountDetailFormError = 'Please fill in all required fields';
      return;
    }

    const operation = this.selectedAccountDetail.id
      ? this.accountDetailsService.update(
          this.selectedAccountDetail.id,
          this.selectedAccountDetail
        )
      : this.accountDetailsService.create(this.selectedAccountDetail);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.selectedAccountDetail!.id
            ? 'Account detail updated successfully'
            : 'Account detail created successfully',
        });
        this.closeAccountDetailDialog();
        this.loadAccountDetails(
          this.selectedAccountDetail!.entity_type,
          this.selectedAccountDetail!.entity_code
        );
      },
      error: (error) => {
        console.error('Error saving account detail:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save account detail',
        });
      },
    });
  }

  deleteAccountDetail(accountDetail: AccountDetail) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this account detail?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (accountDetail.id) {
          this.accountDetailsService.delete(accountDetail.id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Account detail deleted successfully',
              });
              this.loadAccountDetails(
                accountDetail.entity_type,
                accountDetail.entity_code
              );
            },
            error: (error) => {
              console.error('Error deleting account detail:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete account detail',
              });
            },
          });
        }
      },
    });
  }

  onPrimaryChange(accountDetail: AccountDetail) {
    if (!accountDetail.id || !this.selectedVendor) return;

    // Create a complete AccountDetail object for the update
    const updateData: AccountDetail = {
      ...accountDetail,
      is_primary: accountDetail.is_primary,
    };

    this.accountDetailsService.update(accountDetail.id, updateData).subscribe({
      next: () => {
        this.loadAccountDetails('vendor', this.selectedVendor!.vendor_no);
      },
      error: (error: any) => {
        console.error('Error updating primary status:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update primary status',
        });
        // Revert the change
        accountDetail.is_primary = !accountDetail.is_primary;
      },
    });
  }

  constructor(
    private vendorService: VendorService,
    private mappingService: MappingService,
    private numberSeriesService: NumberSeriesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private masterLocationService: MasterLocationService,
    private masterTypeService: MasterTypeService,
    private entityDocumentService: EntityDocumentService,
    private departmentService: DepartmentService,
    private configService: ConfigService,
    private contextService: ContextService,
    private sanitizer: DomSanitizer,
    private accountDetailsService: AccountDetailsService
  ) {}

  ngOnInit() {
    this.loadOptions();
    this.loadMappedVendorSeriesCode();
    this.loadDocumentUploadPath();
    this.loadDocumentTypeOptions();

    // Subscribe to context changes and reload data when context changes
    this.contextSubscription = this.contextService.context$.subscribe(() => {
      console.log('Context changed in VendorComponent, reloading data...');
      this.refreshList();
      this.loadMappedVendorSeriesCode();
      this.loadDocumentUploadPath();
    });
  }

  ngOnDestroy() {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }
  }

  loadOptions() {
    // Load vendor type options from master type where key === 'Vendor' and status === 'Active'
    this.masterTypeService.getAll().subscribe({
      next: (types: any[]) => {
        this.vendorTypeOptions = (types || [])
          .filter((t) => t.key === 'VENDOR' && t.status === 'Active')
          .map((t) => ({ label: t.value, value: t.value }));
        console.log('Vendor type options loaded:', this.vendorTypeOptions);
      },
      error: (error) => {
        console.error('Error loading vendor types:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load vendor types',
        });
      },
    });

    // Load existing vendors for bill-to vendor dropdown
    this.refreshList();

    // Load locations for country, state, city dropdowns
    this.loadLocations();
  }

  onGlobalFilter(event: Event, table: any) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  refreshList() {
    this.vendorService.getAll().subscribe({
      next: (data) => {
        this.vendors = data;
        this.billToVendorOptions = data.map((c) => ({
          label: `${c.vendor_no} - ${c.name}`,
          value: `${c.vendor_no} - ${c.name}`,
        }));
        console.log('Vendors loaded:', this.vendors.length);
      },
      error: (error) => {
        console.error('Error loading vendors:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load vendors',
        });
      },
    });
  }

  loadMappedVendorSeriesCode(): Promise<void> {
    return new Promise((resolve) => {
      const context = this.contextService.getContext();
      console.log('Loading vendor series code for context:', context);

      // Try context-based mapping first
      this.mappingService
        .findMappingByContext(
          'vendorCode',
          context.companyCode || '',
          context.branchCode || '',
          context.departmentCode || '',
          context.serviceType || ''
        )
        .subscribe({
          next: (contextMapping) => {
            console.log('Context mapping result:', contextMapping);
            if (contextMapping && contextMapping.mapping) {
              this.mappedVendorSeriesCode = contextMapping.mapping;
              this.checkSeriesManualFlag().then(() => {
                console.log(
                  'Vendor series code mapped (context-based):',
                  this.mappedVendorSeriesCode,
                  'Manual:',
                  this.isManualSeries
                );
                resolve();
              });
            } else {
              console.log(
                'No context mapping found, falling back to generic mapping'
              );
              // Fallback to generic mapping
              this.mappingService.getMapping().subscribe({
                next: (mapping) => {
                  console.log('Generic mapping result:', mapping);
                  this.mappedVendorSeriesCode = mapping.vendorCode;
                  if (this.mappedVendorSeriesCode) {
                    this.checkSeriesManualFlag().then(() => {
                      console.log(
                        'Vendor series code mapped (generic):',
                        this.mappedVendorSeriesCode,
                        'Manual:',
                        this.isManualSeries
                      );
                      resolve();
                    });
                  } else {
                    this.isManualSeries = false;
                    console.log('No vendor series code mapped');
                    resolve();
                  }
                },
                error: (error) => {
                  console.error('Error loading generic mapping:', error);
                  this.isManualSeries = false;
                  resolve();
                },
              });
            }
          },
          error: (error) => {
            console.error(
              'Error loading context-based mapping, falling back to generic:',
              error
            );
            // Fallback to generic mapping
            this.mappingService.getMapping().subscribe({
              next: (mapping) => {
                console.log('Generic mapping result (fallback):', mapping);
                this.mappedVendorSeriesCode = mapping.vendorCode;
                if (this.mappedVendorSeriesCode) {
                  this.checkSeriesManualFlag().then(() => {
                    console.log(
                      'Vendor series code mapped (generic fallback):',
                      this.mappedVendorSeriesCode,
                      'Manual:',
                      this.isManualSeries
                    );
                    resolve();
                  });
                } else {
                  this.isManualSeries = false;
                  console.log('No vendor series code mapped');
                  resolve();
                }
              },
              error: (error) => {
                console.error('Error loading generic mapping:', error);
                this.isManualSeries = false;
                resolve();
              },
            });
          },
        });
    });
  }

  private checkSeriesManualFlag(): Promise<void> {
    return new Promise((resolve) => {
      if (this.mappedVendorSeriesCode) {
        console.log(
          'Checking series manual flag for code:',
          this.mappedVendorSeriesCode
        );
        this.numberSeriesService.getAll().subscribe({
          next: (seriesList) => {
            console.log('Number series list:', seriesList);
            const found = seriesList.find(
              (s: any) => s.code === this.mappedVendorSeriesCode
            );
            console.log('Found series:', found);
            this.isManualSeries = !!(found && found.is_manual);
            console.log('Is manual series:', this.isManualSeries);
            resolve();
          },
          error: (error) => {
            console.error('Error loading number series:', error);
            this.isManualSeries = false;
            resolve();
          },
        });
      } else {
        this.isManualSeries = false;
        console.log('No mapped vendor series code, setting manual to false');
        resolve();
      }
    });
  }

  addRow() {
    // Get the Validation settings
    const config = this.configService.getConfig();
    const vendorFilter = config?.validation?.vendorFilter || '';

    console.log(
      'Vendor filter:',
      vendorFilter,
      'is Duplicate,',
      this.isDuplicate
    );

    // Check if we need to validate context
    if (vendorFilter) {
      // Get the current context
      const context = this.contextService.getContext();

      console.log('Current context:', context);

      // Check if the required context is set based on the filter
      let contextValid = true;
      let missingContexts = [];

      if (vendorFilter.includes('C') && !context.companyCode) {
        contextValid = false;
        missingContexts.push('Company');
      }

      if (vendorFilter.includes('B') && !context.branchCode) {
        contextValid = false;
        missingContexts.push('Branch');
      }

      if (vendorFilter.includes('D') && !context.departmentCode) {
        contextValid = false;
        missingContexts.push('Department');
      }

      if (vendorFilter.includes('ST') && !context.serviceType) {
        contextValid = false;
        missingContexts.push('Service Type');
      }

      console.log('Context valid:', contextValid);
      console.log('Missing contexts:', missingContexts);

      // If context is not valid, show an error message and trigger the context selector
      if (!contextValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Context Required',
          detail: `Please select ${missingContexts.join(
            ', '
          )} in the context selector.`,
        });

        // Show the context selector dialog
        this.contextService.showContextSelector();
        return;
      }
    }

    console.log('Validation passed, proceeding with adding vendor');

    this.selectedVendor = {
      vendor_no: '',
      type: '',
      name: '',
      name2: '',
      blocked: false,
      address: '',
      address1: '',
      country: '',
      state: '',
      city: '',
      postal_code: '',
      website: '',
      bill_to_vendor_name: '',
      vat_gst_no: '',
      place_of_supply: '',
      pan_no: '',
      tan_no: '',
      contacts: [],
      isNew: true,
    };

    // Load the mapped vendor series code to determine if manual series is enabled
    this.loadMappedVendorSeriesCode().then(() => {
      // Show the dialog after mapping is complete
      this.isDialogVisible = true;
      this.updateBillToVendorNameDefault();
    });
  }

  duplicateVendor(vendor: Vendor) {
    this.isDuplicate = true;
    this.selectedVendor = { ...vendor, isNew: false };
    // Always set Bill-to Vendor Name to the real value on edit
    if (this.selectedVendor.vendor_no && this.selectedVendor.name) {
      this.selectedVendor.bill_to_vendor_name = `${this.selectedVendor.vendor_no} - ${this.selectedVendor.name}`;
    }

    console.log(
      'Selected Vendor,',
      this.selectedVendor,
      'selectedVendorType,',
      this.selectedVendorType
    );

    this.selectedVendorRecords = this.vendors.filter(
      //since vendor no are always unique will use vendor name
      // (v) => v.vendor_no === this.selectedVendor?.vendor_no
      (v) => v.name === this.selectedVendor?.name 
    );
    console.log(
      'selected vendor records matching the vendor,',
      this.selectedVendor.vendor_no,
      'are:',
      this.selectedVendorRecords
    );
    this.selectedVendorType = this.selectedVendor.type!;
    this.duplicationVendorTypeOptions = this.vendorTypeOptions.map((option) => {
      const isAsigned = this.selectedVendorRecords.some(
        (selectedVendorRecord) => selectedVendorRecord.type === option.value 
      );

      return isAsigned ? { ...option, disabled: true } : option;
    });

    console.log(
      'Duplication vendor type options,',
      this.duplicationVendorTypeOptions
    );

    this.isDialogVisible = true;
  }

  // get Menu items
  getMenuItems(vendor: Vendor): MenuItem[] {
    return [
      {
        label: 'Duplicate',
        command: () => this.duplicateVendor(vendor),
      },
    ];
  }

  updateBillToVendorNameDefault() {
    if (this.selectedVendor) {
      let no = this.selectedVendor.vendor_no;
      if (!this.isManualSeries) {
        no = '(auto)';
      }
      const liveValue = `${no || ''} - ${
        this.selectedVendor.name || ''
      }`.trim();
      if (
        !this.selectedVendor.bill_to_vendor_name ||
        (Array.isArray(this.billToVendorOptions) &&
          this.billToVendorOptions.every(
            (opt) => opt.value !== this.selectedVendor!.bill_to_vendor_name
          ))
      ) {
        this.selectedVendor.bill_to_vendor_name = liveValue;
      }
    }
  }

  editRow(vendor: Vendor) {
    this.selectedVendor = { ...vendor, isNew: false };
    // Always set Bill-to Vendor Name to the real value on edit
    if (this.selectedVendor.vendor_no && this.selectedVendor.name) {
      this.selectedVendor.bill_to_vendor_name = `${this.selectedVendor.vendor_no} - ${this.selectedVendor.name}`;
    }
    this.isDialogVisible = true;

    // Populate state and city options based on existing values
    if (this.selectedVendor.country) {
      this.populateStateOptions(this.selectedVendor.country);
      if (this.selectedVendor.state) {
        this.populateCityOptions(
          this.selectedVendor.country,
          this.selectedVendor.state
        );
      }
    }

    // Load vendor documents and account details
    if (vendor.id) {
      this.loadVendorDocuments(vendor.vendor_no);
      this.loadAccountDetails('vendor', vendor.vendor_no);
    }
  }

  // Add these helper methods
  populateStateOptions(country: string) {
    if (!country) {
      this.stateOptions = [];
      return;
    }

    const matchingLocations = this.allLocations.filter(
      (l) => l.country && l.country.toLowerCase() === country.toLowerCase()
    );

    const states = matchingLocations.map((l) => l.state).filter(Boolean);

    this.stateOptions = uniqueCaseInsensitive(states).map((s) => ({
      label: toTitleCase(s),
      value: s,
    }));
  }

  populateCityOptions(country: string, state: string) {
    if (!country || !state) {
      this.cityOptions = [];
      return;
    }

    const cities = this.allLocations
      .filter(
        (l) =>
          l.country &&
          l.country.toLowerCase() === country.toLowerCase() &&
          l.state &&
          l.state.toLowerCase() === state.toLowerCase()
      )
      .map((l) => l.city)
      .filter(Boolean);

    this.cityOptions = uniqueCaseInsensitive(cities).map((c) => ({
      label: toTitleCase(c),
      value: c,
    }));
  }

  // displays show confirmation dialog if the duplicate vendor type is selected
  showGstConfirmationforVendorDuplication(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message:
          'Do you want to copy GST details from the original vendor type to the duplicated vendor type(s)?',
        header: 'Copy GST Details',
        icon: 'pi pi-info-circle',
        rejectButtonProps: {
          label: 'No',
          severity: 'secondary',
          outlined: true,
        },
        acceptButtonProps: { label: 'Yes', severity: 'sucess' },
        reject: () => {
          // this.selectedVendor!.vat_gst_no = '';
          this.messageService.add({
            severity: 'info',
            summary: 'Info',
            detail: 'GST details will not be copied.',
            life: 3000,
          });
          resolve(false);
        },
        accept: () => {
          // this.selectedVendorTypes = [];
          this.messageService.add({
            severity: 'info',
            summary: 'Info',
            detail: 'GST details will be copied.',
          });
          resolve(true);
        },
      });
    });
  }

  async saveRow() {
    if (!this.selectedVendor) return;
    // let dupVendorPayload: Vendor[] = [];
    let dupVendorPayload  ={};
    if (this.isDuplicate) {
      if (this.selectedVendorTypes.length === 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Minimum one vendor type must be selected for duplication',
        });
        return;
      }
      const copyGstDupVendor =
        await this.showGstConfirmationforVendorDuplication();
      const dupVendorList = this.selectedVendorTypes.map((type) => {
        return {
          ...(this.selectedVendor as Vendor),
          type,
          vendor_no: '',
          vat_gst_no: copyGstDupVendor ? this.selectedVendor!.vat_gst_no : '',
          seriesCode: this.mappedVendorSeriesCode,
        };
      });
      dupVendorPayload = {
        vendors: dupVendorList
      }
      console.log('Duplicate vendor payload:', dupVendorPayload,'vendors list,',this.vendors);
    }

    console.log(
      'Saving vendor:',
      this.selectedVendor,
      'if duplicate selected vendor type,',
      this.selectedVendorTypes
    );

    if (!this.validateForm()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fix the validation errors before saving',
      });
      return;
    }

    const payload: any = {
      ...this.selectedVendor,
      seriesCode: this.mappedVendorSeriesCode, // Always use mapped code
    };
    if (!this.isManualSeries) {
      payload.vendor_no = undefined; // Let backend generate
    }

    try {
      let savedVendor;
      if (this.selectedVendor.isNew && !this.isDuplicate) {
        savedVendor = await this.vendorService.create(payload).toPromise();
      } else if (this.isDuplicate) {
        console.log('Creating duplicate vendors:', dupVendorPayload);
        const dupVendor = await this.vendorService
          .createDuplicate(dupVendorPayload)
          .toPromise();
      } else {
        savedVendor = await this.vendorService
          .update(this.selectedVendor.id!, this.selectedVendor)
          .toPromise();
      }

      // Update Bill-to Vendor Name with the real number after save
      if (savedVendor && savedVendor.vendor_no && savedVendor.name) {
        this.selectedVendor!.bill_to_vendor_name = `${savedVendor.vendor_no} - ${savedVendor.name}`;
      }
      const msg = this.isDuplicate
        ? 'Vendor Duplicated'
        : this.selectedVendor?.isNew
        ? 'Vendor created'
        : 'Vendor updated';
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: msg,
      });

      // Save documents if vendor was created/updated successfully
      if (savedVendor && savedVendor.vendor_no) {
        await this.saveDocuments(savedVendor);
      }
      this.refreshList();
      this.hideDialog();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Operation failed',
      });
    }
  }

  hideDialog() {
    this.isDuplicate = false;
    this.isDialogVisible = false;
    this.selectedVendor = null;
    this.selectedVendorTypes = [];
    this.fieldErrors = {};
    this.touchedFields = {};
    this.vendorDocuments = [];
  }

  addContact() {
    if (this.selectedVendor) {
      this.selectedVendor.contacts.push({
        name: '',
        department: '',
        mobile: '',
        landline: '',
        email: '',
        remarks: '',
      });
    }
  }

  removeContact(index: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this contact?',
      header: 'Confirm Removal',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this.selectedVendor) {
          this.selectedVendor.contacts.splice(index, 1);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Contact removed successfully',
          });
        }
      },
    });
  }

  clear(table: any) {
    table.clear();
  }

  loadLocations() {
    this.countryOptions = Country.getAllCountries().map((country) => ({
      label: country.name,
      value: country.name,
    }));
    this.stateOptions = [];
    this.cityOptions = [];
    this.masterLocationService.getAll().subscribe({
      next: (locations) => {
        this.allLocations = locations.filter((l) => l.active);

        {
          /* // Unique countries - show ALL active locations regardless of type
            this.countryOptions = uniqueCaseInsensitive(this.allLocations.map(l => l.country))
              .map(c => ({ label: toTitleCase(c), value: c }));
            // Reset state and city options
            this.stateOptions = [];
            this.cityOptions = [];*/
        }
        // Place of Supply: GST_LOCATION type, format 'gst_state_code-name'
        const gstLocations = this.allLocations.filter((l) => l.type === 'GST');
        this.placeOfSupplyOptions = uniqueCaseInsensitive(
          gstLocations.map((l) => `${l.gst_state_code}-${l.name}`)
        ).map((val) => ({ label: val, value: val }));
        console.log('Locations loaded:', this.allLocations.length);
        console.log('Countries loaded:', this.countryOptions.length);
        console.log(
          'Place of supply options loaded:',
          this.placeOfSupplyOptions.length
        );
      },
      error: (error) => {
        console.error('Error loading locations:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load locations',
        });
      },
    });
  }

  onCountryChange() {
    if (!this.selectedVendor || !this.selectedVendor.country) {
      this.stateOptions = [];
      this.cityOptions = [];
      if (this.selectedVendor) {
        this.selectedVendor.state = '';
        this.selectedVendor.city = '';
      }
      return;
    }

    console.log('Selected country:', this.selectedVendor.country);
    console.log('All locations for debugging:', this.allLocations);

    // getting the country object for retrieving state of corresponding country
    let country = Country.getAllCountries().find(
      (c) => c.name === this.selectedVendor?.country
    );

    if (country) {
      this.stateOptions = State.getStatesOfCountry(country.isoCode).map(
        (state) => ({
          label: state.name,
          value: state.name,
        })
      );
    }

    // clear city options when city changes
    this.cityOptions = [];
    this.selectedVendor.state = '';
    this.selectedVendor.city = '';

    {
      /* // Show ALL states for the selected country regardless of location type (case-insensitive)
    const matchingLocations = this.allLocations.filter(l => 
      l.country && l.country.toLowerCase() === this.selectedVendor!.country.toLowerCase()
    );
    console.log('Matching locations for country:', matchingLocations);
    
    const states = matchingLocations
      .map(l => l.state)
      .filter(Boolean);
    console.log('All states found:', states);
    
    this.stateOptions = uniqueCaseInsensitive(states).map(s => ({ label: toTitleCase(s), value: s }));
    console.log('Final state options:', this.stateOptions);*/
    }
  }

  onStateChange() {
    if (!this.selectedVendor || !this.selectedVendor.state) {
      this.cityOptions = [];
      if (this.selectedVendor) {
        this.selectedVendor.city = '';
      }
      return;
    }

    // Previous Master based listing
    {
      /*// Show ALL cities for the selected country and state regardless of location type (case-insensitive)
    const cities = this.allLocations
      .filter(l => 
        l.country && l.country.toLowerCase() === this.selectedVendor!.country.toLowerCase() &&
        l.state && l.state.toLowerCase() === this.selectedVendor!.state.toLowerCase()
      )
      .map(l => l.city)
      .filter(Boolean);
    this.cityOptions = uniqueCaseInsensitive(cities).map(c => ({ label: toTitleCase(c), value: c }));
    this.selectedVendor.city = ''; */
    }
    // Check if both country and state are from the database
    const country = Country.getAllCountries().find(
      (c) => c.name === this.selectedVendor!.country
    );
    if (country) {
      const state = State.getStatesOfCountry(country.isoCode).find(
        (s) => s.name === this.selectedVendor!.state
      );

      if (state) {
        // Both country and state are valid, load cities
        this.cityOptions = City.getCitiesOfState(
          country.isoCode,
          state.isoCode
        ).map((city) => ({
          label: city.name,
          value: city.name,
        }));
      } else {
        // State is manual entry, keep existing city options or clear them
        // Don't clear city options for manual state entries
      }
    } else {
      // Country is manual entry, keep existing city options or clear them
      // Don't clear city options for manual country entries
    }

    // Clear city selection when state changes
    this.selectedVendor!.city = '';
  }

  // Validation methods
  validateField(field: string, value: any): string {
    switch (field) {
      case 'vendor_no':
        if (!value || value.trim() === '') return 'Vendor No. is required';
        break;
      case 'type':
        if (!value || value.trim() === '') return 'Vendor Type is required';
        break;
      case 'name':
        if (!value || value.trim() === '') return 'Vendor Name is required';
        break;
      case 'country':
        if (!value || value.trim() === '') return 'Country is required';
        break;
      case 'state':
        if (!value || value.trim() === '') return 'State is required';
        break;
      case 'city':
        if (!value || value.trim() === '') return 'City is required';
        break;
      case 'vat_gst_no':
        if (!value || value.trim() === '') return 'VAT/GST No. is required';
        break;
    }
    return '';
  }

  onFieldChange(field: string, value: any) {
    // Mark field as touched when user starts typing
    this.touchedFields[field] = true;

    const error = this.validateField(field, value);
    if (error) {
      this.fieldErrors[field] = error;
    } else {
      delete this.fieldErrors[field];
    }
  }

  onFieldBlur(field: string) {
    // Mark field as touched when user leaves it (blur event)
    this.touchedFields[field] = true;

    if (!this.selectedVendor) return;

    const value = this.selectedVendor[field as keyof Vendor];
    const error = this.validateField(field, value);
    if (error) {
      this.fieldErrors[field] = error;
    } else {
      delete this.fieldErrors[field];
    }
  }

  getFieldError(field: string): string {
    // Only show error if field has been touched by user
    return this.touchedFields[field] ? this.fieldErrors[field] || '' : '';
  }

  isFormValid(): boolean {
    // Only check if there are any existing errors, don't run validation
    return Object.keys(this.fieldErrors).length === 0;
  }

  validateForm(): boolean {
    if (!this.selectedVendor) return false;

    // For vendor_no, only require it if it's a manual series
    const requiredFields = this.isManualSeries
      ? ['vendor_no', 'type', 'name', 'country', 'state', 'city', 'vat_gst_no']
      : ['type', 'name', 'country', 'state', 'city', 'vat_gst_no'];

    for (const field of requiredFields) {
      const error = this.validateField(
        field,
        this.selectedVendor[field as keyof Vendor]
      );
      if (error) {
        this.fieldErrors[field] = error;
        // Mark all fields as touched when form validation runs
        this.touchedFields[field] = true;
      }
    }

    return Object.keys(this.fieldErrors).length === 0;
  }

  // Document handling methods
  loadDocumentUploadPath() {
    console.log('Loading document upload path for vendor...');
    this.entityDocumentService.getUploadPath('vendor').subscribe({
      next: (response: any) => {
        console.log('Document upload path loaded:', response.value);
        this.documentUploadPath = response.value;
      },
      error: (error: any) => {
        console.error('Error loading document upload path:', error);
        this.documentUploadPath = '/uploads/documents/vendor';
      },
    });
  }

  loadDocumentTypeOptions() {
    this.masterTypeService.getAll().subscribe({
      next: (types: any[]) => {
        this.documentTypeOptions = (types || [])
          .filter((t) => t.key === 'VEN_DOCUMENT' && t.status === 'Active')
          .map((t) => ({ label: t.value, value: t.value }));
        console.log('Document type options loaded:', this.documentTypeOptions);
      },
      error: (error) => {
        console.error('Error loading document types:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load document types',
        });
      },
    });
  }

  addDocument() {
    this.vendorDocuments.push({
      entity_type: 'vendor',
      entity_code: this.selectedVendor!.vendor_no,
      doc_type: '',
      document_number: '',
      valid_from: '',
      valid_till: '',
      file_path: '',
      file_name: '',
      file_size: 0,
      mime_type: '',
    });
  }

  removeDocument(index: number) {
    const document = this.vendorDocuments[index];
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this document?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (document.id) {
          // Delete from server if it exists
          this.entityDocumentService.delete(document.id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Document deleted',
              });
              this.vendorDocuments.splice(index, 1);
            },
            error: (error: any) => {
              console.error('Error deleting document:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete document',
              });
            },
          });
        } else {
          // Just remove from local array if not saved yet
          this.vendorDocuments.splice(index, 1);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Document removed',
          });
        }
      },
    });
  }

  onFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.vendorDocuments[index].file = file;
      this.vendorDocuments[index].file_name = file.name;
      this.vendorDocuments[index].file_size = file.size;
      this.vendorDocuments[index].mime_type = file.type;
    }
  }

  downloadDocument(doc: EntityDocument) {
    if (!doc.id) return;
    this.entityDocumentService.download(doc.id).subscribe({
      next: (blob: any) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.file_name;
        link.click();
        window.URL.revokeObjectURL(url);

        console.log('Download link clicked');
      },
      error: (error: any) => {
        console.error('Error downloading document:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
        });
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to download document',
        });
      },
    });
  }

  viewDocument(doc: EntityDocument) {
    if (!doc.id) return;

    this.selectedDocument = doc;
    this.isDocumentViewerVisible = true;
    this.pdfLoaded = false;
    this.pdfError = false;

    // Always load fresh from server - no caching for blob URLs
    this.entityDocumentService.view(doc.id).subscribe({
      next: (blob: any) => {
        console.log('View successful, blob size:', blob.size);
        console.log('Blob type:', blob.type);

        this.documentViewerUrl = window.URL.createObjectURL(blob);
        this.safeDocumentViewerUrl =
          this.sanitizer.bypassSecurityTrustResourceUrl(this.documentViewerUrl);

        console.log('Document viewer URL created:', this.documentViewerUrl);

        // Immediate load for PDFs
        if (doc.mime_type === 'application/pdf') {
          this.pdfLoaded = true;
        } else {
          // Short delay for other file types
          setTimeout(() => {
            this.pdfLoaded = true;
          }, 300);
        }
      },
      error: (error: any) => {
        console.error('Error viewing document:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
        });
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to view document',
        });
        this.hideDocumentViewer();
      },
    });
  }

  hideDocumentViewer() {
    this.isDocumentViewerVisible = false;
    this.selectedDocument = null;
    if (this.documentViewerUrl) {
      window.URL.revokeObjectURL(this.documentViewerUrl);
      this.documentViewerUrl = '';
    }
    this.safeDocumentViewerUrl = null;
    this.pdfLoaded = false;
    this.pdfError = false;
  }

  getOfficeViewerUrl(): string {
    if (!this.documentViewerUrl || !this.selectedDocument) return '';

    // Check if it's a blob URL
    if (this.documentViewerUrl.startsWith('blob:')) {
      // For blob URLs, we can't use online viewers directly
      // We'll return empty to show the fallback
      return '';
    }

    // For regular URLs, try Microsoft Office Online Viewer
    const encodedUrl = encodeURIComponent(this.documentViewerUrl);
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
  }

  getSafeOfficeViewerUrl(): SafeResourceUrl | null {
    const url = this.getOfficeViewerUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  }

  openDocumentInNewTab() {
    if (this.selectedDocument?.id) {
      // Use the server URL instead of blob URL for better compatibility
      const serverUrl = `${window.location.origin}/api/entity-documents/${this.selectedDocument.id}/view`;
      window.open(serverUrl, '_blank');
    }
  }

  onPdfLoad() {
    console.log('PDF loaded successfully');
    this.pdfLoaded = true;
    this.pdfError = false;
  }

  onPdfError() {
    console.log('PDF failed to load');
    this.pdfError = true;
    this.pdfLoaded = false;
  }

  loadVendorDocuments(vendorNo: string) {
    this.entityDocumentService.getByEntityCode('vendor', vendorNo).subscribe({
      next: (documents: any) => {
        this.vendorDocuments = documents;
      },
      error: (error: any) => {
        console.error('Error loading vendor documents:', error);
        this.vendorDocuments = [];
      },
    });
  }

  async saveDocuments(vendorData?: any) {
    const vendor = vendorData || this.selectedVendor;
    if (!vendor?.vendor_no) return;

    // Filter out documents without doc_type selected
    const documentsToUpload = this.vendorDocuments.filter(
      (doc) => doc.file && !doc.id && doc.doc_type
    );
    const documentsWithoutDocType = this.vendorDocuments.filter(
      (doc) => doc.file && !doc.id && !doc.doc_type
    );

    if (documentsWithoutDocType.length > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please select document type for all documents before saving',
      });
      return;
    }

    const uploadPromises = documentsToUpload.map((doc) => {
      console.log('Preparing to upload document:', {
        entity_type: 'vendor',
        entity_code: vendor.vendor_no,
        entity_name: vendor.name, // Include vendor name for folder creation
        doc_type: doc.doc_type,
        document_number: doc.document_number || '',
        valid_from: doc.valid_from || '',
        valid_till: doc.valid_till || '',
        file_name: doc.file?.name,
        uploadPath: this.documentUploadPath,
      });

      const formData = new FormData();
      formData.append('entity_type', 'vendor');
      formData.append('entity_code', vendor.vendor_no);
      formData.append('entity_name', vendor.name); // Include vendor name for folder creation
      formData.append('doc_type', doc.doc_type);
      formData.append('document_number', doc.document_number || '');
      formData.append('valid_from', doc.valid_from || '');
      formData.append('valid_till', doc.valid_till || '');
      formData.append('document', doc.file!);
      formData.append('uploadPath', this.documentUploadPath);

      return this.entityDocumentService.uploadDocument(formData).toPromise();
    });

    const updatePromises = this.vendorDocuments
      .filter((doc) => doc.id && !doc.file) // Only update existing documents without new files
      .map((doc) => {
        return this.entityDocumentService
          .update(doc.id!, {
            doc_type: doc.doc_type,
            document_number: doc.document_number,
            valid_from: doc.valid_from,
            valid_till: doc.valid_till,
          })
          .toPromise();
      });

    await Promise.all([...uploadPromises, ...updatePromises]);
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Documents saved successfully',
    });
    this.loadVendorDocuments(vendor.vendor_no);
  }

  // Master dialog methods
  openMaster(masterType: string) {
    this.masterDialogVisible[masterType] = true;
  }

  closeMasterDialog(masterType: string) {
    this.masterDialogVisible[masterType] = false;
    if (masterType === 'vendorType') {
      this.loadVendorTypeOptions();
    } else if (masterType === 'state') {
      this.loadStateOptions();
    } else if (masterType === 'documentType') {
      this.loadDocumentTypeOptions();
    }
  }

  private loadVendorTypeOptions() {
    this.masterTypeService.getAll().subscribe({
      next: (data: any[]) => {
        this.vendorTypeOptions = data
          .filter((item: any) => item.key === 'VENDOR')
          .map((item: any) => ({ label: item.value, value: item.value }));
      },
      error: (error: any) => {
        console.error('Error loading customer type options:', error);
      },
    });
  }

  private loadStateOptions() {
    this.masterLocationService.getAll().subscribe({
      next: (data: any[]) => {
        this.stateOptions = data
          .filter((item: any) => item.type === 'STATE')
          .map((item: any) => ({ label: item.name, value: item.name }));
      },
      error: (error: any) => {
        console.error('Error loading state options:', error);
      },
    });
  }
}
