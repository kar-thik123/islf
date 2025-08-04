import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { CompanyService, Company } from '../../../services/company.service';
import { BranchService, Branch } from '../../../services/branch.service';
import { DepartmentService, Department } from '../../../services/department.service';
import { ConfigService } from '../../../services/config.service';
import { ConfigDatePipe } from '../../../pipes/config-date.pipe';
import { TabsModule } from 'primeng/tabs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { EntityDocumentService, EntityDocument } from '../../../services/entity-document.service';
import { MasterTypeService } from '../../../services/mastertype.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-company-hierarchy',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, InputTextModule, ButtonModule, TableModule, DropdownModule, ToastModule, TabsModule, ConfirmDialogModule, ConfigDatePipe],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="md:w-full">
      <div class="card">
        <div class="font-semibold text-xl mb-4">Company Management</div>
        <p-tabs [value]="tabIndex">
          <p-tablist>
            <p-tab [value]="0">Company</p-tab>
            <p-tab [value]="1">Branches</p-tab>
            <p-tab [value]="2">Departments</p-tab>
            <p-tab [value]='3'>Operations</p-tab>
          </p-tablist>
          <p-tabpanels>
            <p-tabpanel [value]="0">
              <!-- Company Section: Add button, company card, full detail dialog -->
              <div class="flex justify-end mb-4">
                <button pButton label="+ Add Company" class="p-button-success" (click)="openCompanyDialog()"></button>
              </div>
              <div *ngIf="errorMessage" class="text-red-600 mb-2">{{ errorMessage }}</div>
              <div *ngFor="let company of companies" class="cursor-pointer border rounded-xl shadow-lg hover:shadow-xl transition-all mt-10 mb-16" (click)="openCompanyDialog(company)">
                <div class="company-header ">
                  <h2 class="text-2xl font-bold uppercase">{{ company.name }}</h2>
                  <p class="text-sm mt-1 ">{{ company.name2 }}</p>
                  <p class="text-sm mt-1 ">{{ company.address1 }}<span *ngIf="company.address2">, {{ company.address2 }}</span></p>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 text-sm">
                  <div><strong>GST:</strong> {{ company.gst }}</div>
                  <div><strong>Phone:</strong> {{ company.phone }}</div>
                  <div><strong>Landline:</strong> {{ company.landline }}</div>
                  <div><strong>Email:</strong> {{ company.email }}</div>
                  <div><strong>Website:</strong> {{ company.website }}</div>
                </div>
              </div>
            </p-tabpanel>
            <p-tabpanel [value]="1">
              <!-- Branch Section: Company card (min details), Add Branch, branch cards with dialog -->
              <div *ngFor="let company of companies" class="mb-8">
                <div class="mb-4 border rounded p-4 bg-blue-50">
                  <div class="font-bold text-lg">{{ company.name }}</div>
                  <div class="text-xs text-gray-500">Code: {{ company.code }}</div>
                </div>
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-xl font-semibold">Branches</h3>
                  <button pButton label="+ Add Branch" class="p-button-success" (click)="openBranchDialogForCompany(company)"></button>
                </div>
                <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <div *ngFor="let branch of getBranchesForCompany(company.code)" class="cursor-pointer border rounded-xl shadow hover:shadow-lg transition-all" (click)="openBranchDialog(branch)">
                 <div class="branch-header">
                    <h3 class="text-xl font-bold uppercase">{{ branch.name }}</h3>
                    <div class="text-right text-sm font-medium">Incharge: {{ branch.incharge_name }}</div>
                  </div>

                    <div class="grid grid-cols-2 p-4 gap-2 text-sm bg-white">
                      <div><strong>Code:</strong> {{ branch.code }}</div>
                      <div><strong>GST:</strong> {{ branch.gst }}</div>
                      <div><strong>Address:</strong> {{ branch.address }}</div>
                      <div><strong>Incharge From:</strong> {{ branch.incharge_from | configDate }}</div>
                      <div><strong>Status:</strong> {{ branch.status }}</div>
                      <div><strong>Start:</strong> {{ branch.start_date | configDate }}</div>
                      <div><strong>Close:</strong> {{ branch.close_date ? (branch.close_date | configDate) : '-' }}</div>
                      <div class="col-span-2"><strong>Remarks:</strong> {{ branch.remarks }}</div>
                      <div class="col-span-2"><strong>Description:</strong> {{ branch.description }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </p-tabpanel>
            <p-tabpanel [value]="2">
              <!-- Department Section: Show all companies, each with their branches and departments -->
              <div *ngFor="let company of companies" class="mb-8">
                <div class="mb-4 border rounded p-4 bg-blue-50">
                  <div class="font-bold text-lg">{{ company.name }}</div>
                  <div class="text-xs text-gray-500">Code: {{ company.code }}</div>
                </div>
                <div *ngFor="let branch of getBranchesForCompany(company.code)" class="mb-8">
                  <div class="w-full border rounded-xl shadow bg-green-50 p-4 mb-2">
                    <div class="flex justify-between items-center">
                      <div>
                        <div class="font-bold text-lg">{{ branch.name }}</div>
                        <div class="text-xs text-gray-500">Incharge: {{ branch.incharge_name }}</div>
                      </div>
                      <button pButton icon="pi pi-plus" label="Add Department" class="p-button-sm p-button-success" (click)="openDepartmentDialog(branch)"></button>
                    </div>
                  </div>
                   <h3 class="text-xl font-semibold mt-6 mb-6  ml-[2px]">Departments</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div *ngFor="let dept of branch.departments" class="bg-white border rounded-xl shadow hover:shadow-md transition-all cursor-pointer" (click)="openDepartmentDialog(branch, dept); $event.stopPropagation()">
                    <div class="branch-header">
                      <div class="col-span-full flex justify-between items-center w-full">
                        <div class="text-lg font-bold uppercase">{{ dept.name }}</div>
                        <div class="text-sm font-medium">Incharge: {{ dept.incharge_name }}</div>
                      </div>
                    </div>


                      <div class="p-4">
                        <div class="text-xs text-gray-600 mb-2">{{ dept.description }}</div>
                        <div class="grid grid-cols-2 gap-2 text-xs">
                          <div><strong>Code:</strong> {{dept.code }}</div>
                          <div><strong>Incharge From:</strong> {{ dept.incharge_from | configDate }}</div>
                          <div><strong>Status:</strong> {{ dept.status }}</div>
                          <div><strong>Start:</strong> {{ dept.start_date | configDate }}</div>
                          <div><strong>Close:</strong> {{ dept.close_date ? (dept.close_date | configDate) : '-' }}</div>
                          <div class="col-span-2"><strong>Remarks:</strong> {{ dept.remarks }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>
        <!-- Dialogs remain unchanged -->
        <p-dialog header="{{ selectedCompany?.code ? 'Edit' : 'Add' }} Company" [(visible)]="displayCompanyDialog" [modal]="true" [style]="{ width: '700px' }" [closable]="false">
          <div *ngIf="errorMessage" class="text-red-600 mb-2">{{ errorMessage }}</div>
          <form class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div *ngIf="companyFormError" class="text-red-600 mb-2">{{ companyFormError }}</div>
            <ng-container *ngFor="let field of companyFields">
              <div>
                <label class="block mb-1 font-medium">
                  {{ field.label }}
                  <span *ngIf="field.required" class="text-red-600">*</span>
                </label>
                <input 
                  [type]="field.type" 
                  pInputText 
                  class="w-full" 
                  [class.border-red-500]="getFieldError(field.key)"
                  [(ngModel)]="selectedCompany[field.key]" 
                  [name]="field.key"
                  [disabled]="field.key === 'code' && !!selectedCompany?.code"
                  (ngModelChange)="onFieldChange(field.key, $event)"
                  (blur)="onFieldBlur(field.key)" />
                <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError(field.key)">{{ getFieldError(field.key) }}</small>
              </div>
            </ng-container>
          


            <!-- Logo upload -->
            <div class="col-span-2">
             <hr class="w-full border-t border-gray-300 my-4" />
            <label class="block mb-2 text-sm font-semibold text-gray-700">Company Logo</label>

            <!-- File input -->
            <input
              type="file"
              accept="image/*"
              (change)="onLogoSelected($event)"
              class="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
            />

            <!-- Preview -->
            <div *ngIf="selectedCompany['logo']" class="mt-4">
              <img
                [src]="selectedCompany['logo']"
                alt="Logo Preview"
                class="h-16 w-auto max-w-xs border border-gray-300 rounded shadow-sm object-contain"
              />
            </div>
          </div>

          <!-- Document Upload Button -->
          <div class="col-span-2">
            <hr class="w-full border-t border-gray-300 my-4" />
            <div class="flex justify-between items-center">
              <label class="block text-sm font-semibold text-gray-700">Company Documents</label>
              <button pButton label="Upload Documents" icon="pi pi-upload" class="p-button-outlined" (click)="openCompanyDocumentDialog()"></button>
            </div>
          </div>

          </form>
        
          <div class="text-right">
            <button pButton label="Navigate to Mapping" class="p-button-primary" (click)="navigateToMapping()"></button>
          </div>
          <ng-template pTemplate="footer">
            <div class="text-right">
              <button pButton label="Cancel" class="p-button-secondary mr-2" (click)="closeCompanyDialog()"></button>
              <button pButton label="Save" class="p-button-primary" type="button" (click)="saveCompany()"></button>
            </div>
          </ng-template>
        </p-dialog>
        <p-dialog header="{{ selectedBranch?.code ? 'Edit' : 'Add' }} Branch" [(visible)]="displayBranchDialog" [modal]="true" [style]="{ width: '700px' }" [closable]="false">
          <form class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div *ngIf="branchFormError" class="text-red-600 mb-2">{{ branchFormError }}</div>
            <ng-container *ngFor="let field of branchFields">
              <div>
                <label class="block mb-1 font-medium">
                  {{ field.label }}
                  <span *ngIf="field.required" class="text-red-600">*</span>
                </label>
                <input 
                  [type]="field.type" 
                  pInputText 
                  class="w-full" 
                  [class.border-red-500]="getFieldError(field.key)"
                  [(ngModel)]="selectedBranch[field.key]" 
                  [name]="field.key"
                  [disabled]="field.key === 'code' && !!selectedBranch?.code"
                  [disabled]="field.key === 'company_code' && !!selectedBranch?.company_code"
                  (ngModelChange)="onFieldChange(field.key, $event)"
                  (blur)="onFieldBlur(field.key)" />
                <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError(field.key)">{{ getFieldError(field.key) }}</small>
              </div>
            </ng-container>

            <!-- Document Upload Button -->
            <div class="col-span-2">
              <hr class="w-full border-t border-gray-300 my-4" />
              <div class="flex justify-between items-center">
                <label class="block text-sm font-semibold text-gray-700">Branch Documents</label>
                <button pButton label="Upload Documents" icon="pi pi-upload" class="p-button-outlined" (click)="openBranchDocumentDialog()"></button>
              </div>
            </div>
          </form>
          <ng-template pTemplate="footer">
            <div class="text-right">
              <button pButton label="Cancel" class="p-button-secondary mr-2" (click)="closeBranchDialog()"></button>
              <button pButton label="Save" class="p-button-primary" type="button" (click)="saveBranch()"></button>
            </div>
          </ng-template>
        </p-dialog>
        <p-dialog header="{{ selectedDepartment?.code ? 'Edit' : 'Add' }} Department" [(visible)]="displayDepartmentDialog" [modal]="true" [style]="{ width: '700px' }" [closable]="false">
          <form class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div *ngIf="departmentFormError" class="text-red-600 mb-2">{{ departmentFormError }}</div>
            <ng-container *ngFor="let field of departmentFields">
              <div>
                <label class="block mb-1 font-medium">
                  {{ field.label }}
                  <span *ngIf="field.required" class="text-red-600">*</span>
                </label>
                <input 
                  [type]="field.type" 
                  pInputText 
                  class="w-full" 
                  [class.border-red-500]="getFieldError(field.key)"
                  [(ngModel)]="selectedDepartment[field.key]" 
                  [name]="field.key"
                  [disabled]="field.key === 'code' && !!selectedDepartment?.code"
                  [disabled]="field.key === 'branch_code' && !!selectedDepartment?.branch_code" 
                  [disabled]="field.key === 'company_code' && !!selectedDepartment?.company_code"
                  (ngModelChange)="onFieldChange(field.key, $event)"
                  (blur)="onFieldBlur(field.key)" />
                <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError(field.key)">{{ getFieldError(field.key) }}</small>
              </div>
            </ng-container>

            <!-- Document Upload Button -->
            <div class="col-span-2">
              <hr class="w-full border-t border-gray-300 my-4" />
              <div class="flex justify-between items-center">
                <label class="block text-sm font-semibold text-gray-700">Department Documents</label>
                <button pButton label="Upload Documents" icon="pi pi-upload" class="p-button-outlined" (click)="openDepartmentDocumentDialog()"></button>
              </div>
            </div>
          </form>
          <ng-template pTemplate="footer">
            <div class="text-right">
              <button pButton label="Cancel" class="p-button-secondary mr-2" (click)="closeDepartmentDialog()"></button>
              <button pButton label="Save" class="p-button-primary" type="button" (click)="saveDepartment()"></button>
            </div>
          </ng-template>
        </p-dialog>
      </div>
      
      <!-- Company Document Dialog -->
      <p-dialog 
        header="Company Documents" 
        [(visible)]="displayCompanyDocumentDialog" 
        [modal]="true" 
        [style]="{ width: '1000px' }" 
        [closable]="false">
        <div class="space-y-4">
          <p-table [value]="companyDocuments" [showGridlines]="true" [responsiveLayout]="'scroll'">
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
            <ng-template pTemplate="body" let-document let-rowIndex="rowIndex">
              <tr>
                <td>
                  <p-dropdown [options]="documentTypeOptions" [(ngModel)]="document.doc_type" optionLabel="label" optionValue="value" placeholder="Select Document Type"></p-dropdown>
                </td>
                <td>
                  <input pInputText [(ngModel)]="document.document_number" placeholder="Document Number" />
                </td>
                <td>
                  <input pInputText type="date" [(ngModel)]="document.valid_from" />
                </td>
                <td>
                  <input pInputText type="date" [(ngModel)]="document.valid_till" />
                </td>
                <td>
                  <input type="file" (change)="onCompanyFileSelected($event, rowIndex)" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt" class="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"/>
                  <small *ngIf="document.file_name" class="text-gray-600">{{ document.file_name }}</small>
                </td>
                <td>
                  <div class="flex gap-1">
                    <button pButton icon="pi pi-eye" class="p-button-sm p-button-outlined" (click)="viewDocument(document)" *ngIf="document.id" pTooltip="View Document"></button>
                    <button pButton icon="pi pi-download" class="p-button-sm p-button-outlined" (click)="downloadDocument(document)" *ngIf="document.id" pTooltip="Download Document"></button>
                    <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeCompanyDocument(rowIndex)" pTooltip="Delete Document"></button>
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="footer">
              <tr>
                <td colspan="6">
                  <button pButton label="Add Document" icon="pi pi-plus" (click)="addCompanyDocument()"></button>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
        <ng-template pTemplate="footer">
          <div class="text-right">
            <button pButton label="Cancel" class="p-button-secondary mr-2" (click)="closeCompanyDocumentDialog()"></button>
            <button pButton label="Save Documents" class="p-button-primary" (click)="saveCompanyDocuments()"></button>
          </div>
        </ng-template>
      </p-dialog>

      <!-- Branch Document Dialog -->
      <p-dialog 
        header="Branch Documents" 
        [(visible)]="displayBranchDocumentDialog" 
        [modal]="true" 
        [style]="{ width: '1000px' }" 
        [closable]="false">
        <div class="space-y-4">
          <p-table [value]="branchDocuments" [showGridlines]="true" [responsiveLayout]="'scroll'">
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
            <ng-template pTemplate="body" let-document let-rowIndex="rowIndex">
              <tr>
                <td>
                  <p-dropdown [options]="documentTypeOptions" [(ngModel)]="document.doc_type" optionLabel="label" optionValue="value" placeholder="Select Document Type"></p-dropdown>
                </td>
                <td>
                  <input pInputText [(ngModel)]="document.document_number" placeholder="Document Number" />
                </td>
                <td>
                  <input pInputText type="date" [(ngModel)]="document.valid_from" />
                </td>
                <td>
                  <input pInputText type="date" [(ngModel)]="document.valid_till" />
                </td>
                <td>
                  <input type="file" (change)="onBranchFileSelected($event, rowIndex)" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt" class="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"/>
                  <small *ngIf="document.file_name" class="text-gray-600">{{ document.file_name }}</small>
                </td>
                <td>
                  <div class="flex gap-1">
                    <button pButton icon="pi pi-eye" class="p-button-sm p-button-outlined" (click)="viewDocument(document)" *ngIf="document.id" pTooltip="View Document"></button>
                    <button pButton icon="pi pi-download" class="p-button-sm p-button-outlined" (click)="downloadDocument(document)" *ngIf="document.id" pTooltip="Download Document"></button>
                    <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeBranchDocument(rowIndex)" pTooltip="Delete Document"></button>
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="footer">
              <tr>
                <td colspan="6">
                  <button pButton label="Add Document" icon="pi pi-plus" (click)="addBranchDocument()"></button>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
        <ng-template pTemplate="footer">
          <div class="text-right">
            <button pButton label="Cancel" class="p-button-secondary mr-2" (click)="closeBranchDocumentDialog()"></button>
            <button pButton label="Save Documents" class="p-button-primary" (click)="saveBranchDocuments()"></button>
          </div>
        </ng-template>
      </p-dialog>

      <!-- Department Document Dialog -->
      <p-dialog 
        header="Department Documents" 
        [(visible)]="displayDepartmentDocumentDialog" 
        [modal]="true" 
        [style]="{ width: '1000px' }" 
        [closable]="false">
        <div class="space-y-4">
          <p-table [value]="departmentDocuments" [showGridlines]="true" [responsiveLayout]="'scroll'">
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
            <ng-template pTemplate="body" let-document let-rowIndex="rowIndex">
              <tr>
                <td>
                  <p-dropdown [options]="documentTypeOptions" [(ngModel)]="document.doc_type" optionLabel="label" optionValue="value" placeholder="Select Document Type"></p-dropdown>
                </td>
                <td>
                  <input pInputText [(ngModel)]="document.document_number" placeholder="Document Number" />
                </td>
                <td>
                  <input pInputText type="date" [(ngModel)]="document.valid_from" />
                </td>
                <td>
                  <input pInputText type="date" [(ngModel)]="document.valid_till" />
                </td>
                <td>
                  <input type="file" (change)="onDepartmentFileSelected($event, rowIndex)" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt" class="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"/>
                  <small *ngIf="document.file_name" class="text-gray-600">{{ document.file_name }}</small>
                </td>
                <td>
                  <div class="flex gap-1">
                    <button pButton icon="pi pi-eye" class="p-button-sm p-button-outlined" (click)="viewDocument(document)" *ngIf="document.id" pTooltip="View Document"></button>
                    <button pButton icon="pi pi-download" class="p-button-sm p-button-outlined" (click)="downloadDocument(document)" *ngIf="document.id" pTooltip="Download Document"></button>
                    <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeDepartmentDocument(rowIndex)" pTooltip="Delete Document"></button>
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="footer">
              <tr>
                <td colspan="6">
                  <button pButton label="Add Document" icon="pi pi-plus" (click)="addDepartmentDocument()"></button>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
        <ng-template pTemplate="footer">
          <div class="text-right">
            <button pButton label="Cancel" class="p-button-secondary mr-2" (click)="closeDepartmentDocumentDialog()"></button>
            <button pButton label="Save Documents" class="p-button-primary" (click)="saveDepartmentDocuments()"></button>
          </div>
        </ng-template>
      </p-dialog>
      
      <!-- Confirmation Dialog -->
      <p-confirmDialog></p-confirmDialog>
      
      <!-- Toast for messages -->
      <p-toast></p-toast>
      
      <!-- Document Viewer Dialog -->
      <p-dialog 
        [(visible)]="isDocumentViewerVisible" 
        [modal]="true" 
        [style]="{width: '90vw', height: '90vh'}" 
        [maximizable]="true"
        [draggable]="false"
        [resizable]="false"
        (onHide)="hideDocumentViewer()">
        
        <ng-template pTemplate="header">
          <div class="flex align-items-center justify-content-between w-full">
            <h5 class="m-0">
              <i class="pi pi-file mr-2"></i>
              {{ selectedDocument?.file_name }}
            </h5>
            <div class="flex gap-2">
              <button pButton icon="pi pi-download" class="p-button-sm p-button-outlined" 
                      (click)="downloadDocument(selectedDocument!)" 
                      pTooltip="Download Document"></button>
              <button pButton icon="pi pi-times" class="p-button-sm p-button-outlined" 
                      (click)="hideDocumentViewer()" 
                      pTooltip="Close"></button>
            </div>
          </div>
        </ng-template>

        <ng-template pTemplate="content">
          <div class="document-viewer-container" style="height: calc(90vh - 120px); overflow: auto;">
            <!-- Image files -->
            <img *ngIf="selectedDocument?.mime_type?.startsWith('image/') && documentViewerUrl" 
                 [src]="documentViewerUrl" 
                 [alt]="selectedDocument?.file_name"
                 style="max-width: 100%; max-height: 100%; object-fit: contain;">
            
            <!-- PDF files -->
            <div *ngIf="selectedDocument?.mime_type === 'application/pdf'" style="height: 100%; display: flex; flex-direction: column;">
              <!-- PDF Loading State -->
              <div *ngIf="!pdfLoaded" class="flex align-items-center justify-content-center" style="height: 100%; flex-direction: column; gap: 1rem;">
                <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #6c757d;"></i>
                <p class="text-muted">Loading PDF...</p>
                <button pButton label="Open PDF in New Tab" icon="pi pi-external-link" 
                        (click)="openDocumentInNewTab()" 
                        class="p-button-outlined"></button>
              </div>
              
              <!-- PDF Viewer -->
              <iframe *ngIf="selectedDocument?.mime_type === 'application/pdf' && safeDocumentViewerUrl && pdfLoaded" 
                      [src]="safeDocumentViewerUrl" 
                      style="width: 100%; height: 100%; border: none;"
                      (load)="onPdfLoad()"
                      (error)="onPdfError()">
              </iframe>
              
              <!-- PDF Error State -->
              <div *ngIf="pdfError" class="flex align-items-center justify-content-center" style="height: 100%; flex-direction: column; gap: 1rem;">
                <i class="pi pi-exclamation-triangle" style="font-size: 4rem; color: #dc3545;"></i>
                <h4>PDF Loading Failed</h4>
                <p class="text-muted">Unable to display PDF in browser.</p>
                <div class="flex gap-2">
                  <button pButton label="Download PDF" icon="pi pi-download" 
                          (click)="downloadDocument(selectedDocument!)" 
                          class="p-button-primary"></button>
                  <button pButton label="Open in New Tab" icon="pi pi-external-link" 
                          (click)="openDocumentInNewTab()" 
                          class="p-button-outlined"></button>
                </div>
              </div>
            </div>
            
            <!-- Text files -->
            <div *ngIf="selectedDocument?.mime_type === 'text/plain' && documentViewerUrl" 
                 style="padding: 1rem; background: white; height: 100%; overflow: auto;">
              <pre style="margin: 0; white-space: pre-wrap; font-family: monospace;">{{ documentViewerUrl }}</pre>
            </div>
            
            <!-- Office Documents and other files - Enhanced viewer -->
            <div *ngIf="!selectedDocument?.mime_type?.startsWith('image/') && 
                        selectedDocument?.mime_type !== 'application/pdf' && 
                        selectedDocument?.mime_type !== 'text/plain' && 
                        documentViewerUrl" 
                 style="height: 100%; display: flex; flex-direction: column;">
              
              <!-- Try Microsoft Office Online Viewer first -->
              <iframe *ngIf="getSafeOfficeViewerUrl()" 
                      [src]="getSafeOfficeViewerUrl()"
                      style="width: 100%; height: 100%; border: none;">
              </iframe>
              
              <!-- Fallback for unsupported files -->
              <div *ngIf="!getSafeOfficeViewerUrl()" 
                   class="flex align-items-center justify-content-center" 
                   style="height: 100%; flex-direction: column; gap: 1rem;">
                <i class="pi pi-file" style="font-size: 4rem; color: #6c757d;"></i>
                <h4>Document Preview</h4>
                <p class="text-muted">This file type requires download for viewing.</p>
                <button pButton label="Download File" icon="pi pi-download" 
                        (click)="downloadDocument(selectedDocument!)" 
                        class="p-button-primary"></button>
              </div>
            </div>
            
            <!-- Loading state -->
            <div *ngIf="!documentViewerUrl" 
                 class="flex align-items-center justify-content-center" 
                 style="height: 100%;">
              <div class="text-center">
                <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #6c757d;"></i>
                <p class="mt-2 text-muted">Loading document...</p>
              </div>
            </div>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class CompanyManagementComponent implements OnInit {
  tabIndex = 0;
  companies: Company[] = [];
  branches: Branch[] = [];
  

  // Add this method to filter branches by company code
  getBranchesForCompany(companyCode: string): Branch[] {
    return this.branches.filter(b => b.company_code === companyCode);
  }

  selectedCompany: Company = {} as Company;
  selectedBranch: Branch = {} as Branch;
  selectedDepartment: Department = {} as Department;
  currentBranchForDepartment: Branch | null = null;

  displayCompanyDialog = false;
  displayBranchDialog = false;
  displayDepartmentDialog = false;
  
  // Document dialog visibility
  displayCompanyDocumentDialog = false;
  displayBranchDocumentDialog = false;
  displayDepartmentDocumentDialog = false;

  // Track original company data for change detection
  originalCompanyData: Company | null = null;
  hasUnsavedChanges = false;

  companyFields = [
    { key: 'code', label: 'Company Code', type: 'text', required: true },
    { key: 'name', label: 'Company Name', type: 'text', required: true },
    { key: 'name2', label: 'Company Name 2', type: 'text', required: false },
    { key: 'gst', label: 'GST No.', type: 'text', required: true },
    { key: 'phone', label: 'Phone', type: 'text', required: false },
    { key: 'landline', label: 'Landline', type: 'text', required: false },
    { key: 'email', label: 'Email', type: 'email', required: false },
    { key: 'website', label: 'Website', type: 'text', required: false },
    { key: 'address1', label: 'Address 1', type: 'text', required: false },
    { key: 'address2', label: 'Address 2', type: 'text', required: false },
  ];

  branchFields = [
    { key: 'company_code', label: 'Company Code', type: 'text', required: true },
    { key: 'code', label: 'Branch Code', type: 'text', required: true },
    { key: 'name', label: 'Branch Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'text', required: false },
    { key: 'address', label: 'Address', type: 'text', required: false },
    { key: 'gst', label: 'GST No.', type: 'text', required: true },
    { key: 'incharge_name', label: 'Incharge Name & Contact No.', type: 'text', required: true },
    { key: 'incharge_from', label: 'Incharge From Date', type: 'date', required: false },
    { key: 'status', label: 'Status', type: 'text', required: false },
    { key: 'start_date', label: 'Start Date', type: 'date', required: false },
    { key: 'close_date', label: 'Close Date', type: 'date', required: false },
    { key: 'remarks', label: 'Remarks', type: 'text', required: false },
  ];

  departmentFields = [
    { key: 'company_code', label: 'Company Code', type: 'text', required: true },
    { key: 'branch_code', label: 'Branch Code', type: 'text', required: true },
    { key: 'code', label: 'Department Code', type: 'text', required: true },
    { key: 'name', label: 'Department Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'text', required: false },
    { key: 'incharge_name', label: 'Incharge Name & Contact No.', type: 'text', required: true },
    { key: 'incharge_from', label: 'Incharge From Date', type: 'date', required: false },
    { key: 'status', label: 'Status', type: 'text', required: false },
    { key: 'start_date', label: 'Start Date', type: 'date', required: false },
    { key: 'close_date', label: 'Close Date', type: 'date', required: false },
    { key: 'remarks', label: 'Remarks', type: 'text', required: false },
  ];

  maxCompanies = 1;
  errorMessage = '';
  companyFormError = '';
  branchFormError = '';
  departmentFormError = '';
  
  // Field-level error tracking
  fieldErrors: { [key: string]: string } = {};
  touchedFields: { [key: string]: boolean } = {};

  // Document management properties
  companyDocuments: (EntityDocument & { file?: File })[] = [];
  branchDocuments: (EntityDocument & { file?: File })[] = [];
  departmentDocuments: (EntityDocument & { file?: File })[] = [];
  documentTypeOptions: any[] = [];
  
  // Document viewer properties
  isDocumentViewerVisible = false;
  selectedDocument: EntityDocument | null = null;
  documentViewerUrl: string = '';
  safeDocumentViewerUrl: SafeResourceUrl | null = null;
  pdfLoaded: boolean = false;
  pdfError: boolean = false;

  constructor(
    private companyService: CompanyService,
    private branchService: BranchService,
    private departmentService: DepartmentService,
    private http: HttpClient,
    private router: Router,
    private confirmationService: ConfirmationService,
    private configService: ConfigService,
    private entityDocumentService: EntityDocumentService,
    private masterTypeService: MasterTypeService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.fetchMaxCompanies();
    this.loadCompanies();
    this.loadBranches();
    this.loadDocumentTypeOptions();
  }

  fetchMaxCompanies() {
    this.http.get<{ value: number }>('/api/settings/max_companies').subscribe({
      next: (res) => this.maxCompanies = res.value || 1,
      error: () => this.maxCompanies = 1
    });
  }

  loadCompanies() {
    this.companyService.getAll().subscribe({
      next: (companies) => {
        this.companies = companies;
      },
      error: (error) => {
        console.error('Error loading companies:', error);
      }
    });
  }

  // Check if form has unsaved changes
  checkForUnsavedChanges(): boolean {
    if (!this.originalCompanyData || !this.selectedCompany) {
      return false;
    }

    // Compare current form data with original data
    for (const field of this.companyFields) {
      const key = field.key as keyof Company;
      if (this.selectedCompany[key] !== this.originalCompanyData[key]) {
        return true;
      }
    }

    // Check logo changes
    if (this.selectedCompany['logo'] !== this.originalCompanyData['logo']) {
      return true;
    }

    return false;
  }

  navigateToMapping() {
    this.hasUnsavedChanges = this.checkForUnsavedChanges();
    
    if (this.hasUnsavedChanges) {
      this.confirmationService.confirm({
        message: 'Unsaved changes detected. Save the form before navigating to Number Series Mapping?',
        header: 'Unsaved Changes',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Save Changes',
        accept: () => {
          // Save the form first, then navigate
          this.saveCompanyAndNavigate();
        },
        rejectVisible: false ,
      });
    } else {
      // No changes, navigate directly
      this.router.navigate(['/settings/mapping']);
    }
  }

  saveCompanyAndNavigate() {
    if (!this.selectedCompany) {
      this.router.navigate(['/settings/mapping']);
      return;
    }

    this.companyFormError = '';
    // Validate required fields
    const missing = this.companyFields.filter(f => f.required && !this.selectedCompany[f.key]);
    if (missing.length > 0) {
      this.companyFormError = `Please fill all required fields: ${missing.map(f => f.label).join(', ')}`;
      return;
    }
    if (typeof this.selectedCompany.code === 'string') {
      this.selectedCompany.code = this.selectedCompany.code.trim();
      if (this.selectedCompany.code.length >= 10) {
        this.companyFormError = 'Company Code must be atleast 10 characters long.';
        return;
      }
    }

    // Check if the code exists in the loaded companies
    const codeExists = this.companies.some(c => c.code === this.selectedCompany.code);

    if (!codeExists) {
      this.companyService.create(this.selectedCompany).subscribe({
        next: (created) => {
          this.loadCompanies();
          this.router.navigate(['/settings/mapping']);
        },
        error: (err) => {
          console.error('Error creating company:', err);
        }
      });
    } else {
      this.companyService.update(this.selectedCompany.code, this.selectedCompany).subscribe({
        next: () => {
          this.loadCompanies();
          this.router.navigate(['/settings/mapping']);
        },
        error: (err) => {
          console.error('Error updating company:', err);
        }
      });
    }
  }

  loadBranches() {
    this.branchService.getAll().subscribe({
      next: (branches) => {
        this.branches = branches.map(branch => ({
          ...branch,
          departments: []
        }));
        this.loadDepartmentsForBranches();
      },
      error: (error) => {
        console.error('Error loading branches:', error);
      }
    });
  }

  loadDepartmentsForBranches() {
    this.departmentService.getAll().subscribe({
      next: (departments) => {
        // Clear all branch departments first
        this.branches.forEach(branch => branch.departments = []);
        departments.forEach(dept => {
          const branch = this.branches.find(b => b.code === dept.branch_code);
          if (branch) {
            if (!Array.isArray(branch.departments)) {
              branch.departments = [];
            }
            branch.departments.push(dept);
          }
        });
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  openCompanyDialog(data: Company | null = null) {
    this.errorMessage = '';
    this.companyFormError = '';
    this.clearFieldErrors();
    if (data) {
      // Save selected company to localStorage for sidebar logo
      localStorage.setItem('selectedCompany', JSON.stringify(data));
    }
    if (!data && Array.isArray(this.companies) && this.companies.length >= this.maxCompanies) {
      if (this.maxCompanies === 1) {
        this.errorMessage = `You can only create one company.`; // Singular form
      } else {
        this.errorMessage = `You can only create up to ${this.maxCompanies} companies.`; // Plural form
      }
      return;
    }
    
    this.selectedCompany = data ? { ...data } : {} as Company;
    // Store original data for change detection
    this.originalCompanyData = data ? { ...data } : null;
    this.hasUnsavedChanges = false;
    this.displayCompanyDialog = true;
    
    // Load existing documents if editing
    if (data?.code) {
      this.loadCompanyDocuments(data.code);
    } else {
      this.companyDocuments = [];
    }
  }

  closeCompanyDialog() {
    this.displayCompanyDialog = false;
    this.selectedCompany = {} as Company;
    this.originalCompanyData = null;
    this.hasUnsavedChanges = false;
    this.companyFormError = '';
    this.clearFieldErrors();
  }

  saveCompany() {
    if (!this.selectedCompany) return;
    this.companyFormError = '';
    // Validate required fields
    const missing = this.companyFields.filter(f => f.required && !this.selectedCompany[f.key]);
    if (missing.length > 0) {
      this.companyFormError = `Please fill all required fields: ${missing.map(f => f.label).join(', ')}`;
      return;
    }
    if (typeof this.selectedCompany.code === 'string') {
      this.selectedCompany.code = this.selectedCompany.code.trim();
      if (this.selectedCompany.code.length >= 10) {
        this.companyFormError = 'Company Code must be atleast 10 characters long.';
        return;
      }
    }
    console.log('Saving company:', this.selectedCompany);

    // Check if the code exists in the loaded companies
    const codeExists = this.companies.some(c => c.code === this.selectedCompany.code);

    if (!codeExists) {
      this.companyService.create(this.selectedCompany).subscribe({
        next: async (created) => {
          // Save documents after company is created
          await this.saveCompanyDocuments();
          this.loadCompanies();
          this.closeCompanyDialog();
          this.companyFormError = '';
        },
        error: (err) => {
          console.error('Error creating company:', err);
        }
      });
    } else {
      console.log('Updating company with code:', this.selectedCompany.code, 'Payload:', this.selectedCompany);
      this.companyService.update(this.selectedCompany.code, this.selectedCompany).subscribe({
        next: async () => {
          // Save documents after company is updated
          await this.saveCompanyDocuments();
          this.loadCompanies();
          this.closeCompanyDialog();
          this.companyFormError = '';
        },
        error: (err) => {
          console.error('Error updating company:', err);
        }
      });
    }
  }

  openBranchDialog(branch: Branch | null = null) {
    this.selectedBranch = branch ? { ...branch } : { company_code: this.companies[0]?.code || '' } as Branch;
    this.displayBranchDialog = true;
    this.branchFormError = '';
    this.clearFieldErrors();
    
    // Load existing documents if editing
    if (branch?.code) {
      this.loadBranchDocuments(branch.code);
    } else {
      this.branchDocuments = [];
    }
  }

  closeBranchDialog() {
    this.displayBranchDialog = false;
    this.selectedBranch = {} as Branch;
    this.branchFormError = '';
    this.clearFieldErrors();
  }

  saveBranch() {
    if (!this.selectedBranch) return;
    this.branchFormError = '';
    // Validate required fields
    const missing = this.branchFields.filter(f => f.required && !this.selectedBranch[f.key]);
    if (missing.length > 0) {
      this.branchFormError = `Please fill all required fields: ${missing.map(f => f.label).join(', ')}`;
      return;
    }
    if (typeof this.selectedBranch.code === 'string') {
      this.selectedBranch.code = this.selectedBranch.code.trim();
    }
    console.log('Saving branch:', this.selectedBranch);

    // Check if the code exists in the loaded branches
    const codeExists = this.branches.some(b => b.code === this.selectedBranch.code);

    if (!codeExists) {
      this.branchService.create(this.selectedBranch).subscribe({
        next: async (created) => {
          // Save documents after branch is created
          await this.saveBranchDocuments();
          this.loadBranches();
          this.closeBranchDialog();
          this.branchFormError = '';
        },
        error: (err) => {
          console.error('Error creating branch:', err);
        }
      });
    } else {
      console.log('Updating branch with code:', this.selectedBranch.code, 'Payload:', this.selectedBranch);
      this.branchService.update(this.selectedBranch.code, this.selectedBranch).subscribe({
        next: async () => {
          // Save documents after branch is updated
          await this.saveBranchDocuments();
          this.loadBranches();
          this.closeBranchDialog();
          this.branchFormError = '';
        },
        error: (err) => {
          console.error('Error updating branch:', err);
        }
      });
    }
  }

  openDepartmentDialog(branch: Branch, department: Department | null = null) {
    this.currentBranchForDepartment = branch;
    this.selectedDepartment = department
      ? { ...department }
      : { company_code: branch.company_code, branch_code: branch.code } as Department;
    this.displayDepartmentDialog = true;
    this.departmentFormError = '';
    this.clearFieldErrors();
    
    // Load existing documents if editing
    if (department?.code) {
      this.loadDepartmentDocuments(department.code);
    } else {
      this.departmentDocuments = [];
    }
  }

  closeDepartmentDialog() {
    this.displayDepartmentDialog = false;
    this.selectedDepartment = {} as Department;
    this.departmentFormError = '';
    this.clearFieldErrors();
  }

  saveDepartment() {
    if (!this.selectedDepartment) return;
    this.departmentFormError = '';
    // Validate required fields
    const missing = this.departmentFields.filter(f => f.required && !this.selectedDepartment[f.key]);
    if (missing.length > 0) {
      this.departmentFormError = `Please fill all required fields: ${missing.map(f => f.label).join(', ')}`;
      return;
    }
    if (typeof this.selectedDepartment.code === 'string') {
      this.selectedDepartment.code = this.selectedDepartment.code.trim();
    }
    console.log('Saving department:', this.selectedDepartment);

    // Check if the code exists in the loaded departments for this branch
    const branch = this.branches.find(b => b.code === this.selectedDepartment.branch_code);
    const codeExists = branch && branch.departments && branch.departments.some(d => d.code === this.selectedDepartment.code);

    if (!codeExists) {
      this.departmentService.create(this.selectedDepartment).subscribe({
        next: async (created) => {
          // Save documents after department is created
          await this.saveDepartmentDocuments();
          this.loadDepartmentsForBranches();
          this.closeDepartmentDialog();
          this.departmentFormError = '';
        },
        error: (err) => {
          console.error('Error creating department:', err);
        }
      });
    } else {
      console.log('Updating department with code:', this.selectedDepartment.code, 'Payload:', this.selectedDepartment);
      this.departmentService.update(this.selectedDepartment.code, this.selectedDepartment).subscribe({
        next: async () => {
          // Save documents after department is updated
          await this.saveDepartmentDocuments();
          this.loadDepartmentsForBranches();
          this.closeDepartmentDialog();
          this.departmentFormError = '';
        },
        error: (err) => {
          console.error('Error updating department:', err);
        }
      });
    }
  }

  openBranchDialogForCompany(company: Company) {
    this.selectedBranch = { company_code: company.code } as Branch;
    this.displayBranchDialog = true;
    this.clearFieldErrors();
  }

  // Document dialog methods
  openCompanyDocumentDialog() {
    if (this.selectedCompany?.code) {
      this.loadCompanyDocuments(this.selectedCompany.code);
      this.displayCompanyDocumentDialog = true;
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please save the company first before uploading documents' });
    }
  }

  closeCompanyDocumentDialog() {
    this.displayCompanyDocumentDialog = false;
  }

  openBranchDocumentDialog() {
    if (this.selectedBranch?.code) {
      this.loadBranchDocuments(this.selectedBranch.code);
      this.displayBranchDocumentDialog = true;
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please save the branch first before uploading documents' });
    }
  }

  closeBranchDocumentDialog() {
    this.displayBranchDocumentDialog = false;
  }

  openDepartmentDocumentDialog() {
    if (this.selectedDepartment?.code) {
      this.loadDepartmentDocuments(this.selectedDepartment.code);
      this.displayDepartmentDocumentDialog = true;
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please save the department first before uploading documents' });
    }
  }

  closeDepartmentDocumentDialog() {
    this.displayDepartmentDocumentDialog = false;
  }

  onLogoSelected(event: any) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedCompany['logo'] = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  deleteCompany(code: string) {
    this.companyService.delete(code).subscribe({
      next: () => {
        this.loadCompanies();
        // After reloading, check if companies is empty and clear selectedCompany
        setTimeout(() => {
          if (this.companies.length === 0) {
            localStorage.removeItem('selectedCompany');
          }
        }, 100); // Wait for loadCompanies to update the list
      },
      error: (err) => {
        console.error('Error deleting company:', err);
      }
    });
  }

  // Field-level validation methods
  validateField(field: string, value: any): string {
    switch (field) {
      case 'code':
        if (!value || value.trim() === '') return 'Code is required';
        break;
      case 'name':
        if (!value || value.trim() === '') return 'Name is required';
        break;
      case 'gst':
        if (!value || value.trim() === '') return 'GST No. is required';
        break;
      case 'email':
        if (value && value.trim() !== '') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) return 'Please enter a valid email address';
        }
        break;
      case 'website':
        if (value && value.trim() !== '') {
          const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
          if (!urlRegex.test(value)) return 'Please enter a valid website URL';
        }
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
    
    let value: any;
    if (this.displayCompanyDialog && this.selectedCompany) {
      value = this.selectedCompany[field as keyof Company];
    } else if (this.displayBranchDialog && this.selectedBranch) {
      value = this.selectedBranch[field as keyof Branch];
    } else if (this.displayDepartmentDialog && this.selectedDepartment) {
      value = this.selectedDepartment[field as keyof Department];
    }
    
    const error = this.validateField(field, value);
    if (error) {
      this.fieldErrors[field] = error;
    } else {
      delete this.fieldErrors[field];
    }
  }

  getFieldError(field: string): string {
    // Only show error if field has been touched by user
    return this.touchedFields[field] ? (this.fieldErrors[field] || '') : '';
  }

  clearFieldErrors() {
    this.fieldErrors = {};
    this.touchedFields = {};
  }

  // Document management methods
  loadDocumentTypeOptions() {
    this.masterTypeService.getAll().subscribe({
      next: (types: any[]) => {
        this.documentTypeOptions = (types || [])
          .filter(t => t.key === 'DOC_TYPE' && t.status === 'Active')
          .map(t => ({ label: t.value, value: t.value }));
        console.log('Document type options loaded:', this.documentTypeOptions);
      },
      error: (error) => {
        console.error('Error loading document types:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load document types' });
      }
    });
  }

  // Company document methods
  loadCompanyDocuments(companyCode: string) {
    this.entityDocumentService.getByEntityCode('company', companyCode).subscribe({
      next: (documents: any) => {
        this.companyDocuments = documents;
      },
      error: (error: any) => {
        console.error('Error loading company documents:', error);
        this.companyDocuments = [];
      }
    });
  }

  addCompanyDocument() {
    this.companyDocuments.push({
      entity_type: 'company',
      entity_code: this.selectedCompany.code,
      doc_type: '',
      document_number: '',
      valid_from: '',
      valid_till: '',
      file_path: '',
      file_name: '',
      file_size: 0,
      mime_type: ''
    });
  }

  removeCompanyDocument(index: number) {
    const document = this.companyDocuments[index];
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this document?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (document.id) {
          this.entityDocumentService.delete(document.id).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Document deleted' });
              this.companyDocuments.splice(index, 1);
            },
            error: (error: any) => {
              console.error('Error deleting document:', error);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete document' });
            }
          });
        } else {
          this.companyDocuments.splice(index, 1);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Document removed' });
        }
      }
    });
  }

  onCompanyFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.companyDocuments[index].file = file;
      this.companyDocuments[index].file_name = file.name;
      this.companyDocuments[index].file_size = file.size;
      this.companyDocuments[index].mime_type = file.type;
    }
  }

  // Branch document methods
  loadBranchDocuments(branchCode: string) {
    this.entityDocumentService.getByEntityCode('branch', branchCode).subscribe({
      next: (documents: any) => {
        this.branchDocuments = documents;
      },
      error: (error: any) => {
        console.error('Error loading branch documents:', error);
        this.branchDocuments = [];
      }
    });
  }

  addBranchDocument() {
    this.branchDocuments.push({
      entity_type: 'branch',
      entity_code: this.selectedBranch.code,
      doc_type: '',
      document_number: '',
      valid_from: '',
      valid_till: '',
      file_path: '',
      file_name: '',
      file_size: 0,
      mime_type: ''
    });
  }

  removeBranchDocument(index: number) {
    const document = this.branchDocuments[index];
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this document?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (document.id) {
          this.entityDocumentService.delete(document.id).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Document deleted' });
              this.branchDocuments.splice(index, 1);
            },
            error: (error: any) => {
              console.error('Error deleting document:', error);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete document' });
            }
          });
        } else {
          this.branchDocuments.splice(index, 1);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Document removed' });
        }
      }
    });
  }

  onBranchFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.branchDocuments[index].file = file;
      this.branchDocuments[index].file_name = file.name;
      this.branchDocuments[index].file_size = file.size;
      this.branchDocuments[index].mime_type = file.type;
    }
  }

  // Department document methods
  loadDepartmentDocuments(departmentCode: string) {
    this.entityDocumentService.getByEntityCode('department', departmentCode).subscribe({
      next: (documents: any) => {
        this.departmentDocuments = documents;
      },
      error: (error: any) => {
        console.error('Error loading department documents:', error);
        this.departmentDocuments = [];
      }
    });
  }

  addDepartmentDocument() {
    this.departmentDocuments.push({
      entity_type: 'department',
      entity_code: this.selectedDepartment.code,
      doc_type: '',
      document_number: '',
      valid_from: '',
      valid_till: '',
      file_path: '',
      file_name: '',
      file_size: 0,
      mime_type: ''
    });
  }

  removeDepartmentDocument(index: number) {
    const document = this.departmentDocuments[index];
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this document?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (document.id) {
          this.entityDocumentService.delete(document.id).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Document deleted' });
              this.departmentDocuments.splice(index, 1);
            },
            error: (error: any) => {
              console.error('Error deleting document:', error);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete document' });
            }
          });
        } else {
          this.departmentDocuments.splice(index, 1);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Document removed' });
        }
      }
    });
  }

  onDepartmentFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.departmentDocuments[index].file = file;
      this.departmentDocuments[index].file_name = file.name;
      this.departmentDocuments[index].file_size = file.size;
      this.departmentDocuments[index].mime_type = file.type;
    }
  }

  // Document viewer methods
  viewDocument(doc: EntityDocument) {
    if (!doc.id) return;
    
    this.selectedDocument = doc;
    this.isDocumentViewerVisible = true;
    this.pdfLoaded = false;
    this.pdfError = false;
    
    this.entityDocumentService.view(doc.id).subscribe({
      next: (blob: any) => {
        this.documentViewerUrl = window.URL.createObjectURL(blob);
        this.safeDocumentViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.documentViewerUrl);
        
        if (doc.mime_type === 'application/pdf') {
          this.pdfLoaded = true;
        } else {
          setTimeout(() => {
            this.pdfLoaded = true;
          }, 300);
        }
      },
      error: (error: any) => {
        console.error('Error viewing document:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to view document' });
        this.hideDocumentViewer();
      }
    });
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
      },
      error: (error: any) => {
        console.error('Error downloading document:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to download document' });
      }
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
    
    if (this.documentViewerUrl.startsWith('blob:')) {
      return '';
    }
    
    const encodedUrl = encodeURIComponent(this.documentViewerUrl);
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
  }

  getSafeOfficeViewerUrl(): SafeResourceUrl | null {
    const url = this.getOfficeViewerUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  }

  openDocumentInNewTab() {
    if (this.selectedDocument?.id) {
      const serverUrl = `${window.location.origin}/api/entity-documents/${this.selectedDocument.id}/view`;
      window.open(serverUrl, '_blank');
    }
  }

  onPdfLoad() {
    this.pdfLoaded = true;
    this.pdfError = false;
  }

  onPdfError() {
    this.pdfError = true;
    this.pdfLoaded = false;
  }

  // Document saving methods
  async saveCompanyDocuments() {
    if (!this.selectedCompany?.code) return;

    const documentsToUpload = this.companyDocuments.filter(doc => doc.file && !doc.id && doc.doc_type);
    const documentsWithoutDocType = this.companyDocuments.filter(doc => doc.file && !doc.id && !doc.doc_type);
    
    if (documentsWithoutDocType.length > 0) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Validation Error', 
        detail: 'Please select document type for all documents before saving' 
      });
      return;
    }

    const uploadPromises = documentsToUpload.map(doc => {
      const formData = new FormData();
      formData.append('entity_type', 'company');
      formData.append('entity_code', this.selectedCompany.code);
      formData.append('entity_name', `${this.selectedCompany.code} - ${this.selectedCompany.name}`);
      formData.append('doc_type', doc.doc_type);
      formData.append('document_number', doc.document_number || '');
      formData.append('valid_from', doc.valid_from || '');
      formData.append('valid_till', doc.valid_till || '');
      formData.append('document', doc.file!);

      return this.entityDocumentService.uploadDocument(formData).toPromise();
    });

    await Promise.all(uploadPromises);
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Documents saved successfully' });
  }

  async saveBranchDocuments() {
    if (!this.selectedBranch?.code) return;

    const documentsToUpload = this.branchDocuments.filter(doc => doc.file && !doc.id && doc.doc_type);
    const documentsWithoutDocType = this.branchDocuments.filter(doc => doc.file && !doc.id && !doc.doc_type);
    
    if (documentsWithoutDocType.length > 0) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Validation Error', 
        detail: 'Please select document type for all documents before saving' 
      });
      return;
    }

    const uploadPromises = documentsToUpload.map(doc => {
      const formData = new FormData();
      formData.append('entity_type', 'branch');
      formData.append('entity_code', this.selectedBranch.code);
      formData.append('entity_name', `${this.selectedBranch.code} - ${this.selectedBranch.name}`);
      formData.append('doc_type', doc.doc_type);
      formData.append('document_number', doc.document_number || '');
      formData.append('valid_from', doc.valid_from || '');
      formData.append('valid_till', doc.valid_till || '');
      formData.append('document', doc.file!);

      return this.entityDocumentService.uploadDocument(formData).toPromise();
    });

    await Promise.all(uploadPromises);
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Documents saved successfully' });
  }

  async saveDepartmentDocuments() {
    if (!this.selectedDepartment?.code) return;

    const documentsToUpload = this.departmentDocuments.filter(doc => doc.file && !doc.id && doc.doc_type);
    const documentsWithoutDocType = this.departmentDocuments.filter(doc => doc.file && !doc.id && !doc.doc_type);
    
    if (documentsWithoutDocType.length > 0) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Validation Error', 
        detail: 'Please select document type for all documents before saving' 
      });
      return;
    }

    const uploadPromises = documentsToUpload.map(doc => {
      const formData = new FormData();
      formData.append('entity_type', 'department');
      formData.append('entity_code', this.selectedDepartment.code);
      formData.append('entity_name', `${this.selectedDepartment.code} - ${this.selectedDepartment.name}`);
      formData.append('doc_type', doc.doc_type);
      formData.append('document_number', doc.document_number || '');
      formData.append('valid_from', doc.valid_from || '');
      formData.append('valid_till', doc.valid_till || '');
      formData.append('document', doc.file!);

      return this.entityDocumentService.uploadDocument(formData).toPromise();
    });

    await Promise.all(uploadPromises);
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Documents saved successfully' });
  }
}
