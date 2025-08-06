import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'primeng/tree';
import { ButtonModule } from 'primeng/button';
import { TreeNode } from 'primeng/api';
import { Router } from '@angular/router';
import { CompanyService, Company } from '../../../services/company.service';
import { BranchService, Branch } from '../../../services/branch.service';
import { DepartmentService, Department } from '../../../services/department.service';
import { ServiceTypeService, ServiceType } from '../../../services/servicetype.service';
import { ConfigDatePipe } from '../../../pipes/config-date.pipe';

@Component({
  selector: 'app-company-tree',
  standalone: true,
  imports: [CommonModule, TreeModule, ButtonModule, ConfigDatePipe],
  template: `
    <div class="md:w-full">
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <div class="font-semibold text-xl">Company Hierarchy Tree</div>
          <button pButton label="Back to Management" icon="pi pi-arrow-left" class="p-button-outlined" (click)="navigateBack()"></button>
        </div>
        
        <div class="mb-4">
          <p class="text-gray-600">This tree shows the complete hierarchical structure of your organization.</p>
        </div>

                 <div class="tree-container">
           <p-tree 
             [value]="treeData" 
             (onNodeExpand)="onNodeExpand($event)"
             (onNodeCollapse)="onNodeCollapse($event)">
            
            <ng-template pTemplate="default" let-node>
              <div class="flex items-center gap-2 p-2">
                <!-- Company Node -->
                <div *ngIf="node.data.type === 'company'" class="flex items-center gap-2 w-full">
                  <i class="pi pi-building text-blue-600 text-lg"></i>
                  <div class="flex-1">
                    <div class="font-semibold text-blue-800">{{ node.data.name }}</div>
                    <div class="text-xs text-gray-500">Code: {{ node.data.code }}</div>
                    <div class="text-xs text-gray-500">{{ node.data.address1 }}<span *ngIf="node.data.address2">, {{ node.data.address2 }}</span></div>
                  </div>
                  <div class="text-xs text-gray-400">
                    <div>GST: {{ node.data.gst }}</div>
                    <div>Phone: {{ node.data.phone }}</div>
                  </div>
                </div>

                <!-- Branch Node -->
                <div *ngIf="node.data.type === 'branch'" class="flex items-center gap-2 w-full">
                  <i class="pi pi-sitemap text-green-600 text-lg"></i>
                  <div class="flex-1">
                    <div class="font-semibold text-green-800">{{ node.data.name }}</div>
                    <div class="text-xs text-gray-500">Code: {{ node.data.code }}</div>
                    <div class="text-xs text-gray-500">Incharge: {{ node.data.incharge_name }}</div>
                  </div>
                  <div class="text-xs text-gray-400">
                    <div>GST: {{ node.data.gst }}</div>
                    <div>Status: {{ node.data.status }}</div>
                  </div>
                </div>

                <!-- Department Node -->
                <div *ngIf="node.data.type === 'department'" class="flex items-center gap-2 w-full">
                  <i class="pi pi-briefcase text-orange-600 text-lg"></i>
                  <div class="flex-1">
                    <div class="font-semibold text-orange-800">{{ node.data.name }}</div>
                    <div class="text-xs text-gray-500">Code: {{ node.data.code }}</div>
                    <div class="text-xs text-gray-500">Incharge: {{ node.data.incharge_name }}</div>
                  </div>
                  <div class="text-xs text-gray-400">
                    <div>Status: {{ node.data.status }}</div>
                    <div>Start: {{ node.data.start_date | configDate }}</div>
                  </div>
                </div>

                <!-- Service Type Node -->
                <div *ngIf="node.data.type === 'serviceType'" class="flex items-center gap-2 w-full">
                  <i class="pi pi-cog text-purple-600 text-lg"></i>
                  <div class="flex-1">
                    <div class="font-semibold text-purple-800">{{ node.data.name }}</div>
                    <div class="text-xs text-gray-500">Code: {{ node.data.code }}</div>
                    <div class="text-xs text-gray-500">Incharge: {{ node.data.incharge_name }}</div>
                  </div>
                  <div class="text-xs text-gray-400">
                    <div>Status: {{ node.data.status }}</div>
                    <div>Start: {{ node.data.start_date | configDate }}</div>
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
      // Load all data using firstValueFrom instead of deprecated toPromise()
      const companies = await this.companyService.getAll().toPromise();
      const branches = await this.branchService.getAll().toPromise();
      const departments = await this.departmentService.getAll().toPromise();
      const serviceTypes = await this.serviceTypeService.getAll().toPromise();

      // Build tree structure
      this.treeData = this.buildTreeStructure(companies || [], branches || [], departments || [], serviceTypes || []);
      
      // Set counts
      this.companiesCount = companies?.length || 0;
      this.branchesCount = branches?.length || 0;
      this.departmentsCount = departments?.length || 0;
      this.serviceTypesCount = serviceTypes?.length || 0;

      // Expand first level by default
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
} 