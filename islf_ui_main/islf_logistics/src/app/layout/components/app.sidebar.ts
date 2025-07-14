import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppMenu } from './app.menu';
import { LayoutService } from '../../layout/service/layout.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: '[app-sidebar]',
    standalone: true,
    imports: [CommonModule, AppMenu, RouterModule],
    template: ` <div
        class="layout-sidebar"
        (mouseenter)="onMouseEnter()"
        (mouseleave)="onMouseLeave()"
    >
        <div class="sidebar-header">
            <a [routerLink]="['/']" class="app-logo">
            <ng-container *ngIf="logoToShow">
              <img [src]="logoToShow" alt="Logo" class="h-12 max-w-xs sidebar-logo" />
            </ng-container>
            </a>
            <button
                class="layout-sidebar-anchor p-link z-2"
                type="button"
                (click)="anchor()"
            ></button>
        </div>

        <div #menuContainer class="layout-menu-container">
            <app-menu></app-menu>
        </div>
    </div>`,
})
export class AppSidebar implements OnInit, OnDestroy {
    timeout: any = null;
    logoToShow: string | null = null;
    companiesExist: boolean = false;

    @ViewChild('menuContainer') menuContainer!: ElementRef;
    constructor(
        public layoutService: LayoutService,
        public el: ElementRef,
        private http: HttpClient,
    ) {}

    ngOnInit() {
      this.loadSidebarLogo();
    }

    loadSidebarLogo() {
      // Fetch companies and check for a logo
      this.http.get<any[]>('/api/company').subscribe({
        next: (companies) => {
          const companyWithLogo = Array.isArray(companies) ? companies.find(c => c.logo) : null;
          if (companyWithLogo && companyWithLogo.logo) {
            this.logoToShow = companyWithLogo.logo;
          } else {
            // No company logo found, fetch settings logo
            this.http.get<{ value: string | null }>('/api/settings/default_logo').subscribe({
              next: (res) => {
                this.logoToShow = res.value || null;
              },
              error: () => {
                this.logoToShow = null;
              }
            });
          }
        },
        error: () => {
          // On error, fallback to settings logo
          this.http.get<{ value: string | null }>('/api/settings/default_logo').subscribe({
            next: (res) => {
              this.logoToShow = res.value || null;
            },
            error: () => {
              this.logoToShow = null;
            }
          });
        }
      });
    }

    ngOnDestroy() {
      window.removeEventListener('storage', this.handleStorageChange.bind(this));
    }

    handleStorageChange(event: StorageEvent) {
      if (event.key === 'selectedCompany') {
        this.updateLogoFromLocalStorage();
      }
    }

    updateLogoFromLocalStorage() {
      let selectedCompany: any = null;
      try {
        const stored = localStorage.getItem('selectedCompany');
        if (stored) {
          selectedCompany = JSON.parse(stored);
        }
      } catch (e) {
        selectedCompany = null;
      }

      if (selectedCompany && selectedCompany.logo) {
        this.logoToShow = selectedCompany.logo;
      } else if (this.companiesExist) {
        // No selected company or logo, but companies exist: show nothing
        this.logoToShow = null;
      } else {
        // No companies: show default logo from settings
        this.http.get<{ value: string | null }>('/api/settings/default_logo').subscribe({
          next: (res) => {
            this.logoToShow = res.value || null;
          },
          error: () => {
            this.logoToShow = null;
          }
        });
      }
    }

    onMouseEnter() {
        if (!this.layoutService.layoutState().anchored) {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }

            this.layoutService.layoutState.update((state: any) => {
                if (!state.sidebarActive) {
                    return {
                        ...state,
                        sidebarActive: true,
                    };
                }
                return state;
            });
        }
    }

    onMouseLeave() {
        if (!this.layoutService.layoutState().anchored) {
            if (!this.timeout) {
                this.timeout = setTimeout(() => {
                    this.layoutService.layoutState.update((state: any) => {
                        if (state.sidebarActive) {
                            return {
                                ...state,
                                sidebarActive: false,
                            };
                        }
                        return state;
                    });
                }, 300);
            }
        }
    }

    anchor() {
        this.layoutService.layoutState.update((state: any) => ({
            ...state,
            anchored: !state.anchored,
        }));
    }
}
