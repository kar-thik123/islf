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
import { ServiceTypeService, ServiceType } from '../../../services/servicetype.service';
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
import { AccountDetailsService, AccountDetail } from '../../../services/account-details.service';
import { InchargeService, Incharge } from '../../../services/incharge.service';


@Component({
  selector: 'app-company-hierarchy',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, InputTextModule, ButtonModule, TableModule, DropdownModule, ToastModule, TabsModule, ConfirmDialogModule, ConfigDatePipe],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="md:w-full">
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <div class="font-semibold text-xl">Company Management</div>
          <button pButton label="View Hierarchy Tree" icon="pi pi-sitemap" class="p-button-outlined" (click)="navigateToTree()"></button>
        </div>
        <p-tabs [value]="tabIndex">
          <p-tablist>
            <p-tab [value]="0">Company</p-tab>
            <p-tab [value]="1">Branches</p-tab>
            <p-tab [value]="2">Departments</p-tab>
            <p-tab [value]="3">Service Types</p-tab>
          
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
                  <p class="text-sm mt-1 ">{{ company.register_address }}<span *ngIf="company.head_office_address">, {{ company.head_office_address }}</span></p>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 text-sm">
                  <div><strong>GST:</strong> {{ company.gst }}</div>
                  <div><strong>Phone:</strong> {{ company.phone }}</div>
                  <div><strong>Landline:</strong> {{ company.landline }}</div>
                  <div><strong>Email:</strong> {{ company.email }}</div>
                  <div><strong>Website:</strong> {{ company.website }}</div>
                  <div><strong>PAN:</strong> {{ company.pan_number }}</div>
                  <div><strong>Register No:</strong> {{ company.register_number }}</div>
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
                    <div class="text-right text-sm font-medium">Code: {{ branch.code }}</div>
                  </div>

                    <div class="grid grid-cols-2 p-4 gap-2 text-sm bg-white">
                      <div class="col-span-2 "><strong>Incharge:</strong> {{ branch.incharge_name }}</div>
                      <div><strong>GST:</strong> {{ branch.gst }}</div>
                      <div class ="col-span-2"><strong>Address:</strong> {{ branch.address }}</div>
                      <div><strong>Start:</strong> {{ branch.start_date | configDate }}</div>
                      <div><strong>Close:</strong> {{ branch.close_date ? (branch.close_date | configDate) : '-' }}</div>
                      <div><strong>Status:</strong> {{ branch.status }}</div>
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
                      <div class="flex items-center gap-2">
                        <button pButton 
                                [icon]="isBranchExpanded(branch.code) ? 'pi pi-chevron-down' : 'pi pi-chevron-right'" 
                                class="p-button-text p-button-sm" 
                                (click)="toggleBranchExpansion(branch.code); $event.stopPropagation()"
                                pTooltip="Toggle Departments">
                        </button>
                        <div>
                          <div class="font-bold text-lg">{{ branch.name }}</div>
                          <div class="text-xs text-gray-500">Incharge: {{ branch.incharge_name }}</div>
                        </div>
                      </div>
                      <button pButton icon="pi pi-plus" label="Add Department" class="p-button-sm p-button-success" (click)="openDepartmentDialog(branch)"></button>
                    </div>
                  </div>
                  
                  <!-- Departments Section - Expandable -->
                  <div *ngIf="isBranchExpanded(branch.code)">
                    <h3 class="text-xl font-semibold mt-6 mb-6 ml-[2px]">Departments</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      <div *ngFor="let dept of branch.departments" class="bg-white border rounded-xl shadow hover:shadow-md transition-all cursor-pointer" (click)="openDepartmentDialog(branch, dept); $event.stopPropagation()">
                        <div class="branch-header">
                          <div class="col-span-full flex justify-between items-center w-full">
                            <div class="text-lg font-bold uppercase">{{ dept.name }}</div>
                            <div class="text-sm font-medium">Code: {{ dept.code }}</div>
                          </div>
                        </div>
                          <div class="grid grid-cols-2 p-4 gap-2 text-sm bg-white">
                            <div class="col-span-2"><strong>Incharge:</strong> {{dept.incharge_name }}</div>
                            <div><strong>GST:</strong> {{ dept.gst }}</div>
                            <div><strong>Start:</strong> {{ dept.start_date | configDate }}</div>
                            <div><strong>Close:</strong> {{ dept.close_date ? (dept.close_date | configDate) : '-' }}</div>
                             <div><strong>Status:</strong> {{ dept.status }}</div>
                            <div class="col-span-2"><strong>Remarks:</strong> {{ dept.remarks }}</div>
                            <div class="col-span-2"><strong>Description:</strong>{{ dept.description }}</div>
                          
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </p-tabpanel>
            <p-tabpanel [value]="3">
              <!-- Service Type Section: Show all companies, each with their branches, departments and service types -->
              <div *ngFor="let company of companies" class="mb-8">
                <div class="mb-4 border rounded p-4 bg-blue-50">
                  <div class="font-bold text-lg">{{ company.name }}</div>
                  <div class="text-xs text-gray-500">Code: {{ company.code }}</div>
                </div>
                <div *ngFor="let branch of getBranchesForCompany(company.code)" class="mb-8">
                  <div class="w-full border rounded-xl shadow bg-green-50 p-4 mb-2">
                    <div class="flex items-center gap-2">
                      <button pButton 
                              [icon]="isBranchExpanded(branch.code) ? 'pi pi-chevron-down' : 'pi pi-chevron-right'" 
                              class="p-button-text p-button-sm" 
                              (click)="toggleBranchExpansion(branch.code); $event.stopPropagation()"
                              pTooltip="Toggle Departments">
                      </button>
                      <div>
                        <div class="font-bold text-lg">{{ branch.name }}</div>
                        <div class="text-xs text-gray-500">Incharge: {{ branch.incharge_name }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Departments Section - Expandable -->
                  <div *ngIf="isBranchExpanded(branch.code)">
                    <div *ngFor="let dept of branch.departments" class="mb-6">
                      <div class="w-full border rounded-xl shadow bg-yellow-50 p-4 mb-2">
                        <div class="flex justify-between items-center">
                          <div class="flex items-center gap-2">
                            <button pButton 
                                    [icon]="isDepartmentExpanded(dept.code) ? 'pi pi-chevron-down' : 'pi pi-chevron-right'" 
                                    class="p-button-text p-button-sm" 
                                    (click)="toggleDepartmentExpansion(dept.code); $event.stopPropagation()"
                                    pTooltip="Toggle Service Types">
                            </button>
                            <div>
                              <div class="font-bold text-lg">{{ dept.name }}</div>
                              <div class="text-xs text-gray-500">Incharge: {{ dept.incharge_name }}</div>
                            </div>
                          </div>
                          <button pButton icon="pi pi-plus" label="Add Service Type" class="p-button-sm p-button-success" (click)="openServiceTypeDialog(dept)"></button>
                        </div>
                      </div>
                      
                      <!-- Service Types Section - Expandable -->
                      <div *ngIf="isDepartmentExpanded(dept.code)">
                        <h3 class="text-xl font-semibold mt-6 mb-6 ml-[2px]">Service Types</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          <div *ngFor="let serviceType of dept.serviceTypes" class="bg-white border rounded-xl shadow hover:shadow-md transition-all cursor-pointer" (click)="openServiceTypeDialog(dept, serviceType); $event.stopPropagation()">
                            <div class="branch-header">
                              <div class="col-span-full flex justify-between items-center w-full">
                                <div class="text-lg font-bold uppercase">{{ serviceType.name }}</div>
                                <div class="text-sm font-medium">Code: {{ serviceType.code }}</div>
                              </div>
                            </div>
                            <div class="grid grid-cols-2 p-4 gap-2 text-sm bg-white">
                                <div class="col-span-2"><strong>Incharge:</strong> {{ serviceType.incharge_name }}</div>
                                <div><strong>Start:</strong> {{ serviceType.start_date | configDate }}</div>
                                <div><strong>Close:</strong> {{ serviceType.close_date ? (serviceType.close_date | configDate) : '-' }}</div>
                                <div><strong>Status:</strong> {{ serviceType.status }}</div>
                                <div class="col-span-2"><strong>Remarks:</strong> {{ serviceType.remarks }}</div>
                                <div class="col-span-2"><strong>Description:</strong> {{ serviceType.description }}</div>
                              
                            </div>
                          </div>
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
                  [disabled]="field.key === 'code' && isCompanyCodeDisabled()"
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
            <div class="flex justify-between items-center">
              <button pButton label="Upload Documents" icon="pi pi-upload" class="p-button-outlined mr-2" (click)="openCompanyDocumentDialog()"></button>
               <button pButton label="Manage Directors/Partners" icon="pi pi-users" class="p-button-outlined p-button-sm" type="button" (click)="openDirectorsPartnersListDialog()"></button>
              <button pButton label="Account Details" icon="pi pi-credit-card" class="p-button-outlined mr-2" (click)="openAccountDetailDialog('company', selectedCompany.code)"></button>
            </div>
          </div>

          </form>
        
        
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
                
                <!-- Conditional rendering for dropdown fields -->
                <p-dropdown 
                  *ngIf="field.type === 'dropdown'"
                  [options]="field.options" 
                  [(ngModel)]="selectedBranch[field.key]" 
                  [name]="field.key"
                  placeholder="Select {{ field.label }}"
                  optionLabel="label" 
                  optionValue="value"
                  class="w-full"
                  [class.border-red-500]="getFieldError(field.key)"
                  (ngModelChange)="onFieldChange(field.key, $event)"
                  (onBlur)="onFieldBlur(field.key)">
                </p-dropdown>
                
                <!-- Regular input for non-dropdown fields -->
                <input 
                  *ngIf="field.type !== 'dropdown'"
                  [type]="field.type" 
                  pInputText 
                  class="w-full" 
                  [class.border-red-500]="getFieldError(field.key)"
                  [(ngModel)]="selectedBranch[field.key]" 
                  [name]="field.key"
                  [disabled]="(field.key === 'code' && isBranchCodeDisabled()) || (field.key === 'company_code' && isBranchCompanyCodeDisabled()) || (field.disabled === true)"
                  (ngModelChange)="onFieldChange(field.key, $event)"
                  (blur)="onFieldBlur(field.key)"
                  (click)="field.key === 'incharge_name' ? openInchargeDialog('branch', selectedBranch.code) : null"
                  (focus)="field.key === 'incharge_name' ? openInchargeDialog('branch', selectedBranch.code) : null" />
                
                <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError(field.key)">{{ getFieldError(field.key) }}</small>
              </div>
            </ng-container>

            <!-- Document Upload Button -->
            <div class="col-span-2">
              <hr class="w-full border-t border-gray-300 my-4" />
              <div class="flex justify-between items-center">
                <button pButton label="Upload Documents" icon="pi pi-upload" class="p-button-outlined mr-2" (click)="openBranchDocumentDialog()"></button>
                <button pButton label="Incharge" icon="pi pi-user" class="p-button-outlined mr-2" (click)="openInchargeDialog('branch', selectedBranch.code)"></button>
                <button pButton label="Account Details" icon="pi pi-credit-card" class="p-button-outlined" (click)="openAccountDetailDialog('branch', selectedBranch.code)"></button>
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
                
                <!-- Conditional rendering for dropdown fields -->
                <p-dropdown 
                  *ngIf="field.type === 'dropdown'"
                  [options]="field.options" 
                  [(ngModel)]="selectedDepartment[field.key]" 
                  [name]="field.key"
                  [disabled]="field.disabled ?? false"
                  placeholder="Select {{ field.label }}"
                  optionLabel="label" 
                  optionValue="value"
                  class="w-full"
                  [class.border-red-500]="getFieldError(field.key)"
                  (ngModelChange)="onFieldChange(field.key, $event)"
                  (onBlur)="onFieldBlur(field.key)">
                </p-dropdown>
                
                <!-- Regular input for non-dropdown fields -->
                <input 
                  *ngIf="field.type !== 'dropdown'"
                  [type]="field.type" 
                  pInputText 
                  class="w-full" 
                  [class.border-red-500]="getFieldError(field.key)"
                  [(ngModel)]="selectedDepartment[field.key]" 
                  [name]="field.key"
                  [disabled]="(field.key === 'code' && isDepartmentCodeDisabled()) || (field.key === 'branch_code' && isDepartmentBranchCodeDisabled()) || (field.key === 'company_code' && isDepartmentCompanyCodeDisabled() ) || (field.disabled === true)"
                  (ngModelChange)="onFieldChange(field.key, $event)"
                  (blur)="onFieldBlur(field.key)"
                  (click)="field.key === 'incharge_name' ? openInchargeDialog('department', selectedDepartment.code) : null"
                  (focus)="field.key === 'incharge_name' ? openInchargeDialog('department', selectedDepartment.code) : null" />
                
                <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError(field.key)">{{ getFieldError(field.key) }}</small>
              </div>
            </ng-container>

            <!-- Document Upload Button -->
            <div class="col-span-2">
              <hr class="w-full border-t border-gray-300 my-4" />
              <div class="flex justify-between items-center">
                <button pButton label="Upload Documents" icon="pi pi-upload" class="p-button-outlined mr-2" (click)="openDepartmentDocumentDialog()"></button>
                <button pButton label="Incharge" icon="pi pi-user" class="p-button-outlined mr-2" (click)="openInchargeDialog('department', selectedDepartment.code)"></button>
                <button pButton label="Account Details" icon="pi pi-credit-card" class="p-button-outlined" (click)="openAccountDetailDialog('department', selectedDepartment.code)"></button>
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
        <p-dialog header="{{ selectedServiceType?.code ? 'Edit' : 'Add' }} Service Type" [(visible)]="displayServiceTypeDialog" [modal]="true" [style]="{ width: '700px' }" [closable]="false">
          <form class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div *ngIf="serviceTypeFormError" class="text-red-600 mb-2">{{ serviceTypeFormError }}</div>
            <ng-container *ngFor="let field of serviceTypeFields">
              <div>
                <label class="block mb-1 font-medium">
                  {{ field.label }}
                  <span *ngIf="field.required" class="text-red-600">*</span>
                </label>
                
                <!-- Conditional rendering for dropdown fields -->
                <p-dropdown 
                  *ngIf="field.type === 'dropdown'"
                  [options]="field.options" 
                  [(ngModel)]="selectedServiceType[field.key]" 
                  [name]="field.key"
                  placeholder="Select {{ field.label }}"
                  optionLabel="label" 
                  optionValue="value"
                  class="w-full"
                  [class.border-red-500]="getFieldError(field.key)"
                  (ngModelChange)="onFieldChange(field.key, $event)"
                  (onBlur)="onFieldBlur(field.key)">
                </p-dropdown>
                
                <!-- Regular input for non-dropdown fields -->
                <input 
                  *ngIf="field.type !== 'dropdown'"
                  [type]="field.type" 
                  pInputText 
                  class="w-full" 
                  [class.border-red-500]="getFieldError(field.key)"
                  [(ngModel)]="selectedServiceType[field.key]" 
                  [name]="field.key"
                  [disabled]="(field.key === 'code' && isServiceTypeCodeDisabled()) || (field.key === 'department_code' && isServiceTypeDepartmentCodeDisabled()) || (field.key === 'branch_code' && isServiceTypeBranchCodeDisabled()) || (field.key === 'company_code' && isServiceTypeCompanyCodeDisabled())"
                  (ngModelChange)="onFieldChange(field.key, $event)"
                  (blur)="onFieldBlur(field.key)"
                  (click)="field.key === 'incharge_name' ? openInchargeDialog('service_type', selectedServiceType.code) : null"
                  (focus)="field.key === 'incharge_name' ? openInchargeDialog('service_type', selectedServiceType.code) : null" />
                
                <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError(field.key)">{{ getFieldError(field.key) }}</small>
              </div>
            </ng-container>


          </form>
          <ng-template pTemplate="footer">
            <div class="text-right">
              <button pButton label="Cancel" class="p-button-secondary mr-2" (click)="closeServiceTypeDialog()"></button>
              <button pButton label="Save" class="p-button-primary" type="button" (click)="saveServiceType()"></button>
            </div>
          </ng-template>
        </p-dialog>
      </div>
      
      <!-- Company Document Dialog -->
      <p-dialog 
        header="Company Documents" 
        [(visible)]="displayCompanyDocumentDialog" 
        [modal]="true" 
        [style]="{ width: '1200px' }" 
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
                  <p-dropdown [options]="companyDocumentTypeOptions" [(ngModel)]="document.doc_type" optionLabel="label" optionValue="value" placeholder="Select Document Type"></p-dropdown>
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
        [style]="{ width: '1200px' }" 
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
                  <p-dropdown [options]="branchDocumentTypeOptions" [(ngModel)]="document.doc_type" optionLabel="label" optionValue="value" placeholder="Select Document Type"></p-dropdown>
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
        [style]="{ width: '1200px' }" 
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
                  <p-dropdown [options]="departmentDocumentTypeOptions" [(ngModel)]="document.doc_type" optionLabel="label" optionValue="value" placeholder="Select Document Type"></p-dropdown>
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
      

      <!-- Account Details List Dialog -->
      <p-dialog 
        header="Account Details" 
        [(visible)]="displayAccountDetailListDialog" 
        [modal]="true" 
        [style]="{ width: '1200px' }" 
        [closable]="false">
        <div class="space-y-4">
          <p-table [value]="accountDetails" [showGridlines]="true" [responsiveLayout]="'scroll'">
            <ng-template pTemplate="header">
              <tr>
                <th>BENEFICIARY</th>
                <th>BANK NAME</th>
                <th>ACCOUNT NUMBER</th>
                <th>ACCOUNT TYPE</th>
                <th>BRANCH CODE</th>
                <th>RTGS/NEFT CODE</th>
                <th>SWIFT CODE</th>
                <th>Action</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-account>
              <tr [class.bg-yellow-50]="account.is_primary" 
                  [class.border-l-2]="account.is_primary" 
                  [class.border-yellow-400]="account.is_primary"
                  [class.font-semibold]="account.is_primary">
                <td>
                  <div class="flex items-center">
                    <i class="pi pi-star text-yellow-500 mr-2" *ngIf="account.is_primary"></i>
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
                  <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm mr-1" (click)="openAccountDetailFormDialog(currentEntityType, currentEntityCode, account)"></button>
                  <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger" (click)="deleteAccountDetail(account)"></button>
                </td>
              </tr>
            </ng-template>
          </p-table>
          
          <button pButton label="Add Account Detail" icon="pi pi-plus" class="p-button-primary mt-4" (click)="openAccountDetailFormDialog(currentEntityType, currentEntityCode)"></button>
        </div>
        
        <ng-template pTemplate="footer">
          <div class="text-right">
            <button pButton label="Close" class="p-button-secondary" (click)=" closeAccountDetailListDialog()"></button>
          </div>
        </ng-template>
      </p-dialog>

      <!-- Account Detail Form Dialog -->
      <p-dialog 
        header="{{ selectedAccountDetail?.id ? 'Edit' : 'Add' }} Account Detail" 
        [(visible)]="displayAccountDetailFormDialog" 
        [modal]="true" 
        [style]="{ width: '700px' }" 
        [closable]="false">
        <form class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div *ngIf="accountDetailFormError" class="col-span-2 text-red-600 mb-2">{{ accountDetailFormError }}</div>
          
          <!-- Beneficiary -->
          <div>
            <label class="block mb-1 font-medium">
              Beneficiary
              <span class="text-red-600">*</span>
            </label>
            <input 
              type="text" 
              pInputText 
              class="w-full" 
              [class.border-red-500]="getFieldError('beneficiary')"
              [(ngModel)]="selectedAccountDetail['beneficiary']" 
              name="beneficiary"
              (ngModelChange)="onFieldChange('beneficiary', $event)"
              (blur)="onFieldBlur('beneficiary')" />
            <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('beneficiary')">{{ getFieldError('beneficiary') }}</small>
          </div>

          <!-- Bank Name -->
          <div>
            <label class="block mb-1 font-medium">
              Bank Name
              <span class="text-red-600">*</span>
            </label>
            <input 
              type="text" 
              pInputText 
              class="w-full" 
              [class.border-red-500]="getFieldError('bank_name')"
              [(ngModel)]="selectedAccountDetail['bank_name']" 
              name="bank_name"
              (ngModelChange)="onFieldChange('bank_name', $event)"
              (blur)="onFieldBlur('bank_name')" />
            <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('bank_name')">{{ getFieldError('bank_name') }}</small>
          </div>

          <!-- Account Number -->
          <div>
            <label class="block mb-1 font-medium">
              Account Number
              <span class="text-red-600">*</span>
            </label>
            <input 
              type="text" 
              pInputText 
              class="w-full" 
              [class.border-red-500]="getFieldError('account_number')"
              [(ngModel)]="selectedAccountDetail['account_number']" 
              name="account_number"
              (ngModelChange)="onFieldChange('account_number', $event)"
              (blur)="onFieldBlur('account_number')" />
            <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('account_number')">{{ getFieldError('account_number') }}</small>
          </div>

          <!-- Bank Branch Code -->
          <div>
            <label class="block mb-1 font-medium">
              Bank Branch Code
            </label>
            <input 
              type="text" 
              pInputText 
              class="w-full" 
              [class.border-red-500]="getFieldError('bank_branch_code')"
              [(ngModel)]="selectedAccountDetail['bank_branch_code']" 
              name="bank_branch_code"
              (ngModelChange)="onFieldChange('bank_branch_code', $event)"
              (blur)="onFieldBlur('bank_branch_code')" />
            <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('bank_branch_code')">{{ getFieldError('bank_branch_code') }}</small>
          </div>

          <!-- RTGS/NEFT Code -->
          <div>
            <label class="block mb-1 font-medium">
              RTGS/NEFT Code
            </label>
            <input 
              type="text" 
              pInputText 
              class="w-full" 
              [class.border-red-500]="getFieldError('rtgs_neft_code')"
              [(ngModel)]="selectedAccountDetail['rtgs_neft_code']" 
              name="rtgs_neft_code"
              (ngModelChange)="onFieldChange('rtgs_neft_code', $event)"
              (blur)="onFieldBlur('rtgs_neft_code')" />
            <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('rtgs_neft_code')">{{ getFieldError('rtgs_neft_code') }}</small>
          </div>

          <!-- Account Type -->
          <div>
            <label class="block mb-1 font-medium">
              Account Type
            </label>
            <input 
              type="text" 
              pInputText 
              class="w-full" 
              [class.border-red-500]="getFieldError('account_type')"
              [(ngModel)]="selectedAccountDetail['account_type']" 
              name="account_type"
              (ngModelChange)="onFieldChange('account_type', $event)"
              (blur)="onFieldBlur('account_type')" />
            <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('account_type')">{{ getFieldError('account_type') }}</small>
          </div>

          <!-- Swift Code -->
          <div>
            <label class="block mb-1 font-medium">
              Swift Code
            </label>
            <input 
              type="text" 
              pInputText 
              class="w-full" 
              [class.border-red-500]="getFieldError('swift_code')"
              [(ngModel)]="selectedAccountDetail['swift_code']" 
              name="swift_code"
              (ngModelChange)="onFieldChange('swift_code', $event)"
              (blur)="onFieldBlur('swift_code')" />
            <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('swift_code')">{{ getFieldError('swift_code') }}</small>
          </div>

          <!-- Primary Account Selection -->
          <div>
            <label class="block mb-1 font-medium">
              Primary Account
            </label>
            <p-dropdown 
              [options]="primaryOptions" 
              [(ngModel)]="selectedAccountDetail['is_primary']" 
              name="is_primary"
              placeholder="Select Primary Status"
              optionLabel="label" 
              optionValue="value"
              class="w-full"
              (ngModelChange)="onFieldChange('is_primary', $event)"
              (onBlur)="onFieldBlur('is_primary')">
            </p-dropdown>
            <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('is_primary')">{{ getFieldError('is_primary') }}</small>
          </div>

          <!-- Bank Address (with proper border styling) -->
          <div class="col-span-2">
            <label class="block mb-1 font-medium">
              Bank Address
            </label>
            <textarea 
              pInputTextarea 
              class="w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:outline-none" 
              [class.border-red-500]="getFieldError('bank_address')"
              [(ngModel)]="selectedAccountDetail['bank_address']" 
              name="bank_address"
              rows="3"
              placeholder="Enter bank address"
              (ngModelChange)="onFieldChange('bank_address', $event)"
              (blur)="onFieldBlur('bank_address')">
            </textarea>
            <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('bank_address')">{{ getFieldError('bank_address') }}</small>
          </div>
        </form>
        
        <ng-template pTemplate="footer">
          <div class="text-right">
            <button pButton label="Cancel" class="p-button-secondary mr-2" (click)="closeAccountDetailFormDialog()"></button>
            <button pButton label="Save" class="p-button-primary" type="button" (click)="saveAccountDetail()"></button>
          </div>
        </ng-template>
      </p-dialog>

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

      <!-- Incharge List Dialog -->
      <p-dialog 
        header="Incharge Management" 
        [(visible)]="displayInchargeListDialog" 
        [modal]="true" 
        [style]="{ width: '800px' }" 
        [closable]="false">
        <div class="space-y-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Incharge Records</h3>
            <button pButton label="Add Incharge" icon="pi pi-plus" class="p-button-primary" (click)="openInchargeFormDialog()"></button>
          </div>
          
          <p-table [value]="inchargeRecords" [showGridlines]="true" [responsiveLayout]="'scroll'">
            <ng-template pTemplate="header">
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Actions</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-incharge>
              <tr>
                <td>{{ incharge.incharge_name }}</td>
                <td>{{ incharge.phone_number }}</td>
                <td>{{ incharge.email }}</td>
                <td>
                  <span [class]="incharge.status === 'active' ? 'text-green-600 font-semibold' : 'text-red-600'">
                    {{ incharge.status | titlecase }}
                  </span>
                </td>
                <td>{{ incharge.from_date | date:'shortDate' }}</td>
                <td>{{ incharge.to_date | date:'shortDate' }}</td>
                <td>
                  <div class="flex gap-1">
                    <button pButton icon="pi pi-pencil" class="p-button-sm p-button-outlined" (click)="openInchargeFormDialog(incharge)" pTooltip="Edit"></button>
                    <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="deleteIncharge(incharge)" pTooltip="Delete"></button>
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="7" class="text-center py-4">No incharge records found</td>
              </tr>
            </ng-template>
          </p-table>
        </div>
        <ng-template pTemplate="footer">
          <div class="text-right">
            <button pButton label="Close" class="p-button-secondary" (click)="closeInchargeListDialog()"></button>
          </div>
        </ng-template>
      </p-dialog>

      <!-- Incharge Form Dialog -->
      <p-dialog 
        [header]="selectedIncharge?.id ? 'Edit Incharge' : 'Add Incharge'" 
        [(visible)]="displayInchargeFormDialog" 
        [modal]="true" 
        [style]="{ width: '500px' }" 
        [closable]="false">
        <form class="space-y-4">
          <div *ngIf="inchargeFormError" class="text-red-600 mb-2">{{ inchargeFormError }}</div>
          
          <ng-container *ngFor="let field of inchargeFields">
            <div>
              <label class="block mb-1 font-medium">
                {{ field.label }}
                <span *ngIf="field.required" class="text-red-600">*</span>
              </label>
              
              <!-- Dropdown for dropdown type fields -->
              <p-dropdown 
                *ngIf="field.type === 'dropdown'"
                [options]="field.options" 
                class="w-full" 
                [ngModel]="getInchargeFieldValue(field.key)"
                (ngModelChange)="setInchargeFieldValue(field.key, $event)"
                [name]="field.key"
                optionLabel="label" 
                optionValue="value" 
                placeholder="Select {{ field.label }}">
              </p-dropdown>
              
              <!-- Regular input for non-dropdown fields -->
              <input 
                *ngIf="field.type !== 'dropdown'"
                [type]="field.type" 
                pInputText 
                class="w-full" 
                [ngModel]="getInchargeFieldValue(field.key)"
                (ngModelChange)="setInchargeFieldValue(field.key, $event)"
                [name]="field.key"
                [disabled]="field.key === 'entity_type' || field.key === 'entity_code'" />
            </div>
          </ng-container>
        </form>
        <ng-template pTemplate="footer">
          <div class="text-right">
            <button pButton label="Cancel" class="p-button-secondary mr-2" (click)="closeInchargeFormDialog()"></button>
            <button pButton label="Save" class="p-button-primary" (click)="saveIncharge()"></button>
          </div>
        </ng-template>
      </p-dialog>

      <!-- Directors/Partners List Dialog -->
      <p-dialog 
        header="Directors / Partners Management" 
        [(visible)]="displayDirectorsPartnersListDialog" 
        [modal]="true" 
        [style]="{ width: '900px' }" 
        [closable]="false">
        <div class="space-y-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Directors / Partners Records</h3>
            <button pButton label="Add Director/Partner" icon="pi pi-plus" class="p-button-primary" (click)="openDirectorPartnerFormDialog()"></button>
          </div>
          
          <p-table [value]="directorsPartners" [showGridlines]="true" [responsiveLayout]="'scroll'">
            <ng-template pTemplate="header">
              <tr>
                <th>DIN/PAN</th>
                <th>Name</th>
                <th>Designation</th>
                <th>Date of Appointment</th>
                <th>Cessation Date</th>
                <th>Signatory</th>
                <th>Actions</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-director>
              <tr>
                <td>{{ director.din_pan }}</td>
                <td>{{ director.incharge_name }}</td>
                <td>{{ director.designation }}</td>
                <td>{{ director.appointment_date | date:'shortDate' }}</td>
                <td>{{ director.cessation_date ? (director.cessation_date | date:'shortDate') : '-' }}</td>
                <td>
                  <span [class]="director.signatory ? 'text-green-600 font-semibold' : 'text-gray-600'">
                    {{ director.signatory ? 'Yes' : 'No' }}
                  </span>
                </td>
                <td>
                  <div class="flex gap-1">
                    <button pButton icon="pi pi-pencil" class="p-button-sm p-button-outlined" (click)="openDirectorPartnerFormDialog(director)" pTooltip="Edit"></button>
                    <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="deleteDirectorPartner(director)" pTooltip="Delete"></button>
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="7" class="text-center py-4">No directors/partners records found</td>
              </tr>
            </ng-template>
          </p-table>
        </div>
        <ng-template pTemplate="footer">
          <div class="text-right">
            <button pButton label="Close" class="p-button-secondary" (click)="closeDirectorsPartnersListDialog()"></button>
          </div>
        </ng-template>
      </p-dialog>

      <!-- Director/Partner Form Dialog -->
      <p-dialog 
        [header]="selectedDirectorPartner?.id ? 'Edit Director/Partner' : 'Add Director/Partner'" 
        [(visible)]="displayDirectorPartnerFormDialog" 
        [modal]="true" 
        [style]="{ width: '500px' }" 
        [closable]="false">
        <form class="space-y-4">
          <div *ngIf="directorPartnerFormError" class="text-red-600 mb-2">{{ directorPartnerFormError }}</div>
          
          <ng-container *ngFor="let field of directorsPartnersFields">
            <div>
              <label class="block mb-1 font-medium">
                {{ field.label }}
                <span *ngIf="field.required" class="text-red-600">*</span>
              </label>
              
              <!-- Dropdown for dropdown type fields -->
              <p-dropdown 
                *ngIf="field.type === 'dropdown'"
                [options]="field.options" 
                appendTo="body"
                class="w-full" 
                [ngModel]="getDirectorPartnerFieldValue(field.key)"
                (ngModelChange)="setDirectorPartnerFieldValue(field.key, $event)"
                [name]="field.key"
                optionLabel="label" 
                optionValue="value" 
                placeholder="Select {{ field.label }}">
              </p-dropdown>
              
              <!-- Regular input for non-dropdown fields -->
              <input 
                *ngIf="field.type !== 'dropdown'"
                [type]="field.type" 
                pInputText 
                class="w-full" 
                [ngModel]="getDirectorPartnerFieldValue(field.key)"
                (ngModelChange)="setDirectorPartnerFieldValue(field.key, $event)"
                [name]="field.key" />
            </div>
          </ng-container>
        </form>
        <ng-template pTemplate="footer">
          <div class="text-right">
            <button pButton label="Cancel" class="p-button-secondary mr-2" (click)="closeDirectorPartnerFormDialog()"></button>
            <button pButton label="Save" class="p-button-primary" (click)="saveDirectorPartner()"></button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class CompanyManagementComponent implements OnInit {
  primaryOptions = [
    { label: 'No', value: false },
    { label: 'Yes', value: true }
  ];
  tabIndex = 0;
  companies: Company[] = [];
  branches: Branch[] = [];
  
  // Add expand/collapse state tracking
  expandedBranches: { [key: string]: boolean } = {};
  expandedDepartments: { [key: string]: boolean } = {};
  expandedServiceTypes: { [key: string]: boolean } = {};

  // Add this method to filter branches by company code
  getBranchesForCompany(companyCode: string): Branch[] {
    return this.branches.filter(b => b.company_code === companyCode);
  }

  // Add this method to filter departments by branch code
  getDepartmentsForBranch(branchCode: string): Department[] {
    const branch = this.branches.find(b => b.code === branchCode);
    return branch?.departments || [];
  }

  // Add this method to filter service types by department code
  getServiceTypesForDepartment(departmentCode: string): ServiceType[] {
    const department = this.branches
      .flatMap(b => b.departments || [])
      .find(d => d.code === departmentCode);
    return department?.serviceTypes || [];
  }

  // Add toggle methods for expand/collapse
  toggleBranchExpansion(branchCode: string): void {
    this.expandedBranches[branchCode] = !this.expandedBranches[branchCode];
  }

  toggleDepartmentExpansion(departmentCode: string): void {
    this.expandedDepartments[departmentCode] = !this.expandedDepartments[departmentCode];
  }

  toggleServiceTypeExpansion(serviceTypeCode: string): void {
    this.expandedServiceTypes[serviceTypeCode] = !this.expandedServiceTypes[serviceTypeCode];
  }

  // Check if sections are expanded
  isBranchExpanded(branchCode: string): boolean {
    return this.expandedBranches[branchCode] || false;
  }

  isDepartmentExpanded(departmentCode: string): boolean {
    return this.expandedDepartments[departmentCode] || false;
  }

  isServiceTypeExpanded(serviceTypeCode: string): boolean {
    return this.expandedServiceTypes[serviceTypeCode] || false;
  }
    getInchargeFieldValue(fieldKey: string): any {
    return (this.selectedIncharge as any)[fieldKey];
  }

  setInchargeFieldValue(fieldKey: string, value: any): void {
    (this.selectedIncharge as any)[fieldKey] = value;
  }
  // Helper methods for disabled conditions
  isCompanyCodeDisabled(): boolean {
    return this.companies.some(c => c.code === this.selectedCompany?.code);
  }

  isBranchCodeDisabled(): boolean {
    return this.branches.some(b => b.code === this.selectedBranch?.code);
  }

  isBranchCompanyCodeDisabled(): boolean {
    return !!this.selectedBranch?.company_code;
  }

  isDepartmentCodeDisabled(): boolean {
    const departments = this.getDepartmentsForBranch(this.selectedDepartment?.branch_code || '');
    return departments.some(d => d.code === this.selectedDepartment?.code);
  }

  isDepartmentBranchCodeDisabled(): boolean {
    return !!this.selectedDepartment?.branch_code;
  }

  isDepartmentCompanyCodeDisabled(): boolean {
    return !!this.selectedDepartment?.company_code;
  }

  isServiceTypeCodeDisabled(): boolean {
    const serviceTypes = this.getServiceTypesForDepartment(this.selectedServiceType?.department_code || '');
    return serviceTypes.some((st: ServiceType) => st.code === this.selectedServiceType?.code);
  }

  isServiceTypeDepartmentCodeDisabled(): boolean {
    return !!this.selectedServiceType?.department_code;
  }

  isServiceTypeBranchCodeDisabled(): boolean {
    return !!this.selectedServiceType?.branch_code;
  }

  isServiceTypeCompanyCodeDisabled(): boolean {
    return !!this.selectedServiceType?.company_code;
  }

  selectedCompany: Company = {} as Company;
  selectedBranch: Branch = {} as Branch;
  selectedDepartment: Department = {} as Department;
  selectedServiceType: ServiceType = {} as ServiceType;
  currentBranchForDepartment: Branch | null = null;
  currentDepartmentForServiceType: Department | null = null;

  displayCompanyDialog = false;
  displayBranchDialog = false;
  displayDepartmentDialog = false;
  displayServiceTypeDialog = false;
  
  // Document dialog visibility
  displayCompanyDocumentDialog = false;
  displayBranchDocumentDialog = false;
  displayDepartmentDocumentDialog = false;

  // Track original company data for change detection
  originalCompanyData: Company | null = null;
  hasUnsavedChanges = false;

  companyFields = [
    { key: 'code', label: 'Code', type: 'text', required: true },
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'pan_number', label: 'PAN Number', type: 'text', required: true },
    { key: 'gst', label: 'GST', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'website', label: 'Website', type: 'text' },
    { key: 'company_type', label: 'Company Type', type: 'text' },
    { key: 'register_number', label: 'Register Number', type: 'text' },
    { key: 'register_address', label: 'Register Address', type: 'text' },
    { key: 'head_office_address', label: 'Head Office Address', type: 'text' }
  ];

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];

  branchFields = [
    { key: 'company_code', label: 'Company Code', type: 'text', required: true },
    { key: 'code', label: 'Branch Code', type: 'text', required: true },
    { key: 'name', label: 'Branch Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'text', required: false },
    { key: 'address', label: 'Address', type: 'text', required: false },
    { key: 'pan_number', label: 'PAN Number', type: 'text', required: false, disabled: true },
    { key: 'gst', label: 'GST No.', type: 'text', required: false },
    { key: 'incharge_name', label: 'Incharge Name & Contact No.', type: 'text', required: true },
    { key: 'status', label: 'Status', type: 'dropdown', required: false, options: this.statusOptions },
    { key: 'start_date', label: 'Start Date', type: 'date', required: false },
    { key: 'close_date', label: 'Close Date', type: 'date', required: false },
    { key: 'remarks', label: 'Remarks', type: 'text', required: false },
  ];

  departmentFields = [
    { key: 'company_code', label: 'Company Code', type: 'text', required: true },
    { key: 'branch_code', label: 'Branch Code', type: 'text', required: true },
    { key: 'code', label: 'Department Code', type: 'text', required: true },
    { key: 'name', label: 'Department Name', type: 'text', required: true },
    { key: 'pan_number', label: 'PAN Number', type: 'text', required: false, disabled: true },
    { key: 'gst', label: 'GST No.', type: 'text', required: false },
    { key: 'description', label: 'Description', type: 'text', required: false },
    { key: 'incharge_name', label: 'Incharge Name & Contact No.', type: 'text', required: true },
    { key: 'status', label: 'Status', type: 'dropdown', required: false, options: this.statusOptions },
    { key: 'start_date', label: 'Start Date', type: 'date', required: false },
    { key: 'close_date', label: 'Close Date', type: 'date', required: false },
    { key: 'remarks', label: 'Remarks', type: 'text', required: false },
  ];

  serviceTypeFields = [
    { key: 'company_code', label: 'Company Code', type: 'text', required: true },
    { key: 'branch_code', label: 'Branch Code', type: 'text', required: true },
    { key: 'department_code', label: 'Department Code', type: 'text', required: true },
    { key: 'code', label: 'Service Type Code', type: 'text', required: true },
    { key: 'name', label: 'Service Type Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'text', required: false },
    { key: 'incharge_name', label: 'Incharge Name & Contact No.', type: 'text', required: true },
  
    { key: 'status', label: 'Status', type: 'dropdown', required: false, options: this.statusOptions },
    { key: 'start_date', label: 'Start Date', type: 'date', required: false },
    { key: 'close_date', label: 'Close Date', type: 'date', required: false },
    { key: 'remarks', label: 'Remarks', type: 'text', required: false },
  ];

  maxCompanies = 1;
  errorMessage = '';
  companyFormError = '';
  branchFormError = '';
  departmentFormError = '';
  serviceTypeFormError = '';
  
  // Field-level error tracking
  fieldErrors: { [key: string]: string } = {};
  touchedFields: { [key: string]: boolean } = {};

  // Document management properties
  companyDocuments: (EntityDocument & { file?: File })[] = [];
  branchDocuments: (EntityDocument & { file?: File })[] = [];
  departmentDocuments: (EntityDocument & { file?: File })[] = [];
  companyDocumentTypeOptions: any[] = [];
  branchDocumentTypeOptions: any[] = [];
  departmentDocumentTypeOptions: any[] = [];
  
  // Document viewer properties
  isDocumentViewerVisible = false;
  selectedDocument: EntityDocument | null = null;
  documentViewerUrl: string = '';
  safeDocumentViewerUrl: SafeResourceUrl | null = null;
  pdfLoaded: boolean = false;
  pdfError: boolean = false;

  // Account detail properties
  accountDetails: AccountDetail[] = [];
  selectedAccountDetail: AccountDetail = {} as AccountDetail;
  displayAccountDetailListDialog = false;
  displayAccountDetailFormDialog = false;
  accountDetailFormError = '';
  currentEntityType = '';
  currentEntityCode = '';

  // Incharge management properties
  inchargeRecords: Incharge[] = [];
  selectedIncharge: Incharge = {} as Incharge;
  displayInchargeListDialog = false;
  displayInchargeFormDialog = false;
  inchargeFormError = '';

  // Directors/Partners management properties
  directorsPartners: any[] = [];
  selectedDirectorPartner: any = {};
  displayDirectorsPartnersListDialog = false;
  displayDirectorPartnerFormDialog = false;
  directorPartnerFormError = '';
  currentInchargeEntityType = '';
  currentInchargeEntityCode = '';

  inchargeFields = [
    { key: 'incharge_name', label: 'Incharge Name', type: 'text', required: true },
    { key: 'phone_number', label: 'Phone Number', type: 'text', required: false },
    { key: 'email', label: 'Email', type: 'email', required: false },
   { key: 'status', label: 'Status', type: 'dropdown', required: false, options: this.statusOptions },
    { key: 'from_date', label: 'From Date', type: 'date', required: true },
    { key: 'to_date', label: 'To Date', type: 'date', required: false }
  ];

  directorsPartnersFields = [
    { key: 'din_pan', label: 'DIN/PAN', type: 'text', required: true },
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'designation', label: 'Designation', type: 'text', required: true },
    { key: 'date_of_appointment', label: 'Date of Appointment', type: 'date', required: true },
    { key: 'cessation_date', label: 'Cessation Date', type: 'date', required: false },
    { key: 'signatory', label: 'Signatory', type: 'dropdown', required: false, options: [{ label: 'Yes', value: true }, { label: 'No', value: false }] }
  ];

  accountDetailFields = [
    { key: 'beneficiary', label: 'Beneficiary', type: 'text', required: true },
    { key: 'bank_name', label: 'Bank Name', type: 'text', required: true },
    { key: 'bank_address', label: 'Bank Address', type: 'textarea' },
    { key: 'account_number', label: 'Account Number', type: 'text', required: true },
    { key: 'bank_branch_code', label: 'Bank Branch Code', type: 'text' },
    { key: 'rtgs_neft_code', label: 'RTGS/NEFT Code', type: 'text' },
    { key: 'account_type', label: 'Account Type', type: 'text' },
    { key: 'swift_code', label: 'Swift Code', type: 'text' },
  
  ];

  constructor(
    private companyService: CompanyService,
    private branchService: BranchService,
    private departmentService: DepartmentService,
    private serviceTypeService: ServiceTypeService,
    private http: HttpClient,
    private router: Router,
    private confirmationService: ConfirmationService,
    private configService: ConfigService,
    private entityDocumentService: EntityDocumentService,
    private masterTypeService: MasterTypeService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer,
    private accountDetailsService: AccountDetailsService,
    private inchargeService: InchargeService
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
  navigateToTree() {
    this.router.navigate(['/settings/company_tree']);
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
        // Load service types for departments
        this.loadServiceTypesForDepartments();
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  loadServiceTypesForDepartments() {
    this.serviceTypeService.getAll().subscribe({
      next: (serviceTypes) => {
        // Clear all department service types first
        this.branches.forEach(branch => {
          if (branch.departments) {
            branch.departments.forEach(dept => {
              dept.serviceTypes = [];
            });
          }
        });
        
        serviceTypes.forEach(serviceType => {
          const department = this.branches
            .flatMap(b => b.departments || [])
            .find(d => d.code === serviceType.department_code);
          if (department) {
            if (!Array.isArray(department.serviceTypes)) {
              department.serviceTypes = [];
            }
            department.serviceTypes.push(serviceType);
          }
        });
        
        // Initialize expanded state for sections with data
        this.initializeExpandedState();
      },
      error: (error) => {
        console.error('Error loading service types:', error);
      }
    });
  }

  // Initialize expanded state for sections with data
  initializeExpandedState() {
    // Expand first branch by default if it has departments
    if (this.branches.length > 0) {
      const firstBranch = this.branches[0];
      if (firstBranch.departments && firstBranch.departments.length > 0) {
        this.expandedBranches[firstBranch.code] = true;
        
        // Expand first department by default if it has service types
        const firstDepartment = firstBranch.departments[0];
        if (firstDepartment.serviceTypes && firstDepartment.serviceTypes.length > 0) {
          this.expandedDepartments[firstDepartment.code] = true;
        }
      }
    }
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
    
    // Populate PAN number from company data
    if (this.selectedBranch.company_code) {
      const company = this.companies.find(c => c.code === this.selectedBranch.company_code);
      if (company) {
        this.selectedBranch['pan_number'] = company.pan_number;
      }
    }
    
    // Format date fields for HTML date inputs
    if (branch) {
      this.formatDateFields(this.selectedBranch, this.branchFields);
    }
    
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

    // Create a copy of selectedBranch without the PAN number field for saving
     const branchToSave = { ...this.selectedBranch };
    delete branchToSave['pan_number'];

    // Check if the code exists in the loaded branches
    const codeExists = this.branches.some(b => b.code === branchToSave.code);

    if (!codeExists) {
      this.branchService.create(branchToSave).subscribe({
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
      console.log('Updating branch with code:', branchToSave.code, 'Payload:', branchToSave);
      this.branchService.update(branchToSave.code, branchToSave).subscribe({
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
    
    // Populate PAN number from company data (same as branch)
    if (branch.company_code) {
      const company = this.companies.find(c => c.code === branch.company_code);
      if (company) {
        this.selectedDepartment['pan_number'] = company.pan_number;
      }
    }
    
    // Format date fields for HTML date inputs
    if (department) {
      this.formatDateFields(this.selectedDepartment, this.departmentFields);
    }
    
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

    // Ensure required fields are included for updates
    const departmentData = {
      ...this.selectedDepartment,
      // Explicitly ensure these fields are present for updates
      company_code: this.selectedDepartment.company_code,
      branch_code: this.selectedDepartment.branch_code
    };

    // Check if the code exists in the loaded departments for this branch
    const branch = this.branches.find(b => b.code === departmentData.branch_code);
    const codeExists = branch && branch.departments && branch.departments.some(d => d.code === departmentData.code);

    if (!codeExists) {
      this.departmentService.create(departmentData).subscribe({
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
      console.log('Updating department with code:', departmentData.code, 'Payload:', departmentData);
      this.departmentService.update(departmentData.code, departmentData).subscribe({
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

  openServiceTypeDialog(department: Department, serviceType: ServiceType | null = null) {
    this.currentDepartmentForServiceType = department;
    this.selectedServiceType = serviceType
      ? { ...serviceType }
      : { company_code: department.company_code, branch_code: department.branch_code, department_code: department.code } as ServiceType;
    
    // Format date fields for HTML date inputs
    if (serviceType) {
      this.formatDateFields(this.selectedServiceType, this.serviceTypeFields);
    }
    
    this.displayServiceTypeDialog = true;
    this.serviceTypeFormError = '';
    this.clearFieldErrors();
  }

  closeServiceTypeDialog() {
    this.displayServiceTypeDialog = false;
    this.selectedServiceType = {} as ServiceType;
    this.serviceTypeFormError = '';
    this.clearFieldErrors();
  }

  saveServiceType() {
    if (!this.selectedServiceType) return;
    this.serviceTypeFormError = '';
    // Validate required fields
    const missing = this.serviceTypeFields.filter(f => f.required && !this.selectedServiceType[f.key as keyof ServiceType]);
    if (missing.length > 0) {
      this.serviceTypeFormError = `Please fill all required fields: ${missing.map(f => f.label).join(', ')}`;
      return;
    }
    if (typeof this.selectedServiceType.code === 'string') {
      this.selectedServiceType.code = this.selectedServiceType.code.trim();
    }
    console.log('Saving service type:', this.selectedServiceType);

    // Ensure required fields are included for updates
    const serviceTypeData = {
      ...this.selectedServiceType,
      // Explicitly ensure these fields are present for updates
      company_code: this.selectedServiceType.company_code,
      branch_code: this.selectedServiceType.branch_code,
      department_code: this.selectedServiceType.department_code
    };

    if (this.selectedServiceType.code && this.isServiceTypeCodeDisabled()) {
      // Update existing service type
      this.serviceTypeService.update(serviceTypeData.code, serviceTypeData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Service type updated successfully!' });
          this.loadServiceTypesForDepartments();
          this.closeServiceTypeDialog();
          this.serviceTypeFormError = '';
        },
        error: (err) => {
          console.error('Error updating service type:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update service type: ' + (err.error?.message || err.message) });
        }
      });
    } else {
      // Create new service type
      this.serviceTypeService.create(serviceTypeData).subscribe({
        next: (created) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Service type created successfully!' });
          this.loadServiceTypesForDepartments();
          this.closeServiceTypeDialog();
          this.serviceTypeFormError = '';
        },
        error: (err) => {
          console.error('Error creating service type:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create service type: ' + (err.error?.message || err.message) });
        }
      });
    }
  }

  openBranchDialogForCompany(company: Company) {
    this.selectedBranch = {
      company_code: company.code,
      code: '',
      name: '',
      description: '',
      address: '',
      gst: '',
      incharge_name: '',
      status: '',
      start_date: '',
      close_date: '',
      remarks: ''
    } as Branch;
    
    // Set PAN number from company
    this.selectedBranch['pan_number'] = company.pan_number;
    
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
    } else if (this.displayServiceTypeDialog && this.selectedServiceType) {
      value = this.selectedServiceType[field as keyof ServiceType];
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

  setFieldError(field: string, error: string) {
    this.fieldErrors[field] = error;
    this.touchedFields[field] = true; // Mark field as touched when setting error
  }

  clearFieldErrors() {
    this.fieldErrors = {};
    this.touchedFields = {};
  }

  formatDateFields(entity: any, fields: any[]) {
    fields.forEach(field => {
      if (field.type === 'date' && entity[field.key]) {
        const date = new Date(entity[field.key]);
        if (!isNaN(date.getTime())) {
          // Format as YYYY-MM-DD for HTML date input
          entity[field.key] = date.toISOString().split('T')[0];
        }
      }
    });
  }

  // Document management methods
  loadDocumentTypeOptions() {
    this.masterTypeService.getAll().subscribe({
      next: (types: any[]) => {
        // Load company document types
        this.companyDocumentTypeOptions = (types || [])
          .filter(t => t.key === 'COM_DOC_TYPE' && t.status === 'Active')
          .map(t => ({ label: t.value, value: t.value }));
        
        // Load branch document types
        this.branchDocumentTypeOptions = (types || [])
          .filter(t => t.key === 'BRANCH_DOC_TYPE' && t.status === 'Active')
          .map(t => ({ label: t.value, value: t.value }));
        
        // Load department document types
        this.departmentDocumentTypeOptions = (types || [])
          .filter(t => t.key === 'DEPT_DOC_TYPE' && t.status === 'Active')
          .map(t => ({ label: t.value, value: t.value }));
        
        console.log('Document type options loaded:', {
          company: this.companyDocumentTypeOptions,
          branch: this.branchDocumentTypeOptions,
          department: this.departmentDocumentTypeOptions
        });
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

  // Account detail methods
  openAccountDetailDialog(entityType: string, entityCode: string) {
    this.currentEntityType = entityType;
    this.currentEntityCode = entityCode;
    this.loadAccountDetails(entityType, entityCode);
    this.displayAccountDetailListDialog = true;
  }

  openAccountDetailFormDialog(entityType: string, entityCode: string, accountDetail?: AccountDetail) {
    if (accountDetail) {
      this.selectedAccountDetail = { ...accountDetail };
      // Convert is_primary to boolean if it's coming from database as number/string
      if (this.selectedAccountDetail.is_primary !== undefined) {
        this.selectedAccountDetail.is_primary = Boolean(this.selectedAccountDetail.is_primary);
      }
    } else {
      this.selectedAccountDetail = { 
        entity_type: entityType, 
        entity_code: entityCode,
        is_primary: false // Set default value
      } as AccountDetail;
    }
    
    this.displayAccountDetailFormDialog = true;
    this.accountDetailFormError = '';
    this.clearFieldErrors();
  }

  closeAccountDetailListDialog() {
    this.displayAccountDetailListDialog = false;
  }

  closeAccountDetailFormDialog() {
    this.displayAccountDetailFormDialog = false;
    this.selectedAccountDetail = {} as AccountDetail;
    this.accountDetailFormError = '';
    this.clearFieldErrors();
  }

  // Update the existing method to only handle both dialogs when needed
  closeAccountDetailDialog() {
    this.displayAccountDetailListDialog = false;
    this.displayAccountDetailFormDialog = false;
    this.selectedAccountDetail = {} as AccountDetail;
    this.accountDetailFormError = '';
    this.clearFieldErrors();
  }

  loadAccountDetails(entityType: string, entityCode: string) {
    this.accountDetailsService.getByEntity(entityType, entityCode).subscribe({
      next: (data: AccountDetail[]) => {
        this.accountDetails = data;
      },
      error: (error) => {
        console.error('Error loading account details:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load account details' });
      }
    });
  }

  saveAccountDetail() {
    this.clearFieldErrors();
    
    // Validate required fields
    const requiredFields = this.accountDetailFields.filter(f => f.required);
    let hasErrors = false;
    
    for (const field of requiredFields) {
      if (!this.selectedAccountDetail[field.key as keyof AccountDetail]) {
        this.setFieldError(field.key, `${field.label} is required`);
        hasErrors = true;
      }
    }
    
    if (hasErrors) {
      this.accountDetailFormError = 'Please fill in all required fields';
      return;
    }
    
    const operation = this.selectedAccountDetail.id
      ? this.accountDetailsService.update(this.selectedAccountDetail.id, this.selectedAccountDetail)
      : this.accountDetailsService.create(this.selectedAccountDetail);
    
    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Account detail ${this.selectedAccountDetail.id ? 'updated' : 'created'} successfully`
        });
        this.displayAccountDetailFormDialog = false;  // Close only the form dialog
        this.loadAccountDetails(this.currentEntityType, this.currentEntityCode);
      },
      error: (error) => {
        console.error('Error saving account detail:', error);
        this.accountDetailFormError = 'Failed to save account detail';
      }
    });
  }

  deleteAccountDetail(accountDetail: AccountDetail) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this account detail?',
      accept: () => {
        this.accountDetailsService.delete(accountDetail.id!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Account detail deleted successfully' });
            this.loadAccountDetails(this.currentEntityType, this.currentEntityCode);
          },
          error: (error) => {
            console.error('Error deleting account detail:', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete account detail' });
          }
        });
      }
    });
  }

  onPrimaryChange(selectedAccount: AccountDetail) {
    // Toggle the selected account's primary status
    selectedAccount.is_primary = !selectedAccount.is_primary;
    
    if (selectedAccount.is_primary) {
      // If this account is now primary, uncheck all other accounts
      this.accountDetails.forEach(account => {
        if (account.id !== selectedAccount.id) {
          account.is_primary = false;
        }
      });
    }
    
    // Update all accounts in the backend
    this.accountDetails.forEach(account => {
      if (account.id) {
        this.accountDetailsService.update(account.id, account).subscribe({
          next: () => {
            console.log(`Account ${account.id} primary status updated to ${account.is_primary}`);
          },
          error: (error) => {
            console.error('Error updating account primary status:', error);
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: 'Failed to update primary account status' 
            });
          }
        });
      }
    });
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

  openInchargeDialog(entityType: string, entityCode: string) {
    this.currentInchargeEntityType = entityType;
    this.currentInchargeEntityCode = entityCode;
    this.loadInchargeRecords();
    this.displayInchargeListDialog = true;
  }

  loadInchargeRecords() {
    this.inchargeService.getByEntity(this.currentInchargeEntityType, this.currentInchargeEntityCode).subscribe({
      next: (records) => {
        this.inchargeRecords = records;
      },
      error: (error) => {
        console.error('Error loading incharge records:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load incharge records' });
      }
    });
  }

  openInchargeFormDialog(incharge?: Incharge) {
    if (incharge) {
      this.selectedIncharge = { ...incharge };
    } else {
      this.selectedIncharge = {
        entity_type: this.currentInchargeEntityType,
        entity_code: this.currentInchargeEntityCode,
        incharge_name: '',
        phone_number: '',
        email: '',
        status: 'active',
        from_date: new Date().toISOString().split('T')[0]
      } as Incharge;
    }
    this.displayInchargeFormDialog = true;
    this.inchargeFormError = '';
  }

  saveIncharge() {
    this.inchargeFormError = '';
    
    // Validate required fields
    const requiredFields = this.inchargeFields.filter(f => f.required);
    const missing = requiredFields.filter(f => !this.selectedIncharge[f.key as keyof Incharge]);
    if (missing.length > 0) {
      this.inchargeFormError = `Please fill all required fields: ${missing.map(f => f.label).join(', ')}`;
      return;
    }

    const operation = this.selectedIncharge.id ? 
      this.inchargeService.update(this.selectedIncharge.id, this.selectedIncharge) :
      this.inchargeService.create(this.selectedIncharge);

    operation.subscribe({
      next: (result) => {
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Success', 
          detail: `Incharge ${this.selectedIncharge.id ? 'updated' : 'created'} successfully` 
        });
        this.displayInchargeFormDialog = false;
        this.loadInchargeRecords();
        this.updateInchargeNameField(result);
      },
      error: (error) => {
        console.error('Error saving incharge:', error);
        this.inchargeFormError = 'Failed to save incharge record';
      }
    });
  }

  deleteIncharge(incharge: Incharge) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete incharge record for ${incharge.incharge_name}?`,
      accept: () => {
        if (incharge.id) {
          this.inchargeService.delete(incharge.id).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Incharge deleted successfully' });
              this.loadInchargeRecords();
            },
            error: (error) => {
              console.error('Error deleting incharge:', error);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete incharge' });
            }
          });
        }
      }
    });
  }

  updateInchargeNameField(activeIncharge: Incharge) {
    if (activeIncharge.status === 'active') {
      const inchargeDisplay = `${activeIncharge.incharge_name}${activeIncharge.phone_number ? ' - ' + activeIncharge.phone_number : ''}`;
      
      switch (this.currentInchargeEntityType) {
        case 'company':
          // Company doesn't have incharge_name field in the current structure
          break;
        case 'branch':
          if (this.selectedBranch) {
            this.selectedBranch.incharge_name = inchargeDisplay;
          }
          break;
        case 'department':
          if (this.selectedDepartment) {
            this.selectedDepartment.incharge_name = inchargeDisplay;
          }
          break;
        case 'service_type':
          if (this.selectedServiceType) {
            this.selectedServiceType.incharge_name = inchargeDisplay;
          }
          break;
      }
    }
  }

  closeInchargeListDialog() {
    this.displayInchargeListDialog = false;
  }

  closeInchargeFormDialog() {
    this.displayInchargeFormDialog = false;
  }

  // Directors/Partners helper methods
  getDirectorPartnerFieldValue(fieldKey: string): any {
    return (this.selectedDirectorPartner as any)[fieldKey];
  }

  setDirectorPartnerFieldValue(fieldKey: string, value: any): void {
    (this.selectedDirectorPartner as any)[fieldKey] = value;
  }

  // Directors/Partners dialog methods
  openDirectorsPartnersListDialog(): void {
    this.loadDirectorsPartners();
    this.displayDirectorsPartnersListDialog = true;
  }

  closeDirectorsPartnersListDialog(): void {
    this.displayDirectorsPartnersListDialog = false;
  }

  openDirectorPartnerFormDialog(directorPartner?: any): void {
    if (directorPartner) {
      // Map database fields to frontend fields for editing
      this.selectedDirectorPartner = {
        ...directorPartner,
        name: directorPartner.incharge_name, // Map backend field to frontend field
        date_of_appointment: directorPartner.appointment_date, // Map backend field to frontend field
      };
    } else {
      // New record initialization
      this.selectedDirectorPartner = {
        entity_type: 'directors_partners',
        entity_code: this.selectedCompany?.code || '',
        status: 'active',
        from_date: new Date().toISOString().split('T')[0]
      };
    }
    this.directorPartnerFormError = '';
    this.displayDirectorPartnerFormDialog = true;
  }

  closeDirectorPartnerFormDialog(): void {
    this.displayDirectorPartnerFormDialog = false;
    this.selectedDirectorPartner = {};
    this.directorPartnerFormError = '';
  }

  saveDirectorPartner(): void {
    // Validate required fields
    for (const field of this.directorsPartnersFields) {
      if (field.required && !this.selectedDirectorPartner[field.key]) {
        this.directorPartnerFormError = `${field.label} is required`;
        return;
      }
    }

    // Map frontend fields to backend expected fields
    const directorPartnerData = {
      ...this.selectedDirectorPartner,
      entity_type: 'directors_partners', // Set correct entity type
      entity_code: this.selectedCompany?.code || '',
      incharge_name: this.selectedDirectorPartner.name, // Map 'name' to 'incharge_name'
      appointment_date: this.selectedDirectorPartner.date_of_appointment, // Map field name
      status: this.selectedDirectorPartner.status || 'active', // Add required status field
      from_date: this.selectedDirectorPartner.from_date || new Date().toISOString().split('T')[0] // Add required from_date field
    };

    // Remove the frontend 'name' field to avoid confusion
    delete directorPartnerData.name;
    delete directorPartnerData.date_of_appointment;

    if (this.selectedDirectorPartner.id) {
      // Update existing director/partner
      this.inchargeService.update(this.selectedDirectorPartner.id, directorPartnerData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Director/Partner updated successfully' });
          this.loadDirectorsPartners();
          this.closeDirectorPartnerFormDialog();
        },
        error: (error) => {
          this.directorPartnerFormError = error.error?.message || 'Error updating director/partner';
        }
      });
    } else {
      // Create new director/partner
      this.inchargeService.create(directorPartnerData).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Director/Partner added successfully' });
          this.loadDirectorsPartners();
          this.closeDirectorPartnerFormDialog();
        },
        error: (error) => {
          this.directorPartnerFormError = error.error?.message || 'Error adding director/partner';
        }
      });
    }
  }

  deleteDirectorPartner(directorPartner: any): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete director/partner ${directorPartner.name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.inchargeService.delete(directorPartner.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Director/Partner deleted successfully' });
            this.loadDirectorsPartners();
          },
          error: (error) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error deleting director/partner' });
          }
        });
      }
    });
  }

  loadDirectorsPartners(): void {
    const companyCode = this.selectedCompany?.code;
    console.log('Loading directors/partners for company:', companyCode);
    
    // Fix: Use 'directors_partners' as entity_type instead of 'company'
    this.inchargeService.getByEntity('directors_partners', companyCode).subscribe({
      next: (records) => {
        console.log('Raw API response:', records);
        console.log('Number of records received:', records.length);
        
        // No need to filter since API already returns directors_partners records
        this.directorsPartners = records;
      },
      error: (error) => {
        console.error('Error loading directors/partners:', error);
        this.directorsPartners = [];
      }
    });
  }

}


