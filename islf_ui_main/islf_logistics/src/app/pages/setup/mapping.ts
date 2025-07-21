import { Component, signal } from '@angular/core';
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
        <div class="p-fluid grid">
          <div class="field col-12 md:col-6 lg:col-4">
            <label for="customerCode">Customer Code No Series</label>
            <p-dropdown [options]="numberSeries()" [(ngModel)]="selectedSeries().customerCode" optionLabel="description" placeholder="Select Customer Code No Series" [filter]="true" filterBy="description">
              <ng-template let-item pTemplate="item">
                <div>{{item.code}} - {{item.description}}</div>
              </ng-template>
            </p-dropdown>
          </div>

          <div class="field col-12 md:col-6 lg:col-4">
            <label for="vendorCode">Vendor Code No Series</label>
            <p-dropdown [options]="numberSeries()" [(ngModel)]="selectedSeries().vendorCode" optionLabel="description" placeholder="Select Vendor Code No Series" [filter]="true" filterBy="description">
              <ng-template let-item pTemplate="item">
                <div>{{item.code}} - {{item.description}}</div>
              </ng-template>
            </p-dropdown>
          </div>

          <div class="field col-12 md:col-6 lg:col-4">
            <label for="employeeCode">Employee Code No Series</label>
            <p-dropdown [options]="numberSeries()" [(ngModel)]="selectedSeries().employeeCode" optionLabel="description" placeholder="Select Employee Code No Series" [filter]="true" filterBy="description">
              <ng-template let-item pTemplate="item">
                <div>{{item.code}} - {{item.description}}</div>
              </ng-template>
            </p-dropdown>
          </div>

          <div class="field col-12 md:col-6 lg:col-4">
            <label for="customerQuote">Customer Quote No Series</label>
            <p-dropdown [options]="numberSeries()" [(ngModel)]="selectedSeries().customerQuote" optionLabel="description" placeholder="Select Customer Quote No Series" [filter]="true" filterBy="description">
              <ng-template let-item pTemplate="item">
                <div>{{item.code}} - {{item.description}}</div>
              </ng-template>
            </p-dropdown>
          </div>

          <div class="field col-12 md:col-6 lg:col-4">
            <label for="invoiceNo">Invoice No Series</label>
            <p-dropdown [options]="numberSeries()" [(ngModel)]="selectedSeries().invoiceNo" optionLabel="description" placeholder="Select Invoice No Series" [filter]="true" filterBy="description">
              <ng-template let-item pTemplate="item">
                <div>{{item.code}} - {{item.description}}</div>
              </ng-template>
            </p-dropdown>
          </div>

          <div class="field col-12 md:col-6 lg:col-4">
            <label for="taxNo">Tax No Series</label>
            <p-dropdown [options]="numberSeries()" [(ngModel)]="selectedSeries().taxNo" optionLabel="description" placeholder="Select Tax No Series" [filter]="true" filterBy="description">
              <ng-template let-item pTemplate="item">
                <div>{{item.code}} - {{item.description}}</div>
              </ng-template>
            </p-dropdown>
          </div>

          <div class="field col-12 md:col-6 lg:col-4">
            <label for="jobcardNo">Jobcard No Series</label>
            <p-dropdown [options]="numberSeries()" [(ngModel)]="selectedSeries().jobcardNo" optionLabel="description" placeholder="Select Jobcard No Series" [filter]="true" filterBy="description">
              <ng-template let-item pTemplate="item">
                <div>{{item.code}} - {{item.description}}</div>
              </ng-template>
            </p-dropdown>
          </div>

          <div class="field col-12 md:col-6 lg:col-4">
            <label for="branchNo">Branch No Series</label>
            <p-dropdown [options]="numberSeries()" [(ngModel)]="selectedSeries().branchNo" optionLabel="description" placeholder="Select Branch No Series" [filter]="true" filterBy="description">
              <ng-template let-item pTemplate="item">
                <div>{{item.code}} - {{item.description}}</div>
              </ng-template>
            </p-dropdown>
          </div>

          <div class="field col-12 md:col-6 lg:col-4">
            <label for="departmentNo">Department No Series</label>
            <p-dropdown [options]="numberSeries()" [(ngModel)]="selectedSeries().departmentNo" optionLabel="description" placeholder="Select Department No Series" [filter]="true" filterBy="description">
              <ng-template let-item pTemplate="item">
                <div>{{item.code}} - {{item.description}}</div>
              </ng-template>
            </p-dropdown>
          </div>
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
    .field {
      margin-bottom: 1.5rem;
    }
  `]
})
export class mappingComponent {
 

  selectedSeries = signal({
    customerCode: null,
    vendorCode: null,
    employeeCode: null,
    customerQuote: null,
    invoiceNo: null,
    taxNo: null,
    jobcardNo: null,
    branchNo: null,
    departmentNo: null
  });

  numberSeriesList = signal<NumberSeries[]>([]);

  constructor(private messageService: MessageService, private numberSeriesService: NumberSeriesService) {
    this.loadNumberSeries();
  }

  loadNumberSeries() {
    this.numberSeriesService.getAll().subscribe(data => this.numberSeriesList.set(data));
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

  save() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Number series mappings saved successfully'
    });
    // Implement your actual save logic here
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
      departmentNo: null
    });
    this.messageService.add({
      severity: 'info',
      summary: 'Reset',
      detail: 'Form has been reset'
    });
  }
}