import { Component, OnInit } from '@angular/core';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
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
    ButtonModule,
    ToastModule,
    ToggleSwitchModule,
    TableModule
  ,
    HasPermissionDirective
],
  template: `
    <p-toast></p-toast>
    <div class="card">

      <!-- Page Title — matches User Mgmt / Master Types pattern -->
      <div class="font-semibold text-xl mb-4">Roles &amp; Permissions</div>

      <!-- Role Selection Row — mirrors the "Add User / Clear / Search" caption pattern -->
      <div class="flex justify-between items-center flex-col sm:flex-row gap-2 mb-4">
        <div class="flex align-items-center gap-3 w-full sm:w-auto" style="min-width:280px; flex:1;">
          <label class="font-medium text-color-secondary white-space-nowrap">Role:</label>
          <p-dropdown
            [options]="roleOptions"
            [(ngModel)]="selectedRole"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Role"
            (onChange)="onRoleChange()"
            [style]="{'width':'100%'}"
            [filter]="true"
            filterBy="label"
            [showClear]="true">
          </p-dropdown>
        </div>
        <ng-container *appHasPermission="{ module: 'Settings', subModule: 'Authorization', action: 'write' }">
<button pButton label="Save Changes" icon="pi pi-check" class="p-button" (click)="savePermissions()" [disabled]="!selectedRole"></button>
</ng-container>
      </div>

      <small *ngIf="roleOptions.length === 0" class="text-orange-500 block mb-3">
        <i class="pi pi-exclamation-triangle mr-1"></i> No roles found. Add roles via Master Types (key: USER_ROLE).
      </small>

      <!-- Module Tab Bar — standard pill-button row used in ISLF settings pages -->
      <div *ngIf="selectedRole" class="flex overflow-x-auto gap-2 mb-4 pb-1">
        <button
          *ngFor="let m of moduleOptions"
          pButton
          [label]="m.label"
          class="p-button-sm white-space-nowrap"
          [class.p-button-outlined]="selectedModule !== m.value"
          (click)="selectedModule = m.value">
        </button>
      </div>

      <!-- Permissions Table — same structure as every ISLF settings table -->
      <div *ngIf="selectedRole && selectedModule">

        <!-- Grant / Revoke strip — placed where "Add / Clear" buttons go in other modules -->
        <div class="flex justify-between items-center mb-3">
          <span class="font-medium text-color-secondary">
            Sub-modules in <strong>{{ selectedModule }}</strong>
          </span>
          <div class="flex gap-2">
            <button pButton label="Grant All" icon="pi pi-check-circle"
              class="p-button-sm p-button-outlined p-button-success"
              (click)="grantAllInModule()"></button>
            <button pButton label="Revoke All" icon="pi pi-times-circle"
              class="p-button-sm p-button-outlined p-button-danger"
              (click)="revokeAllInModule()"></button>
          </div>
        </div>

        <p-table
          [value]="filteredPermissions"
          [showGridlines]="true"
          [rowHover]="true"
          responsiveLayout="scroll">

          <ng-template #header>
            <tr>
              <th>Sub-Module</th>
              <th style="width:120px; text-align:center;">Read</th>
              <th style="width:120px; text-align:center;">Write</th>
              <th style="width:120px; text-align:center;">Delete</th>
            </tr>
          </ng-template>

          <ng-template #body let-perm>
            <tr>
              <td>
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-box text-color-secondary"></i>
                  <span class="font-medium">{{ perm.sub_module_name }}</span>
                </div>
              </td>
              <td style="text-align:center;">
                <p-toggleswitch [(ngModel)]="perm.can_read"></p-toggleswitch>
              </td>
              <td style="text-align:center;">
                <p-toggleswitch [(ngModel)]="perm.can_write"></p-toggleswitch>
              </td>
              <td style="text-align:center;">
                <p-toggleswitch [(ngModel)]="perm.can_delete"></p-toggleswitch>
              </td>
            </tr>
          </ng-template>

          <ng-template #emptymessage>
            <tr>
              <td colspan="4" class="text-center p-5">
                <i class="pi pi-inbox text-4xl text-400 mb-3 block"></i>
                <span class="text-600">No sub-modules found for {{ selectedModule }}</span>
              </td>
            </tr>
          </ng-template>

        </p-table>
      </div>

    </div>
  `
})
export class AuthorizationComponent implements OnInit {
  roleOptions: any[] = [];
  selectedRole: string = '';
  selectedModule: string = '';
  permissionsMatrix: ModulePermission[] = [];

