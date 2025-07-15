// user-create.component.ts (unchanged except for layout tweaks in template)
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
  ],
  template: `
  
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
      <input type="text" pInputText class="w-full" [(ngModel)]="user.employeeId" name="employeeId" (input)="onEmployeeIdInput()" />
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
      <p-dropdown [options]="genders" optionLabel="label" optionValue="value" placeholder="Select Gender" class="w-full" [(ngModel)]="user.gender" name="gender"></p-dropdown>
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
        <input type="text" pInputText class="w-full" [(ngModel)]="user.designation" name="designation" />
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
        <p-password toggleMask="true" feedback="false" class="w-full" [(ngModel)]="user.password" name="password"></p-password>
      </div>
      <div class="col-span-12 md:col-span-6">
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
          [options]="roles" 
          optionLabel="label" 
          optionValue="value"
          placeholder="Select Role" 
          class="w-full"
          (onChange)="onRoleChange($event)"
          [(ngModel)]="user.role" name="role">
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
        <p-dropdown [options]="statuses" optionLabel="label" optionValue="value" placeholder="Select Status" class="w-full" [(ngModel)]="user.status" name="status"></p-dropdown>
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
        <p-dropdown [options]="employmentTypes" optionLabel="label" placeholder="Select Type" class="w-full" [(ngModel)]="user.employmentType" name="employmentType"></p-dropdown>
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


  `
})
export class UserCreateComponent implements OnInit {
    
  avatarPreview: string | ArrayBuffer | null = null;
  selectedRole = '';
  permissions: any[] = [];
  selectedPermissions: any[] = [];
  user = {
    fullName: '',
    employeeId: '',
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
    employmentType: '',
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
    { label: 'Inactive', value: 'Inactive' },
    { label: 'Suspended', value: 'Suspended' }
  ];

  employmentTypes = [
    { label: 'Full-time' },
    { label: 'Part-time' },
    { label: 'Contract' },
    { label: 'Intern' }
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
    };
    reader.readAsDataURL(file);
  }
  
  onEmployeeIdInput() {
    if (!this.usernameManuallyEdited) {
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
  }
  constructor(
    private router: Router,
    private userService: UserService,
    private toast: ToastService,
    private branchService: BranchService,
    private departmentService: DepartmentService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.branchService.getAll().subscribe({
      next: (branches: any[]) => {
        this.branches = branches;
      },
      error: (err) => {
        this.toast.showError('Error', 'Failed to load branches');
      }
    });
    this.departmentService.getAll().subscribe({
      next: (departments: any[]) => {
        this.departments = departments;
      },
      error: (err) => {
        this.toast.showError('Error', 'Failed to load departments');
      }
    });
    // Load user for editing if ID is present
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.userId = id;
      this.userService.getUserById(id).subscribe({
        next: (res: any) => {
          if (res.user) {
            // Map backend fields to form fields
            this.user = {
              ...this.user,
              fullName: res.user.full_name || '',
              employeeId: res.user.employee_id || '',
              email: res.user.email || '',
              phoneNumber: res.user.phone || '',
              gender: res.user.gender || '',
              dateOfBirth: res.user.date_of_birth ? new Date(res.user.date_of_birth) : '',
              joiningDate: res.user.joining_date ? new Date(res.user.joining_date) : '',
              branch: res.user.branch
                ? Array.isArray(res.user.branch)
                  ? res.user.branch
                  : (typeof res.user.branch === 'string' && res.user.branch.length > 0 ? res.user.branch.split(',') : [])
                : [],
              department: res.user.department
                ? Array.isArray(res.user.department)
                  ? res.user.department
                  : (typeof res.user.department === 'string' && res.user.department.length > 0 ? res.user.department.split(',') : [])
                : [],
              designation: res.user.designation || '',
              reportingManager: res.user.reporting_manager || '',
              username: res.user.username || '',
              password: '',
              confirmPassword: '',
              role: res.user.role || '',
              status: res.user.status || '',
              employmentType: res.user.employment_type || '',
              vehicleAssigned: res.user.vehicle_assigned || '',
              shiftTiming: res.user.shift_timing || '',
              bio: res.user.bio || '',
              avatar: res.user.avatar_url || null
            };
            if (res.user.avatar_url) {
              this.avatarPreview = res.user.avatar_url;
            }
          }
        },
        error: (err: any) => {
          this.toast.showError('Error', 'Failed to load user details');
        }
      });
    }
  }
  goBack() {
    this.router.navigate(['/setup/user_management']);
  }
  

  createUser() {
    if (this.user.password !== this.user.confirmPassword) {
      this.toast.showError('Error', 'Passwords do not match!');
      return;
    }
    // Store branch and department as comma-separated label strings
    const userToSend = {
      ...this.user,
      branch: Array.isArray(this.user.branch) ? this.user.branch.map(b => b.label).join(',') : '',
      department: Array.isArray(this.user.department) ? this.user.department.map(d => d.label).join(',') : '',
      permissions: this.selectedPermissions
    };
    this.userService.createUser(userToSend).subscribe({
      next: (res: any) => {
        this.toast.showSuccess('Success', 'User created successfully!');
        this.onCancel();
      },
      error: (err: any) => {
        this.toast.showError('Error', 'Error creating user: ' + (err.error?.message || err.message));
      }
    });
  }

  updateUser() {
    if (!this.userId) return;
    // Store branch and department as comma-separated label strings
    const userToSend = {
      ...this.user,
      branch: Array.isArray(this.user.branch) ? this.user.branch.map(b => b.label).join(',') : '',
      department: Array.isArray(this.user.department) ? this.user.department.map(d => d.label).join(',') : '',
      permissions: this.selectedPermissions
    };
    this.userService.updateUser(this.userId, userToSend).subscribe({
      next: (res: any) => {
        this.toast.showSuccess('Success', 'User updated successfully!');
        // Optionally reset or navigate back
        // this.onCancel();
        // this.router.navigate(['/setup/user_management']);
      },
      error: (err: any) => {
        this.toast.showError('Error', 'Error updating user: ' + (err.error?.message || err.message));
      }
    });
  }

  get branchOptions() {
    return this.branches.map(branch => ({
      ...branch,
      label: `${branch.code}-${branch.name}`
    }));
  }

  get departmentOptions() {
    if (!this.user.branch || this.user.branch.length === 0) {
      return [];
    }
    // user.branch is an array of selected branch objects or codes
    const selectedBranchCodes = this.user.branch.map((b: any) => b.code ? b.code : b);
    return this.departments
      .filter(dept => selectedBranchCodes.includes(dept.branch_code))
      .map(dept => ({
        ...dept,
        label: `${dept.code}-${dept.name}`
      }));
  }

  onBranchChange() {
    this.user.department = [];
  }
}
