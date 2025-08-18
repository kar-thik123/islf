import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { ContextService } from './context.service';

export interface SystemConfig {
  maxCompanies: number;
  sessionTimeout: number;
  defaultLanguage: string;
  defaultCurrency: string;
  maxFileSize: number;
  dateFormat: string;
  timeFormat: string;
  timezone: string;
  decimalPlaces: number;
  enableNotifications: boolean;
  enableAuditLog: boolean;
  enableDataExport: boolean;
  enableBulkOperations: boolean;
  maxRecordsPerPage: number;
  enableAutoSave: boolean;
  autoSaveInterval: number;
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  passwordResetSubject: string;
  welcomeSubject: string;
  notificationSubject: string;
}

export interface SecurityConfig {
  minPasswordLength: number;
  passwordExpiryDays: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number;
  enableTwoFactor: boolean;
  enableLoginNotifications: boolean;
}

export interface BackupConfig {
  enableAutoBackup: boolean;
  frequency: string;
  backupTime: Date;
  retentionDays: number;
  backupPath: string;
}

export interface MaintenanceConfig {
  enableLogRotation: boolean;
  logRetentionDays: number;
  enableSystemMonitoring: boolean;
  diskSpaceThreshold: number;
  dbCleanupInterval: number;
}

export interface BrandingConfig {
  appName: string;
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  websiteUrl: string;
  address: string;
  defaultLogo?: string;
}

export interface LogisticsConfig {
  defaultShippingMethod: string;
  defaultContainerType: string;
  defaultVesselType: string;
  defaultUOM: string;
  invoicePrefix: string;
  billOfLadingPrefix: string;
  containerPrefix: string;
  vesselPrefix: string;
  enableShipmentNotifications: boolean;
  enableContainerAlerts: boolean;
  enableVesselAlerts: boolean;
  enableCustomsAlerts: boolean;
  alertEmailRecipients: string;
  enableAPIIntegration: boolean;
  apiBaseUrl: string;
  apiKey: string;
  apiSecret: string;
}

export interface DocumentPaths {
  customer: string;
  vendor: string;
  company: string;
  user: string;
}

export interface ValidationConfig {
  customerFilter: string;
  vendorFilter: string;
  vesselFilter: string;
  uomFilter: string;
  itemFilter: string;
  tariffFilter: string;
  masterCodeFilter: string;
  masterTypeFilter: string;
  locationFilter: string;
  currencyFilter: string;
  containerFilter: string;
  gstsetupFilter: string;
  numberSeriesFilter: string;
  numberSeriesRelationFilter: string;
  userListFilter: string;
  mappingFilter: string; // Add this line
  manualCustomerFilter: string;
}

export interface AppConfig {
  system: SystemConfig;
  email: EmailConfig;
  security: SecurityConfig;
  backup: BackupConfig;
  maintenance: MaintenanceConfig;
  branding: BrandingConfig;
  logistics: LogisticsConfig;
  documentPaths: DocumentPaths;
  validation?: ValidationConfig;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private configSubject = new BehaviorSubject<AppConfig | null>(null);
  public config$ = this.configSubject.asObservable();

