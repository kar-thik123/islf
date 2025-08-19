import { Component, OnInit } from '@angular/core';
import { InputText } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FileUploadModule } from 'primeng/fileupload';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { RippleModule } from 'primeng/ripple';
import { CalendarModule } from 'primeng/calendar';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { HttpClientModule } from '@angular/common/http';
import { ToastService } from '../../../services/toast.service';
import { BranchService } from '../../../services/branch.service';
import { DepartmentService } from '@/services/department.service';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MasterCodeService } from '../../../services/mastercode.service';
import { MasterTypeService } from '../../../services/mastertype.service';
import { EntityDocumentService, EntityDocument } from '../../../services/entity-document.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NumberSeriesService } from '../../../services/number-series.service';
import { MappingService } from '../../../services/mapping.service';
import { ContextService } from '../../../services/context.service';
import { NumberSeriesRelationService } from '../../../services/number-series-relation.service';


@Component({
  selector: 'user-create',
  standalone: true,
  imports: [
    InputText,
    TextareaModule,
    FileUploadModule,
    InputGroupAddon,
    ButtonModule,
    InputGroupModule,
    RippleModule,
    CalendarModule,
    PasswordModule,
    DropdownModule,
    MultiSelectModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    ConfirmDialogModule,
    TableModule,
    DialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService],
  template: `
  
  <p-toast></p-toast>
<div class="card p-6">
  
    <h2 class="text-xl font-bold mb-6">{{ isEditMode ? 'Edit User' : 'Create User' }}</h2>

   <!-- 1. Personal Information -->
<h3 class="section-header">1. Personal Information</h3>

<div class="grid grid-cols-12 gap-4 mb-6">
  <!-- Avatar Column (3 cols) -->
  <div class="col-span-12 md:col-span-3 flex justify-center items-start">
    <div>
      <label class="block font-semibold mt-16"></label>
      <div class="relative w-32 h-32">
        <label for="avatarInput">
          <div 
            class="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-500 transition"
            [ngClass]="{ 'p-0': avatarPreview, 'p-4': !avatarPreview }"
          >
            <ng-container *ngIf="avatarPreview; else emptyCircle">
              <img 
                [src]="avatarPreview" 
                alt="Avatar" 
                class="w-full h-full object-cover rounded-full"
              />
            </ng-container>
            <ng-template #emptyCircle>
              <span class="text-gray-400 text-sm text-center">Click to upload</span>
            </ng-template>
          </div>
        </label>
        <input 
          type="file" 
          id="avatarInput" 
          (change)="onAvatarChange($event)" 
          accept="image/*" 
          class="hidden" 
        />
      </div>
    </div>
  </div>

  <!-- Personal Info Fields (9 cols) -->
  <div class="col-span-12 md:col-span-9 grid grid-cols-12 gap-4">
    <div class="col-span-12 md:col-span-6">
      <label class="block font-semibold mb-1">Full Name <span class="text-red-500">*</span></label>
      <input type="text" pInputText class="w-full" [(ngModel)]="user.fullName" name="fullName" />
    </div>
    <div class="col-span-12 md:col-span-6">
      <label class="block font-semibold mb-1">Employee ID <span class="text-red-500">*</span></label>
      <input 
        type="text" 
        pInputText 
        class="w-full" 
        [(ngModel)]="user.employeeId" 
        name="employeeId" 
        (input)="onEmployeeIdInput()"
        [disabled]="!isManualSeries || (isEditMode && !isManualSeries)" 
        [placeholder]="!isManualSeries && !isEditMode ? 'Auto-generated' : ''" />
    </div>
    <div class="col-span-12 md:col-span-6">
      <label class="block font-semibold mb-1">Email <span class="text-red-500">*</span></label>
      <input type="text" pInputText class="w-full" [(ngModel)]="user.email" name="email" />
    </div>
    <div class="col-span-12 md:col-span-6">
      <label class="block font-semibold mb-1">Phone Number <span class="text-red-500">*</span></label>
      <input type="text" pInputText class="w-full" [(ngModel)]="user.phoneNumber" name="phoneNumber" />
    </div>
    <div class="col-span-12 md:col-span-6">
      <label class="block font-semibold mb-1">Gender <span class="text-red-500">*</span></label>
      <p-dropdown [options]="genders" optionLabel="label" optionValue="value" placeholder="Select Gender" class="w-full" [(ngModel)]="user.gender" name="gender" [filter]="true" filterBy="label"></p-dropdown>
    </div>
    <div class="col-span-12 md:col-span-6">
      <label class="block font-semibold mb-1">Date of Birth</label>
      <p-calendar class="w-full" dateFormat="yy-mm-dd" [(ngModel)]="user.dateOfBirth" name="dateOfBirth"></p-calendar>
    </div>
  </div>
</div>


    <!-- 2. Organizational Info -->
    <h3 class="section-header">2. Organizational Info</h3>
    <div class="grid grid-cols-12 gap-4 mb-6">
      <div class="col-span-12 md:col-span-6">
        <label class="block font-semibold mb-1">Branch</label>
        <p-multiSelect [options]="branchOptions" optionLabel="label" defaultLabel="Select Branches" class="w-full" [(ngModel)]="user.branch" name="branch" (onChange)="onBranchChange()"></p-multiSelect>
      </div>
      <div class="col-span-12 md:col-span-6">
        <label class="block font-semibold mb-1">Department</label>
        <p-multiSelect [options]="departmentOptions" optionLabel="label" defaultLabel="Select Departments" class="w-full" [(ngModel)]="user.department" name="department"></p-multiSelect>
      </div>
      <div class="col-span-12 md:col-span-6">
        <label class="block font-semibold mb-1">Designation</label>
        <p-dropdown [options]="designationOptions" optionLabel="value" optionValue="value" placeholder="Select Designation" class="w-full" [(ngModel)]="user.designation" name="designation" [filter]="true" filterBy="value"></p-dropdown>
      </div>
      <div class="col-span-12 md:col-span-6">
        <label class="block font-semibold mb-1">Reporting Manager</label>
        <input type="text" pInputText class="w-full" [(ngModel)]="user.reportingManager" name="reportingManager" />
      </div>
    </div>

    <!-- 3. Login Credentials -->
    <h3 class="section-header">3. Login Credentials</h3>
    <div class="grid grid-cols-12 gap-4 mb-6">
      <div class="col-span-12 md:col-span-6">
        <label class="block font-semibold mb-1">Username <span class="text-red-500">*</span></label>
        <input type="text" pInputText class="w-full" [(ngModel)]="user.username" name="username" (input)="onUsernameInput()" />
      </div>
      <div class="col-span-12 md:col-span-6">
        <label class="block font-semibold mb-1">Password <span class="text-red-500">*</span></label>
        <p-password 
          toggleMask="true" 
          feedback="false" 
          class="w-full" 
          [(ngModel)]="user.password" 
          name="password" 
          [disabled]="isEditMode"
          [placeholder]="isEditMode ? '********' : ''">
        </p-password>
      </div>
      <div class="col-span-12 md:col-span-6" *ngIf="!isEditMode">
        <label class="block font-semibold mb-1">Confirm Password <span class="text-red-500">*</span></label>
        <p-password toggleMask="true" feedback="false" class="w-full" [(ngModel)]="user.confirmPassword" name="confirmPassword"></p-password>
      </div>
    </div>

    <!-- 4. Access & Role -->
    <h3 class="section-header">4. Access & Role</h3>
    <div class="grid grid-cols-12 gap-4 mb-6">
      <div class="col-span-12 md:col-span-6">
        <label class="block font-semibold mb-1">Role</label>
        <p-dropdown 
          [options]="roleOptions" 
          optionLabel="value" 
          optionValue="value"
          placeholder="Select Role" 
          class="w-full"
          (onChange)="onRoleChange($event)"
          [(ngModel)]="user.role" name="role" [filter]="true" filterBy="value">
        </p-dropdown>
      </div>
      <div class="col-span-12 md:col-span-6">
        <label class="block font-semibold mb-1">Permissions</label>
        <p-multiSelect 
          [options]="permissions" 
          [(ngModel)]="selectedPermissions" 
          defaultLabel="Select Permissions" 
          [disabled]="!selectedRole"
          class="w-full">
        </p-multiSelect>
      </div>
      <div class="col-span-12 md:col-span-6">
        <label class="block font-semibold mb-1">Status</label>
        <p-dropdown [options]="statusOptions" optionLabel="value" optionValue="value" placeholder="Select Status" class="w-full" [(ngModel)]="user.status" name="status" [filter]="true" filterBy="value"></p-dropdown>
      </div>
    </div>

    <!-- 5. HR / Workflow -->
     <h3 class="section-header">5. Optional HR / Workflow</h3>
    <div class="grid grid-cols-12 gap-4 mb-6">
      <div class="col-span-12 md:col-span-6">
        <label class="block font-semibold mb-1">Joining Date</label>
        <p-calendar dateFormat="yy-mm-dd" class="w-full" [(ngModel)]="user.joiningDate" name="joiningDate"></p-calendar>
      </div>
      <div class="col-span-12 md:col-span-6">
        <label class="block font-semibold mb-1">Employment Type</label>
        <p-dropdown [options]="employmentTypes" optionLabel="label" placeholder="Select Type" class="w-full" [(ngModel)]="user.employmentType" name="employmentType" [filter]="true" filterBy="label"></p-dropdown>
      </div>
      <div class="col-span-12 md:col-span-6">
        <label class="block font-semibold mb-1">Vehicle Assigned</label>
        <input type="text" pInputText class="w-full" [(ngModel)]="user.vehicleAssigned" name="vehicleAssigned" />
      </div>
      <div class="col-span-12 md:col-span-6">
        <label class="block font-semibold mb-1">Shift Timing</label>
        <input type="text" pInputText class="w-full" placeholder="e.g. 9AM - 6PM" [(ngModel)]="user.shiftTiming" name="shiftTiming" />
      </div>
    </div>

    <!-- 6. Bio & Avatar -->
    <h3 class="section-header">6. Additional Info</h3>

    <div class="grid grid-cols-12 gap-4 mb-6">
      <div class="col-span-12">
        <label class="block font-semibold mb-1">Bio</label>
        <textarea pInputTextarea rows="3" class="w-full" [(ngModel)]="user.bio" name="bio"></textarea>
      </div>
    </div>

    <!-- 7. Document Upload -->
    <h3 class="section-header">7. Document Upload</h3>
    <div class="document-upload-section">
      <p-table [value]="userDocuments" [showGridlines]="true" [responsiveLayout]="'scroll'">
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
              <input type="file" (change)="onFileSelected($event, rowIndex)" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt" class="block w-full text-sm text-gray-500
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
                <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeDocument(rowIndex)" pTooltip="Delete Document"></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="footer">
          <tr>
            <td colspan="6">
              <button pButton label="Add Document" icon="pi pi-plus" (click)="addDocument()"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Submit -->
  <div class="flex justify-between items-center mt-4">
  <!-- Back Button -->
  <button
    class="text-sm text-blue-900 hover:underline"
    (click)="goBack()"
  >
    ← Back
  </button>

  <!-- Action Buttons: Cancel & Create -->
  <div class="flex gap-4">
    <button
      class="bg-gray-300 text-black hover:bg-gray-400 px-4 py-2 rounded"
      (click)="onCancel()"
    >
      Cancel
    </button>

    <button *ngIf="!isEditMode" class="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded" (click)="createUser()">Create User</button>
    <button *ngIf="isEditMode" class="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded" (click)="updateUser()">Update</button>
  </div>
  </div>
<p-confirmDialog [style]="{width: '350px'}" [baseZIndex]="10000"></p-confirmDialog>

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

  `
})
export class UserCreateComponent implements OnInit {
    
