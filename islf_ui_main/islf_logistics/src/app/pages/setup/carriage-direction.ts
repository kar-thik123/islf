import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { CarriageService, CarriageDirection } from '../../services/carriage.service';
import { MessageService } from 'primeng/api';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'carriage-direction-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, CheckboxModule, ButtonModule, ToastModule, InputTextModule],
  providers: [MessageService],
  template: `
    <div class="card">
      <p-toast></p-toast>
      <div class="flex justify-between items-center mb-3">
        <h2 class="font-semibold text-xl mb-4">Carriage Configuration</h2>
      </div>
      <p-table #dt [value]="rows" [paginator]="true" [rows]="configService.getSystemConfig().maxRecordsPerPage" [rowsPerPageOptions]="[10,20,50]" dataKey="carriage" [responsiveLayout]="'scroll'">
        <ng-template pTemplate="header">
          <tr>
            <th>Carriage Type</th>
            <th>FROM</th>
            <th>TO</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-r>
          <tr>
            <td>{{ r.carriage }}</td>
            <td>
             <p-checkbox
              [binary]="true"
              [(ngModel)]="r.is_from"
              (onChange)="toggleDirection(r, 'from')">  
            </p-checkbox>
            </td>
            <td>
              <p-checkbox
              [binary]="true"
              [(ngModel)]="r.is_to"
              (onChange)="toggleDirection(r, 'to')">
            </p-checkbox>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="3" class="text-center py-4">No carriage types found</td></tr>
        </ng-template>
        <ng-template pTemplate="footer">
          <tr>
            <td colspan="3">
              <div class="flex justify-between items-center w-full">
                <span class="text-sm">Total Carriage: {{ rows?.length || 0 }}</span>
                <div>
                  <button pButton label="Save" icon="pi pi-save" (click)="save()" class="p-button-primary"></button>
                </div>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
})
export class CarriageDirectionSettingsComponent {
  rows: CarriageDirection[] = [];
  constructor(private service: CarriageService, private msg: MessageService, public configService: ConfigService) {
    this.load();
  }
  load() {
    this.service.getCarriageDirection().subscribe({
      next: (list) => (this.rows = list || []),
    });
  }
  toggleDirection(row: CarriageDirection, type: 'from' | 'to') {
    if (type === 'from') {
      if (row.is_from) row.is_to = false;   // Uncheck TO
    } else {
      if (row.is_to) row.is_from = false;   // Uncheck FROM
    }
  }
  save() {
    this.service.saveCarriageDirection(this.rows).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Saved', detail: 'Carriage configuration updated' });
        this.load();
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to save' }),
    });
  }
  onGlobalFilter(dt: any, event: any) {
    dt.filterGlobal(event.target.value, 'contains');
  }
  clear(dt: any) {
    dt.clear();
  }
}