  moduleOptions: any[] = [];

  allModules = [
    { module: 'Settings', subModules: ['Company Mgmt', 'No. Series', 'No. Series Relation', 'No. Series Mapping', 'IT Setup', 'User Mgmt', 'Carriage Direction', 'Roles & Permissions'] },
    { module: 'Logs', subModules: ['Auth Logs', 'Masters Logs', 'Master Type Logs', 'Operations Logs', 'Setup Logs', 'System Logs'] },
    { module: 'Masters', subModules: ['Master Code', 'Master Type', 'Customer', 'Vendor', 'Location', 'Vessel', 'Airline', 'Unit of Measure', 'Basis', 'Master Item', 'Cargo', 'Charges', 'Currency Code', 'Container', 'GST Setup', 'Local Tariff', 'Sourcing', 'Service Area', 'Source Sales'] },
    { module: 'Master Types', subModules: ['User Status', 'Tariff Type', 'Customer', 'Vendor', 'Cargo Type', 'Charge Type', 'Basis', 'Service Area', 'Item', 'Location', 'Carriage'] },
    { module: 'Search', subModules: ['Tariff'] },
    { module: 'Operations', subModules: ['Enquiry', 'Booking', 'Job Card'] }
  ];

  constructor(
    private http: HttpClient,
    private masterTypeService: MasterTypeService,
    private toastService: ToastService
  ) {
    this.moduleOptions = this.allModules.map(m => ({ label: m.module, value: m.module }));
  }

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.masterTypeService.getAll().subscribe({
      next: (types: any[]) => {
        if (types && types.length > 0) {
          const roleTypes = types.filter(
            t => t.key && t.key.trim().toLowerCase() === 'user_role'
              && t.status && t.status.trim().toLowerCase() === 'active'
          );
          this.roleOptions = roleTypes.map(r => ({ label: r.value, value: r.value }));
        } else {
          this.roleOptions = [];
        }

        if (this.roleOptions.length === 0) {
          console.warn('[Roles & Permissions] No roles found in master_types (key=USER_ROLE). Please add roles via Master Types screen.');
        }
      },
      error: (err) => {
        console.error('[Roles & Permissions] Failed to load roles from master_types:', err);
        this.roleOptions = [];
        this.toastService.showError('Error', 'Failed to load roles. Please check Master Types configuration.');
      }
    });
  }

  get filteredPermissions(): ModulePermission[] {
    let result = this.permissionsMatrix;

    if (this.selectedRole !== 'SYSTEM_ADMIN') {
      result = result.filter(p => !(p.module_name === 'Settings' && p.sub_module_name === 'IT Setup'));
    }

    if (!this.selectedModule) {
      return [];
    }
    return result.filter(p => p.module_name === this.selectedModule);
  }

  onRoleChange() {
    this.selectedModule = this.moduleOptions[0]?.value || '';
    this.loadPermissionsForRole();
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

  grantAllInModule() {
    this.filteredPermissions.forEach(perm => {
      perm.can_read = true;
      perm.can_write = true;
      perm.can_delete = true;
    });
    this.toastService.showSuccess('Granted', 'All permissions granted for ' + this.selectedModule);
  }

  revokeAllInModule() {
    this.filteredPermissions.forEach(perm => {
      perm.can_read = false;
      perm.can_write = false;
      perm.can_delete = false;
    });
    this.toastService.showSuccess('Revoked', 'All permissions revoked for ' + this.selectedModule);
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