  private defaultConfig: AppConfig = {
    system: {
      maxCompanies: 1,
      sessionTimeout: 30,
      defaultLanguage: 'en',
      defaultCurrency: 'USD',
      maxFileSize: 10,
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24',
      timezone: 'UTC',
      decimalPlaces: 2,
      enableNotifications: true,
      enableAuditLog: true,
      enableDataExport: true,
      enableBulkOperations: true,
      maxRecordsPerPage: 50,
      enableAutoSave: true,
      autoSaveInterval: 30
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      username: '',
      password: '',
      fromEmail: '',
      fromName: '',
      passwordResetSubject: 'Password Reset Request',
      welcomeSubject: 'Welcome to ISLF Logistics',
      notificationSubject: 'System Notification'
    },
    security: {
      minPasswordLength: 8,
      passwordExpiryDays: 90,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      enableTwoFactor: false,
      enableLoginNotifications: true
    },
    backup: {
      enableAutoBackup: true,
      frequency: 'daily',
      backupTime: new Date(),
      retentionDays: 30,
      backupPath: '/backups/islf'
    },
    maintenance: {
      enableLogRotation: true,
      logRetentionDays: 30,
      enableSystemMonitoring: true,
      diskSpaceThreshold: 80,
      dbCleanupInterval: 7
    },
    branding: {
      appName: 'ISLF Logistics',
      companyName: '',
      supportEmail: '',
      supportPhone: '',
      websiteUrl: '',
      address: ''
    },
    logistics: {
      defaultShippingMethod: 'FCL',
      defaultContainerType: '20FT',
      defaultVesselType: 'Container',
      defaultUOM: 'PCS',
      invoicePrefix: 'INV-',
      billOfLadingPrefix: 'BL-',
      containerPrefix: 'CONT-',
      vesselPrefix: 'VSL-',
      enableShipmentNotifications: true,
      enableContainerAlerts: true,
      enableVesselAlerts: true,
      enableCustomsAlerts: true,
      alertEmailRecipients: '',
      enableAPIIntegration: false,
      apiBaseUrl: '',
      apiKey: '',
      apiSecret: ''
    },
    documentPaths: {
      customer: '/uploads/documents/customer',
      vendor: '/uploads/documents/vendor',
      company: '/uploads/documents/company',
      user: '/uploads/documents/user'
    },
    validation: {
      customerFilter: '',
      vendorFilter: '',
      vesselFilter: '',
      uomFilter: '',
      itemFilter: '',
      tariffFilter: '',
      masterCodeFilter: '',
      masterTypeFilter: '',
      locationFilter: '',
      currencyFilter: '',
      containerFilter: '',
      gstsetupFilter: '',
      numberSeriesFilter: '',
      numberSeriesRelationFilter: '',
      userListFilter: '',
      mappingFilter: '', // Add this line
      manualCustomerFilter: ''
    }
  };

  constructor(private http: HttpClient, private injector: Injector) {
    this.loadConfig();
    
    // Subscribe to context changes and reload config when context changes
    // Use setTimeout to avoid circular dependency during initialization
    setTimeout(() => {
      try {
        // Import ContextService dynamically to avoid circular dependency
        import('./context.service').then(({ ContextService }) => {
          const contextService = this.injector.get(ContextService);
          contextService.context$.subscribe(() => {
            this.loadConfig().subscribe();
          });
        });
      } catch (error) {
        // ContextService might not be available yet, that's okay
        console.log('ContextService not available during ConfigService initialization');
      }
    }, 0);
  }

  // Load configuration from backend
  loadConfig(): Observable<AppConfig> {
    // Get current context to include in the request
    let contextParams = '';
    try {
      // Try to get ContextService from injector, but handle circular dependency
      const contextService = this.injector.get(ContextService, null);
      if (contextService) {
        const context = contextService.getContext();
        if (context && context.companyCode) {
          const params = new URLSearchParams();
          if (context.companyCode) params.append('company_code', context.companyCode);
          if (context.branchCode) params.append('branch_code', context.branchCode);
          if (context.departmentCode) params.append('department_code', context.departmentCode);
          contextParams = params.toString() ? '?' + params.toString() : '';
        }
      }
    } catch (error) {
      // ContextService might not be available, continue without context
      console.log('Could not get context for config loading:', error);
    }
    
    return this.http.get<AppConfig>(`/api/settings/config${contextParams}`).pipe(
      tap(config => {
        this.configSubject.next(config);
        this.applyConfig(config);
      })
    );
  }

  // Save configuration to backend
  saveConfig(config: AppConfig): Observable<any> {
    return this.http.post('/api/settings/config', config).pipe(
      tap(() => {
        this.configSubject.next(config);
        this.applyConfig(config);
      })
    );
  }