  avatarPreview: string | ArrayBuffer | null = null;
  selectedRole = '';
  permissions: any[] = [];
  selectedPermissions: any[] = [];
  isManualSeries: boolean = false;
  mappedEmployeeSeriesCode: string = '';
  user = {
    fullName: '',
    employeeId: '' as string | undefined,
    email: '',
    phoneNumber: '',
    gender: '',
    dateOfBirth: '' as any,
    branch: [] as any[],
    department: [] as any[],
    designation: '',
    reportingManager: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
    status: '',
    joiningDate: '' as any,
    employmentType: '' as string | { label: string },
    vehicleAssigned: '',
    shiftTiming: '',
    bio: '',
    avatar: null
  };
  genders = [
    { label: 'Male', value: 'M' },
    { label: 'Female', value: 'F' },
    { label: 'Other', value: 'O' }
  ];

  branches: any[] = [];

  departments: any[]=[];

  roles = [
    { label: 'Admin', value: 'admin' },
    { label: 'Manager', value: 'manager' },
    { label: 'Staff', value: 'staff' },
    { label: 'Driver', value: 'driver' }
  ];

  statuses = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  employmentTypes = [
    { label: 'Full-time' },
    { label: 'Part-time' },
    { label: 'Contract' },
    { label: 'Intern' }
  ];

