import { Component, ElementRef, ViewChild } from '@angular/core';
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


@Component({
    selector: '[app-topbar]',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppBreadcrumb, InputTextModule, ButtonModule, IconFieldModule, InputIconModule],
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
                <li class="topbar-profile">
                    <button type="button" class="p-link" (click)="onProfileButtonClick()">
                        <img [src]="userAvatar" alt="Profile" style="border: 2px solid #ccc; border-radius: 50%;" />
                    </button>
                </li>


            </ul>
        </div>
    </div>`
})
export class AppTopbar {
    @ViewChild('menubutton') menuButton!: ElementRef;

    userName: string | null = null;
    userAvatar: string | null = null;

    constructor(
        public layoutService: LayoutService, 
        private loginService: LoginService, 
        private authService: AuthService,
        private userService: UserService
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

    onMenuButtonClick() {
        this.layoutService.onMenuToggle();
    }

    onProfileButtonClick() {
        this.layoutService.showProfileSidebar();
    }

    onConfigButtonClick() {
        this.layoutService.showConfigSidebar();
    }
}
