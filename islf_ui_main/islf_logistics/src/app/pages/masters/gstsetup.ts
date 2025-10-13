import { Component, OnInit, OnDestroy, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MasterLocationService } from '@/services/master-location.service';
import { GstSetupService } from '@/services/gstsetup.service';
import { ConfigService } from '../../services/config.service';
import { ContextService } from '../../services/context.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MasterLocationComponent } from './masterlocation';
import { DialogModule } from 'primeng/dialog';
import {State} from 'country-state-city';
import { state } from '@angular/animations';


interface GstRule {
  id?: number;
  from?: string;
  to?: string;
  sgst?: boolean;
  cgst?: boolean;
  igst?: boolean;
  isEditing?: boolean;
  isNew?: boolean;
}

@Component({
  selector: 'gst-setup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CheckboxModule,
    ToastModule,
    MasterLocationComponent,
    DialogModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">GST Setup</div>
      <p-table
        #dt
        [value]="gstRules()"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['from', 'to']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add GST Rule" icon="pi pi-plus" (click)="addRow()"></button>
            <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search keyword" class="ml-auto" />
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th>From</th>
            <th>To</th>
            <th>SGST</th>
            <th>CGST</th>
            <th>IGST</th>
            <th style="min-width: 80px;">Action</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-rule>
          <tr>
            <td>
              <ng-container *ngIf="rule.isEditing; else fromText">
                <div class="flex gap-2 items-start">
                  <div class="flex flex-col flex-1">
                    <p-dropdown
                      [options]="locationOptions"
                      [(ngModel)]="rule.from"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Select From"
                      appendTo="body"
                      [filter]="true"
                      (onChange)="onFieldChange(rule, 'from', rule.from)"
                      [ngClass]="getFieldErrorClass(rule, 'from')"
                      [ngStyle]="getFieldErrorStyle(rule, 'from')"
                    ></p-dropdown>
                    <small *ngIf="getFieldError(rule, 'from')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(rule, 'from') }}</small>
                  </div>
                  <button pButton icon="pi pi-ellipsis-h" class="p-button-sm" (click)="openMasterLocationDialog()"></button>
                </div>
              </ng-container>
              <ng-template #fromText>{{ rule.from }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="rule.isEditing; else toText">
                <div class="flex gap-2 items-start">
                  <div class="flex flex-col flex-1">
                    <p-dropdown
                      [options]="locationOptions"
                      [(ngModel)]="rule.to"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Select To"
                      appendTo="body"
                      [filter]="true"
                      (onChange)="onFieldChange(rule, 'to', rule.to)"
                      [ngClass]="getFieldErrorClass(rule, 'to')"
                      [ngStyle]="getFieldErrorStyle(rule, 'to')"
                    ></p-dropdown>
                    <small *ngIf="getFieldError(rule, 'to')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(rule, 'to') }}</small>
                  </div>
                  <button pButton icon="pi pi-ellipsis-h" class="p-button-sm" (click)="openMasterLocationDialog()"></button>
                </div>
              </ng-container>
              <ng-template #toText>{{ rule.to }}</ng-template>
            </td>
            <td>
              <p-checkbox [(ngModel)]="rule.sgst" binary="true" [disabled]="!rule.isEditing"></p-checkbox>
            </td>
            <td>
              <p-checkbox [(ngModel)]="rule.cgst" binary="true" [disabled]="!rule.isEditing"></p-checkbox>
            </td>
            <td>
              <p-checkbox [(ngModel)]="rule.igst" binary="true" [disabled]="!rule.isEditing"></p-checkbox>
            </td>
            <td>
              <div class="flex items-center space-x-[8px]">
                <button pButton icon="pi pi-pencil" class="p-button-sm" (click)="editRow(rule)" *ngIf="!rule.isEditing"></button>
                <button pButton icon="pi pi-check" class="p-button-sm" (click)="saveRow(rule)" [disabled]="!isValid(rule)" *ngIf="rule.isEditing"></button>
                <button pButton icon="pi pi-trash" class="p-button-sm" severity="danger" (click)="deleteRow(rule)"></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="paginatorleft" let-state>
          <div class="text-sm text-gray-600">
            Total GST Rules: {{ state.totalRecords }}
          </div>
        </ng-template>
      </p-table>
    </div>

    <!-- Master Location Dialog -->
    <p-dialog
      header="Location Master"
      [(visible)]="showMasterLocationDialog"
      [modal]="true"
      [style]="{ width: 'auto', minWidth: '60vw', maxWidth: '95vw', height: 'auto', maxHeight: '90vh' }"
      [contentStyle]="{ overflow: 'visible' }"
      [baseZIndex]="10000"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterLocationDialog()"
    >
      <ng-template pTemplate="content">
        <master-location></master-location>
      </ng-template>
    </p-dialog>
  `
})
export class GstSetupComponent implements OnInit, OnDestroy {
  gstRules = signal<GstRule[]>([]);
  locationOptions: { label: string, value: string }[] = [];
  fieldErrors: { [key: string]: { [field: string]: string } } = {};
  private contextSubscription: Subscription | undefined;
  @ViewChild('dt') dt!: Table;
  showMasterLocationDialog = false;

  constructor(
    private messageService: MessageService,
    private masterLocationService: MasterLocationService,
    private gstSetupService: GstSetupService,
    private configService: ConfigService,
    private contextService: ContextService
  ) {}

  ngOnInit() {
    this.refreshList();
    
    // Subscribe to context changes and reload data when context changes
    this.contextSubscription = this.contextService.context$.pipe(
      debounceTime(300), // Wait 300ms after the last context change
      distinctUntilChanged() // Only emit when context actually changes
    ).subscribe(() => {
      console.log('Context changed in GstSetupComponent, reloading data...');
      this.refreshList();
    });
  }

  ngOnDestroy() {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }
  }

  refreshList() {
    console.log('Refreshing GST setup list');
    
    try {
      // ❌ Remove context validation block
      
      // Load GST rules from database
      this.gstSetupService.getAll().subscribe({
        next: (rules) => {
          this.gstRules.set((rules || []).map((rule: any) => ({
            ...rule,
            isEditing: false,
            isNew: false
          })));
          console.log('GST rules loaded successfully:', rules.length);
        },
        error: (error) => {
          console.error('Error loading GST rules:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to load GST rules' 
          });
        }
      });
      
      // Load GST locations for dropdowns
      this.loadLocationDropdownOptions();
    } catch (error) {
      console.error('Error in refreshList:', error);
    }
  }

  addRow() {
    console.log('Add GST Rule button clicked - starting addRow method');
    
    // Get the validation settings
    const config = this.configService.getConfig();
    const gstsetupFilter = config?.validation?.gstsetupFilter || '';
    
    console.log('GST Setup filter:', gstsetupFilter);
    
    // Check if we need to validate context
    if (gstsetupFilter) {
      // Get the current context
      const context = this.contextService.getContext();
      
      console.log('Current context:', context);
      
      // Check if the required context is set based on the filter
      const missingContexts: string[] = [];
      
      if (gstsetupFilter.includes('C') && !context.companyCode) {
        missingContexts.push('Company');
      }
      if (gstsetupFilter.includes('B') && !context.branchCode) {
        missingContexts.push('Branch');
      }
      if (gstsetupFilter.includes('D') && !context.departmentCode) {
        missingContexts.push('Department');
      }
      
      if (missingContexts.length > 0) {
        console.log('Missing contexts:', missingContexts);
        this.messageService.add({
          severity: 'warn',
          summary: 'Context Required',
          detail: `Please select ${missingContexts.join(', ')} before adding GST rule`
        });
        
        // Trigger the context selector
        this.contextService.showContextSelector();
        return;
      }
    }
    
    // If validation passes or no validation required, proceed with adding row
    const newRow: GstRule = {
      from: '',
      to: '',
      sgst: false,
      cgst: false,
      igst: false,
      isEditing: true,
      isNew: true
    };
    this.gstRules.set([newRow, ...this.gstRules()]);
    
    console.log('New GST rule row added successfully');
  }

  editRow(rule: GstRule) {
    this.gstRules.set(this.gstRules().map(r => r === rule ? { ...r, isEditing: true } : { ...r, isEditing: false }));
  }

  saveRow(rule: GstRule) {
    // Validate required fields on save
    if (!rule.from || !rule.from.trim()) {
      this.onFieldChange(rule, 'from', rule.from);
    }
    if (!rule.to || !rule.to.trim()) {
      this.onFieldChange(rule, 'to', rule.to);
    }
    if (!this.isValid(rule)) return;
    
    if (rule.isNew) {
      // Create new GST rule
      const newRule = {
        from: rule.from,
        to: rule.to,
        sgst: rule.sgst || false,
        cgst: rule.cgst || false,
        igst: rule.igst || false
      };
      
      this.gstSetupService.create(newRule).subscribe({
        next: (created) => {
          console.log('GST rule created successfully:', created);
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Saved', 
            detail: 'GST Rule saved successfully' 
          });
          this.refreshList(); // Reload the list to get the updated data
        },
        error: (error) => {
          console.error('Error creating GST rule:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to save GST rule' 
          });
        }
      });
    } else {
      // Update existing GST rule
      const updateRule = {
        from: rule.from,
        to: rule.to,
        sgst: rule.sgst || false,
        cgst: rule.cgst || false,
        igst: rule.igst || false
      };
      
      this.gstSetupService.update(rule.id!, updateRule).subscribe({
        next: (updated) => {
          console.log('GST rule updated successfully:', updated);
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Updated', 
            detail: 'GST Rule updated successfully' 
          });
          this.refreshList(); // Reload the list to get the updated data
        },
        error: (error) => {
          console.error('Error updating GST rule:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to update GST rule' 
          });
        }
      });
    }
  }

  deleteRow(rule: GstRule) {
    if (rule.id) {
      // Delete from database
      this.gstSetupService.delete(rule.id).subscribe({
        next: () => {
          console.log('GST rule deleted successfully');
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Deleted', 
            detail: 'GST Rule deleted successfully' 
          });
          this.refreshList(); // Reload the list
        },
        error: (error) => {
          console.error('Error deleting GST rule:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to delete GST rule' 
          });
        }
      });
    } else {
      // Remove from UI only (for new unsaved rows)
      this.gstRules.set(this.gstRules().filter(r => r !== rule));
      this.messageService.add({ 
        severity: 'success', 
        summary: 'Deleted', 
        detail: 'GST Rule removed' 
      });
    }
  }

  clear(table: Table) {
    table.clear();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // Validation
  onFieldChange(rule: GstRule, field: string, value: any) {
    const key = rule.id || rule.from || rule.to || 'new';
    if (!this.fieldErrors[key]) this.fieldErrors[key] = {};
    const error = this.validateField(field, value);
    if (error) {
      this.fieldErrors[key][field] = error;
    } else {
      delete this.fieldErrors[key][field];
    }
  }

  validateField(field: string, value: any): string {
    if (!value || value.trim() === '') {
      return `*${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }
    return '';
  }

  getFieldError(rule: GstRule, field: string): string {
    const key = rule.id || rule.from || rule.to || 'new';
    return this.fieldErrors[key]?.[field] || '';
  }

  getFieldErrorClass(rule: GstRule, field: string): string {
    return this.getFieldError(rule, field) ? 'p-invalid' : '';
  }

  getFieldErrorStyle(rule: GstRule, field: string): { [key: string]: string } {
    return this.getFieldError(rule, field) ? { 'border-color': '#f44336' } : {};
  }

  isValid(rule: GstRule): boolean {
    return !!rule.from?.trim() && !!rule.to?.trim() &&
       !this.getFieldError(rule, 'from') &&
       !this.getFieldError(rule, 'to');

  }

  openMasterLocationDialog() {
    this.showMasterLocationDialog = true;
  }

  closeMasterLocationDialog() {
    this.showMasterLocationDialog = false;
    // Reload GST locations so newly added entries appear in dropdowns
    this.loadLocationDropdownOptions();
  }

  private loadLocationDropdownOptions() {
    this.locationOptions = State.getStatesOfCountry('IN').map(state=>({
      label: state.name,
      value: state.name
    }));
    // this.masterLocationService.getAll().subscribe({
    //   next: (locations) => {
    //     const gstLocations = (locations || []).filter(l => l.type === 'GST' && l.active);
    //     this.locationOptions = gstLocations.map(l => ({
    //       label: `${l.gst_state_code} - ${l.name}`,
    //       value: `${l.gst_state_code} - ${l.name}`
    //     }));
    //     console.log('GST locations loaded successfully:', this.locationOptions.length);
    //   },
    //   error: (error) => {
    //     console.error('Error loading GST locations:', error);
    //     this.messageService.add({ 
    //       severity: 'error', 
    //       summary: 'Error', 
    //       detail: 'Failed to load GST locations' 
    //     });
    //     this.locationOptions = [];
    //   }
    // });
  }
}
