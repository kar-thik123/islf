import { Component, OnInit, ViewChild, signal } from '@angular/core';
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
    ToastModule
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
                <p-dropdown
                  [options]="locationOptions"
                  [(ngModel)]="rule.from"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select From"
                   appendTo="body"
                  [filter]="true">
                  
                </p-dropdown>
              </ng-container>
              <ng-template #fromText>{{ rule.from }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="rule.isEditing; else toText">
                <p-dropdown
                  [options]="locationOptions"
                  [(ngModel)]="rule.to"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select To"
                   appendTo="body"
                  [filter]="true">
                </p-dropdown>
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
                <button pButton icon="pi pi-check" class="p-button-sm" (click)="saveRow(rule)" *ngIf="rule.isEditing"></button>
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
  `
})
export class GstSetupComponent implements OnInit {
  gstRules = signal<GstRule[]>([]);
  locationOptions: { label: string, value: string }[] = [];
  @ViewChild('dt') dt!: Table;

  constructor(
    private messageService: MessageService,
    private masterLocationService: MasterLocationService
  ) {}

  ngOnInit() {
    this.masterLocationService.getAll().subscribe(locations => {
      const gstLocations = locations.filter(l => l.type === 'GST_LOCATION' && l.active);
      this.locationOptions = gstLocations.map(l => ({
        label: `${l.gst_state_code} - ${l.name}`,
        value: `${l.gst_state_code} - ${l.name}`
      }));
    });
    // Optionally: Load GST rules from backend here
  }

  addRow() {
    const newRow: GstRule = {
      from: '',
      to: '',
      sgst: false,
      cgst: false,
      igst: false,
      isEditing: true,
      isNew: true
    };
    this.gstRules.set([...this.gstRules(), newRow]);
  }

  saveRow(row: GstRule) {
    row.isEditing = false;
    row.isNew = false;
    // TODO: Save to backend if needed
    this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'GST Rule saved' });
  }

  editRow(row: GstRule) {
    this.gstRules.set(this.gstRules().map(r => r === row ? { ...r, isEditing: true } : r));
  }

  deleteRow(row: GstRule) {
    this.gstRules.set(this.gstRules().filter(r => r !== row));
    this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'GST Rule deleted' });
  }

  clear(table: Table) {
    table.clear();
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
} 