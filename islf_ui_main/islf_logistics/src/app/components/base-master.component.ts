import { OnInit, OnDestroy, Directive } from '@angular/core';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { ContextService } from '../services/context.service';
import { ConfigService } from '../services/config.service';
import { BaseMasterService } from '../services/base-master.service';

@Directive()
export abstract class BaseMasterComponent<T extends object> implements OnInit, OnDestroy {
  abstract data: T[];
  abstract selectedItem: (T & { isNew?: boolean }) | null;
  abstract isDialogVisible: boolean;
  abstract filterKey: string; // e.g., 'uomFilter', 'containerFilter', etc.
  
  private contextSubscription: Subscription | undefined;

  constructor(
    protected masterService: BaseMasterService<T>,
    protected messageService: MessageService,
    protected contextService: ContextService,
    protected configService: ConfigService
  ) {}

  ngOnInit() {
    this.refreshList();
    this.setupContextSubscription();
    this.loadAdditionalData();
  }

  ngOnDestroy() {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }
  }

  private setupContextSubscription() {
    this.contextSubscription = this.contextService.context$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      console.log(`Context changed in ${this.constructor.name}, reloading data...`);
      this.refreshList();
    });
  }

  refreshList() {
    this.masterService.getAll().subscribe(data => {
      this.data = data;
    });
  }

  // Common context validation for add button
  validateContextForAdd(): boolean {
    const config = this.configService.getConfig();
    const filterValue = config?.validation?.[this.filterKey as keyof typeof config.validation] || '';
    
    if (!filterValue) {
      return true; // No validation required
    }

    const context = this.contextService.getContext();
    let contextValid = true;
    let missingContexts: string[] = [];
    
    if (filterValue.includes('C') && !context.companyCode) {
      contextValid = false;
      missingContexts.push('Company');
    }
    
    if (filterValue.includes('B') && !context.branchCode) {
      contextValid = false;
      missingContexts.push('Branch');
    }
    
    if (filterValue.includes('D') && !context.departmentCode) {
      contextValid = false;
      missingContexts.push('Department');
    }
    
    if (filterValue.includes('ST') && !context.serviceType) {
      contextValid = false;
      missingContexts.push('Service Type');
    }
    
    if (!contextValid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Context Required',
        detail: `Please select ${missingContexts.join(', ')} in the context selector before adding a record.`
      });
      
      this.contextService.showContextSelector();
      return false;
    }
    
    return true;
  }

  // Common add method
  addRow() {
    if (!this.validateContextForAdd()) {
      return;
    }
    
    this.selectedItem = this.createNewItem();
    this.isDialogVisible = true;
  }

  // Common hide dialog method
  hideDialog() {
    this.isDialogVisible = false;
    this.selectedItem = null;
  }

  // Common global filter method
  onGlobalFilter(event: Event, table: any) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // Common clear method
  clear(table: any) {
    table.clear();
  }

  // Abstract methods to be implemented by child components
  abstract createNewItem(): T & { isNew?: boolean };
  abstract saveRow(): void;
  abstract editRow(item: T): void;
  
  // Optional method for loading additional data (dropdowns, etc.)
  protected loadAdditionalData(): void {
    // Override in child components if needed
  }
}