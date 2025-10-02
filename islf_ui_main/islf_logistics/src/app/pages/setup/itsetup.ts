import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { HttpClient } from '@angular/common/http';
import { ConfigService, AppConfig } from '../../services/config.service';
import { map } from 'rxjs';

// Define DocumentPaths interface
interface DocumentPaths {
  customer: string;
  vendor: string;
  company: string;
  branch: string;
  department: string;
  user: string;
  [key: string]: string; // Allow string indexing
}

@Component({
  selector: 'app-it-setup',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ButtonModule, 
    InputTextModule, 
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    InputSwitchModule,
    TabViewModule,
    CardModule,
    DividerModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <h2 class="text-2xl font-bold mb-6">IT System Configuration</h2>
      
      <p-tabView>
        <!-- System Settings Tab -->
        <p-tabPanel header="System Settings">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <p-card header="Company Configuration">
              <div class="space-y-4">
                <div>
                  <label class="block mb-2 font-medium">Maximum Companies Allowed</label>
                  <p-inputNumber 
                    [(ngModel)]="systemSettings.maxCompanies" 
                    [min]="1" 
                    [max]="10"
                    class="w-full"
                    placeholder="Enter max companies">
                  </p-inputNumber>
                </div>
                <div>
                  <label class="block mb-2 font-medium">Session Timeout (minutes)</label>
                  <p-inputNumber 
                    [(ngModel)]="systemSettings.sessionTimeout" 
                    [min]="1" 
                    [max]="480"
                    class="w-full"
                    placeholder="Session timeout in minutes">
                  </p-inputNumber>
                </div>
                <div> 
                  <label class="block mb-2 font-medium">Default Language</label>
                  <p-dropdown 
                    [(ngModel)]="systemSettings.defaultLanguage"
                    [options]="languageOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select language"
                    class="w-full">
                  </p-dropdown>
                </div>
                <div>
                  <label class="block mb-2 font-medium">Default Currency</label>
                  <p-dropdown 
                    [(ngModel)]="systemSettings.defaultCurrency"
                    [options]="currencyOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select currency"
                    class="w-full">
                  </p-dropdown>
                </div>
                <div>
                  <label class="block mb-2 font-medium">Decimal Places</label>
                  <p-dropdown 
                    [(ngModel)]="systemSettings.decimalPlaces"
                    [options]="decimalPlacesOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select decimal places"
                    class="w-full">
                  </p-dropdown>
                </div>
                <div>
                  <label class="block mb-2 font-medium">Max Records Per Page</label>
                  <p-dropdown 
                    [(ngModel)]="systemSettings.maxRecordsPerPage"
                    [options]="recordsPerPageOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select records per page"
                    class="w-full">
                  </p-dropdown>
                </div>
              </div>
            </p-card>

            <p-card header="Date & Time Configuration">
              <div class="space-y-4">
                <div>
                  <label class="block mb-2 font-medium">Date Format</label>
                  <p-dropdown 
                    [(ngModel)]="systemSettings.dateFormat"
                    [options]="dateFormatOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select date format"
                    class="w-full">
                  </p-dropdown>
                </div>
                <div>
                  <label class="block mb-2 font-medium">Time Format</label>
                  <p-dropdown 
                    [(ngModel)]="systemSettings.timeFormat"
                    [options]="timeFormatOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select time format"
                    class="w-full">
                  </p-dropdown>
                </div>
                <div>
                  <label class="block mb-2 font-medium">Timezone</label>
                  <p-dropdown 
                    [(ngModel)]="systemSettings.timezone"
                    [options]="timezoneOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select timezone"
                    class="w-full">
                  </p-dropdown>
                </div>
                <div>
                  <label class="block mb-2 font-medium">Auto Save Interval (seconds)</label>
                  <p-inputNumber 
                    [(ngModel)]="systemSettings.autoSaveInterval" 
                    [min]="10" 
                    [max]="300"
                    class="w-full"
                    placeholder="Auto save interval">
                  </p-inputNumber>
                </div>
              </div>
            </p-card>

            <p-card header="Document Management">
              <div class="space-y-4">
                <div>
                  <label class="block mb-2 font-medium">Customer Documents Path</label>
                  <input 
                    type="text" 
                    pInputText 
                    [(ngModel)]="documentUploadPaths.customer" 
                    class="w-full"
                    placeholder="/uploads/documents/customer" />
                </div>
                <div>
                  <label class="block mb-2 font-medium">Vendor Documents Path</label>
                  <input 
                    type="text" 
                    pInputText 
                    [(ngModel)]="documentUploadPaths.vendor" 
                    class="w-full"
                    placeholder="/uploads/documents/vendor" />
                </div>
                <div>
                  <label class="block mb-2 font-medium">Company Documents Path</label>
                  <input 
                    type="text" 
                    pInputText 
                    [(ngModel)]="documentUploadPaths.company" 
                    class="w-full"
                    placeholder="/uploads/documents/company" />
                </div>
                <div>
                  <label class="block mb-2 font-medium">Branch Documents Path</label>
                  <input 
                    type="text" 
                    pInputText 
                    [(ngModel)]="documentUploadPaths.branch" 
                    class="w-full"
                    placeholder="/uploads/documents/branch" />
                </div>
                <div>
                  <label class="block mb-2 font-medium">Department Documents Path</label>
                  <input 
                    type="text" 
                    pInputText 
                    [(ngModel)]="documentUploadPaths.department" 
                    class="w-full"
                    placeholder="/uploads/documents/department" />
                </div>
                <div>
                  <label class="block mb-2 font-medium">User Documents Path</label>
                  <input 
                    type="text" 
                    pInputText 
                    [(ngModel)]="documentUploadPaths.user" 
                    class="w-full"
                    placeholder="/uploads/documents/user" />
                </div>
                <div>
                  <label class="block mb-2 font-medium">Max File Size (MB)</label>
                  <p-inputNumber 
                    [(ngModel)]="systemSettings.maxFileSize" 
                    [min]="1" 
                    [max]="100"
                    class="w-full"
                    placeholder="Max file size in MB">
                  </p-inputNumber>
                </div>
              </div>
            </p-card>

            <p-card header="System Features">
              <div class="space-y-4">
                <div class="flex items-center space-x-2">
                  <p-inputSwitch [(ngModel)]="systemSettings.enableNotifications"></p-inputSwitch>
                  <label class="font-medium">Enable System Notifications</label>
                </div>
                <div class="flex items-center space-x-2">
                  <p-inputSwitch [(ngModel)]="systemSettings.enableAuditLog"></p-inputSwitch>
                  <label class="font-medium">Enable Audit Logging</label>
                </div>
                <div class="flex items-center space-x-2">
                  <p-inputSwitch [(ngModel)]="systemSettings.enableDataExport"></p-inputSwitch>
                  <label class="font-medium">Enable Data Export</label>
                </div>
                <div class="flex items-center space-x-2">
                  <p-inputSwitch [(ngModel)]="systemSettings.enableBulkOperations"></p-inputSwitch>
                  <label class="font-medium">Enable Bulk Operations</label>
                </div>
                <div class="flex items-center space-x-2">
                  <p-inputSwitch [(ngModel)]="systemSettings.enableAutoSave"></p-inputSwitch>
                  <label class="font-medium">Enable Auto Save</label>
                </div>
              </div>
            </p-card>
          </div>
        </p-tabPanel>

        <!-- Email Configuration Tab -->
        <p-tabPanel header="Email Configuration">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <p-card header="SMTP Settings">
              <div class="space-y-4">
                <div>
                  <label class="block mb-2 font-medium">SMTP Host</label>
                  <input 
                    type="text" 
                    pInputText 
                    [(ngModel)]="emailSettings.smtpHost" 
                    class="w-full"
                    placeholder="smtp.gmail.com" />
                </div>
                <div>
                  <label class="block mb-2 font-medium">SMTP Port</label>
                  <p-inputNumber 
                    [(ngModel)]="emailSettings.smtpPort" 
                    [min]="1" 
                    [max]="65535"
                    class="w-full"
                    placeholder="587">
                  </p-inputNumber>
                </div>
                <div>
                  <label class="block mb-2 font-medium">Username</label>
                  <input 
                    type="text" 
                    pInputText 
                    [(ngModel)]="emailSettings.username" 
                    class="w-full"
                    placeholder="your-email@gmail.com" />
                </div>
                <div>
                  <label class="block mb-2 font-medium">Password</label>
                  <input 
                    type="password" 
                    pInputText 
                    [(ngModel)]="emailSettings.password" 
                    class="w-full"
                    placeholder="App password" />
                </div>
                <div>
                  <label class="block mb-2 font-medium">From Email</label>
                  <input 
                    type="email" 
                    pInputText 
                    [(ngModel)]="emailSettings.fromEmail" 
                    class="w-full"
                    placeholder="noreply@yourcompany.com" />
                </div>
                <div>
                  <label class="block mb-2 font-medium">From Name</label>
                  <input 
                    type="text" 
                    pInputText 
                    [(ngModel)]="emailSettings.fromName" 
                    class="w-full"
                    placeholder="Your Company Name" />
                </div>
              </div>
            </p-card>

            <p-card header="Email Templates">
              <div class="space-y-4">
                <div>
                  <label class="block mb-2 font-medium">Password Reset Subject</label>
                  <input 
                    type="text" 
                    pInputText 
                    [(ngModel)]="emailSettings.passwordResetSubject" 
                    class="w-full"
                    placeholder="Password Reset Request" />
                </div>
                <div>
                  <label class="block mb-2 font-medium">Welcome Email Subject</label>
                  <input 
                    type="text" 
                    pInputText 
                    [(ngModel)]="emailSettings.welcomeSubject" 
                    class="w-full"
                    placeholder="Welcome to ISLF Logistics" />
                </div>
                <div>
                  <label class="block mb-2 font-medium">Notification Email Subject</label>
                  <input 
                    type="text" 
                    pInputText 
                    [(ngModel)]="emailSettings.notificationSubject" 
                    class="w-full"
                    placeholder="System Notification" />
                </div>
              </div>
            </p-card>
          </div>
        </p-tabPanel>

        <!-- Security Settings Tab -->
        <p-tabPanel header="Security Settings">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <p-card header="Password Policy">
              <div class="space-y-4">
                <div>
                  <label class="block mb-2 font-medium">Minimum Password Length</label>
                  <p-inputNumber 
                    [(ngModel)]="securitySettings.minPasswordLength" 
                    [min]="6" 
                    [max]="20"
                    class="w-full">
                  </p-inputNumber>
                </div>
                <div>
                  <label class="block mb-2 font-medium">Password Expiry Days</label>
                  <p-inputNumber 
                    [(ngModel)]="securitySettings.passwordExpiryDays" 
                    [min]="30" 
                    [max]="365"
                    class="w-full">
                  </p-inputNumber>
                </div>
                <div class="flex items-center space-x-2">
                  <p-inputSwitch [(ngModel)]="securitySettings.requireUppercase"></p-inputSwitch>
                  <label class="font-medium">Require Uppercase Letters</label>
                </div>
                <div class="flex items-center space-x-2">
                  <p-inputSwitch [(ngModel)]="securitySettings.requireLowercase"></p-inputSwitch>
                  <label class="font-medium">Require Lowercase Letters</label>
                </div>
                <div class="flex items-center space-x-2">
                  <p-inputSwitch [(ngModel)]="securitySettings.requireNumbers"></p-inputSwitch>
                  <label class="font-medium">Require Numbers</label>
                </div>
                <div class="flex items-center space-x-2">
                  <p-inputSwitch [(ngModel)]="securitySettings.requireSpecialChars"></p-inputSwitch>
                  <label class="font-medium">Require Special Characters</label>
                </div>
        </div>
            </p-card>

            <p-card header="Login Security">
        <div class="space-y-4">
          <div>
                  <label class="block mb-2 font-medium">Max Login Attempts</label>
                  <p-inputNumber 
                    [(ngModel)]="securitySettings.maxLoginAttempts" 
                    [min]="3" 
                    [max]="10"
                    class="w-full">
                  </p-inputNumber>
                </div>
                <div>
                  <label class="block mb-2 font-medium">Lockout Duration (minutes)</label>
                  <p-inputNumber 
                    [(ngModel)]="securitySettings.lockoutDuration" 
                    [min]="5" 
                    [max]="60"
                    class="w-full">
                  </p-inputNumber>
                </div>
                <div class="flex items-center space-x-2">
                  <p-inputSwitch [(ngModel)]="securitySettings.enableTwoFactor"></p-inputSwitch>
                  <label class="font-medium">Enable Two-Factor Authentication</label>
                </div>
                <div class="flex items-center space-x-2">
                  <p-inputSwitch [(ngModel)]="securitySettings.enableLoginNotifications"></p-inputSwitch>
                  <label class="font-medium">Enable Login Notifications</label>
                </div>
              </div>
            </p-card>
          </div>
        </p-tabPanel>

        <!-- Backup & Maintenance Tab -->
        <p-tabPanel header="Backup & Maintenance">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <p-card header="Backup Settings">
              <div class="space-y-4">
                <div class="flex items-center space-x-2">
                  <p-inputSwitch [(ngModel)]="backupSettings.enableAutoBackup"></p-inputSwitch>
                  <label class="font-medium">Enable Automatic Backup</label>
                </div>
                <div>
                  <label class="block mb-2 font-medium">Backup Frequency</label>
                  <p-dropdown 
                    [(ngModel)]="backupSettings.frequency"
                    [options]="backupFrequencyOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select frequency"
                    class="w-full">
                  </p-dropdown>
                </div>
                <div>
                  <label class="block mb-2 font-medium">Backup Time</label>
                  <p-calendar 
                    [(ngModel)]="backupSettings.backupTime"
                    timeOnly="true"
                    hourFormat="24"
                    class="w-full">
                  </p-calendar>
                </div>
                <div>
                  <label class="block mb-2 font-medium">Backup Retention (days)</label>
                  <p-inputNumber 
                    [(ngModel)]="backupSettings.retentionDays" 
                    [min]="7" 
                    [max]="365"
                    class="w-full">
                  </p-inputNumber>
                </div>
                <div>
                  <label class="block mb-2 font-medium">Backup Path</label>
                  <input 
                    type="text" 
                    pInputText 
                    [(ngModel)]="backupSettings.backupPath" 
                    class="w-full"
                    placeholder="/backups/islf" />
                </div>
              </div>
            </p-card>

            <p-card header="System Maintenance">
              <div class="space-y-4">
                <div class="flex items-center space-x-2">
                  <p-inputSwitch [(ngModel)]="maintenanceSettings.enableLogRotation"></p-inputSwitch>
                  <label class="font-medium">Enable Log Rotation</label>
                </div>
                <div>
                  <label class="block mb-2 font-medium">Log Retention (days)</label>
                  <p-inputNumber 
                    [(ngModel)]="maintenanceSettings.logRetentionDays" 
                    [min]="7" 
                    [max]="90"
                    class="w-full">
                  </p-inputNumber>
                </div>
                <div class="flex items-center space-x-2">
                  <p-inputSwitch [(ngModel)]="maintenanceSettings.enableSystemMonitoring"></p-inputSwitch>
                  <label class="font-medium">Enable System Monitoring</label>
                </div>
                <div>
                  <label class="block mb-2 font-medium">Disk Space Alert Threshold (%)</label>
                  <p-inputNumber 
                    [(ngModel)]="maintenanceSettings.diskSpaceThreshold" 
                    [min]="70" 
                    [max]="95"
                    class="w-full">
                  </p-inputNumber>
          </div>
          <div>
                  <label class="block mb-2 font-medium">Database Cleanup Interval (days)</label>
                  <p-inputNumber 
                    [(ngModel)]="maintenanceSettings.dbCleanupInterval" 
                    [min]="7" 
                    [max]="30"
                    class="w-full">
                  </p-inputNumber>
                </div>
              </div>
            </p-card>
          </div>
        </p-tabPanel>
        <!-- Branding Tab -->
        <p-tabPanel header="Branding">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <p-card header="Logo & Branding">
              <div class="space-y-4">
                <div>
                  <label class="block mb-2 font-medium">Default Company Logo</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    (change)="onLogoSelected($event)"
                    class="w-full" />
                  <div *ngIf="defaultLogo()" class="mt-2">
                    <img 
                      [src]="defaultLogo()" 
                      alt="Default Logo Preview" 
                      class="h-16 max-w-xs border rounded shadow" />
                  </div>
                </div>
                <div>
                  <label class="block mb-2 font-medium">Application Name</label>
                  <input 
                    type="text" 
                    pInputText 
                    [(ngModel)]="brandingSettings.appName" 
                    class="w-full"
                    placeholder="ISLF Logistics" />
                </div>
                <div>
                  <label class="block mb-2 font-medium">Company Name</label>
                  <input 
                    type="text" 
                    pInputText 
                    [(ngModel)]="brandingSettings.companyName" 
                    class="w-full"
                    placeholder="Your Company Name" />
                </div>
              </div>
            </p-card>

            <p-card header="Contact Information">
              <div class="space-y-4">
                <div>
                  <label class="block mb-2 font-medium">Support Email</label>
                  <input 
                    type="email" 
                    pInputText 
                    [(ngModel)]="brandingSettings.supportEmail" 
                    class="w-full"
                    placeholder="support@yourcompany.com" />
                </div>
                <div>
                  <label class="block mb-2 font-medium">Support Phone</label>
                  <input 
                    type="text" 
                    pInputText 
                    [(ngModel)]="brandingSettings.supportPhone" 
                    class="w-full"
                    placeholder="+1-800-123-4567" />
                </div>
                <div>
                  <label class="block mb-2 font-medium">Website URL</label>
                  <input 
                    type="url" 
                    pInputText 
                    [(ngModel)]="brandingSettings.websiteUrl" 
                    class="w-full"
                    placeholder="https://yourcompany.com" />
                </div>
                <div>
                  <label class="block mb-2 font-medium">Address</label>
                  <textarea 
                    pInputTextarea 
                    [(ngModel)]="brandingSettings.address" 
                    rows="3"
                    class="w-full"
                    placeholder="Company address"></textarea>
                </div>
              </div>
            </p-card>
        </div>
        </p-tabPanel>
        
        <!-- Validate/Filter Tab -->
        <p-tabPanel header="Validate/Filter">
          <div class="grid grid-cols-2 md:grid-cols-2 gap-6">
         <p-card header="Validation Settings" class="col-span-2">
         <small class="block mt-3 mb-3 text-gray-500 ">
          C = Company, D = Department, B = Branch, ST = Service Type
          </small>
         <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block mb-2 font-medium">Customer:</label>
                  <p-dropdown
                    [(ngModel)]="validationSettings.customerFilter"
                    [options]="customerFilterOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select customer filter"
                    class="w-full">
                  </p-dropdown>
                  
                </div>
                <div>
                  <label class="block mb-2 font-medium">Vendor:</label>
                  <p-dropdown
                    [(ngModel)]="validationSettings.vendorFilter"
                    [options]="vendorFilterOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select vendor filter"
                    class="w-full">
                  </p-dropdown>
                  
                </div>
             <!---   <div>
                  <label class="block mb-2 font-medium">Manual Entry:</label>
                  <input
                    type="text"
                    pInputText
                    [(ngModel)]="validationSettings.manualCustomerFilter"
                    class="w-full"
                    placeholder="e.g., C, CB, CBD, CBDST"
                    (input)="onManualCustomerFilterChange($event)" />
                  <small class="block mt-1 text-gray-500">
                    Enter combinations like C, CB, CBD, CBDST
                  </small>
                </div>  --->
                <div>
                  <label class="block mb-2 font-medium">Vessel:</label>
                  <p-dropdown
                    [(ngModel)]="validationSettings.vesselFilter"
                    [options]="vesselFilterOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select vessel filter"
                    class="w-full">
                  </p-dropdown>
                  
                </div>
                <div>
                  <label class="block mb-2 font-medium">UOM:</label>
                  <p-dropdown
                    [(ngModel)]="validationSettings.uomFilter"
                    [options]="vesselFilterOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select UOM filter"
                    class="w-full">
                  </p-dropdown>
                  
                </div>
                <div>
                <label class="block mb-2 font-medium">Container Type</label>  
                <p-dropdown
                [(ngModel)]="validationSettings.containerFilter"
                [options]="vesselFilterOptions"
                 optionValue="value"
                 placeholder="Select Container filter"
                class="w-full">
                </p-dropdown>
                
                </div>
                <div>
                  <label class="block mb-2 font-medium">Currency:</label>  
                  <p-dropdown
                  [(ngModel)]="validationSettings.currencyFilter"
                  [options]="vesselFilterOptions"
                   optionValue="value"
                  placeholder="Select Currency filter"
                  class="w-full">
                  </p-dropdown>
                    
                  </div>
                  <div>
                  <label class="block mb-2 font-medium">GST setup:</label>  
                  <p-dropdown
                  [(ngModel)]="validationSettings.gstsetupFilter"
                  [options]="vesselFilterOptions"
                   optionValue="value"
                  placeholder="Select GST Setup filter"
                  class="w-full">
                  </p-dropdown>
                    
                  </div>
                  <div>
                  <label class="block mb-2 font-medium">Location:</label>  
                  <p-dropdown
                  [(ngModel)]="validationSettings.locationFilter"
                  [options]="vesselFilterOptions"
                   optionValue="value"
                  placeholder="Select Location filter"
                  class="w-full">
                  </p-dropdown>
                    
                  </div>
                  <div>
                  <label class="block mb-2 font-medium">Master Code:</label>  
                  <p-dropdown
                  [(ngModel)]="validationSettings.masterCodeFilter"

                  [options]="vesselFilterOptions"
                   optionValue="value"
                  placeholder="Select Master Code filter"
                  class="w-full">
                  </p-dropdown>
                    
                  </div>
                  <div>
                  <label class="block mb-2 font-medium">Master Type:</label>  
                  <p-dropdown
                  [(ngModel)]="validationSettings.masterTypeFilter"
                  [options]="vesselFilterOptions"
                   optionValue="value"
                  placeholder="Select Master Type filter"
                  class="w-full">
                  </p-dropdown>
                    
                  </div>
                  <div>
                  <label class="block mb-2 font-medium">Tariff:</label>  
                  <p-dropdown
                  [(ngModel)]="validationSettings.tariffFilter"

                  [options]="vesselFilterOptions"
                   optionValue="value"
                  placeholder="Select Tariff filter"
                  class="w-full">
                  </p-dropdown>
                    
                  </div>
                  <div>
                  <label class="block mb-2 font-medium">Item:</label>  
                  <p-dropdown
                  [(ngModel)]="validationSettings.itemFilter"
                  [options]="vesselFilterOptions"
                   optionValue="value"
                  placeholder="Select Item filter"
                  class="w-full">
                  </p-dropdown>   
                  </div>
                  <div>
                  <label class="block mb-2 font-medium">Number Series:</label>  
                  <p-dropdown
                  [(ngModel)]="validationSettings.numberSeriesFilter"
                  [options]="vesselFilterOptions"
                   optionValue="value"
                  placeholder="Select Number Series filter"
                  class="w-full">
                  </p-dropdown>
                  </div>
                  <div>
                  <label class="block mb-2 font-medium">Number Series Relation:</label>  
                  <p-dropdown
                  [(ngModel)]="validationSettings.numberSeriesRelationFilter"
                  [options]="vesselFilterOptions"
                   optionValue="value"
                  placeholder="Select Number Series Relation filter"
                  class="w-full">
                  </p-dropdown>
                  </div>
                  <div>
                  <label class="block mb-2 font-medium">Mapping:</label>  
                  <p-dropdown
                  [(ngModel)]="validationSettings.mappingFilter"
                  [options]="vesselFilterOptions"
                   optionValue="value"
                  placeholder="Select Mapping filter"
                  class="w-full">
                  </p-dropdown>
                  </div>
                   <div>
                  <label class="block mb-2 font-medium">Basis:</label>  
                  <p-dropdown
                  [(ngModel)]="validationSettings.basisFilter"
                  [options]="vesselFilterOptions"
                   optionValue="value"
                  placeholder="Select Basis filter"
                  class="w-full">
                  </p-dropdown>
                  </div>
                  <div>
                  <label class="block mb-2 font-medium">User List:</label>  
                  <p-dropdown
                  [(ngModel)]="validationSettings.userListFilter"
                  [options]="vesselFilterOptions"
                   optionValue="value"
                  placeholder="Select User List filter"
                  class="w-full">
                  </p-dropdown>
                  </div>
                  <div>
                  <label class="block mb-2 font-medium">Sourcing:</label>
                  <p-dropdown
                    [(ngModel)]="validationSettings.sourceFilter"
                    [options]="sourceFilterOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select Source filter"
                    class="w-full">
                  </p-dropdown> 
                  </div>
                  <div>
                  <label class="block mb-2 font-medium">Service Area:</label>
                  <p-dropdown
                    [(ngModel)]="validationSettings.serviceAreaFilter"
                    [options]="sourceFilterOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select Service Area filter"
                    class="w-full">
                  </p-dropdown> 
                  </div>


              </div>
              
            </p-card>
          </div>
        </p-tabPanel>
      </p-tabView>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-3 mt-6">
        <button 
          pButton 
          label="Reset to Defaults" 
          class="p-button-outlined p-button-secondary"
          (click)="resetToDefaults()"
          [disabled]="loading()">
        </button>
        <button 
          pButton 
          label="Save All Settings" 
          class="p-button-primary"
          (click)="saveAllSettings()"
          [disabled]="loading()">
        </button>
      </div>

      <!-- Status Messages -->
      <div *ngIf="message()" class="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-700">
        {{ message() }}
        </div>
      <div *ngIf="error()" class="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
        {{ error() }}
      </div>
      
      <!-- Confirmation Dialog -->
      <p-confirmDialog></p-confirmDialog>
    </div>
  `
})
export class ITSetupComponent implements OnInit {
  // System Settings
  systemSettings = {
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
  };

  // Document Upload Paths
  documentUploadPaths: DocumentPaths = {
    customer: '/uploads/documents/customer',
    vendor: '/uploads/documents/vendor',
    company: '/uploads/documents/company',
    branch: '/uploads/documents/branch',
    department: '/uploads/documents/department',
    user: '/uploads/documents/user'
  };

  // Email Settings
  emailSettings = {
    smtpHost: '',
    smtpPort: 587,
    username: '',
    password: '',
    fromEmail: '',
    fromName: '',
    passwordResetSubject: 'Password Reset Request',
    welcomeSubject: 'Welcome to ISLF Logistics',
    notificationSubject: 'System Notification'
  };

  // Security Settings
  securitySettings = {
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
  };

  // Backup Settings
  backupSettings = {
    enableAutoBackup: true,
    frequency: 'daily',
    backupTime: new Date(),
    retentionDays: 30,
    backupPath: '/backups/islf'
  };

  // Maintenance Settings
  maintenanceSettings = {
    enableLogRotation: true,
    logRetentionDays: 30,
    enableSystemMonitoring: true,
    diskSpaceThreshold: 80,
    dbCleanupInterval: 7
  };

  // Branding Settings
  brandingSettings = {
    appName: 'ISLF Logistics',
    companyName: '',
    supportEmail: '',
    supportPhone: '',
    websiteUrl: '',
    address: ''
  };

  // Logistics Settings
  logisticsSettings = {
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
  };

  // Validation Settings
  validationSettings = {
    customerFilter: '',
    vendorFilter: '',
    vesselFilter: '',
    uomFilter: '',
    itemFilter: '',
    tariffFilter: '',
    masterCodeFilter:'',
    masterTypeFilter:'',
    locationFilter:'',
    currencyFilter:'',
    containerFilter:'',
    gstsetupFilter:'',
    numberSeriesFilter:'',
    numberSeriesRelationFilter:'',
    userListFilter:'',
    mappingFilter:'',
    basisFilter:'',
    sourceFilter: '',
    serviceAreaFilter:'',



    manualCustomerFilter: ''
  };

  // Options for dropdowns
  languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' },
    { label: 'Chinese', value: 'zh' },
    { label: 'Japanese', value: 'ja' },
    { label: 'Hindi', value: 'hi' },
    { label: 'Arabic', value: 'ar' }
  ];

  currencyOptions = [
    { label: 'US Dollar (USD)', value: 'USD' },
    { label: 'Euro (EUR)', value: 'EUR' },
    { label: 'British Pound (GBP)', value: 'GBP' },
    { label: 'Indian Rupee (INR)', value: 'INR' },
    { label: 'Canadian Dollar (CAD)', value: 'CAD' },
    { label: 'Australian Dollar (AUD)', value: 'AUD' },
    { label: 'Singapore Dollar (SGD)', value: 'SGD' },
    { label: 'UAE Dirham (AED)', value: 'AED' },
    { label: 'Saudi Riyal (SAR)', value: 'SAR' },
    { label: 'Chinese Yuan (CNY)', value: 'CNY' }
  ];

  dateFormatOptions = [
    { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
    { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
    { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
    { label: 'DD-MM-YYYY', value: 'DD-MM-YYYY' },
    { label: 'MM-DD-YYYY', value: 'MM-DD-YYYY' },
    { label: 'DD.MM.YYYY', value: 'DD.MM.YYYY' },
    { label: 'MM.DD.YYYY', value: 'MM.DD.YYYY' }
  ];

  timeFormatOptions = [
    { label: '24 Hour', value: '24' },
    { label: '12 Hour', value: '12' }
  ];

  timezoneOptions = [
    { label: 'UTC', value: 'UTC' },
    { label: 'GMT', value: 'GMT' },
    { label: 'EST (UTC-5)', value: 'America/New_York' },
    { label: 'CST (UTC-6)', value: 'America/Chicago' },
    { label: 'MST (UTC-7)', value: 'America/Denver' },
    { label: 'PST (UTC-8)', value: 'America/Los_Angeles' },
    { label: 'IST (UTC+5:30)', value: 'Asia/Kolkata' },
    { label: 'SGT (UTC+8)', value: 'Asia/Singapore' },
    { label: 'JST (UTC+9)', value: 'Asia/Tokyo' },
    { label: 'CET (UTC+1)', value: 'Europe/Paris' },
    { label: 'EET (UTC+2)', value: 'Europe/Athens' },
    { label: 'GST (UTC+4)', value: 'Asia/Dubai' }
  ];

  decimalPlacesOptions = [
    { label: '0', value: 0 },
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 }
  ];

  recordsPerPageOptions = [
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
    { label: '200', value: 200 }
  ];

  backupFrequencyOptions = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' }
  ];

  // Logistics-specific options
  shippingMethodOptions = [
    { label: 'Full Container Load (FCL)', value: 'FCL' },
    { label: 'Less than Container Load (LCL)', value: 'LCL' },
    { label: 'Air Freight', value: 'AIR' },
    { label: 'Road Transport', value: 'ROAD' },
    { label: 'Rail Transport', value: 'RAIL' },
    { label: 'Express Delivery', value: 'EXPRESS' }
  ];

  containerTypeOptions = [
    { label: '20 Foot Container', value: '20FT' },
    { label: '40 Foot Container', value: '40FT' },
    { label: '40 Foot High Cube', value: '40HC' },
    { label: '45 Foot Container', value: '45FT' },
    { label: 'Reefer Container', value: 'REEFER' },
    { label: 'Open Top Container', value: 'OPENTOP' },
    { label: 'Flat Rack Container', value: 'FLATRACK' }
  ];

  vesselTypeOptions = [
    { label: 'Container Ship', value: 'Container' },
    { label: 'Bulk Carrier', value: 'Bulk' },
    { label: 'Tanker', value: 'Tanker' },
    { label: 'General Cargo', value: 'General' },
    { label: 'Ro-Ro Ship', value: 'RoRo' },
    { label: 'LNG Carrier', value: 'LNG' },
    { label: 'LPG Carrier', value: 'LPG' }
  ];

  uomOptions = [
    { label: 'Pieces (PCS)', value: 'PCS' },
    { label: 'Kilograms (KG)', value: 'KG' },
    { label: 'Metric Tons (MT)', value: 'MT' },
    { label: 'Cubic Meters (CBM)', value: 'CBM' },
    { label: 'Square Meters (SQM)', value: 'SQM' },
    { label: 'Meters (M)', value: 'M' },
    { label: 'Liters (L)', value: 'L' },
    { label: 'Gallons (GAL)', value: 'GAL' },
    { label: 'Feet (FT)', value: 'FT' },
    { label: 'Inches (IN)', value: 'IN' }
  ];

  customerFilterOptions = [
 { label: 'C ', value: 'C' },
    { label: 'CB ', value: 'CB' },
    { label: 'CBD ', value: 'CBD' },
    { label: 'CBDST', value: 'CBDST' }
  ];
  vendorFilterOptions = [
    { label: 'C ', value: 'C' },
    { label: 'CB ', value: 'CB' },
    { label: 'CBD ', value: 'CBD' },
    { label: 'CBDST', value: 'CBDST' }
  ];
  vesselFilterOptions = [
  { label: 'C ', value: 'C' },
    { label: 'CB ', value: 'CB' },
    { label: 'CBD ', value: 'CBD' },
    { label: 'CBDST', value: 'CBDST' }
  ];
  sourceFilterOptions = [
    { label: 'C ', value: 'C' },
    { label: 'CB ', value: 'CB' },
    { label: 'CBD ', value: 'CBD' },
    { label: 'CBDST', value: 'CBDST' }
  ];

  // State management
  message = signal('');
  error = signal('');
  loading = signal(false);
  defaultLogo = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private configService: ConfigService
  ) {}

  ngOnInit() {
    this.loadAllSettings();
    this.subscribeToConfig();
  }

  subscribeToConfig() {
    this.configService.config$.subscribe(config => {
      if (config) {
        this.systemSettings = config.system;
        this.emailSettings = config.email;
        this.securitySettings = config.security;
        this.backupSettings = config.backup;
        this.maintenanceSettings = config.maintenance;
        this.brandingSettings = config.branding;
        this.logisticsSettings = config.logistics;
        this.documentUploadPaths = {
          ...config.documentPaths,
          branch: (config.documentPaths as any)?.branch || '/uploads/documents/branch',
          department: (config.documentPaths as any)?.department || '/uploads/documents/department'
        };
        if (config.validation) {
          this.validationSettings = config.validation;
        }
      }
    });
  }

  loadAllSettings() {
    this.loading.set(true);
    this.error.set('');
    this.message.set('');

    // Use the config service to load all settings
    this.configService.loadConfig().subscribe({
      next: (config) => {
        // Update local settings to match the loaded config
        this.systemSettings = { ...config.system };
        this.emailSettings = { ...config.email };
        this.securitySettings = { ...config.security };
        this.backupSettings = { ...config.backup };
        this.maintenanceSettings = { ...config.maintenance };
        this.brandingSettings = { ...config.branding };
        this.logisticsSettings = { ...config.logistics };
        this.documentUploadPaths = {
          ...config.documentPaths,
          branch: (config.documentPaths as any)?.branch || '/uploads/documents/branch',
          department: (config.documentPaths as any)?.department || '/uploads/documents/department'
        };
        if (config.validation) {
          this.validationSettings = config.validation;
        }
        
        this.loading.set(false);
        this.message.set('Settings loaded successfully!');
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set('Failed to load settings. Using default values.');
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load settings from server'
        });
      }
    });
  }



  onLogoSelected(event: any) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.defaultLogo.set(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  saveAllSettings() {
    this.loading.set(true);
    this.error.set('');
    this.message.set('');

    // Create the complete configuration object
    const config: AppConfig = {
      system: this.systemSettings,
      email: this.emailSettings,
      security: this.securitySettings,
      backup: this.backupSettings,
      maintenance: this.maintenanceSettings,
      branding: this.brandingSettings,
      logistics: this.logisticsSettings,
      documentPaths: this.documentUploadPaths,
      validation: this.validationSettings
    };

    // Save using the config service
    this.configService.saveConfig(config).subscribe({
      next: () => {
        this.message.set('All settings saved successfully!');
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'All settings have been saved and applied globally'
        });
      },
      error: (error) => {
        this.error.set('Failed to save settings. Please try again.');
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save settings'
        });
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }



  resetToDefaults() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to reset all settings to their default values? This action cannot be undone.',
      header: 'Confirm Reset',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
    this.loading.set(true);
        this.error.set('');
        this.message.set('');

        // Use the config service to reset to defaults
        this.configService.resetToDefaults();
        
        // Update local settings to match the reset defaults
        const defaultConfig = this.configService.getConfig();
        if (defaultConfig) {
          this.systemSettings = { ...defaultConfig.system };
          this.emailSettings = { ...defaultConfig.email };
          this.securitySettings = { ...defaultConfig.security };
          this.backupSettings = { ...defaultConfig.backup };
          this.maintenanceSettings = { ...defaultConfig.maintenance };
          this.brandingSettings = { ...defaultConfig.branding };
          this.logisticsSettings = { ...defaultConfig.logistics };
          this.documentUploadPaths = { 
            ...defaultConfig.documentPaths,
            branch: (defaultConfig.documentPaths as any)?.branch || '/uploads/documents/branch',
            department: (defaultConfig.documentPaths as any)?.department || '/uploads/documents/department'
          };
          if (defaultConfig.validation) {
            this.validationSettings = defaultConfig.validation;
          }
        }

        this.defaultLogo.set(null);
        this.loading.set(false);
        this.message.set('Settings reset to defaults successfully!');
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'All settings have been reset to defaults and applied globally'
        });
      }
      });
 }

 onManualCustomerFilterChange(event: any) {
   const value = event.target.value.toUpperCase();
   // Validate that the input only contains allowed characters (C, B, D, ST)
   if (value && !/^[CBDST]+$/.test(value)) {
     // If invalid characters are found, we could show an error message
     // For now, we'll just not update the customerFilter value
     return;
   }
   
   // Update the customerFilter value to match the manual entry
   this.validationSettings.customerFilter = value;
 }
}