  vehicleAssignedOptions = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' }
  ];

  rolePermissionsMap: { [key: string]: any[] } = {
    admin: [
      { label: 'Manage Users', value: 'manage_users' },
      { label: 'View Reports', value: 'view_reports' },
      { label: 'Approve Invoices', value: 'approve_invoices' },
      { label: 'Assign Roles', value: 'assign_roles' }
    ],
    manager: [
      { label: 'Approve Invoices', value: 'approve_invoices' },
      { label: 'View Reports', value: 'view_reports' }
    ],
    staff: [
      { label: 'View Shipments', value: 'view_shipments' },
      { label: 'Update Records', value: 'update_records' }
    ],
    driver: [
      { label: 'View Route', value: 'view_route' },
      { label: 'Confirm Delivery', value: 'confirm_delivery' }
    ]
  };

  usernameManuallyEdited = false;
  isEditMode = false;
  userId: string | null = null;
  designationOptions: any[] = [];
  statusOptions: any[] = [];
  roleOptions: any[] = [];
  
  // Document handling properties
  userDocuments: (EntityDocument & { file?: File })[] = [];
  documentUploadPath: string = '/uploads/documents/user';
  documentTypeOptions: any[] = [];
  
  // Document viewer dialog
  isDocumentViewerVisible = false;
  selectedDocument: EntityDocument | null = null;
  documentViewerUrl: string = '';
  safeDocumentViewerUrl: SafeResourceUrl | null = null;
  pdfLoaded: boolean = false;
  pdfError: boolean = false;

  onRoleChange(event: any) {
    this.selectedRole = event.value;
    this.permissions = this.rolePermissionsMap[this.selectedRole] || [];
    this.selectedPermissions = [];
  }

  onAvatarChange(event: any) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.avatarPreview = e.target.result;
      this.user.avatar = e.target.result; // Set avatar as base64 string
    };
    reader.readAsDataURL(file);
  }
  
  onEmployeeIdInput() {
    if (!this.usernameManuallyEdited && this.user.employeeId) {
      this.user.username = this.user.employeeId;
    }
  }

  onUsernameInput() {
    this.usernameManuallyEdited = true;
  }

  onCancel() {
    this.user = {
      fullName: '',
      employeeId: '',
      email: '',
      phoneNumber: '',
      gender: '',
      dateOfBirth: '',
      branch: [],
      department: [],
      designation: '',
      reportingManager: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: '',
      status: '',
      joiningDate: '',
      employmentType: '',
      vehicleAssigned: '',
      shiftTiming: '',
      bio: '',
      avatar: null
    };
    this.avatarPreview = null;
    this.selectedRole = '';
    this.selectedPermissions = [];
    this.permissions = [];
    this.usernameManuallyEdited = false;
    this.isEditMode = false;
    this.userId = null;
    this.userDocuments = []; // Reset documents array
  }
  constructor(
    private router: Router,
    private userService: UserService,
    private toast: ToastService,
    private branchService: BranchService,
    private departmentService: DepartmentService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private masterCodeService: MasterCodeService,
    private masterTypeService: MasterTypeService,
    private entityDocumentService: EntityDocumentService,
    private sanitizer: DomSanitizer,
    private numberSeriesService: NumberSeriesService,
    private mappingService: MappingService,
    private contextService: ContextService,
    private numberSeriesRelationService: NumberSeriesRelationService
  ) {}

  // Helper to map codes to option objects
  private mapCodesToOptions(codes: string[], options: any[]): any[] {
    return codes
      .map(code => options.find(opt => opt.code.toString() === code.toString()))
      .filter(opt => !!opt);
  }

  ngOnInit() {
    // Load document upload path and document type options
    this.loadDocumentUploadPath();
    this.loadDocumentTypeOptions();
    
    // Load employee number series configuration with context-based mapping
    this.loadMappedEmployeeSeriesCode();
    
    // Fetch branches and departments first
    let branchesLoaded = false;
    let departmentsLoaded = false;

    const tryLoadUser = () => {
      if (branchesLoaded && departmentsLoaded) {
        // Now safe to load user and set selected values
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
          this.isEditMode = true;
          this.userId = id;
          this.userService.getUserById(id).subscribe({
            next: (res: any) => {
              if (res.user) {
                // Extract branch and department codes from DB value
                const branchCodes = typeof res.user.branch === 'string'
                  ? res.user.branch.split(',').filter((b: string) => !!b && b !== '[object Object]')
                  : Array.isArray(res.user.branch)
                    ? res.user.branch.map((b: any) => typeof b === 'string' ? b : b.code)
                    : [];
                // Set user fields except department and permissions
                this.user = {
                  ...this.user,
                  fullName: res.user.full_name || '',
                  employeeId: res.user.employee_id || '',
                  email: res.user.email || '',
                  phoneNumber: res.user.phone || '',
                  gender: res.user.gender || '',
                  dateOfBirth: res.user.date_of_birth ? new Date(res.user.date_of_birth) : '',
                  joiningDate: res.user.joining_date ? new Date(res.user.joining_date) : '',
                  branch: this.mapCodesToOptions(branchCodes, this.branchOptions),
                  // department will be set below
                  designation: res.user.designation || '',
                  reportingManager: res.user.reporting_manager || '',
                  username: res.user.username || '',
                  password: '',
                  confirmPassword: '',
                  role: res.user.role || '',
                  status: res.user.status || '',
                  employmentType: this.employmentTypes.find(et => et.label === res.user.employment_type) || '',
                  vehicleAssigned: res.user.vehicle_assigned || '',
                  shiftTiming: res.user.shift_timing || '',
                  bio: res.user.bio || '',
                  avatar: res.user.avatar_url || null
                };
                if (res.user.avatar_url) {
                  this.avatarPreview = res.user.avatar_url;
                }
                // Set role and permissions options before assigning selectedPermissions
                this.selectedRole = this.user.role;
                this.permissions = this.rolePermissionsMap[this.selectedRole] || [];
                this.selectedPermissions = res.user.permission ? res.user.permission.split(',') : [];
                // Set department options and selected departments after branch is set
                const departmentCodes = typeof res.user.department === 'string'
                  ? res.user.department.split(',').filter((d: string) => !!d && d !== '[object Object]')
                  : Array.isArray(res.user.department)
                    ? res.user.department.map((d: any) => typeof d === 'string' ? d : d.code)
                    : [];
                this.user.department = this.mapCodesToOptions(departmentCodes, this.departmentOptions);
                
                // Load user documents
                if (res.user.employee_id) {
                  this.loadUserDocuments(res.user.employee_id);
                }
              }
            },
            error: (err: any) => {
              this.toast.showError('Error', 'Failed to load user details');
            }
          });
        }
      }
    };

    this.branchService.getAll().subscribe({
      next: (branches: any[]) => {
        this.branches = branches;
        branchesLoaded = true;
        tryLoadUser();
      },
      error: (err) => {
        this.toast.showError('Error', 'Failed to load branches');
        branchesLoaded = true;
        tryLoadUser();
      }
    });
    this.departmentService.getAll().subscribe({
      next: (departments: any[]) => {
        this.departments = departments;
        departmentsLoaded = true;
        tryLoadUser();
      },
      error: (err) => {
        this.toast.showError('Error', 'Failed to load departments');
        departmentsLoaded = true;
        tryLoadUser();
      }
    });

    this.masterCodeService.getMasters().subscribe((codes: any[]) => {
      console.log('Master Codes:', codes);
      // Designation
      const activeDesignationCode = (codes || []).find(
        (c: any) => c.code && c.code.trim().toLowerCase() === 'USER_DESIGNATION' && c.status && c.status.trim().toLowerCase() === 'active'
      );
      const activeStatusCode = (codes || []).find(
        (c: any) => c.code && c.code.trim().toLowerCase() === 'USER_STATUS' && c.status && c.status.trim().toLowerCase() === 'active'
      );
      const activeRoleCode = (codes || []).find(
        (c: any) => c.code && c.code.trim().toLowerCase() === 'USER_ROLE' && c.status && c.status.trim().toLowerCase() === 'active'
      );
      this.masterTypeService.getAll().subscribe((types: any[]) => {
        console.log('Master Types:', types);
        // Designation
        if (activeDesignationCode && activeDesignationCode.code) {
          this.designationOptions = (types || []).filter(
            (t: any) => t.key && t.key.trim().toLowerCase() === activeDesignationCode.code.trim().toLowerCase() && t.status && t.status.trim().toLowerCase() === 'active'
          );
        } else {
          this.designationOptions = [];
        }
        // Status
        if (activeStatusCode && activeStatusCode.code) {
          this.statusOptions = (types || []).filter(
            (t: any) => t.key && t.key.trim().toLowerCase() === activeStatusCode.code.trim().toLowerCase() && t.status && t.status.trim().toLowerCase() === 'active'
          );
        } else {
          this.statusOptions = [];
        }
        // Role
        if (activeRoleCode && activeRoleCode.code) {
          this.roleOptions = (types || []).filter(
            (t: any) => t.key && t.key.trim().toLowerCase() === activeRoleCode.code.trim().toLowerCase() && t.status && t.status.trim().toLowerCase() === 'active'
          );
        } else {
          this.roleOptions = [];
        }
        console.log('Designation Options:', this.designationOptions);
        console.log('Status Options:', this.statusOptions);
        console.log('Role Options:', this.roleOptions);
      });
    });
  }
  goBack() {
    this.router.navigate(['/settings/user_management']);
  }
  

  async createUser() {
    if (this.user.password !== this.user.confirmPassword) {
      this.toast.showError('Error', 'Passwords do not match!');
      return;
    }
    
    const context = this.contextService.getContext();
    
    // Store branch and department as comma-separated label strings
    const userToSend = {
      ...this.user,
      branch: Array.isArray(this.user.branch)
        ? this.user.branch
            .map((b: any) => (b && typeof b === 'object' && typeof b.code === 'string' ? b.code : (typeof b === 'string' ? b : '')))
            .filter((b: string) => !!b)
            .join(',')
        : '',
      department: Array.isArray(this.user.department)
        ? this.user.department
            .map((d: any) => (d && typeof d === 'object' && typeof d.code === 'string' ? d.code : (typeof d === 'string' ? d : '')))
            .filter((d: string) => !!d)
            .join(',')
        : '',
      employmentType: this.user.employmentType && typeof this.user.employmentType === 'object' && (this.user.employmentType as any).label
        ? (this.user.employmentType as any).label
        : this.user.employmentType,
      permission: this.selectedPermissions.join(','),
      // Add context information for backend number series generation
      seriesCode: this.mappedEmployeeSeriesCode,
      companyCode: context.companyCode,
      branchCode: context.branchCode,
      departmentCode: context.departmentCode,
      serviceTypeCode: context.serviceType
    };
    
    // If not manual series, let backend generate employee ID
    if (!this.isManualSeries) {
      userToSend.employeeId = ''; // Use empty string instead of undefined
    }
    
    try {
      const res = await this.userService.createUser(userToSend).toPromise();
      this.toast.showSuccess('Success', 'User created successfully!');
      
      // Save documents if user was created successfully
      if (res && res.user && res.user.employee_id) {
        // Use the response data to ensure we have the correct employee_id
        const userWithResponseData = { ...this.user, employeeId: res.user.employee_id };
        await this.saveDocuments(userWithResponseData);
      }
      
      this.confirmationService.confirm({
        message: 'Need to create another user?',
        header: 'Create Another User',
        icon: 'pi pi-question-circle',
        acceptLabel: 'Yes',
        rejectLabel: 'No',
        accept: () => {
          this.onCancel(); // Reset the form for a new user
        },
        reject: () => {
          this.router.navigate(['/settings/user_management']);
        }
      });
    } catch (err: any) {
      this.toast.showError('Error', 'Error creating user: ' + (err.error?.message || err.message));
    }
  }

  async updateUser() {
    if (!this.userId) return;
    // Store branch and department as comma-separated label strings
    const userToSend = {
      ...this.user,
      branch: Array.isArray(this.user.branch)
        ? this.user.branch
            .map((b: any) => (b && typeof b === 'object' && typeof b.code === 'string' ? b.code : (typeof b === 'string' ? b : '')))
            .filter((b: string) => !!b)
            .join(',')
        : '',
      department: Array.isArray(this.user.department)
        ? this.user.department
            .map((d: any) => (d && typeof d === 'object' && typeof d.code === 'string' ? d.code : (typeof d === 'string' ? d : '')))
            .filter((d: string) => !!d)
            .join(',')
        : '',
      employmentType: this.user.employmentType && typeof this.user.employmentType === 'object' && (this.user.employmentType as any).label
        ? (this.user.employmentType as any).label
        : this.user.employmentType,
      permission: this.selectedPermissions.join(',') // <-- send as comma-separated string
    };
    
    try {
      const res = await this.userService.updateUser(this.userId, userToSend).toPromise();
      this.toast.showSuccess('Success', 'User updated successfully!');
      
      // Save documents if user was updated successfully
      if (res && res.user && res.user.employee_id) {
        // Use the response data to ensure we have the correct employee_id
        const userWithResponseData = { ...this.user, employeeId: res.user.employee_id };
        await this.saveDocuments(userWithResponseData);
      }
      
      this.router.navigate(['/settings/user_management']);
    } catch (err: any) {
      this.toast.showError('Error', 'Error updating user: ' + (err.error?.message || err.message));
    }
  }

  get branchOptions() {
    return this.branches.map(branch => ({
      ...branch,
      label: `${branch.code}-${branch.name}`,
      value: branch.code
    }));
  }

  get departmentOptions() {
    if (!this.user.branch || this.user.branch.length === 0) {
      return [];
    }
    const selectedBranchCodes = this.user.branch.map((b: any) => b.code ? b.code : b);
    return this.departments
      .filter(dept => selectedBranchCodes.includes(dept.branch_code))
      .map(dept => ({
        ...dept,
        label: `${dept.code}-${dept.name}`,
        value: dept.code
      }));
  }

  onBranchChange() {
    this.user.department = [];
  }

  // Document handling methods
  loadDocumentUploadPath() {
    console.log('Loading document upload path for user...');
    this.entityDocumentService.getUploadPath('user').subscribe({
      next: (response: any) => {
        console.log('Document upload path loaded:', response.value);
        this.documentUploadPath = response.value;
      },
      error: (error: any) => {
        console.error('Error loading document upload path:', error);
        this.documentUploadPath = '/uploads/documents/user';
      }
    });
  }

  loadDocumentTypeOptions() {
    this.masterTypeService.getAll().subscribe({
      next: (types: any[]) => {
        this.documentTypeOptions = (types || [])
          .filter(t => t.key === 'USER_DOC_TYPE' && t.status === 'Active')
          .map(t => ({ label: t.value, value: t.value }));
        console.log('Document type options loaded:', this.documentTypeOptions);
      },
      error: (error) => {
        console.error('Error loading document types:', error);
        this.toast.showError('Error', 'Failed to load document types');
      }
    });
  }

  addDocument() {
    this.userDocuments.push({
      entity_type: 'user',
      entity_code: this.user.employeeId || '',
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

  removeDocument(index: number) {
    const document = this.userDocuments[index];
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this document?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (document.id) {
          // Delete from server if it exists
          this.entityDocumentService.delete(document.id).subscribe({
            next: () => {
              this.toast.showSuccess('Success', 'Document deleted');
              this.userDocuments.splice(index, 1);
            },
            error: (error: any) => {
              console.error('Error deleting document:', error);
              this.toast.showError('Error', 'Failed to delete document');
            }
          });
        } else {
          // Just remove from local array if not saved yet
          this.userDocuments.splice(index, 1);
          this.toast.showSuccess('Success', 'Document removed');
        }
      }
    });
  }

  onFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.userDocuments[index].file = file;
      this.userDocuments[index].file_name = file.name;
      this.userDocuments[index].file_size = file.size;
      this.userDocuments[index].mime_type = file.type;
    }
  }

  downloadDocument(doc: EntityDocument) {
    if (!doc.id) return;
    
    console.log('=== FRONTEND DOWNLOAD REQUEST ===');
    console.log('Document ID:', doc.id);
    console.log('Document:', doc);
    
    this.entityDocumentService.download(doc.id).subscribe({
      next: (blob: any) => {
        console.log('Download successful, blob size:', blob.size);
        console.log('Blob type:', blob.type);
        
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
          url: error.url
        });
        this.toast.showError('Error', 'Failed to download document');
      }
    });
  }

  viewDocument(doc: EntityDocument) {
    if (!doc.id) return;
    
    console.log('=== FRONTEND VIEW REQUEST ===');
    console.log('Document ID:', doc.id);
    console.log('Document:', doc);
    
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
        this.safeDocumentViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.documentViewerUrl);
        
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
          url: error.url
        });
        this.toast.showError('Error', 'Failed to view document');
        this.hideDocumentViewer();
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

  loadUserDocuments(employeeId: string) {
    this.entityDocumentService.getByEntityCode('user', employeeId).subscribe({
      next: (documents: any) => {
        this.userDocuments = documents;
      },
      error: (error: any) => {
        console.error('Error loading user documents:', error);
        this.userDocuments = [];
      }
    });
  }

  private loadMappedEmployeeSeriesCode() {
    const context = this.contextService.getContext();
    console.log('Loading employee series code for context:', context);
    
    // Use context-based mapping with NumberSeriesRelation
    this.mappingService.findMappingByContext(
      'employeeCode',
      context.companyCode || '',
      context.branchCode || '',
      context.departmentCode || '',
      context.serviceType || undefined
    ).subscribe({
      next: (contextMapping) => {
        console.log('Employee mapping relation response:', contextMapping);
        this.mappedEmployeeSeriesCode = contextMapping.mapping;
        if (this.mappedEmployeeSeriesCode) {
          this.numberSeriesService.getAll().subscribe({
            next: (seriesList) => {
              const found = seriesList.find((s: any) => s.code === this.mappedEmployeeSeriesCode);
              this.isManualSeries = !!(found && found.is_manual);
              console.log('Employee series code mapped:', this.mappedEmployeeSeriesCode, 'Manual:', this.isManualSeries);
            },
            error: (error) => {
              console.error('Error loading number series:', error);
            }
          });
        } else {
          this.isManualSeries = false;
          console.log('No employee series code mapping found for context');
        }
      },
      error: (error) => {
        console.error('Error loading employee mapping relation:', error);
        // Fallback to generic mapping if context-based mapping fails
        console.log('Falling back to generic mapping method');
        this.mappingService.getMapping().subscribe({
          next: (mapping) => {
            console.log('Fallback mapping response:', mapping);
            this.mappedEmployeeSeriesCode = mapping.employeeCode || '';
            if (this.mappedEmployeeSeriesCode) {
              this.numberSeriesService.getAll().subscribe({
                next: (seriesList) => {
                  const found = seriesList.find((s: any) => s.code === this.mappedEmployeeSeriesCode);
                  this.isManualSeries = !!(found && found.is_manual);
                  console.log('Employee series code mapped (fallback):', this.mappedEmployeeSeriesCode, 'Manual:', this.isManualSeries);
                },
                error: (error) => {
                  console.error('Error loading number series (fallback):', error);
                  this.isManualSeries = true; // Default to manual if error
                }
              });
            } else {
              this.isManualSeries = true; // Default to manual if no mapping
            }
          },
          error: (error) => {
            console.error('Error loading fallback mapping:', error);
            this.isManualSeries = true; // Default to manual if error
          }
        });
      }
    });
  }

  async saveDocuments(userData?: any) {
    const user = userData || this.user;
    console.log('=== SAVE DOCUMENTS DEBUG ===');
    console.log('User data received:', user);
    console.log('User employeeId:', user?.employeeId);
    console.log('User fullName:', user?.fullName);
    
    if (!user?.employeeId) {
      console.log('No employeeId found, returning early');
      return;
    }

    // Filter out documents without doc_type selected
    const documentsToUpload = this.userDocuments.filter(doc => doc.file && !doc.id && doc.doc_type);
    const documentsWithoutDocType = this.userDocuments.filter(doc => doc.file && !doc.id && !doc.doc_type);
    
    if (documentsWithoutDocType.length > 0) {
      this.toast.showError('Validation Error', 'Please select document type for all documents before saving');
      return;
    }

    const uploadPromises = documentsToUpload
      .map(doc => {
        console.log('Preparing to upload document:', {
          entity_type: 'user',
          entity_code: user.employeeId,
          entity_name: user.fullName, // Include user name for folder creation
          doc_type: doc.doc_type,
          document_number: doc.document_number || '',
          valid_from: doc.valid_from || '',
          valid_till: doc.valid_till || '',
          file_name: doc.file?.name,
          uploadPath: this.documentUploadPath
        });

        console.log('=== FRONTEND UPLOAD DEBUG ===');
        console.log('Document upload path being sent:', this.documentUploadPath);
        console.log('User employeeId:', user.employeeId);
        console.log('User fullName:', user.fullName);
        
        const formData = new FormData();
        formData.append('entity_type', 'user');
        formData.append('entity_code', user.employeeId);
        formData.append('entity_name', user.fullName); // Include user name for folder creation
        formData.append('doc_type', doc.doc_type);
        formData.append('document_number', doc.document_number || '');
        formData.append('valid_from', doc.valid_from || '');
        formData.append('valid_till', doc.valid_till || '');
        formData.append('document', doc.file!);
        formData.append('uploadPath', this.documentUploadPath);

        return this.entityDocumentService.uploadDocument(formData).toPromise();
      });

    const updatePromises = this.userDocuments
      .filter(doc => doc.id && !doc.file) // Only update existing documents without new files
      .map(doc => {
        return this.entityDocumentService.update(doc.id!, {
          doc_type: doc.doc_type,
          document_number: doc.document_number,
          valid_from: doc.valid_from,
          valid_till: doc.valid_till
        }).toPromise();
      });

    await Promise.all([...uploadPromises, ...updatePromises]);
    this.toast.showSuccess('Success', 'Documents saved successfully');
    this.loadUserDocuments(user.employeeId);
  }
}
