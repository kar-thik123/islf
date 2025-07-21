import { Component, computed, inject } from '@angular/core';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutService } from '../../layout/service/layout.service';
import { AppConfigurator } from '../../layout/components/app.configurator';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { LoginService } from '../../services/login.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastService } from '@/services/toast.service';
import {ToastModule} from 'primeng/toast'
import { MessageService } from 'primeng/api';
import { LogsComponent } from '../logs/logs';
import { RouterModule } from '@angular/router';




@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CheckboxModule,
        InputTextModule,
        FormsModule,
        AppConfigurator,
        IconFieldModule,
        InputIconModule,
        ButtonModule,
        HttpClientModule,
        CommonModule,
        ToastModule,
        RouterModule,
        
        
    ],
    providers:[ToastService],
    template: `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1600 800"
            class="fixed left-0 top-0 min-h-screen min-w-[100vw]"
            preserveAspectRatio="none"
        >
            <rect
                [attr.fill]="
                    isDarkTheme() ? 'var(--p-primary-900)' : 'var(--p-primary-500)'
                "
                width="1600"
                height="800"
            />
            <path
                [attr.fill]="
                    isDarkTheme() ? 'var(--p-primary-800)' : 'var(--p-primary-400)'
                "
                d="M478.4 581c3.2 0.8 6.4 1.7 9.5 2.5c196.2 52.5 388.7 133.5 593.5 176.6c174.2 36.6 349.5 29.2 518.6-10.2V0H0v574.9c52.3-17.6 106.5-27.7 161.1-30.9C268.4 537.4 375.7 554.2 478.4 581z"
            />
            <path
                [attr.fill]="
                    isDarkTheme() ? 'var(--p-primary-700)' : 'var(--p-primary-300)'
                "
                d="M181.8 259.4c98.2 6 191.9 35.2 281.3 72.1c2.8 1.1 5.5 2.3 8.3 3.4c171 71.6 342.7 158.5 531.3 207.7c198.8 51.8 403.4 40.8 597.3-14.8V0H0v283.2C59 263.6 120.6 255.7 181.8 259.4z"
            />
            <path
                [attr.fill]="
                    isDarkTheme() ? 'var(--p-primary-600)' : 'var(--p-primary-200)'
                "
                d="M454.9 86.3C600.7 177 751.6 269.3 924.1 325c208.6 67.4 431.3 60.8 637.9-5.3c12.8-4.1 25.4-8.4 38.1-12.9V0H288.1c56 21.3 108.7 50.6 159.7 82C450.2 83.4 452.5 84.9 454.9 86.3z"
            />
            <path
                [attr.fill]="
                    isDarkTheme() ? 'var(--p-primary-500)' : 'var(--p-primary-100)'
                "
                d="M1397.5 154.8c47.2-10.6 93.6-25.3 138.6-43.8c21.7-8.9 43-18.8 63.9-29.5V0H643.4c62.9 41.7 129.7 78.2 202.1 107.4C1020.4 178.1 1214.2 196.1 1397.5 154.8z"
            />
        </svg>
        <div class="px-8 min-h-screen flex justify-center items-center">
            <div
                class="border border-surface-200 dark:border-surface-700 bg-white hitbg-we bg-surface-0 dark:bg-surface-900 rounded py-16 px-6 md:px-16 z-10 "
            >
                <div class="mb-6">
                    <img
                        src="assets/layout/images/logo.jpg"
                        alt="logo"
                        class="block mx-auto drop-shadow-2xl "
                    />

                    <div
                        class="text-surface-900 dark:text-surface-0 text-xl font-bold mb-2"
                    >
                        Log in
                    </div>
                    <span
                        class="text-surface-600 dark:text-surface-200 font-medium"
                        >Please enter your details</span
                    >
                </div>
                <div class="flex flex-col">
                    <p-iconfield class="w-full mb-6">
                        <p-inputicon class="pi pi-envelope" />
                        <input
                            id="identifier"
                            type="text"
                            pInputText
                            class="w-full md:w-[25rem]"
                            placeholder="Username, Email, or Phone"
                            [(ngModel)]="identifier"
                        />
                    </p-iconfield>

                    <p-iconfield class="w-full mb-6">
                        <p-inputicon class="pi pi-lock" />
                        <input
                            id="password"
                            type="password"
                            pInputText
                            class="w-full md:w-[25rem]"
                            placeholder="Password"
                            [(ngModel)]="password"
                        />
                    </p-iconfield>

                    <div class="mb-6 flex flex-wrap gap-4">
                        <div class="flex items-center">
                            <p-checkbox
                                name="checkbox"
                                value="val"
                                [(ngModel)]="rememberMe"
                                styleClass="mr-2"
                                class="flex"
                                [binary]="true"
                            ></p-checkbox>
                            <label
                                for="checkbox"
                                class="text-surface-900 dark:text-surface-0 font-medium mr-20"
                                >Remember Me</label
                            >
                        </div>
                        <a
                            class="text-surface-600 dark:text-surface-200 cursor-pointer hover:text-primary ml-auto transition-colors duration-300"
                            [routerLink]="['/auth/forgotpassword']"
                        >Forgot Password</a>
                    </div>
                    <button
                        pButton
                        pRipple
                        label="Log In"
                        class="w-full"
                        (click)="onLogin()"
                    ></button>
                </div>
            </div>
        </div>

        <app-configurator [simple]="true"/>
    `,
})
export class Login {
    rememberMe: boolean = false;
    identifier: string = '';
    password: string = '';
    // errorMessage: string = '';

    LayoutService = inject(LayoutService);
    loginService = inject(LoginService);
    router = inject(Router);
    messageService = inject(MessageService);

    isDarkTheme = computed(() => this.LayoutService.isDarkTheme());

    onLogin() {
        // this.errorMessage = '';
        if (!this.identifier || !this.password) {
            // this.errorMessage = 'Identifier and password are required.';
            this.messageService.add({severity: 'error', summary: 'Validation Error', detail: 'Identifier and password are required.', life: 5000});
            return;
        }
        this.loginService.login(this.identifier, this.password).subscribe({
            next: (res) => {
                this.loginService.setToken(res.token, this.rememberMe);
                if (res.name) {
                    this.loginService.setUserName(res.name, this.rememberMe);
                }
                this.messageService.add({severity: 'success', summary: 'Login Successful', detail: 'You have logged in successfully.', life: 2000});
                this.router.navigate(['logs/auth_logs']);
            },
            error: (err) => {
                const detail = err?.error?.message || 'Invalid identifier or password.';
                // this.errorMessage = detail;
                this.messageService.add({severity: 'error', summary: 'Login Failed', detail, life: 5000});
            }
        });
    }
} 