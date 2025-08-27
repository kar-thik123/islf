import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { AppLayout } from '@/layout/components/app.layout';
import { NumberSeriesComponent } from './numberseries';
import { NumberSeriesService } from '@/services/number-series.service';
import { MappingService, Mapping, MappingRelation } from '@/services/mapping.service';
import { NumberSeriesRelationService } from '@/services/number-series-relation.service';
import { CompanyService, Company } from '@/services/company.service';
import { BranchService, Branch } from '@/services/branch.service';
import { DepartmentService, Department } from '@/services/department.service';
import { ServiceTypeService, ServiceType } from '@/services/servicetype.service';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfigService } from '@/services/config.service';
import { ContextService } from '@/services/context.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface NumberSeries {
  id?: number;
  code: string;
  description: string;
}

@Component({
  selector: 'app-number-series',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PanelModule,
    DropdownModule,
    ButtonModule,
    ToolbarModule,
    CardModule,
    TableModule,
    ToastModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    DialogModule,
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    
    <div class="card mt-4">
      <div class="font-semibold text-xl mb-4">Number Series Relation Mappings</div>
      <p-table
        #dt
        [value]="mappingRelations"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['codeType', 'mapping', 'company', 'branch', 'department', 'serviceType']"
        responsiveLayout="scroll"
      >
        <ng-template #caption>
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add Mapping Relation" icon="pi pi-plus" class="p-button" (click)="showAddMappingDialog()"></button>
            <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
            <p-iconfield iconPosition="left" class="ml-auto">
              <p-inputicon>
                <i class="pi pi-search"></i>
              </p-inputicon>
              <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search keyword" />
            </p-iconfield>
          </div>
        </ng-template>
        <ng-template #header>
          <tr>
            <th>
              <div class="flex justify-between items-center">
                Code Type
                <p-columnFilter type="text" field="codeType" display="menu" placeholder="Search by code type"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Mapping
                <p-columnFilter type="text" field="mapping" display="menu" placeholder="Search by mapping"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Company
                <p-columnFilter type="text" field="company" display="menu" placeholder="Search by company"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Branch
                <p-columnFilter type="text" field="branch" display="menu" placeholder="Search by branch"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Department
                <p-columnFilter type="text" field="department" display="menu" placeholder="Search by department"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Service Type
                <p-columnFilter type="text" field="serviceType" display="menu" placeholder="Search by service type"></p-columnFilter>
              </div>
            </th>
            <th>Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row let-i="rowIndex">
          <tr>
            <td>{{ row.codeType }}</td>
            <td>{{ row.mapping }}</td>
            <td>{{ row.company }}</td>
            <td>{{ row.branch }}</td>
            <td>{{ row.department }}</td>
            <td>{{ row.serviceType }}</td>
            <td>
             <div class="flex items-center space-x-[8px]">
              <button pButton icon="pi pi-pencil" class="p-button-sm" (click)="editMappingRelation(i)"></button>
              <button pButton icon="pi pi-trash" class="p-button-sm p-button-danger" (click)="deleteMappingRelation(i)"></button>
             </div>
            </td>
          </tr>
        </ng-template>
       <ng-template pTemplate="paginatorleft" let-state>
          <div class="text-sm text-gray-600">
            Total Relations: {{ state.totalRecords }}
          </div>
        </ng-template>
      </p-table>
      <p-dialog header="Mapping Relation" [(visible)]="showMappingDialog" [modal]="true" [closable]="true" [dismissableMask]="true" [style]="{width: '40vw'}">
        <!-- Helpful note about mapping functionality -->
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p class="text-sm text-blue-800">
            <i class="pi pi-info-circle mr-2"></i>
            <strong>Note:</strong> This mapping relation links number series to specific organizational contexts (Company, Branch, Department, Service Type). 
            Select a code type and its corresponding number series relation, then specify the organizational scope where this mapping should apply.
            <br><strong>Purpose:</strong> This ensures that different parts of your organization can use different number series for the same document types, providing better organization and control.
          </p>
        </div>
        
        <div class="p-fluid grid">
          <!-- Code Type, Mapping, Company, Branch, Department, Service Type dropdowns here (reuse previous form) -->
          <div class="field col-12 md:col-6 lg:col-4">
            <label for="codeType">Code Type</label>
            <p-dropdown [options]="codeTypes" [(ngModel)]="selectedCodeType" optionLabel="label" optionValue="value" placeholder="Select Code Type" [filter]="true" filterBy="label" [showClear]="true"></p-dropdown>
          </div>
          <div class="field col-12 md:col-6 lg:col-4">
            <label for="mapping">Mapping (No Series Relation)</label>
            <p-dropdown [options]="mappingOptions" [(ngModel)]="selectedMapping" optionLabel="label" optionValue="value" placeholder="Select Mapping" [filter]="true" filterBy="label" [showClear]="true"></p-dropdown>
          </div>
          <div class="field col-12 md:col-6 lg:col-4">
            <label for="company">Company</label>
            <p-dropdown [options]="companyOptions" [(ngModel)]="selectedCompany" optionLabel="name" optionValue="code" placeholder="Select Company" (onChange)="onCompanyChange()" [filter]="true" filterBy="name" [showClear]="true"></p-dropdown>
          </div>
          <div class="field col-12 md:col-6 lg:col-4">
            <label for="branch">Branch</label>
            <p-dropdown [options]="branchOptions" [(ngModel)]="selectedBranch" optionLabel="name" optionValue="code" placeholder="Select Branch" (onChange)="onBranchChange()" [filter]="true" filterBy="name" [showClear]="true"></p-dropdown>
          </div>
          <div class="field col-12 md:col-6 lg:col-4">
            <label for="department">Department</label>
            <p-dropdown [options]="departmentOptions" [(ngModel)]="selectedDepartment" optionLabel="name" optionValue="code" placeholder="Select Department" (onChange)="onDepartmentChange()" [filter]="true" filterBy="name" [showClear]="true"></p-dropdown>
          </div>
          <div class="field col-12 md:col-6 lg:col-4">
            <label for="serviceType">Service Type</label>
            <p-dropdown [options]="serviceTypeOptions" [(ngModel)]="selectedServiceType" optionLabel="name" optionValue="code" placeholder="Select Service Type" [filter]="true" filterBy="name" [showClear]="true"></p-dropdown>
          </div>
        </div>
        <div class="flex justify-content-end gap-2 mt-4">
          <button pButton type="button" label="Save" icon="pi pi-save" (click)="saveMappingRelation()"></button>
          <button pButton type="button" label="Cancel" icon="pi pi-times" class="p-button-secondary" (click)="showMappingDialog = false; resetMappingForm()"></button>
        </div>
      </p-dialog>
    </div>
  `,
  styles: [`
  .card {
  padding: 1rem;
}

.p-toolbar {
  background-color: transparent;
  border: none;
  padding: 0;
}

.p-panel {
  margin-top: 1rem;
}

/* Label + input alignment */
.field {
  display: flex;
  align-items: center;
  margin-bottom: 2.5rem;
}

.field label {
  width: 220px;
  margin-right: 1rem;
  font-weight: 500;
  font-size: 0.95rem;
}

/* Limit input width */
.field .p-dropdown,
.field input {
  width: 400px; /* 👈 Restricts max width */
  max-width: 100%;
}

/* Responsive for smaller devices */
@media screen and (max-width: 768px) {
  .field {
    flex-direction: column;
    align-items: flex-start;
  }

  .field label {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .field .p-dropdown,
  .field input {
    width: 100%;
  }
}


  `]
})
export class mappingComponent implements OnInit, OnDestroy {
  private mappingToLoad: Mapping | null = null;
  private contextSubscription: Subscription = new Subscription(); // Add this line

  selectedSeries = {
    customerCode: null,
    vendorCode: null,
    employeeCode: null,
    customerQuote: null,
    invoiceNo: null,
    taxNo: null,
    jobcardNo: null,
    branchNo: null,
    departmentNo: null,
    vesselCode: null,
    tariffCode: null
  };

  numberSeriesList = signal<NumberSeries[]>([]);

  codeTypes = [
    { label: 'Customer Code No Series', value: 'customerCode' },
    { label: 'Vendor Code No Series', value: 'vendorCode' },
    { label: 'Vessel Code No Series', value: 'vesselCode' },
    { label: 'Employee Code No Series', value: 'employeeCode' },
    { label: 'Customer Quote No Series', value: 'customerQuote' },
    { label: 'Invoice No Series', value: 'invoiceNo' },
    { label: 'Tax No Series', value: 'taxNo' },
    { label: 'Jobcard No Series', value: 'jobcardNo' },
    { label: 'CR No Series', value: 'crNo' },
    { label: 'Booking No Series', value: 'bookingNo' },
    { label: 'Enquiry No Series', value: 'enquiryNo' },
    { label: 'Source No Series', value: 'sourceNo' },
    { label: 'Tariff Code No Series', value: 'tariffCode' }
  ];

  // Replace signals with plain properties for form fields
  selectedCodeType: string | null = null;
  selectedMapping: string | null = null;
  selectedCompany: string | null = null;
  selectedBranch: string | null = null;
  selectedDepartment: string | null = null;
  selectedServiceType: string | null = null;

  // Also update mappingOptions, companyOptions, branchOptions, departmentOptions, serviceTypeOptions to be plain arrays
  mappingOptions: { label: string, value: string }[] = [];
  companyOptions: Company[] = [];
  branchOptions: Branch[] = [];
  departmentOptions: Department[] = [];
  serviceTypeOptions: ServiceType[] = [];

  // Add signals for dialog and mapping relations list
  showMappingDialog: boolean = false;
  mappingRelations: MappingRelation[] = [];
  editingIndex: number | null = null;

  constructor(
    private messageService: MessageService,
    private numberSeriesService: NumberSeriesService,
    private mappingService: MappingService,
    private numberSeriesRelationService: NumberSeriesRelationService,
    private companyService: CompanyService,
    private branchService: BranchService,
    private departmentService: DepartmentService,
    private serviceTypeService: ServiceTypeService,
    private configService: ConfigService, // Add this
    private contextService: ContextService // Add this
  ) {}

  ngOnInit() {
    this.loadMappingOptions();
    this.loadCompanies();
    this.loadMappingRelations();
    
    // Subscribe to context changes
    this.contextSubscription = this.contextService.context$
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.refreshMappingList();
      });
  }

  // Also update the class to implement OnDestroy
  ngOnDestroy() {
    this.contextSubscription.unsubscribe();
  }

  refreshMappingList() {
    this.loadMappingRelations();
  }

  // Add context validation before showing the dialog
  showAddMappingDialog() {
    // Get the validation settings
    const config = this.configService.getConfig();
    const mappingFilter = config?.validation?.mappingFilter || '';
    const context = this.contextService.getContext();
    
    // Check if we need to validate context
    if (mappingFilter) {
      let contextMissing = false;
      
      if (mappingFilter.includes('C') && !context.companyCode) {
        contextMissing = true;
      }
      if (mappingFilter.includes('B') && !context.branchCode) {
        contextMissing = true;
      }
      if (mappingFilter.includes('D') && !context.departmentCode) {
        contextMissing = true;
      }
      
      // If context is missing, show the context selector dialog instead of error message
      if (contextMissing) {
        this.contextService.showContextSelector();
        return;
      }
    }
    
    this.showMappingDialog = true;
  }

  loadMappingOptions() {
    this.numberSeriesRelationService.getNumberSeriesCodes().subscribe(options => {
      this.mappingOptions = options;
    });
  }

  loadCompanies() {
    this.companyService.getAll().subscribe(companies => {
      this.companyOptions = companies;
    });
  }

  onCompanyChange() {
    const company = this.selectedCompany;
    if (company) {
      this.branchService.getAll().subscribe(branches => {
        this.branchOptions = branches.filter(b => b.company_code === company);
        this.selectedBranch = null;
        this.departmentOptions = [];
        this.selectedDepartment = null;
        this.serviceTypeOptions = [];
        this.selectedServiceType = null;
      });
    } else {
      this.branchOptions = [];
      this.selectedBranch = null;
      this.departmentOptions = [];
      this.selectedDepartment = null;
      this.serviceTypeOptions = [];
      this.selectedServiceType = null;
    }
  }

  onBranchChange() {
    const branch = this.selectedBranch;
    if (branch) {
      this.departmentService.getAll().subscribe(departments => {
        this.departmentOptions = departments.filter(d => d.branch_code === branch);
        this.selectedDepartment = null;
        this.serviceTypeOptions = [];
        this.selectedServiceType = null;
      });
    } else {
      this.departmentOptions = [];
      this.selectedDepartment = null;
      this.serviceTypeOptions = [];
      this.selectedServiceType = null;
    }
  }

  onDepartmentChange() {
    const department = this.selectedDepartment;
    if (department) {
      this.serviceTypeService.getByDepartment(department).subscribe(serviceTypes => {
        this.serviceTypeOptions = serviceTypes;
        this.selectedServiceType = null;
      });
    } else {
      this.serviceTypeOptions = [];
      this.selectedServiceType = null;
    }
  }

  numberSeries() {
    return this.numberSeriesList();
  }

  refresh() {
    this.messageService.add({
      severity: 'info',
      summary: 'Refreshing',
      detail: 'Data is being refreshed'
    });
    // Implement your actual refresh logic here
  }

  save() {
    const mapping: Mapping = {
      customerCode: this.selectedSeries.customerCode,
      vendorCode: this.selectedSeries.vendorCode,
      employeeCode: this.selectedSeries.employeeCode,
      customerQuote: this.selectedSeries.customerQuote,
      invoiceNo: this.selectedSeries.invoiceNo,
      taxNo: this.selectedSeries.taxNo,
      jobcardNo: this.selectedSeries.jobcardNo,
      branchNo: this.selectedSeries.branchNo,
      departmentNo: this.selectedSeries.departmentNo,
      vesselCode: this.selectedSeries.vesselCode
    };
    this.mappingService.saveMapping(mapping).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Number series mappings saved successfully'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save mapping'
        });
      }
    });
  }

  loadMappingRelations() {
    this.mappingService.getMappingRelations().subscribe({
      next: (relations) => {
        this.mappingRelations = relations;
      },
      error: (error) => {
        console.error('Error loading mapping relations:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load mapping relations'
        });
      }
    });
  }

  saveMappingRelation() {
    if (!this.selectedCodeType || !this.selectedMapping) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Code Type and Mapping are required'
      });
      return;
    }

    const mappingRelation = {
      codeType: this.selectedCodeType,
      mapping: this.selectedMapping,
      companyCode: this.selectedCompany,
      branchCode: this.selectedBranch,
      departmentCode: this.selectedDepartment,
      serviceTypeCode: this.selectedServiceType
    };

    if (this.editingIndex !== null) {
      // Update existing relation
      const relationId = this.mappingRelations[this.editingIndex].id;
      if (relationId) {
        this.mappingService.updateMappingRelation(relationId, mappingRelation).subscribe({
          next: () => {
            this.loadMappingRelations();
            this.showMappingDialog = false;
            this.resetMappingForm();
            this.editingIndex = null;
            this.messageService.add({
              severity: 'success',
              summary: 'Updated',
              detail: 'Mapping relation updated successfully'
            });
          },
          error: (error) => {
            console.error('Error updating mapping relation:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update mapping relation'
            });
          }
        });
      }
    } else {
      // Create new relation
      this.mappingService.createMappingRelation(mappingRelation).subscribe({
        next: () => {
          this.loadMappingRelations();
          this.showMappingDialog = false;
          this.resetMappingForm();
          this.messageService.add({
            severity: 'success',
            summary: 'Created',
            detail: 'Mapping relation created successfully'
          });
        },
        error: (error) => {
          console.error('Error creating mapping relation:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create mapping relation'
          });
        }
      });
    }
  }

  editMappingRelation(index: number) {
    const rel = this.mappingRelations[index];
    this.selectedCodeType = rel.codeType;
    this.selectedMapping = rel.mapping;
    // Note: The backend returns display names, but we need to find the codes
    // For now, we'll use the display names as codes (this should be improved)
    this.selectedCompany = rel.company;
    this.selectedBranch = rel.branch;
    this.selectedDepartment = rel.department;
    this.selectedServiceType = rel.serviceType;
    this.editingIndex = index;
    this.showMappingDialog = true;
  }

  deleteMappingRelation(index: number) {
    const relation = this.mappingRelations[index];
    if (relation.id) {
      this.mappingService.deleteMappingRelation(relation.id).subscribe({
        next: () => {
          this.loadMappingRelations();
          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Mapping relation deleted successfully'
          });
        },
        error: (error) => {
          console.error('Error deleting mapping relation:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete mapping relation'
          });
        }
      });
    }
  }

  resetMappingForm() {
    this.selectedCodeType = null;
    this.selectedMapping = null;
    this.selectedCompany = null;
    this.selectedBranch = null;
    this.selectedDepartment = null;
    this.selectedServiceType = null;
  }

  reset() {
    this.selectedSeries = {
      customerCode: null,
      vendorCode: null,
      employeeCode: null,
      customerQuote: null,
      invoiceNo: null,
      taxNo: null,
      jobcardNo: null,
      branchNo: null,
      departmentNo: null,
      vesselCode: null,
      tariffCode: null
    };
    this.messageService.add({
      severity: 'info',
      summary: 'Reset',
      detail: 'Form has been reset'
    });
  }

  clear(table: any) {
    table.clear();
  }
  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}