import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-system-logs',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DropdownModule,
        CalendarModule,
        DialogModule,
        TagModule,
        FormsModule,
        ToastModule
    ],
    providers: [MessageService],
    template: `
    <p-toast></p-toast>
    <div class="card p-4">
      <div class="flex justify-between items-center mb-6">
        <div class="font-semibold text-2xl text-red-600">System Logs (Technical)</div>
        <div class="flex gap-2">
            <button pButton label="Clear" class="p-button-outlined p-button-secondary" icon="pi pi-filter-slash" (click)="clearFilters()"></button>
            <button pButton label="Refresh" class="p-button-info" icon="pi pi-refresh" (click)="loadLogs()"></button>
        </div>
      </div>

      <div class="bg-surface-50 p-4 border-round mb-4 border-1 border-surface-200">
        <div class="grid grid-cols-12 gap-4 items-end">
          <div class="col-span-12 md:col-span-3">
            <label class="block text-sm font-bold mb-2">Date Range</label>
            <p-calendar [(ngModel)]="dateRange" selectionMode="range" [showIcon]="true" styleClass="w-full" (onSelect)="loadLogs()" placeholder="Select Range"></p-calendar>
          </div>
          <div class="col-span-12 md:col-span-2">
            <label class="block text-sm font-bold mb-2">Method</label>
            <p-dropdown [options]="methodOptions" [(ngModel)]="selectedMethod" placeholder="All" styleClass="w-full" (onChange)="loadLogs()" [showClear]="true"></p-dropdown>
          </div>
          <div class="col-span-12 md:col-span-2">
            <label class="block text-sm font-bold mb-2">Status</label>
            <p-dropdown [options]="statusOptions" [(ngModel)]="selectedStatus" placeholder="All" styleClass="w-full" (onChange)="loadLogs()" [showClear]="true"></p-dropdown>
          </div>
          <div class="col-span-12 md:col-span-5">
            <label class="block text-sm font-bold mb-2">Search Endpoint/User</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-search"></i>
              <input pInputText type="text" [(ngModel)]="searchTerm" (keyup.enter)="loadLogs()" placeholder="Enter endpoint or username..." class="w-full" />
            </span>
          </div>
        </div>
      </div>

      <p-table 
        [value]="logs()" 
        [lazy]="true" 
        (onLazyLoad)="onLazyLoad($event)" 
        [paginator]="true" 
        [rows]="10" 
        [totalRecords]="totalRecords()" 
        [loading]="loading()"
        responsiveLayout="scroll" 
        styleClass="p-datatable-sm"
      >
        <ng-template pTemplate="header">
          <tr>
            <th style="width: 12rem">Timestamp</th>
            <th style="width: 8rem">User</th>
            <th style="width: 6rem">Method</th>
            <th style="width: 15rem">Endpoint</th>
            <th style="width: 6rem">Code</th>
            <th style="width: 6rem">Duration</th>
            <th style="width: 8rem">Status</th>
            <th style="width: 4rem">View</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-log>
          <tr [ngClass]="{'bg-red-50': log.status === 'ERROR'}">
            <td class="text-xs">{{ log.timestamp | date: 'medium' }}</td>
            <td class="font-bold text-xs">{{ log.username }}</td>
            <td>
                <p-tag [value]="log.method" [severity]="getMethodSeverity(log.method)"></p-tag>
            </td>
            <td class="text-xs font-mono">{{ log.endpoint }}</td>
            <td class="text-xs font-bold" [ngClass]="log.status_code >= 400 ? 'text-red-600' : 'text-green-600'">
                {{ log.status_code }}
            </td>
            <td class="text-xs">{{ log.duration_ms }}ms</td>
            <td>
              <p-tag [value]="log.status" [severity]="log.status === 'SUCCESS' ? 'success' : 'danger'"></p-tag>
            </td>
            <td>
              <button pButton icon="pi pi-code" class="p-button-text p-button-sm" (click)="viewDetails(log)"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Detail Dialog -->
    <p-dialog header="Technical Log Details" [(visible)]="displayModal" [modal]="true" [style]="{width: '70vw'}" [maximizable]="true">
        <div *ngIf="selectedLog" class="p-fluid">
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="bg-surface-50 p-4 rounded border">
                    <h4 class="font-bold border-b pb-1 mb-2">Request Information</h4>
                    <div class="text-xs">
                        <p><strong>Timestamp:</strong> {{selectedLog.timestamp | date: 'medium'}}</p>
                        <p><strong>User:</strong> {{selectedLog.username}}</p>
                        <p><strong>IP:</strong> {{selectedLog.ip_address}}</p>
                        <p><strong>User Agent:</strong> {{selectedLog.user_agent}}</p>
                    </div>
                </div>
                <div class="bg-surface-50 p-4 rounded border">
                    <h4 class="font-bold border-b pb-1 mb-2">Performance & Status</h4>
                    <div class="text-xs">
                        <p><strong>Method:</strong> {{selectedLog.method}}</p>
                        <p><strong>Status:</strong> <p-tag [value]="selectedLog.status" [severity]="selectedLog.status === 'SUCCESS' ? 'success' : 'danger'"></p-tag></p>
                        <p><strong>Status Code:</strong> {{selectedLog.status_code}}</p>
                        <p><strong>Duration:</strong> {{selectedLog.duration_ms}} ms</p>
                    </div>
                </div>
                <div class="col-span-2">
                    <h4 class="font-bold mb-1">Endpoint</h4>
                    <div class="bg-surface-100 p-2 text-xs font-mono rounded">{{selectedLog.endpoint}}</div>
                </div>
                <div class="col-span-2">
                     <h4 class="font-bold mb-1">Payload</h4>
                     <pre class="bg-surface-900 text-white p-3 rounded text-xs overflow-auto max-h-60">{{ selectedLog.payload | json }}</pre>
                </div>
                <div class="col-span-2">
                     <h4 class="font-bold mb-1">{{selectedLog.status === 'ERROR' ? 'Error Detail' : 'Response Body'}}</h4>
                     <pre class="p-3 rounded text-xs overflow-auto max-h-60" 
                          [ngClass]="selectedLog.status === 'ERROR' ? 'bg-red-900 text-white' : 'bg-green-900 text-white'">
                        {{ (selectedLog.status === 'ERROR' ? selectedLog.error_message : selectedLog.response) | json }}
                     </pre>
                </div>
            </div>
        </div>
    </p-dialog>
  `
})
export class SystemLogsComponent implements OnInit {
    logs = signal<any[]>([]);
    totalRecords = signal(0);
    loading = signal(false);
    displayModal = false;
    selectedLog: any = null;