  // Get current configuration
  getConfig(): AppConfig | null {
    return this.configSubject.value;
  }

  // Get specific configuration section
  getSystemConfig(): SystemConfig {
    return this.configSubject.value?.system || this.defaultConfig.system;
  }

  getEmailConfig(): EmailConfig {
    return this.configSubject.value?.email || this.defaultConfig.email;
  }

  getSecurityConfig(): SecurityConfig {
    return this.configSubject.value?.security || this.defaultConfig.security;
  }

  getBackupConfig(): BackupConfig {
    return this.configSubject.value?.backup || this.defaultConfig.backup;
  }

  getMaintenanceConfig(): MaintenanceConfig {
    return this.configSubject.value?.maintenance || this.defaultConfig.maintenance;
  }

  getBrandingConfig(): BrandingConfig {
    return this.configSubject.value?.branding || this.defaultConfig.branding;
  }

  getLogisticsConfig(): LogisticsConfig {
    return this.configSubject.value?.logistics || this.defaultConfig.logistics;
  }

  getDocumentPaths(): DocumentPaths {
    return this.configSubject.value?.documentPaths || this.defaultConfig.documentPaths;
  }

  // Update specific configuration section
  updateSystemConfig(systemConfig: Partial<SystemConfig>): void {
    const currentConfig = this.configSubject.value || this.defaultConfig;
    const updatedConfig = {
      ...currentConfig,
      system: { ...currentConfig.system, ...systemConfig }
    };
    this.configSubject.next(updatedConfig);
    this.applyConfig(updatedConfig);
  }

  updateEmailConfig(emailConfig: Partial<EmailConfig>): void {
    const currentConfig = this.configSubject.value || this.defaultConfig;
    const updatedConfig = {
      ...currentConfig,
      email: { ...currentConfig.email, ...emailConfig }
    };
    this.configSubject.next(updatedConfig);
    this.applyConfig(updatedConfig);
  }

  updateSecurityConfig(securityConfig: Partial<SecurityConfig>): void {
    const currentConfig = this.configSubject.value || this.defaultConfig;
    const updatedConfig = {
      ...currentConfig,
      security: { ...currentConfig.security, ...securityConfig }
    };
    this.configSubject.next(updatedConfig);
    this.applyConfig(updatedConfig);
  }

  updateBackupConfig(backupConfig: Partial<BackupConfig>): void {
    const currentConfig = this.configSubject.value || this.defaultConfig;
    const updatedConfig = {
      ...currentConfig,
      backup: { ...currentConfig.backup, ...backupConfig }
    };
    this.configSubject.next(updatedConfig);
    this.applyConfig(updatedConfig);
  }

  updateMaintenanceConfig(maintenanceConfig: Partial<MaintenanceConfig>): void {
    const currentConfig = this.configSubject.value || this.defaultConfig;
    const updatedConfig = {
      ...currentConfig,
      maintenance: { ...currentConfig.maintenance, ...maintenanceConfig }
    };
    this.configSubject.next(updatedConfig);
    this.applyConfig(updatedConfig);
  }

  updateBrandingConfig(brandingConfig: Partial<BrandingConfig>): void {
    const currentConfig = this.configSubject.value || this.defaultConfig;
    const updatedConfig = {
      ...currentConfig,
      branding: { ...currentConfig.branding, ...brandingConfig }
    };
    this.configSubject.next(updatedConfig);
    this.applyConfig(updatedConfig);
  }

  updateLogisticsConfig(logisticsConfig: Partial<LogisticsConfig>): void {
    const currentConfig = this.configSubject.value || this.defaultConfig;
    const updatedConfig = {
      ...currentConfig,
      logistics: { ...currentConfig.logistics, ...logisticsConfig }
    };
    this.configSubject.next(updatedConfig);
    this.applyConfig(updatedConfig);
  }

