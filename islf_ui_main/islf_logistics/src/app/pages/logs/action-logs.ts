import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { HasPermissionDirective } from '../../directives/has-permission.directive';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { LogService, ActionLog, ActionLogFilters, AuditLogChange } from '../../services/log.service';
import { ConfigService } from '../../services/config.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-action-logs',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    CalendarModule,
    DropdownModule,
    DialogModule,
    TooltipModule,
    FormsModule,
    ToastModule
  ,
    HasPermissionDirective
],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="card p-4">
      <div class="flex justify-between items-center mb-6">
        <div class="font-semibold text-2xl text-primary">{{ getDomainTitle() }} Logs</div>
        <div class="flex gap-2">
            <button pButton label="Clear Filters" class="p-button-outlined p-button-secondary" icon="pi pi-filter-slash" (click)="clearFilters()"></button>
            <ng-container *appHasPermission="{ module: 'Logs', subModule: 'System Logs', action: 'write' }">
<button pButton label="Export Excel" class="p-button-success" icon="pi pi-file-excel" (click)="exportExcel()"></button>
</ng-container>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-surface-50 dark:bg-surface-800 p-4 border-round mb-4 border-1 border-surface-200 dark:border-surface-700">
        <div class="grid grid-cols-12 gap-4 items-end">
          <div class="col-span-12 md:col-span-3">
            <label class="block text-sm font-bold mb-2 text-surface-700 dark:text-surface-200">Date Range</label>
            <p-calendar 
              [(ngModel)]="dateRange" 
              selectionMode="range" 
              [showIcon]="true" 
              placeholder="Select Date Range"
              styleClass="w-full"
              (onSelect)="loadLogs()"
              (onClearClick)="loadLogs()">
            </p-calendar>
          </div>
          <div class="col-span-12 md:col-span-2">
            <label class="block text-sm font-bold mb-2 text-surface-700 dark:text-surface-200">Action</label>
            <p-dropdown 
              [options]="actionOptions" 
              [(ngModel)]="selectedAction" 
              placeholder="All Actions"
              styleClass="w-full"
              [showClear]="true"
              (onChange)="loadLogs()">
            </p-dropdown>
          </div>
          <div class="col-span-12 md:col-span-2">
            <label class="block text-sm font-bold mb-2 text-surface-700 dark:text-surface-200">Status</label>
            <p-dropdown 
              [options]="statusOptions" 
              [(ngModel)]="selectedStatus" 
              placeholder="All Status"
              styleClass="w-full"
              [showClear]="true"
              (onChange)="loadLogs()">
            </p-dropdown>
          </div>
          <div class="col-span-12 md:col-span-5">
            <label class="block text-sm font-bold mb-2 text-surface-700 dark:text-surface-200">Module</label>
            <p-dropdown 
              [options]="modulesList" 
              [(ngModel)]="selectedModule" 
              placeholder="All Modules"
              styleClass="w-full"
              [showClear]="true"
              [filter]="true"
              (onChange)="loadLogs()">
            </p-dropdown>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="w-full overflow-hidden">
        <p-table
          [value]="logs()"
          [lazy]="true"
          (onLazyLoad)="onLazyLoad($event)"
          [paginator]="true"
          [rows]="rows"
          [totalRecords]="totalRecords()"
          [loading]="loading()"
          [showGridlines]="true"
          [rowHover]="true"
          responsiveLayout="scroll"
          [rowsPerPageOptions]="[10, 20, 50, 100]"
          styleClass="p-datatable-sm w-full"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 12rem" class="bg-surface-100 dark:bg-surface-700 font-bold">Timestamp</th>
              <th style="width: 8rem" class="bg-surface-100 dark:bg-surface-700 font-bold">User</th>
              <th style="width: 10rem" class="bg-surface-100 dark:bg-surface-700 font-bold">Module</th>
              <th style="width: 8rem" class="bg-surface-100 dark:bg-surface-700 font-bold">Action</th>
              <th style="width: 15rem" class="bg-surface-100 dark:bg-surface-700 font-bold">Record Name</th>
              <th style="width: 20rem" class="bg-surface-100 dark:bg-surface-700 font-bold">Summary</th>
              <th style="width: 7rem" class="bg-surface-100 dark:bg-surface-700 text-center font-bold">Status</th>
              <th style="width: 4rem" class="bg-surface-100 dark:bg-surface-700 text-center font-bold">View</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-log>
            <tr (click)="viewDetails(log)" class="cursor-pointer">
              <td class="text-sm">{{ log.timestamp | date: 'medium' }}</td>
              <td class="text-sm font-medium">{{ log.username }}</td>
              <td><span class="font-bold text-primary uppercase text-xs">{{ log.module_name }}</span></td>
              <td><span class="font-semibold text-xs">{{ log.action }}</span></td>
              <td class="font-medium text-surface-700 dark:text-surface-200">{{ log.record_name }}</td>
              <td class="text-surface-600 dark:text-surface-300 text-sm">{{ log.summary }}</td>
              <td class="text-center">
                <span [class]="'badge status-' + log.status.toLowerCase()">
                  {{ log.status }}
                </span>
              </td>
              <td class="text-center">
                <button pButton icon="pi pi-eye" class="p-button-rounded p-button-text p-button-sm" (click)="viewDetails(log); $event.stopPropagation()"></button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="text-center p-8 text-surface-500 font-medium">
                <i class="pi pi-filter-slash text-4xl mb-3 block opacity-50"></i>
                No logs found for the selected criteria.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <!-- Details Dialog -->
    <p-dialog 
      header="Log Details" 
      [(visible)]="detailsVisible" 
      [modal]="true" 
      [style]="{width: '70vw'}" 
      [maximizable]="true"
      [draggable]="false"
      [resizable]="false"
    >
      <div *ngIf="selectedLog" class="p-fluid">
        <!-- Business Summary -->
        <div class="bg-surface-50 dark:bg-surface-800 p-4 rounded mb-4 border border-surface-200 dark:border-surface-700">
             <div class="grid grid-cols-2 gap-4">
                 <div>
                     <label class="text-xs font-bold text-surface-500 uppercase block mb-1">Module</label>
                     <div class="font-bold text-lg capitalize">{{selectedLog.module_name}}</div>
                 </div>
                 <div>
                     <label class="text-xs font-bold text-surface-500 uppercase block mb-1">Action</label>
                     <div class="font-bold text-lg">{{selectedLog.action}}</div>
                 </div>
                 <div class="col-span-2">
                     <label class="text-xs font-bold text-surface-500 uppercase block mb-1">Summary</label>
                     <div class="text-base">{{selectedLog.summary}} - <strong>{{selectedLog.record_name}}</strong></div>
                 </div>
             </div>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-4">
             <div>
                 <label class="text-xs font-bold text-surface-500 uppercase block mb-1">User</label>
                 <div>{{selectedLog.username}}</div>
             </div>
             <div>
                 <label class="text-xs font-bold text-surface-500 uppercase block mb-1">Timestamp</label>
                 <div>{{selectedLog.timestamp | date: 'medium'}}</div>
             </div>
             <div>
                 <label class="text-xs font-bold text-surface-500 uppercase block mb-1">Status</label>
                 <span [class]="'badge status-' + selectedLog.status.toLowerCase()">{{ selectedLog.status }}</span>
             </div>
        </div>

        <!-- Field Changes Table -->
        <div *ngIf="selectedLog.changes && selectedLog.changes.length > 0" class="mb-6">
            <h3 class="text-lg font-bold mb-3 border-b pb-2 text-primary">Field Changes</h3>
            <p-table [value]="selectedLog.changes" styleClass="p-datatable-sm" [showGridlines]="true">
                <ng-template pTemplate="header">
                    <tr>
                        <th class="bg-surface-50 font-bold">Field Name</th>
                        <th class="bg-surface-50 font-bold">Old Value</th>
                        <th class="bg-surface-50 font-bold">New Value</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-change>
                    <tr>
                        <td class="font-medium text-sm">{{ change.field_label }}</td>
                        <td class="text-sm bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300">
                            {{ change.old_value || '(empty)' }}
                        </td>
                        <td class="text-sm bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-300">
                            {{ change.new_value || '(empty)' }}
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Technical Toggle -->
        <div class="mt-6 border-t pt-4">
            <button pButton 
                [label]="showTechnical ? 'Hide Technical Details' : 'Show Technical Details'" 
                [icon]="showTechnical ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" 
                class="p-button-text p-button-sm mb-2"
                (click)="showTechnical = !showTechnical">
            </button>

            <div *ngIf="showTechnical" class="animation-duration-200 fadein">
                 <div class="grid grid-cols-2 gap-4 mb-3 text-sm font-mono text-surface-600 bg-surface-50 p-3 rounded">
                    <div><strong>Method:</strong> {{selectedLog.method || '-'}}</div>
                    <div><strong>Endpoint:</strong> {{selectedLog.endpoint || '-'}}</div>
                    <div><strong>IP:</strong> {{selectedLog.ip_address || '-'}}</div>
                    <div><strong>Duration:</strong> {{selectedLog.duration_ms || '-'}} ms</div>
                    <div><strong>Status Code:</strong> {{selectedLog.status_code || '-'}}</div>
                 </div>
              
              <div *ngIf="selectedLog.payload" class="mb-4">
                <label class="block font-bold mb-1">Payload (Request)</label>
                <div class="json-container">
                  <pre>{{ selectedLog.payload | json }}</pre>
                </div>
              </div>

              <div *ngIf="selectedLog.response || selectedLog.error_message" class="mb-2">
                <label class="block font-bold mb-1">{{ selectedLog.status === 'ERROR' ? 'Error Details' : 'Response' }}</label>
                <div [class]="selectedLog.status === 'ERROR' ? 'json-container error' : 'json-container success'">
                  <pre>{{ (selectedLog.status === 'ERROR' ? selectedLog.error_message : selectedLog.response) | json }}</pre>
                </div>
              </div>
            </div>
        </div>
      </div>
    </p-dialog>

    <style>
      .json-container {
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 1rem;
        max-height: 400px;
        overflow: auto;
      }
      .json-container pre {
        margin: 0;
        font-family: monospace;
        font-size: 0.85rem;
        white-space: pre-wrap;
      }
      .json-container.error {
        border-left: 4px solid #f44336;
        background-color: #fff8f8;
      }
      .json-container.success {
        border-left: 4px solid #4caf50;
        background-color: #f8fff8;
      }
      .badge {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .status-success { background-color: #e6f4ea; color: #1e7e34; }
      .status-error { background-color: #fce8e6; color: #d93025; }
    </style>
  `
})
export class ActionLogsComponent implements OnInit, OnDestroy {
  logs = signal<ActionLog[]>([]);
  totalRecords = signal(0);
  loading = signal(false);
  rows = 10;
  currentPage = 1;

  // Route Context
  activeDomain = 'Operations';
  private routeSub: Subscription | null = null;

  // Filters
  dateRange: Date[] = [];
  selectedAction: string | null = null;
  selectedStatus: string | null = null;
  selectedModule: string | null = null;
  modulesList: { label: string, value: string }[] = [];

  // Details
  detailsVisible = false;
  showTechnical = false;
  selectedLog: ActionLog | null = null;

  // Options
  actionOptions = [
    { label: 'CREATE', value: 'CREATE' },
    { label: 'UPDATE', value: 'UPDATE' },
    { label: 'DELETE', value: 'DELETE' },
    { label: 'FETCH_BY_ID', value: 'FETCH_BY_ID' },
    { label: 'EXPORT', value: 'EXPORT' }
  ];

  statusOptions = [
    { label: 'SUCCESS', value: 'SUCCESS' },
    { label: 'ERROR', value: 'ERROR' }
  ];

  constructor(
    private route: ActivatedRoute,
    private logService: LogService,
    public configService: ConfigService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.rows = this.configService.getSystemConfig().maxRecordsPerPage || 10;

    // Listen to route data for domain changes
    this.routeSub = this.route.data.subscribe(data => {
      if (data['domain']) {
        // Map UI domain to Backend module group
        this.activeDomain = this.mapDomainToGroup(data['domain']);
        this.clearFilters(false);
        this.loadModuleList();
        this.loadLogs();
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  mapDomainToGroup(domain: string): string {
    const mapping: { [key: string]: string } = {
      'auth': 'Auth',
      'setup': 'Setup',
      'masters': 'Masters',
      'master_types': 'Master Types',
      'operations': 'Operations'
    };
    return mapping[domain] || domain;
  }

  getDomainTitle(): string {
    return this.activeDomain;
  }

  loadModuleList() {
    this.logService.getModulesByGroup(this.activeDomain).subscribe({
      next: (modules) => {
        this.modulesList = modules.map(m => ({
          label: m.display_name,
          value: m.module_name
        }));
      },
      error: (err) => console.error('Failed to load modules', err)
    });
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    this.rows = event.rows || 10;
    this.currentPage = (event.first || 0) / this.rows + 1;
    this.loadLogs();
  }

  loadLogs() {
    this.loading.set(true);

    const filters: ActionLogFilters = {
      moduleGroup: this.activeDomain,
      action: this.selectedAction || undefined,
      status: this.selectedStatus || undefined,
      moduleName: this.selectedModule || undefined,
      page: this.currentPage,
      limit: this.rows
    };

    if (this.dateRange && this.dateRange[0]) {
      filters.dateFrom = this.dateRange[0].toISOString();
      if (this.dateRange[1]) {
        const end = new Date(this.dateRange[1]);
        end.setHours(23, 59, 59, 999);
        filters.dateTo = end.toISOString();
      }
    }

    this.logService.getLogs(filters).subscribe({
      next: (res) => {
        this.logs.set(res.data);
        this.totalRecords.set(res.total);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load logs', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load logs' });
        this.loading.set(false);
      }
    });
  }

  clearFilters(reload = true) {
    this.dateRange = [];
    this.selectedAction = null;
    this.selectedStatus = null;
    this.selectedModule = null;
    if (reload) this.loadLogs();
  }

  viewDetails(log: ActionLog) {
    this.loading.set(true);
    this.logService.getLogDetail(log.id).subscribe({
      next: (fullLog) => {
        this.selectedLog = fullLog;
        this.showTechnical = false;
        this.detailsVisible = true;
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load log details', err);
        this.selectedLog = log; // Fallback to basic info
        this.detailsVisible = true;
        this.loading.set(false);
      }
    });
  }

  exportExcel() {
    // Navigate to export endpoint
    const url = `/api/audit_logs/export/excel?moduleGroup=${this.activeDomain}`;
    let params = '';
    if (this.selectedModule) params += `&moduleName=${this.selectedModule}`;
    if (this.selectedAction) params += `&action=${this.selectedAction}`;
    if (this.selectedStatus) params += `&status=${this.selectedStatus}`;
    if (this.dateRange[0]) params += `&dateFrom=${this.dateRange[0].toISOString()}`;
    if (this.dateRange[1]) params += `&dateTo=${this.dateRange[1].toISOString()}`;

    window.open(url + params, '_blank');
  }
}
