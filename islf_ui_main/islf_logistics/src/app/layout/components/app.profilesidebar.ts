import { Component, computed, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { BadgeModule } from 'primeng/badge';
import { LayoutService } from '../../layout/service/layout.service';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: '[app-profilesidebar]',
    imports: [
        CommonModule,
        ButtonModule,
        DrawerModule,
        BadgeModule,
    ],
    template: `
        <p-drawer
            [visible]="visible()"
            (onHide)="onDrawerHide()"
            position="right"
            [transitionOptions]="'.3s cubic-bezier(0, 0, 0.2, 1)'"
            styleClass="layout-profile-sidebar w-full sm:w-25rem"
        >
            <!-- User Profile Section -->
            <div class="flex flex-col mx-auto md:mx-0 items-center">
                <img *ngIf="userAvatar" [src]="userAvatar" alt="Profile" class="w-20 h-20 rounded-full mb-2" />
                <span class="mb-2 font-semibold">Welcome</span>
                <span class="text-surface-500 dark:text-surface-400 font-medium mb-8">{{ fullName || 'User' }}</span>
            </div>

            <ul class="list-none m-0 p-0">
                <li>
                    <a class="cursor-pointer flex mb-4 p-4 items-center border border-surface-200 dark:border-surface-700 rounded hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150"
                       (click)="goToProfile()">
                        <span>
                            <i class="pi pi-user text-xl text-primary"></i>
                        </span>
                        <div class="ml-4">
                            <span class="mb-2 font-semibold">Profile</span>
                            <p class="text-surface-500 dark:text-surface-400 m-0">View or edit your profile</p>
                        </div>
                    </a>
                </li>
                <li>
                    <a class="cursor-pointer flex mb-4 p-4 items-center border border-surface-200 dark:border-surface-700 rounded hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150"
                       (click)="signOut()">
                        <span>
                            <i class="pi pi-power-off text-xl text-primary"></i>
                        </span>
                        <div class="ml-4">
                            <span class="mb-2 font-semibold">Sign Out</span>
                            <p class="text-surface-500 dark:text-surface-400 m-0">Sign out of your account</p>
                        </div>
                    </a>
                </li>
            </ul>
            <!-- You can add more sections below as needed -->
        </p-drawer>
    `,
})
export class AppProfileSidebar implements OnInit {
    userName: string | null = null;
    userAvatar: string | null = null; // Extend this if you store avatar in localStorage or user profile
    fullName: string | null = null;
    userId: string | null = null;

    constructor(
        public layoutService: LayoutService,
        private router: Router,
        private loginService: LoginService,
        private authService: AuthService,
        private userService: UserService
    ) {
        this.userName = this.authService.getUserName();
    }

    ngOnInit() {
        if (this.userName) {
            this.userService.getUserByUsername(this.userName).subscribe({
                next: (res) => {
                    this.fullName = res.user.full_name;
                    this.userId = res.user.id;
                },
                error: () => {
                    this.fullName = this.userName; // fallback
                }
            });
        }
    }

    visible = computed(() => this.layoutService.layoutState().profileSidebarVisible);

    onDrawerHide() {
        this.layoutService.layoutState.update((prev) => ({ ...prev, profileSidebarVisible: false }));
    }

    // Navigate to profile page
    goToProfile() {
        this.onDrawerHide();
        if (this.userId) {
            this.router.navigate(['/setup/create_user', this.userId]);
        }
    }

    // Sign out logic
    signOut() {
        this.authService.logout();
        this.onDrawerHide();
        this.router.navigate(['/auth/login']);
    }
}
