import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { MasterAirlineService, MasterAirline } from '../../services/master-airline.service';
import { NumberSeriesService } from '@/services/number-series.service';
import { MappingService } from '@/services/mapping.service';
import { ConfigService } from '@/services/config.service';
import { ContextService } from '@/services/context.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'master-airline',
    standalone: true,
    providers: [MessageService],
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        InputTextModule,
        ButtonModule,
        DropdownModule,
        ToastModule,
        DialogModule
    ],
    template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Airline Master</div>
      
      <p-table
        #dt
        [value]="airlines"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['code', 'airline_name', 'airline_no', 'status']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add Airline" icon="pi pi-plus" (click)="addRow()"></button>
            <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
            <span class="ml-auto">
              <input pInputText type="text" (input)="onGlobalFilter($event, dt)" placeholder="Search keyword" />
            </span>
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="code">Code <p-sortIcon field="code"></p-sortIcon></th>
            <th pSortableColumn="airline_name">Airline Name <p-sortIcon field="airline_name"></p-sortIcon></th>
            <th pSortableColumn="airline_no">Airline No. <p-sortIcon field="airline_no"></p-sortIcon></th>
            <th>Status</th>
            <th style="min-width: 80px;">Action</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-airline>
          <tr>
            <td>{{ airline.code }}</td>
            <td>{{ airline.airline_name }}</td>
            <td>{{ airline.airline_no }}</td>
            <td>
              <span
                class="text-sm font-semibold px-3 py-1 rounded-full"
                [ngClass]="{
                  'text-green-700 bg-green-100': airline.active,
                  'text-red-700 bg-red-100': !airline.active
                }"
              >
                {{ airline.active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <button pButton icon="pi pi-pencil" (click)="editRow(airline)" class="p-button-sm"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog
      header="{{ selectedAirline?.isNew ? 'Add' : 'Edit' }} Airline"
      [(visible)]="isDialogVisible"
      [modal]="true"
      [style]="{ width: '500px' }"
      [closable]="false"
    >
      <ng-template pTemplate="content">
        <div *ngIf="selectedAirline" class="p-fluid grid gap-4 mt-2">
          <div class="field">
            <label for="code">Code</label>
            <input id="code" pInputText [(ngModel)]="selectedAirline.code" [disabled]="!isManualSeries || !selectedAirline.isNew" />
          </div>
          <div class="field">
            <label for="airline_name">Airline Name</label>
            <input id="airline_name" pInputText [(ngModel)]="selectedAirline.airline_name" placeholder="Enter Airline Name" />
          </div>
          <div class="field">
            <label for="airline_no">Airline No. (Flight No)</label>
            <input id="airline_no" pInputText [(ngModel)]="selectedAirline.airline_no" placeholder="Enter Flight Number / ID" />
          </div>
          <div class="field">
            <label for="active">Status</label>
            <p-dropdown id="active" [options]="activeOptions" [(ngModel)]="selectedAirline.active" optionLabel="label" optionValue="value" appendTo="body"></p-dropdown>
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <button pButton label="Cancel" icon="pi pi-times" class="p-button-outlined p-button-secondary" (click)="hideDialog()"></button>
        <button pButton label="{{ selectedAirline?.isNew ? 'Add' : 'Update' }}" icon="pi pi-check" (click)="saveRow()"></button>
      </ng-template>
    </p-dialog>
  `
})
export class MasterAirlineComponent implements OnInit, OnDestroy {
    airlines: MasterAirline[] = [];
    activeOptions = [
        { label: 'Active', value: true },
        { label: 'Inactive', value: false }
    ];
    isDialogVisible = false;
    selectedAirline: (MasterAirline & { isNew?: boolean }) | null = null;
    private contextSubscription: Subscription | undefined;
    mappedAirlineSeriesCode: string | null = null;
    isManualSeries: boolean = false;

    constructor(
        private masterAirlineService: MasterAirlineService,
        private contextService: ContextService,
        private messageService: MessageService,
        private mappingService: MappingService,
        private numberSeriesService: NumberSeriesService,
        private configService: ConfigService
    ) { }

    ngOnInit() {
        this.refreshList();
        this.contextSubscription = this.contextService.context$.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(() => { this.refreshList(); });
    }

    ngOnDestroy() {
        if (this.contextSubscription) this.contextSubscription.unsubscribe();
    }

    refreshList() {
        this.masterAirlineService.getAll().subscribe({
            next: (data) => this.airlines = data,
            error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load airlines' })
        });
    }

    onGlobalFilter(event: Event, table: any) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    addRow() {
        const config = this.configService.getConfig();
        const airlineFilter = (config?.validation as any)?.airlineFilter || '';
        const ctx = this.contextService.getContext();
        if (airlineFilter) {
            const missing = [] as string[];
            if (airlineFilter.includes('C') && !ctx.companyCode) missing.push('Company');
            if (airlineFilter.includes('B') && !ctx.branchCode) missing.push('Branch');
            if (airlineFilter.includes('D') && !ctx.departmentCode) missing.push('Department');
            if (airlineFilter.includes('ST') && !ctx.serviceType) missing.push('Service Type');
            if (missing.length) { this.contextService.showContextSelector(); return; }
        }
        this.loadMappedAirlineSeriesCode().then(() => {
            this.selectedAirline = { code: '', airline_name: '', airline_no: '', active: true, isNew: true };
            this.isDialogVisible = true;
        }).catch(() => {
            this.selectedAirline = { code: '', airline_name: '', airline_no: '', active: true, isNew: true };
            this.isDialogVisible = true;
        });
    }

    editRow(airline: MasterAirline) {
        this.selectedAirline = { ...airline, isNew: false };
        this.isDialogVisible = true;
    }

    saveRow() {
        if (!this.selectedAirline?.airline_name) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Airline Name is required' });
            return;
        }

        const ctx = this.contextService.getContext();
        const payload: any = {
            airline_name: this.selectedAirline.airline_name,
            airline_no: this.selectedAirline.airline_no,
            active: this.selectedAirline.active,
            seriesCode: this.mappedAirlineSeriesCode,
            company_code: ctx.companyCode,
            branch_code: ctx.branchCode,
            department_code: ctx.departmentCode,
            Service_type_code: ctx.serviceType
        };
        if (this.selectedAirline.code) payload.code = this.selectedAirline.code;

        const req = this.selectedAirline.isNew
            ? this.masterAirlineService.create(payload)
            : this.masterAirlineService.update(this.selectedAirline.id!, payload);

        req.subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Airline saved' });
                this.refreshList();
                this.hideDialog();
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Failed to save' })
        });
    }

    hideDialog() {
        this.isDialogVisible = false;
        this.selectedAirline = null;
    }

    clear(table: any) {
        table.clear();
    }

    private loadMappedAirlineSeriesCode(): Promise<void> {
        return new Promise((resolve, reject) => {
            const ctx = this.contextService.getContext();
            this.mappingService.findMappingByContext(
                'AIRLINE_MASTER',
                ctx.companyCode || '',
                ctx.branchCode || '',
                ctx.departmentCode || '',
                ctx.serviceType || ''
            ).subscribe({
                next: (map) => {
                    this.mappedAirlineSeriesCode = map?.mapping || null;
                    this.numberSeriesService.getAll().subscribe({
                        next: (list) => {
                            const found = list.find((s: any) => s.code === this.mappedAirlineSeriesCode);
                            this.isManualSeries = !!(found && found.is_manual);
                            resolve();
                        },
                        error: (e) => { this.isManualSeries = false; reject(e); }
                    });
                },
                error: (e) => { this.mappedAirlineSeriesCode = null; this.isManualSeries = false; resolve(); }
            });
        });
    }
}
