import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TreeNode } from 'primeng/api';
import { Router } from '@angular/router';
import { CompanyService, Company } from '../../../services/company.service';
import { BranchService, Branch } from '../../../services/branch.service';
import { DepartmentService, Department } from '../../../services/department.service';
import { ServiceTypeService, ServiceType } from '../../../services/servicetype.service';
import { ConfigDatePipe } from '../../../pipes/config-date.pipe';
import { forkJoin } from 'rxjs';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-company-tree',
  standalone: true,
  imports: [CommonModule, TreeModule, ButtonModule, DialogModule, ConfigDatePipe, TitleCasePipe],
  template: `
    <div class="md:w-full">
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <div class="font-semibold text-xl">Company Hierarchy Tree</div>
          <button pButton label="Back to Management" icon="pi pi-arrow-left" class="p-button-outlined" (click)="navigateBack()"></button>
        </div>
        
        <div class="mb-4">
          <p class="text-gray-600">This tree shows the complete hierarchical structure of your organization. Click on any node to view details.</p>
        </div>

        <div class="tree-container">
        <p-tree 
          [value]="treeData" 
          selectionMode="single"
          
          (onNodeSelect)="showDetailsDialog($event.node)"
          (onNodeExpand)="onNodeExpand($event)"
          (onNodeCollapse)="onNodeCollapse($event)">
          
          <ng-template pTemplate="default" let-node>
            <div class="flex items-center gap-2 p-2 cursor-pointer">
              <!-- Company Node -->
              <div *ngIf="node.data.type === 'company'" class="flex items-center gap-2 w-full">
                <i class="pi pi-building text-blue-600 text-lg"></i>
                <div class="flex-1">
                  <div class="font-semibold text-blue-800">{{ node.data.name }}</div>
                  <div class="text-xs text-gray-500">Code: {{ node.data.code }}</div>
                </div>
              </div>

              <!-- Branch Node -->
              <div *ngIf="node.data.type === 'branch'" class="flex items-center gap-2 w-full">
                <i class="pi pi-sitemap text-green-600 text-lg"></i>
                <div class="flex-1">
                  <div class="font-semibold text-green-800">{{ node.data.name }}</div>
                  <div class="text-xs text-gray-500">Code: {{ node.data.code }}</div>
                </div>
              </div>

              <!-- Department Node -->
              <div *ngIf="node.data.type === 'department'" class="flex items-center gap-2 w-full">
                <i class="pi pi-briefcase text-orange-600 text-lg"></i>
                <div class="flex-1">
                  <div class="font-semibold text-orange-800">{{ node.data.name }}</div>
                  <div class="text-xs text-gray-500">Code: {{ node.data.code }}</div>
                </div>
              </div>

              <!-- Service Type Node -->
              <div *ngIf="node.data.type === 'serviceType'" class="flex items-center gap-2 w-full">
                <i class="pi pi-cog text-purple-600 text-lg"></i>
                <div class="flex-1">
                  <div class="font-semibold text-purple-800">{{ node.data.name }}</div>
                  <div class="text-xs text-gray-500">Code: {{ node.data.code }}</div>
                </div>
              </div>
            </div>
          </ng-template>
        </p-tree>


        </div>

        <!-- Summary Statistics -->
        <div class="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-blue-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">{{ companiesCount }}</div>
            <div class="text-sm text-blue-800">Companies</div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ branchesCount }}</div>
            <div class="text-sm text-green-800">Branches</div>
          </div>
          <div class="bg-orange-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-orange-600">{{ departmentsCount }}</div>
            <div class="text-sm text-orange-800">Departments</div>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">{{ serviceTypesCount }}</div>
            <div class="text-sm text-purple-800">Service Types</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Dialog -->
    <p-dialog 
      [(visible)]="displayDialog" 
      [header]="dialogTitle" 
      [modal]="true" 
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      styleClass="p-fluid"
      [style]="{width: '600px', maxWidth: '90vw'}">
      
      <div *ngIf="selectedNode">
        <!-- Company Details Dialog -->
        <div *ngIf="selectedNode.data.type === 'company'" class="space-y-4">
          <div class="flex items-center gap-3 mb-4">
            <i class="pi pi-building text-blue-600 text-2xl"></i>
            <h3 class="text-xl font-bold text-blue-800">{{ selectedNode.data.name }}</h3>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-3">
              <div><strong class="text-gray-700">Code:</strong> <span class="ml-2">{{ selectedNode.data.code }}</span></div>
              <div><strong class="text-gray-700">Name:</strong> <span class="ml-2">{{ selectedNode.data.name }}</span></div>
              <div *ngIf="selectedNode.data.name2"><strong class="text-gray-700">Name 2:</strong> <span class="ml-2">{{ selectedNode.data.name2 }}</span></div>
              <div><strong class="text-gray-700">GST:</strong> <span class="ml-2">{{ selectedNode.data.gst }}</span></div>
              <div *ngIf="selectedNode.data.pan"><strong class="text-gray-700">PAN:</strong> <span class="ml-2">{{ selectedNode.data.pan }}</span></div>
              <div><strong class="text-gray-700">Phone:</strong> <span class="ml-2">{{ selectedNode.data.phone }}</span></div>
              <div *ngIf="selectedNode.data.landline"><strong class="text-gray-700">Landline:</strong> <span class="ml-2">{{ selectedNode.data.landline }}</span></div>
            </div>
            <div class="space-y-3">
              <div><strong class="text-gray-700">Email:</strong> <span class="ml-2">{{ selectedNode.data.email }}</span></div>
              <div *ngIf="selectedNode.data.website"><strong class="text-gray-700">Website:</strong> <span class="ml-2">{{ selectedNode.data.website }}</span></div>
              <div *ngIf="selectedNode.data.status"><strong class="text-gray-700">Status:</strong> <span class="ml-2">{{ selectedNode.data.status }}</span></div>
              <div *ngIf="selectedNode.data.start_date"><strong class="text-gray-700">Start Date:</strong> <span class="ml-2">{{ selectedNode.data.start_date | configDate }}</span></div>
              <div *ngIf="selectedNode.data.end_date"><strong class="text-gray-700">End Date:</strong> <span class="ml-2">{{ selectedNode.data.end_date | configDate }}</span></div>
            </div>
          </div>
          
          <div class="mt-4 space-y-3">
            <div *ngIf="selectedNode.data.address1">
              <strong class="text-gray-700">Address:</strong> 
              <div class="ml-2 mt-1">{{ selectedNode.data.address1 }}<span *ngIf="selectedNode.data.address2">, {{ selectedNode.data.address2 }}</span></div>
            </div>
            <div *ngIf="selectedNode.data.head_office_address">
              <strong class="text-gray-700">Head Office:</strong> 
              <div class="ml-2 mt-1">{{ selectedNode.data.head_office_address }}</div>
            </div>
            <div *ngIf="selectedNode.data.register_address">
              <strong class="text-gray-700">Registered Address:</strong> 
              <div class="ml-2 mt-1">{{ selectedNode.data.register_address }}</div>
            </div>
          </div>
        </div>

        <!-- Branch Details Dialog -->
        <div *ngIf="selectedNode.data.type === 'branch'" class="space-y-4">
          <div class="flex items-center gap-3 mb-4">
            <i class="pi pi-sitemap text-green-600 text-2xl"></i>
            <h3 class="text-xl font-bold text-green-800">{{ selectedNode.data.name }}</h3>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-3">
              <div><strong class="text-gray-700">Code:</strong> <span class="ml-2">{{ selectedNode.data.code }}</span></div>
              <div><strong class="text-gray-700">Name:</strong> <span class="ml-2">{{ selectedNode.data.name }}</span></div>
              <div><strong class="text-gray-700">Company:</strong> <span class="ml-2">{{ selectedNode.data.company_code }}</span></div>
              <div *ngIf="selectedNode.data.incharge_name"><strong class="text-gray-700">Incharge:</strong> <span class="ml-2">{{ selectedNode.data.incharge_name }}</span></div>
              <div *ngIf="selectedNode.data.gst"><strong class="text-gray-700">GST:</strong> <span class="ml-2">{{ selectedNode.data.gst }}</span></div>
            </div>
            <div class="space-y-3">
              <div><strong class="text-gray-700">Status:</strong> <span class="ml-2">{{ selectedNode.data.status }}</span></div>
              <div *ngIf="selectedNode.data.phone"><strong class="text-gray-700">Phone:</strong> <span class="ml-2">{{ selectedNode.data.phone }}</span></div>
              <div *ngIf="selectedNode.data.email"><strong class="text-gray-700">Email:</strong> <span class="ml-2">{{ selectedNode.data.email }}</span></div>
              <div *ngIf="selectedNode.data.start_date"><strong class="text-gray-700">Start Date:</strong> <span class="ml-2">{{ selectedNode.data.start_date | configDate }}</span></div>
              <div *ngIf="selectedNode.data.end_date"><strong class="text-gray-700">End Date:</strong> <span class="ml-2">{{ selectedNode.data.end_date | configDate }}</span></div>
            </div>
          </div>
          
          <div class="mt-4" *ngIf="selectedNode.data.address1">
            <strong class="text-gray-700">Address:</strong> 
            <div class="ml-2 mt-1">{{ selectedNode.data.address1 }}<span *ngIf="selectedNode.data.address2">, {{ selectedNode.data.address2 }}</span></div>
          </div>
        </div>

        <!-- Department Details Dialog -->
        <div *ngIf="selectedNode.data.type === 'department'" class="space-y-4">
          <div class="flex items-center gap-3 mb-4">
            <i class="pi pi-briefcase text-orange-600 text-2xl"></i>
            <h3 class="text-xl font-bold text-orange-800">{{ selectedNode.data.name }}</h3>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-3">
              <div><strong class="text-gray-700">Code:</strong> <span class="ml-2">{{ selectedNode.data.code }}</span></div>
              <div><strong class="text-gray-700">Name:</strong> <span class="ml-2">{{ selectedNode.data.name }}</span></div>
              <div><strong class="text-gray-700">Branch:</strong> <span class="ml-2">{{ selectedNode.data.branch_code }}</span></div>
              <div *ngIf="selectedNode.data.incharge_name"><strong class="text-gray-700">Incharge:</strong> <span class="ml-2">{{ selectedNode.data.incharge_name }}</span></div>
            </div>
            <div class="space-y-3">
              <div><strong class="text-gray-700">Status:</strong> <span class="ml-2">{{ selectedNode.data.status }}</span></div>
              <div *ngIf="selectedNode.data.start_date"><strong class="text-gray-700">Start Date:</strong> <span class="ml-2">{{ selectedNode.data.start_date | configDate }}</span></div>
              <div *ngIf="selectedNode.data.end_date"><strong class="text-gray-700">End Date:</strong> <span class="ml-2">{{ selectedNode.data.end_date | configDate }}</span></div>
              <div *ngIf="selectedNode.data.description"><strong class="text-gray-700">Description:</strong> <span class="ml-2">{{ selectedNode.data.description }}</span></div>
            </div>
          </div>
        </div>

        <!-- Service Type Details Dialog -->
        <div *ngIf="selectedNode.data.type === 'serviceType'" class="space-y-4">
          <div class="flex items-center gap-3 mb-4">
            <i class="pi pi-cog text-purple-600 text-2xl"></i>
            <h3 class="text-xl font-bold text-purple-800">{{ selectedNode.data.name }}</h3>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-3">
              <div><strong class="text-gray-700">Code:</strong> <span class="ml-2">{{ selectedNode.data.code }}</span></div>
              <div><strong class="text-gray-700">Name:</strong> <span class="ml-2">{{ selectedNode.data.name }}</span></div>
              <div><strong class="text-gray-700">Department:</strong> <span class="ml-2">{{ selectedNode.data.department_code }}</span></div>
              <div *ngIf="selectedNode.data.incharge_name"><strong class="text-gray-700">Incharge:</strong> <span class="ml-2">{{ selectedNode.data.incharge_name }}</span></div>
            </div>
            <div class="space-y-3">
              <div><strong class="text-gray-700">Status:</strong> <span class="ml-2">{{ selectedNode.data.status }}</span></div>
              <div *ngIf="selectedNode.data.start_date"><strong class="text-gray-700">Start Date:</strong> <span class="ml-2">{{ selectedNode.data.start_date | configDate }}</span></div>
              <div *ngIf="selectedNode.data.end_date"><strong class="text-gray-700">End Date:</strong> <span class="ml-2">{{ selectedNode.data.end_date | configDate }}</span></div>
              <div *ngIf="selectedNode.data.description"><strong class="text-gray-700">Description:</strong> <span class="ml-2">{{ selectedNode.data.description }}</span></div>
            </div>
          </div>
        </div>
      </div>
      
      <ng-template pTemplate="footer">
        <button pButton type="button" label="Close" icon="pi pi-times" class="p-button-outlined" (click)="displayDialog = false"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .tree-container {
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1rem;
      background: white;
    }
    
    :host ::ng-deep .p-tree {
      border: none;
      background: transparent;
    }
    
    :host ::ng-deep .p-tree .p-tree-container {
      padding: 0;
    }
    
    :host ::ng-deep .p-tree .p-treenode {
      padding: 0;
    }
    
    :host ::ng-deep .p-tree .p-treenode-content {
      padding: 0;
      border-radius: 0.375rem;
      margin: 0.125rem 0;
    }
    
    :host ::ng-deep .p-tree .p-treenode-content:hover {
      background-color: #f3f4f6;
    }
    
    :host ::ng-deep .p-tree .p-treenode-content.p-highlight {
      background-color: #dbeafe;
    }
  `]
})
export class CompanyTreeComponent implements OnInit {
  treeData: TreeNode[] = [];
  expandedKeys: { [key: string]: boolean } = {};
  selectedNode: TreeNode | null = null;
  displayDialog: boolean = false;
  dialogTitle: string = '';
  
