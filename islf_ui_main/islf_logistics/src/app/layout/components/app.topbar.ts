import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../../layout/service/layout.service';
import { AppBreadcrumb } from './app.breadcrumb';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { LoginService } from '../../services/login.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ContextService } from '../../services/context.service';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

@Component({
    selector: '[app-topbar]',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppBreadcrumb, InputTextModule, ButtonModule, IconFieldModule, InputIconModule, DialogModule, DropdownModule, FormsModule],
    template: `<div class="layout-topbar">
        <div class="topbar-start">
            <button #menubutton type="button" class="topbar-menubutton p-link p-trigger" (click)="onMenuButtonClick()">
                <i class="pi pi-bars"></i>
            </button>
            <nav app-breadcrumb class="topbar-breadcrumb"></nav>
        </div>

        <div class="topbar-end">
            <ul class="topbar-menu">
                <li class="topbar-search">
                  <!--  <p-iconfield>
                        <p-inputicon class="pi pi-search" />
                        <input type="text" pInputText placeholder="Search" class="w-48 sm:w-full" />
                    </p-iconfield> -->
                </li>
                <li class="ml-3">
                    <p-button icon="pi pi-palette" rounded (onClick)="onConfigButtonClick()"></p-button>
                </li>
                <li class="ml-3">
                    <p-button icon="pi pi-sitemap" rounded (onClick)="onContextButtonClick()"></p-button>
                </li>
                <li class="topbar-profile ml-3">
                    <button type="button" class="p-link" (click)="onProfileButtonClick()">
                        <img [src]="userAvatar" alt="Profile" style="border: 2px solid #ccc; border-radius: 50%;" />
                    </button>
                </li>
            </ul>
        </div>
    </div>
    
    <!-- Context Selector Dialog -->
    <p-dialog
        header="Select Context"
        [(visible)]="showContextDialog"
        [modal]="true"
        [style]="{ width: '50vw' }"
        [draggable]="false"
        [resizable]="false"
    >
        <div class="p-fluid p-3 space-y-3">
            <div>
                <label for="company" class="block mb-2 font-medium">Company</label>
                <p-dropdown
                    id="company"
                    [options]="(contextService.companyOptions$ | async) || []"
                    [(ngModel)]="selectedCompany"
                    (onChange)="onCompanyChange()"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select Company"
                    [showClear]="true"
                ></p-dropdown>
            </div>

            <div>
                <label for="branch" class="block mb-2 font-medium">Branch</label>
                <p-dropdown
                    id="branch"
                    [options]="(contextService.branchOptions$ | async) || []"
                    [(ngModel)]="selectedBranch"
                    (onChange)="onBranchChange()"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select Branch"
                    [showClear]="true"
                ></p-dropdown>
            </div>

            <div>
                <label for="department" class="block mb-2 font-medium">Department</label>
                <p-dropdown
                    id="department"
                    [options]="(contextService.departmentOptions$ | async) || []"
                    [(ngModel)]="selectedDepartment"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select Department"
                    [showClear]="true"
                ></p-dropdown>
            </div>

            <div class="text-right pt-3">
                <button
                    pButton
                    type="button"
                    label="Save"
                    icon="pi pi-check"
                    class="p-button-primary"
                    (click)="saveContext()"
                    [disabled]="!canSave()"
                ></button>
            </div>
        </div>
    </p-dialog>`
})
export class AppTopbar implements OnInit {
    @ViewChild('menubutton') menuButton!: ElementRef;

    userName: string | null = null;
    userAvatar: string | null = null;
    showContextDialog: boolean = false;
    selectedCompany?: string;
    selectedBranch?: string;
    selectedDepartment?: string;

    constructor(
        public layoutService: LayoutService, 
        private loginService: LoginService, 
        private authService: AuthService,
        private userService: UserService,
        public contextService: ContextService
    ) {
        this.userName = this.authService.getUserName();
        if (this.userName) {
            this.userService.getUserByUsername(this.userName).subscribe({
                next: (res) => {
                    this.userAvatar = res.user.avatar_url || '/layout/images/avatar.png';
                },
                error: () => {
                    this.userAvatar = '/layout/images/avatar.png';
                }
            });
        } else {
            this.userAvatar = '/layout/images/avatar.png';
        }
    }

    ngOnInit() {
        // Initialize context options
        this.contextService.loadOptions();
        
        // Initialize context values if already set
        const context = this.contextService.getContext();
        this.selectedCompany = context.companyCode;
        this.selectedBranch = context.branchCode;
        this.selectedDepartment = context.departmentCode;
    }

    onMenuButtonClick() {
        this.layoutService.onMenuToggle();
    }

    onProfileButtonClick() {
        this.layoutService.showProfileSidebar();
    }

    onConfigButtonClick() {
        this.layoutService.showConfigSidebar();
    }
    
    onContextButtonClick() {
        this.showContextDialog = true;
    }
    
    onCompanyChange() {
        this.selectedBranch = undefined;
        this.selectedDepartment = undefined;
        this.contextService.clearBranchOptions();
        this.contextService.clearDepartmentOptions();
        
        if (this.selectedCompany) {
            this.contextService.loadBranchesForCompany(this.selectedCompany);
        }
    }

    onBranchChange() {
        this.selectedDepartment = undefined;
        this.contextService.clearDepartmentOptions();
        
        if (this.selectedBranch) {
            this.contextService.loadDepartmentsForBranch(this.selectedBranch);
        }
    }

    canSave(): boolean {
        return !!(this.selectedCompany && this.selectedBranch && this.selectedDepartment);
    }

    saveContext(): void {
        if (!this.selectedCompany || !this.selectedBranch || !this.selectedDepartment) {
            return;
        }
        
        // Clear previous context before setting new one
        this.contextService.clearContext();
        
        const ctx = {
            companyCode: this.selectedCompany,
            branchCode: this.selectedBranch,
            departmentCode: this.selectedDepartment
        };
        
        this.contextService.setContext(ctx);
        this.showContextDialog = false;
    }
}