    // Filters
    dateRange: Date[] = [];
    selectedMethod: string | null = null;
    selectedStatus: string | null = null;
    searchTerm: string = '';

    methodOptions = [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'DELETE', value: 'DELETE' },
        { label: 'PATCH', value: 'PATCH' }
    ];

    statusOptions = [
        { label: 'SUCCESS', value: 'SUCCESS' },
        { label: 'ERROR', value: 'ERROR' }
    ];

    constructor(private http: HttpClient, private messageService: MessageService) { }

    ngOnInit() { }

    onLazyLoad(event: TableLazyLoadEvent) {
        this.loadLogs(event.first || 0, event.rows || 10);
    }

    loadLogs(first: number = 0, rows: number = 10) {
        this.loading.set(true);
        let params = new HttpParams()
            .set('page', (first / rows + 1).toString())
            .set('limit', rows.toString());

        if (this.selectedMethod) params = params.set('method', this.selectedMethod);
        if (this.selectedStatus) params = params.set('status', this.selectedStatus);
        if (this.searchTerm) params = params.set('search', this.searchTerm);

        if (this.dateRange && this.dateRange[0]) {
            params = params.set('dateFrom', this.dateRange[0].toISOString());
            if (this.dateRange[1]) {
                const end = new Date(this.dateRange[1]);
                end.setHours(23, 59, 59, 999);
                params = params.set('dateTo', end.toISOString());
            }
        }

        this.http.get<any>('/api/audit_logs/system_logs', { params }).subscribe({
            next: (res) => {
                this.logs.set(res.data);
                this.totalRecords.set(res.total);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Failed to load system logs', err);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load system logs' });
                this.loading.set(false);
            }
        });
    }

    clearFilters() {
        this.dateRange = [];
        this.selectedMethod = null;
        this.selectedStatus = null;
        this.searchTerm = '';
        this.loadLogs();
    }

    viewDetails(log: any) {
        this.selectedLog = log;
        this.displayModal = true;
    }

    getMethodSeverity(method: string): string {
        switch (method) {
            case 'GET': return 'info';
            case 'POST': return 'success';
            case 'PUT': return 'warning';
            case 'DELETE': return 'danger';
            default: return 'secondary';
        }
    }
}
