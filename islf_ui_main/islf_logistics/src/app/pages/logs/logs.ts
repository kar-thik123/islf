import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { HttpClient, HttpClientModule } from '@angular/common/http';


interface LogEntry {
  timestamp: Date;
  username: string;
  action: string;
  details: string;
}

@Component({
  selector: 'app-log-viewer',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    
    
    HttpClientModule // Add HttpClientModule for HTTP requests
  ],
  template: `
    <div class="card p-4">
      <p-table
        #dt
        [value]="logs()"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[10, 50, 100]"
        [globalFilterFields]="filterFields"
        [tableStyle]="{ 'min-width': '75rem' }"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} logs"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center mb-3">
            <h5 class="m-0 font-semibold">System Logs</h5>
            <p-iconfield>
              <p-inputicon styleClass="pi pi-search" />
              <input
                pInputText
                type="text"
                (input)="onGlobalFilter(dt, $event)"
                placeholder="Search logs..."
              />
            </p-iconfield>
          </div>
        </ng-template>

        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="timestamp">
              <span class="flex items-center gap-2">
                Timestamp <p-sortIcon field="timestamp" />
              </span>
            </th>
            <th pSortableColumn="user">
              <span class="flex items-center gap-2">
                User <p-sortIcon field="user" />
              </span>
            </th>
            <th pSortableColumn="action">
              <span class="flex items-center gap-2">
                Action <p-sortIcon field="action" />
              </span>
            </th>
            <th pSortableColumn="details">
              <span class="flex items-center gap-2">
                Details <p-sortIcon field="details" />
              </span>
            </th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-log>
          <tr>
            <td>{{ log.timestamp | date: 'dd/MM/yyyy & HH:mm' }}</td>
            <td>{{ log.username }}</td>
            <td>{{ log.action }}</td>
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
export class LogsComponent implements OnInit {
  logs = signal<LogEntry[]>([]);
  filterFields: string[] = ['timestamp', 'user', 'action', 'details'];

  @ViewChild('dt') dt!: Table;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<LogEntry[]>('/api/logs/auth').subscribe({
      next: (data) => this.logs.set(data),
      error: (err) => console.error('Failed to load logs', err)
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
