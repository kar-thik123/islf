import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { AppLayout } from '@/layout/components/app.layout';
import { NumberSeriesComponent } from './numberseries';
import { NumberSeriesService } from '@/services/number-series.service';
import { MappingService, Mapping } from '@/services/mapping.service';

interface NumberSeries {
  id?: number;
  code: string;
  description: string;
}

@Component({
  selector: 'app-number-series',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PanelModule,
    DropdownModule,
    ButtonModule,
    ToolbarModule,
    CardModule,
    TableModule,
    ToastModule,
    InputTextModule,
 
   
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    
    <div class="card">
      <p-toolbar>
        <ng-template pTemplate="start">
          <h4>Number Series Management</h4>
        </ng-template>
        <ng-template pTemplate="end">
          <button pButton icon="pi pi-refresh" class="p-button-rounded p-button-text" (click)="refresh()"></button>
        </ng-template>
      </p-toolbar>

      <p-panel header="Number Series Mapping" [toggleable]="true" [collapsed]="false">
      <h3 class="section-header">Number Series Mapping for Master</h3>
        <div class="p-fluid grid">
        
          <div class="field col-12 md:col-6 lg:col-4">
            <label for="customerCode">Customer Code No Series</label>
            <p-dropdown [options]="numberSeries()" [(ngModel)]="selectedSeries().customerCode" optionLabel="description" optionValue="code" placeholder="Select Customer Code No Series" [filter]="true" filterBy="description">
              <ng-template let-item pTemplate="item">
                <div>{{item.code}} </div>
              </ng-template>
            </p-dropdown>
          </div>

          <div class="field col-12 md:col-6 lg:col-4">
            <label for="vendorCode">Vendor Code No Series</label>
            <p-dropdown [options]="numberSeries()" [(ngModel)]="selectedSeries().vendorCode" optionLabel="description" optionValue="code" placeholder="Select Vendor Code No Series" [filter]="true" filterBy="description">
              <ng-template let-item pTemplate="item">
                <div>{{item.code}} </div>
              </ng-template>
            </p-dropdown>
          </div>
         <div class="field col-12 md:col-6 lg:col-4">
            <label for="vesselCode">Vessel Code No Series</label>
            <p-dropdown [options]="numberSeries()" [(ngModel)]="selectedSeries().vesselCode" optionLabel="description" optionValue="code" placeholder="Select Vessel Code No Series" [filter]="true" filterBy="description">
              <ng-template let-item pTemplate="item">
                <div>{{item.code}} </div>
              </ng-template>
            </p-dropdown>
          </div>
          </div>
           <h3 class="section-header">Number Series Mapping for Operations</h3>
          <div class="p-fluid grid">
          <div class="field col-12 md:col-6 lg:col-4">
            <label for="employeeCode">Employee Code No Series</label>
            <p-dropdown [options]="numberSeries()" [(ngModel)]="selectedSeries().employeeCode" optionLabel="description" optionValue="code" placeholder="Select Employee Code No Series" [filter]="true" filterBy="description">
              <ng-template let-item pTemplate="item">
                <div>{{item.code}} </div>
              </ng-template>
            </p-dropdown>
          </div>

          <div class="field col-12 md:col-6 lg:col-4">
            <label for="customerQuote">Customer Quote No Series</label>
            <p-dropdown [options]="numberSeries()" [(ngModel)]="selectedSeries().customerQuote" optionLabel="description" optionValue="code" placeholder="Select Customer Quote No Series" [filter]="true" filterBy="description">
              <ng-template let-item pTemplate="item">
                <div>{{item.code}} </div>
              </ng-template>
            </p-dropdown>
          </div>

          <div class="field col-12 md:col-6 lg:col-4">
            <label for="invoiceNo">Invoice No Series</label>
            <p-dropdown [options]="numberSeries()" [(ngModel)]="selectedSeries().invoiceNo" optionLabel="description" optionValue="code" placeholder="Select Invoice No Series" [filter]="true" filterBy="description">
              <ng-template let-item pTemplate="item">
                <div>{{item.code}} </div>
              </ng-template>
            </p-dropdown>
          </div>

          <div class="field col-12 md:col-6 lg:col-4">
            <label for="taxNo">Tax No Series</label>
            <p-dropdown [options]="numberSeries()" [(ngModel)]="selectedSeries().taxNo" optionLabel="description" optionValue="code" placeholder="Select Tax No Series" [filter]="true" filterBy="description">
              <ng-template let-item pTemplate="item">
                <div>{{item.code}} </div>
              </ng-template>
            </p-dropdown>
          </div>
 
          <div class="field col-12 md:col-6 lg:col-4">
            <label for="jobcardNo">Jobcard No Series</label>
            <p-dropdown [options]="numberSeries()" [(ngModel)]="selectedSeries().jobcardNo" optionLabel="description" optionValue="code" placeholder="Select Jobcard No Series" [filter]="true" filterBy="description">
              <ng-template let-item pTemplate="item">
                <div>{{item.code}} </div>
              </ng-template>
            </p-dropdown>
          </div>
<!--
          <div class="field col-12 md:col-6 lg:col-4">
            <label for="branchNo">Branch No Series</label>
            <p-dropdown [options]="numberSeries()" [(ngModel)]="selectedSeries().branchNo" optionLabel="description" optionValue="code" placeholder="Select Branch No Series" [filter]="true" filterBy="description">
              <ng-template let-item pTemplate="item">
                <div>{{item.code}} </div>
              </ng-template>
            </p-dropdown>
          </div>

          <div class="field col-12 md:col-6 lg:col-4">
            <label for="departmentNo">Department No Series</label>
            <p-dropdown [options]="numberSeries()" [(ngModel)]="selectedSeries().departmentNo" optionLabel="description" optionValue="code" placeholder="Select Department No Series" [filter]="true" filterBy="description">
              <ng-template let-item pTemplate="item">
                <div>{{item.code}} </div>
              </ng-template>
            </p-dropdown>
          </div>  -->
           
        </div>

        <div class="flex justify-content-end gap-2 mt-4">
          <button pButton type="button" label="Save" icon="pi pi-save" (click)="save()"></button>
          <button pButton type="button" label="Reset" icon="pi pi-refresh" class="p-button-secondary" (click)="reset()"></button>
        </div>
      </p-panel>
    </div>
  `,
  styles: [`
  .card {
  padding: 1rem;
}

.p-toolbar {
  background-color: transparent;
  border: none;
  padding: 0;
}

.p-panel {
  margin-top: 1rem;
}

/* Label + input alignment */
.field {
  display: flex;
  align-items: center;
  margin-bottom: 2.5rem;
}

.field label {
  width: 220px;
  margin-right: 1rem;
  font-weight: 500;
  font-size: 0.95rem;
}

/* Limit input width */
.field .p-dropdown,
.field input {
  width: 500px; /* 👈 Restricts max width */
  max-width: 100%;
}

/* Responsive for smaller devices */
@media screen and (max-width: 768px) {
  .field {
    flex-direction: column;
    align-items: flex-start;
  }

  .field label {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .field .p-dropdown,
  .field input {
    width: 100%;
  }
}


  `]
})
export class mappingComponent implements OnInit {
  private mappingToLoad: Mapping | null = null;

  selectedSeries = signal<Mapping>({
    customerCode: null,
    vendorCode: null,
    employeeCode: null,
    customerQuote: null,
    invoiceNo: null,
    taxNo: null,
    jobcardNo: null,
    branchNo: null,
    departmentNo: null,
    vesselCode: null
  });

  numberSeriesList = signal<NumberSeries[]>([]);

  constructor(
    private messageService: MessageService,
    private numberSeriesService: NumberSeriesService,
    private mappingService: MappingService
  ) {
  }

  ngOnInit() {
    this.loadNumberSeries();
    this.loadMapping();
  }

  loadNumberSeries() {
    this.numberSeriesService.getAll().subscribe(data => {
      this.numberSeriesList.set(data);
    });
  }

  loadMapping() {
    this.mappingService.getMapping().subscribe({
      next: (mapping) => {
        this.selectedSeries.set(mapping);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load mapping'
        });
      }
    });
  }

  numberSeries() {
    return this.numberSeriesList();
  }

  refresh() {
    this.messageService.add({
      severity: 'info',
      summary: 'Refreshing',
      detail: 'Data is being refreshed'
    });
    // Implement your actual refresh logic here
  }

  private getCode(val: any): string | null {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && 'code' in val) return val.code;
    return null;
  }

  save() {
    const mapping: Mapping = {
      customerCode: this.getCode(this.selectedSeries().customerCode),
      vendorCode: this.getCode(this.selectedSeries().vendorCode),
      employeeCode: this.getCode(this.selectedSeries().employeeCode),
      customerQuote: this.getCode(this.selectedSeries().customerQuote),
      invoiceNo: this.getCode(this.selectedSeries().invoiceNo),
      taxNo: this.getCode(this.selectedSeries().taxNo),
      jobcardNo: this.getCode(this.selectedSeries().jobcardNo),
      branchNo: this.getCode(this.selectedSeries().branchNo),
      departmentNo: this.getCode(this.selectedSeries().departmentNo),
      vesselCode: this.getCode(this.selectedSeries().vesselCode)
    };
    this.mappingService.saveMapping(mapping).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Number series mappings saved successfully'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save mapping'
        });
      }
    });
  }

  reset() {
    this.selectedSeries.set({
      customerCode: null,
      vendorCode: null,
      employeeCode: null,
      customerQuote: null,
      invoiceNo: null,
      taxNo: null,
      jobcardNo: null,
      branchNo: null,
      departmentNo: null,
      vesselCode: null
    });
    this.messageService.add({
      severity: 'info',
      summary: 'Reset',
      detail: 'Form has been reset'
    });
  }
}