import { Inject, Injectable, forwardRef, Injector } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CompanyService } from './company.service';
import { BranchService } from './branch.service';
import { DepartmentService } from './department.service';
import { ServiceTypeService } from './servicetype.service';
import { AuthService } from './auth.service';


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

  // Global BehaviorSubject for context changes
  private contextSubject = new BehaviorSubject<UserContext>({});
  public context$ = this.contextSubject.asObservable();

  // Private option subjects with initial empty arrays
  private companyOptions = new BehaviorSubject<{ label: string; value: string }[]>([]);
  private branchOptions = new BehaviorSubject<{ label: string; value: string }[]>([]);
  private departmentOptions = new BehaviorSubject<{ label: string; value: string }[]>([]);
  private serviceTypeOptions = new BehaviorSubject<{ label: string; value: string }[]>([]);

  // Subject to trigger showing the context selector
  private showContextSelectorSubject = new BehaviorSubject<boolean>(false);
  public showContextSelector$ = this.showContextSelectorSubject.asObservable();

  // Public observables that ensure we never emit null
  companyOptions$: Observable<{ label: string; value: string }[]> = this.companyOptions.asObservable();
  branchOptions$: Observable<{ label: string; value: string }[]> = this.branchOptions.asObservable();
  departmentOptions$: Observable<{ label: string; value: string }[]> = this.departmentOptions.asObservable();
  serviceTypeOptions$: Observable<{ label: string; value: string }[]> = this.serviceTypeOptions.asObservable();

  constructor(private injector: Injector) {
    const stored = sessionStorage.getItem(this.storageKey);
    console.log('[DEBUG-CONTEXT] ContextService constructor - stored context:', stored);
    if (stored) {
      try {
        this.context = JSON.parse(stored);
        console.log('[DEBUG-CONTEXT] Context parsed successfully:', this.context);
        // Important: notify subscribers about the restored context immediately
        this.contextSubject.next(this.context);
      } catch (e) {
        console.error('[DEBUG-CONTEXT] Failed to parse stored context:', e);
      }
    }
  }

  setContext(ctx: UserContext) {
    console.log('[DEBUG-CONTEXT] setContext called with:', ctx);
    this.context = ctx; // This completely replaces the old context
    const contextStr = JSON.stringify(ctx);
    sessionStorage.setItem(this.storageKey, contextStr);
    console.log('[DEBUG-CONTEXT] Context saved to sessionStorage:', contextStr);

    // Emit the new context to all subscribers
    this.contextSubject.next(ctx);
  }

  getContext(): UserContext {
    return this.context;
  }

  clearContext() {
    console.log('Clearing context');
    this.context = {};
    sessionStorage.removeItem(this.storageKey);

    // Emit the cleared context to all subscribers
    this.contextSubject.next(this.context);
  }

  isContextSet(): boolean {
    console.log('Context check:', this.context);
    return !!this.context.companyCode;
  }

  private getUserAssignments() {
    const authService = this.injector.get(AuthService);
    const token = authService.getToken();
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      
      return {
        role: payload.role,
        company_code: payload.company_code ? payload.company_code.split(',').map((s: string) => s.trim()) : null,
        branch: payload.branch ? payload.branch.split(',').map((s: string) => s.trim()) : null,
        department: payload.department ? payload.department.split(',').map((s: string) => s.trim()) : null
      };
    } catch (e) {
      console.error('Failed to decode token for context filtering', e);
      return null;
    }
  }

  private isBypassRole(role: string): boolean {
    return ['SYSTEM_ADMIN', 'ADMIN'].includes(role);
  }

  isBypassRolePublic(): boolean {
    const assignments = this.getUserAssignments();
    return assignments ? this.isBypassRole(assignments.role) : true;
  }

  loadOptions() {
    const authService = this.injector.get(AuthService);
    if (!authService.isAuthenticated()) {
      console.warn('ContextService: Skipping loadOptions as user is not authenticated');
      return;
    }

    const assignments = this.getUserAssignments();
    const bypass = assignments ? this.isBypassRole(assignments.role) : true;

    const companyService = this.injector.get(CompanyService);
    const branchService = this.injector.get(BranchService);
    const departmentService = this.injector.get(DepartmentService);

    companyService.getAll().pipe(
      map(companies => companies?.map(c => ({ label: c.name, value: c.code })) || []),
      map(options => {
        if (bypass || !assignments?.company_code) return options;
        return options.filter(o => assignments.company_code!.includes(o.value));
      }),
      catchError(() => of([]))
    ).subscribe(options => this.companyOptions.next(options));

    // Load all branches and departments initially
    branchService.getAll().pipe(
      map(branches => branches?.map(b => ({ label: b.name, value: b.code })) || []),
      map(options => {
        if (bypass || !assignments?.branch) return options;
        return options.filter(o => assignments.branch!.includes(o.value));
      }),
      catchError(() => of([]))
    ).subscribe(options => this.branchOptions.next(options));

    departmentService.getAll().pipe(
      map(depts => depts?.map(d => ({ label: d.name, value: d.code })) || []),
      map(options => {
        if (bypass || !assignments?.department) return options;
        return options.filter(o => assignments.department!.includes(o.value));
      }),
      catchError(() => of([]))
    ).subscribe(options => this.departmentOptions.next(options));
  }

  loadBranchesForCompany(companyCode: string) {
    const branchService = this.injector.get(BranchService);
    const assignments = this.getUserAssignments();
    const bypass = assignments ? this.isBypassRole(assignments.role) : true;

    branchService.getByCompany(companyCode).pipe(
      map(branches => branches?.map(b => ({ label: b.name, value: b.code })) || []),
      map(options => {
        if (bypass || !assignments?.branch) return options;
        return options.filter(o => assignments.branch!.includes(o.value));
      }),
      catchError(() => of([]))
    ).subscribe(options => this.branchOptions.next(options));
  }

  loadDepartmentsForBranch(branchCode: string) {
    const departmentService = this.injector.get(DepartmentService);
    const assignments = this.getUserAssignments();
    const bypass = assignments ? this.isBypassRole(assignments.role) : true;

    departmentService.getByBranch(branchCode).pipe(
      map(depts => depts?.map(d => ({ label: d.name, value: d.code })) || []),
      map(options => {
        if (bypass || !assignments?.department) return options;
        return options.filter(o => assignments.department!.includes(o.value));
      }),
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
      map(serviceTypes => serviceTypes?.map(st => ({ label: st.name, value: st.name })) || []),
      catchError(() => of([]))
    ).subscribe(options => this.serviceTypeOptions.next(options));
  }

  clearServiceTypeOptions() {
    this.serviceTypeOptions.next([]);
  }

  someMethod() {
    // Removed unnecessary self-injection
  }

  /**
   * Trigger the context selector to be shown.
   * For dynamic roles, if context is already fully set, this is a no-op.
   * For bypass roles, always shows the selector.
   */
  showContextSelector() {
    if (!this.isBypassRolePublic() && this.isContextSet()) {
      // Dynamic user already has context set — skip the dialog
      return;
    }
    this.showContextSelectorSubject.next(true);
  }

  /**
   * Hide the context selector
   */
  hideContextSelector() {
    this.showContextSelectorSubject.next(false);
  }

  /**
   * Called on initial dashboard load to trigger progressive context setup.
   * Loads options. For dynamic roles, auto-selection happens in ContextSelectorComponent
   * subscriptions once options emit. For bypass roles, nothing extra is needed
   * (they always use the manual selector).
   */
  triggerProgressiveContextSetup() {
    this.loadOptions();
  }
}
