import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MasterTypeService } from '../../services/mastertype.service';
import { ToastService } from '../../services/toast.service';

export interface ModulePermission {
  module_name: string;
  sub_module_name: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
}

@Component({
  selector: 'app-authorization',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    TableModule,
    ButtonModule,
    ToastModule,
    CheckboxModule,
    HttpClientModule
  ],
  template: `
    <p-toast></p-toast>
    <div class="card p-6">
      <h2 class="text-xl font-bold mb-6">Role-Based Authorization configuration</h2>
      
      <div class="flex gap-4 mb-6 align-items-end">
        <div class="field w-full md:w-3">
          <label class="block font-semibold mb-2">Select Role</label>
          <p-dropdown 
            [options]="roleOptions" 
            [(ngModel)]="selectedRole" 
            optionLabel="label" 
            optionValue="value" 
            placeholder="Select a Role"
            (onChange)="loadPermissionsForRole()"
            class="w-full"
            [style]="{'width':'100%'}">
          </p-dropdown>
        </div>
      </div>

      <div *ngIf="selectedRole">
        <p-table [value]="permissionsMatrix" styleClass="p-datatable-gridlines p-datatable-sm" [responsive]="true">
          <ng-template pTemplate="header">
            <tr>
              <th>Module</th>
              <th>Sub-Module</th>
              <th class="text-center w-2">Read</th>
              <th class="text-center w-2">Write (Add/Edit)</th>
              <th class="text-center w-2">Delete</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-perm>
            <tr>
              <td>{{ perm.module_name }}</td>
              <td>{{ perm.sub_module_name }}</td>
              <td class="text-center">
                <p-checkbox [(ngModel)]="perm.can_read" [binary]="true"></p-checkbox>
              </td>
              <td class="text-center">
                <p-checkbox [(ngModel)]="perm.can_write" [binary]="true"></p-checkbox>
              </td>
              <td class="text-center">
                <p-checkbox [(ngModel)]="perm.can_delete" [binary]="true"></p-checkbox>
              </td>
            </tr>
          </ng-template>
        </p-table>

        <div class="mt-4 flex justify-end">
          <button pButton label="Save Permissions" icon="pi pi-save" (click)="savePermissions()" class="p-button-success"></button>
        </div>
      </div>
    </div>
  `
})
export class AuthorizationComponent implements OnInit {
  roleOptions: any[] = [];
  selectedRole: string = '';
  permissionsMatrix: ModulePermission[] = [];
  
  // Define all available modules and submodules based on app.menu.ts
  allModules = [
    { module: 'Settings', subModules: ['Company Mgmt', 'No. Series', 'No. Series Relation', 'No. Series Mapping', 'IT Setup', 'User Mgmt', 'Carriage Direction', 'Authorization'] },
    { module: 'Logs', subModules: ['Auth Logs', 'Masters Logs', 'Master Type Logs', 'Operations Logs', 'Setup Logs', 'System Logs'] },
    { module: 'Masters', subModules: ['Master Code', 'Master Type', 'Customer', 'Vendor', 'Location', 'Vessel', 'Airline', 'Unit of Measure', 'Basis', 'Master Item', 'Cargo', 'Charges', 'Currency Code', 'Container', 'GST Setup', 'Local Tariff', 'Sourcing', 'Service Area', 'Source Sales'] },
    { module: 'Master Types', subModules: ['User Status', 'Tariff Type', 'Customer', 'Vendor', 'Cargo Type', 'Charge Type', 'Basis', 'Service Area', 'Item', 'Location', 'Carriage'] },
    { module: 'Search', subModules: ['Tariff'] },
    { module: 'Operations', subModules: ['Enquiry', 'Booking'] }
  ];

  constructor(
    private http: HttpClient,
    private masterTypeService: MasterTypeService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.masterTypeService.getAll().subscribe({
      next: (types: any[]) => {
        if (types && types.length > 0) {
          const roleTypes = types.filter(t => t.key && t.key.trim().toLowerCase() === 'user_role' && t.status && t.status.trim().toLowerCase() === 'active');
          if (roleTypes.length > 0) {
            this.roleOptions = roleTypes.map(r => ({ label: r.value, value: r.value }));
          }
        }
        
        // If master types are empty or don't have roles, provide default fallback roles
        if (this.roleOptions.length === 0) {
          this.roleOptions = [
            { label: 'admin', value: 'admin' },
            { label: 'manager', value: 'manager' },
            { label: 'staff', value: 'staff' },
            { label: 'driver', value: 'driver' }
          ];
        } else {
             // add those from usercreate.ts static list in case they are missing
             const defaults = ['admin', 'manager', 'staff', 'driver'];
             defaults.forEach(d => {
                 if (!this.roleOptions.find(ro => ro.value === d)) {
                     this.roleOptions.push({label: d, value: d});
                 }
             });
        }
      },
      error: () => {
        // Fallback
        this.roleOptions = [
          { label: 'admin', value: 'admin' },
          { label: 'manager', value: 'manager' },
          { label: 'staff', value: 'staff' },
          { label: 'driver', value: 'driver' }
        ];
      }
    });
  }

  buildEmptyMatrix() {
    const matrix: ModulePermission[] = [];
    this.allModules.forEach(m => {
      m.subModules.forEach(sm => {
        matrix.push({
          module_name: m.module,
          sub_module_name: sm,
          can_read: false,
          can_write: false,
          can_delete: false
        });
      });
    });
    return matrix;
  }

  loadPermissionsForRole() {
    if (!this.selectedRole) return;
    
    this.permissionsMatrix = this.buildEmptyMatrix();
    
    this.http.get<{permissions: ModulePermission[]}>(`${environment.apiUrl}/api/authorization/${this.selectedRole}`).subscribe({
      next: (res) => {
        const savedPerms = res.permissions || [];
        // Merge saved permissions with the empty matrix
        savedPerms.forEach(sp => {
          const match = this.permissionsMatrix.find(p => p.module_name === sp.module_name && p.sub_module_name === sp.sub_module_name);
          if (match) {
            match.can_read = sp.can_read;
            match.can_write = sp.can_write;
            match.can_delete = sp.can_delete;
          }
        });
      },
      error: (err) => {
        this.toastService.showError('Error', 'Failed to load permissions for role');
      }
    });
  }

  savePermissions() {
    if (!this.selectedRole) return;
    
    this.http.post(`${environment.apiUrl}/api/authorization/${this.selectedRole}`, {
      roleName: this.selectedRole,
      permissions: this.permissionsMatrix
    }).subscribe({
      next: () => {
        this.toastService.showSuccess('Success', 'Permissions saved successfully');
      },
      error: (err) => {
        this.toastService.showError('Error', 'Failed to save permissions');
      }
    });
  }
}