  updateDocumentPaths(documentPaths: Partial<DocumentPaths>): void {
    const currentConfig = this.configSubject.value || this.defaultConfig;
    const updatedConfig = {
      ...currentConfig,
      documentPaths: { ...currentConfig.documentPaths, ...documentPaths }
    };
    this.configSubject.next(updatedConfig);
    this.applyConfig(updatedConfig);
  }

  // Apply configuration changes to the application
  private applyConfig(config: AppConfig): void {
    // Apply date format
    this.applyDateFormat(config.system.dateFormat);
    
    // Apply timezone
    this.applyTimezone(config.system.timezone);
    
    // Apply branding
    this.applyBranding(config.branding);
    
    // Apply system settings
    this.applySystemSettings(config.system);
    
    // Store in localStorage for persistence
    localStorage.setItem('appConfig', JSON.stringify(config));
  }

  private applyDateFormat(dateFormat: string): void {
    // Set CSS custom property for date format
    document.documentElement.style.setProperty('--date-format', dateFormat);
    
    // Update moment.js locale if available
    if (typeof (window as any).moment !== 'undefined') {
      const moment = (window as any).moment;
      moment.locale('en', {
        longDateFormat: {
          LT: 'HH:mm',
          LTS: 'HH:mm:ss',
          L: dateFormat,
          LL: dateFormat,
          LLL: dateFormat + ' HH:mm',
          LLLL: dateFormat + ' HH:mm'
        }
      });
    }
  }

  private applyTimezone(timezone: string): void {
    // Set timezone for the application
    localStorage.setItem('appTimezone', timezone);
    
    // Update moment.js timezone if available
    if (typeof (window as any).moment !== 'undefined') {
      const moment = (window as any).moment;
      moment.tz.setDefault(timezone);
    }
  }

  private applyBranding(branding: BrandingConfig): void {
 
    // Update document title
    document.title = branding.appName;
    
    // Update favicon if logo is available
    if (branding.defaultLogo) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = branding.defaultLogo;
      }
    }
  }

  private applySystemSettings(system: SystemConfig): void {
    // Apply decimal places
    document.documentElement.style.setProperty('--decimal-places', system.decimalPlaces.toString());
    
    // Apply max records per page
    localStorage.setItem('maxRecordsPerPage', system.maxRecordsPerPage.toString());
    
    // Apply session timeout
    localStorage.setItem('sessionTimeout', system.sessionTimeout.toString());
    
    // Apply language
    localStorage.setItem('appLanguage', system.defaultLanguage);
    
    // Apply currency
    localStorage.setItem('appCurrency', system.defaultCurrency);
  }

  // Utility methods for components to use
  formatDate(date: Date | string, format?: string): string {
    const config = this.getSystemConfig();
    const dateFormat = format || config.dateFormat;
    
    if (typeof (window as any).moment !== 'undefined') {
      const moment = (window as any).moment;
      return moment(date).format(dateFormat);
    }
    
    // Fallback to native Date formatting
    const d = new Date(date);
    return d.toLocaleDateString();
  }

  formatTime(date: Date | string): string {
    const config = this.getSystemConfig();
    const timeFormat = config.timeFormat;
    
    if (typeof (window as any).moment !== 'undefined') {
      const moment = (window as any).moment;
      return moment(date).format(timeFormat === '24' ? 'HH:mm' : 'hh:mm A');
    }
    
    // Fallback to native Date formatting
    const d = new Date(date);
    return d.toLocaleTimeString();
  }

  formatCurrency(amount: number, currency?: string): string {
    const config = this.getSystemConfig();
    const currencyCode = currency || config.defaultCurrency;
    const decimalPlaces = config.decimalPlaces;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    }).format(amount);
  }

  formatNumber(number: number): string {
    const config = this.getSystemConfig();
    const decimalPlaces = config.decimalPlaces;
    
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    }).format(number);
  }

  // Reset to defaults
  resetToDefaults(): void {
    this.configSubject.next(this.defaultConfig);
    this.applyConfig(this.defaultConfig);
  }
}