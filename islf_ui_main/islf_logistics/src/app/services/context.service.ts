import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompanyService } from './company.service';
import { BranchService } from './branch.service';
import { DepartmentService } from './department.service';

export interface UserContext {
  companyCode?: string;
  branchCode?: string;
  departmentCode?: string;
}

@Injectable({ providedIn: 'root' })
export class ContextService {
  private context: UserContext = {};
  private storageKey = 'userContext';

  // Option subjects
  companyOptions$ = new BehaviorSubject<{ label: string, value: string }[]>([]);
  branchOptions$ = new BehaviorSubject<{ label: string, value: string }[]>([]);
  departmentOptions$ = new BehaviorSubject<{ label: string, value: string }[]>([]);

  constructor(
    private companyService: CompanyService,
    private branchService: BranchService,
    private departmentService: DepartmentService
  ) {
    const stored = sessionStorage.getItem(this.storageKey);
    if (stored) {
      this.context = JSON.parse(stored);
    }
  }

  setContext(ctx: UserContext) {
    this.context = ctx;
    sessionStorage.setItem(this.storageKey, JSON.stringify(ctx));
  }

  getContext(): UserContext {
    return this.context;
  }

  clearContext() {
    this.context = {};
    sessionStorage.removeItem(this.storageKey);
  }

  isContextSet(): boolean {
    return !!(this.context.companyCode && this.context.branchCode && this.context.departmentCode);
  }

  loadOptions() {
    this.companyService.getAll().subscribe(companies => {
      this.companyOptions$.next(companies.map(c => ({ label: c.name, value: c.code })));
    });
    this.branchService.getAll().subscribe(branches => {
      this.branchOptions$.next(branches.map(b => ({ label: b.name, value: b.code })));
    });
    this.departmentService.getAll().subscribe(depts => {
      this.departmentOptions$.next(depts.map(d => ({ label: d.name, value: d.code })));
    });
  }
}