  companiesCount = 0;
  branchesCount = 0;
  departmentsCount = 0;
  serviceTypesCount = 0;

  constructor(
    private companyService: CompanyService,
    private branchService: BranchService,
    private departmentService: DepartmentService,
    private serviceTypeService: ServiceTypeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTreeData();
  }

async loadTreeData() {
  try {
    const [companies, branches, departments, serviceTypes] = await firstValueFrom(
      forkJoin([
        this.companyService.getAll(),
        this.branchService.getAll(),
        this.departmentService.getAll(),
        this.serviceTypeService.getAll()
      ])
    );

    this.treeData = this.buildTreeStructure(companies || [], branches || [], departments || [], serviceTypes || []);

    // Set counts
    this.companiesCount = companies?.length || 0;
    this.branchesCount = branches?.length || 0;
    this.departmentsCount = departments?.length || 0;
    this.serviceTypesCount = serviceTypes?.length || 0;

    this.expandFirstLevel();
  } catch (error) {
    console.error('Error loading tree data:', error);
  }
}

  navigateBack() {
    this.router.navigate(['/settings/company_management']);
  }

  buildTreeStructure(companies: Company[], branches: Branch[], departments: Department[], serviceTypes: ServiceType[]): TreeNode[] {
    const tree: TreeNode[] = [];

    companies.forEach(company => {
      const companyNode: TreeNode = {
        key: `company-${company.code}`,
        label: company.name,
        data: {
          type: 'company',
          ...company
        },
        children: []
      };

      // Add branches for this company
      const companyBranches = branches.filter(branch => branch.company_code === company.code);
      companyBranches.forEach(branch => {
        const branchNode: TreeNode = {
          key: `branch-${branch.code}`,
          label: branch.name,
          data: {
            type: 'branch',
            ...branch
          },
          children: []
        };

        // Add departments for this branch
        const branchDepartments = departments.filter(dept => dept.branch_code === branch.code);
        branchDepartments.forEach(department => {
          const departmentNode: TreeNode = {
            key: `department-${department.code}`,
            label: department.name,
            data: {
              type: 'department',
              ...department
            },
            children: []
          };

          // Add service types for this department
          const departmentServiceTypes = serviceTypes.filter(st => st.department_code === department.code);
          departmentServiceTypes.forEach(serviceType => {
            const serviceTypeNode: TreeNode = {
              key: `serviceType-${serviceType.code}`,
              label: serviceType.name,
              data: {
                type: 'serviceType',
                ...serviceType
              },
              children: []
            };
            departmentNode.children?.push(serviceTypeNode);
          });

          branchNode.children?.push(departmentNode);
        });

        companyNode.children?.push(branchNode);
      });

      tree.push(companyNode);
    });

    return tree;
  }

  expandFirstLevel() {
    this.treeData.forEach(node => {
      this.expandedKeys[node.key!] = true;
    });
  }

  onNodeExpand(event: any) {
    this.expandedKeys[event.node.key] = true;
  }

  onNodeCollapse(event: any) {
    delete this.expandedKeys[event.node.key];
  }

 

  showDetailsDialog(node: TreeNode) {
    this.selectedNode = node;
    this.dialogTitle = `${node.data.type.charAt(0).toUpperCase() + node.data.type.slice(1)} Details - ${node.data.name}`;
    this.displayDialog = true;
  }
}