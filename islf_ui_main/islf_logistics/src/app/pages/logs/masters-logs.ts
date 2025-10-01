import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ButtonModule } from 'primeng/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as XLSX from 'xlsx';

interface MastersLogEntry {
  timestamp: Date;
  formattedTimestamp?: string;
  username: string;
  action: string;
  details: string;
  masterType: string;
  recordId: string;
  recordName: string;
}

@Component({
  selector: 'app-masters-log-viewer',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    HttpClientModule,
  ],
  template: `
    <div class="card p-4">
      <div class="font-semibold text-xl mb-4">Masters Logs</div>
      <p-table
        #dt
        [value]="logs()"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[10, 50, 100]"
        [globalFilterFields]="filterFields"
        [showGridlines]="true"
        [rowHover]="true"
        [scrollable]="true"
        [scrollHeight]="'500px'"
      >
      
        <ng-template pTemplate="caption">
          
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
          
            <div class="flex items-center gap-2">
              <button pButton label="Clear" class="p-button-outlined p-button" icon="pi pi-filter-slash" (click)="dt.clear()"></button>
              <button pButton label="Export" class="p-button" icon="pi pi-file-excel" (click)="exportExcel()"></button>
            </div>

            <div class="flex items-center gap-2 ml-auto">
              <p-iconfield iconPosition="left">
                <p-inputicon>
                  <i class="pi pi-search"></i>
                </p-inputicon>
                <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search keyword" />
              </p-iconfield>
            </div>
          </div>
        </ng-template>

        <ng-template pTemplate="header">
          <tr>
            <th>
              <div class="flex justify-between items-center">
                Timestamp
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                User
                <p-columnFilter type="text" field="username" display="menu" placeholder="Filter by user"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Action
                <p-columnFilter type="text" field="action" display="menu" placeholder="Filter by action"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Master Type
                <p-columnFilter type="text" field="masterType" display="menu" placeholder="Filter by master type"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Code
                <p-columnFilter type="text" field="recordId" display="menu" placeholder="Filter by record ID"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Details
                <p-columnFilter type="text" field="details" display="menu" placeholder="Filter by details"></p-columnFilter>
              </div>
            </th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-log>
          <tr>
            <td>{{ log.timestamp | date: 'MM/dd/yyyy & HH:mm' }}</td>
            <td>{{ log.username }}</td>
            <td>{{ log.action }}</td>
            <td>{{ log.masterType }}</td>
            <td>{{ log.recordId }}</td>
            <td>{{ log.details }}</td>
          </tr>
        </ng-template>

        <ng-template pTemplate="paginatorleft" let-state>
          <div class="text-sm text-gray-600">
            Total Logs: {{ state.totalRecords }}
          </div>
        </ng-template>
      </p-table>
    </div>
  `
})
export class MastersLogsComponent implements OnInit {
  logs = signal<MastersLogEntry[]>([]);
  filterFields: string[] = ['formattedTimestamp', 'username', 'action', 'masterType','details'];

  @ViewChild('dt') dt!: Table;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('http://77.237.234.63:3001/api/logs/masters').subscribe({
      next: (data) => {
        const enriched = data.map(log => ({
          ...log,
          // Map snake_case to camelCase for frontend compatibility
          masterType: log.master_type,
          recordId: log.record_id,
          recordName: log.record_name,
          formattedTimestamp: new Date(log.timestamp).toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }));
        this.logs.set(enriched);
      },
      error: (err) => console.error('Failed to load masters logs', err)
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value.toLowerCase(), 'contains');
  }

  exportExcel() {
    // Get filtered data if available, otherwise all data
    const dataToExport = (this.dt as any).filteredValue ?? this.logs();

    if (!dataToExport || dataToExport.length === 0) {
      console.error('No data to export');
      return;
    }

    // Prepare data for Excel
    const exportData = dataToExport.map((log: any) => ({
      Timestamp: log.formattedTimestamp || log.timestamp,
      User: log.username,
      Action: log.action,
      'Master Type': log.masterType,
      'Record ID': log.recordId,
      Details: log.details
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Masters Logs');

    // Generate filename: masters_logs-YYYYMMDD-filtervalue.xlsx
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${dd}${mm}${yyyy}`;

    // Try to get the global filter value from the table
    let filterValue = '';
    if ((this.dt as any).filters && (this.dt as any).filters['global']) {
      filterValue = (this.dt as any).filters['global'].value || '';
    }
    // Sanitize filter value for filename
    filterValue = filterValue.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `masters_logs-${dateStr}${filterValue ? '-' + filterValue : ''}.xlsx`;

    // Export to Excel file
    XLSX.writeFile(workbook, filename);
  }
} 