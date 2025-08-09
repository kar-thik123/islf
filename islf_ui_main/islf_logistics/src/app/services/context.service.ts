import { Inject, Injectable, forwardRef, Injector } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CompanyService } from './company.service';
import { BranchService } from './branch.service';
import { DepartmentService } from './department.service';
import { ServiceTypeService } from './servicetype.service';

export interface UserContext {
  companyCode?: string;
  branchCode?: string;
  departmentCode?: string;
  serviceType?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ContextService {
  private context: UserContext = {};
  private storageKey = 'userContext';

  // Private option subjects with initial empty arrays
  private companyOptions = new BehaviorSubject<{ label: string; value: string }[]>([]);
  private branchOptions = new BehaviorSubject<{ label: string; value: string }[]>([]);
  private departmentOptions = new BehaviorSubject<{ label: string; value: string }[]>([]);
  private serviceTypeOptions = new BehaviorSubject<{ label: string; value: string }[]>([]);

  // Public observables that ensure we never emit null
  companyOptions$: Observable<{ label: string; value: string }[]> = this.companyOptions.asObservable();
  branchOptions$: Observable<{ label: string; value: string }[]> = this.branchOptions.asObservable();
  departmentOptions$: Observable<{ label: string; value: string }[]> = this.departmentOptions.asObservable();
  serviceTypeOptions$: Observable<{ label: string; value: string }[]> = this.serviceTypeOptions.asObservable();

  constructor(private injector: Injector) {
    const stored = sessionStorage.getItem(this.storageKey);
    console.log('Context service initialized, stored context:', stored);
    if (stored) {
      this.context = JSON.parse(stored);
    }
  }

  setContext(ctx: UserContext) {
    console.log('Setting context:', ctx);
    this.context = ctx;
    sessionStorage.setItem(this.storageKey, JSON.stringify(ctx));
  }

  getContext(): UserContext {
    return this.context;
  }

  clearContext() {
    console.log('Clearing context');
    this.context = {};
    sessionStorage.removeItem(this.storageKey);
  }

  isContextSet(): boolean {
    console.log('Context check:', this.context);
    return !!(this.context.companyCode && this.context.branchCode && this.context.departmentCode);
  }

  loadOptions() {
    const companyService = this.injector.get(CompanyService);
    const branchService = this.injector.get(BranchService);
    const departmentService = this.injector.get(DepartmentService);

    companyService.getAll().pipe(
      map(companies => companies?.map(c => ({ label: c.name, value: c.code })) || []),
      catchError(() => of([]))
    ).subscribe(options => this.companyOptions.next(options));

    // Load all branches and departments initially
    branchService.getAll().pipe(
      map(branches => branches?.map(b => ({ label: b.name, value: b.code })) || []),
      catchError(() => of([]))
    ).subscribe(options => this.branchOptions.next(options));

    departmentService.getAll().pipe(
      map(depts => depts?.map(d => ({ label: d.name, value: d.code })) || []),
      catchError(() => of([]))
    ).subscribe(options => this.departmentOptions.next(options));
  }

  loadBranchesForCompany(companyCode: string) {
    const branchService = this.injector.get(BranchService);
    
    branchService.getByCompany(companyCode).pipe(
      map(branches => branches?.map(b => ({ label: b.name, value: b.code })) || []),
      catchError(() => of([]))
    ).subscribe(options => this.branchOptions.next(options));
  }

  loadDepartmentsForBranch(branchCode: string) {
    const departmentService = this.injector.get(DepartmentService);
    
    departmentService.getByBranch(branchCode).pipe(
      map(depts => depts?.map(d => ({ label: d.name, value: d.code })) || []),
      catchError(() => of([]))
    ).subscribe(options => this.departmentOptions.next(options));
  }

  clearBranchOptions() {
    this.branchOptions.next([]);
  }

  clearDepartmentOptions() {
    this.departmentOptions.next([]);
  }

  loadServiceTypesForDepartment(departmentCode: string) {
    const serviceTypeService = this.injector.get(ServiceTypeService);
    
    serviceTypeService.getByDepartment(departmentCode).pipe(
      map(serviceTypes => serviceTypes?.map(st => ({ label: st.name, value: st.code })) || []),
      catchError(() => of([]))
    ).subscribe(options => this.serviceTypeOptions.next(options));
  }

  clearServiceTypeOptions() {
    this.serviceTypeOptions.next([]);
  }

  someMethod() {
    // Removed unnecessary self-injection
  }
}
