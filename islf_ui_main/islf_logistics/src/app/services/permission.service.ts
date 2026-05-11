import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { isAdminBypassRole } from '../constants/roles';

export interface ModulePermission {
  module_name: string;
  sub_module_name: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor() { }

  private getPermissions(): ModulePermission[] {
    const perms = localStorage.getItem('userPermissions');
    if (perms) {
      try {
        return JSON.parse(perms);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  /**
   * Phase K1: Admin bypass uses centralized isAdminBypassRole() instead of
   * hardcoded string comparisons. This supports SYSTEM_ADMIN, ADMIN, and
   * legacy 'admin' roles transparently.
   */
  private hasAdminBypass(): boolean {
    const role = localStorage.getItem('userRole');
    return isAdminBypassRole(role);
  }

  canRead(moduleName: string, subModuleName: string): boolean {
    if (this.hasAdminBypass()) return true;

    const perms = this.getPermissions();
    if (perms.length === 0) return false;
    const match = perms.find(p => p.module_name === moduleName && p.sub_module_name === subModuleName);
    if(!match) return false;
    return match.can_read;
  }

  canWrite(moduleName: string, subModuleName: string): boolean {
    if (this.hasAdminBypass()) return true;

    const perms = this.getPermissions();
    if (perms.length === 0) return false;
    const match = perms.find(p => p.module_name === moduleName && p.sub_module_name === subModuleName);
    if(!match) return false;
    return match.can_write;
  }

  canDelete(moduleName: string, subModuleName: string): boolean {
    if (this.hasAdminBypass()) return true;

    const perms = this.getPermissions();
    if (perms.length === 0) return false;
    const match = perms.find(p => p.module_name === moduleName && p.sub_module_name === subModuleName);
    if(!match) return false;
    return match.can_delete;
  }

  // Check if user has read access to any sub-module within a module
  canReadModule(moduleName: string): boolean {
    const perms = this.getPermissions();
    return perms.some(p => p.module_name === moduleName && p.can_read);
  }
}
