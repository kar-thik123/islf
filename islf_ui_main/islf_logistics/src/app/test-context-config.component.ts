import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ContextService } from './services/context.service';
import { ConfigService } from './services/config.service';

@Component({
  selector: 'app-test-context-config',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <h3>Context & Configuration Test</h3>
      
      <div class="mb-4">
        <h4>Current Context:</h4>
        <pre>{{ currentContext | json }}</pre>
      </div>
      
      <div class="mb-4">
        <h4>Current Configuration:</h4>
        <pre>{{ currentConfig | json }}</pre>
      </div>
      
      <div class="mb-4">
        <h4>Test Log:</h4>
        <div *ngFor="let log of testLogs" class="text-sm">
          {{ log }}
        </div>
      </div>
      
      <button 
        (click)="testContextChange()" 
        class="bg-blue-500 text-white px-4 py-2 rounded mr-2">
        Test Context Change
      </button>
      
      <button 
        (click)="clearContext()" 
        class="bg-red-500 text-white px-4 py-2 rounded">
        Clear Context
      </button>
    </div>
  `
})
export class TestContextConfigComponent implements OnInit, OnDestroy {
  currentContext: any = {};
  currentConfig: any = {};
  testLogs: string[] = [];
  
  private contextSubscription?: Subscription;
  private configSubscription?: Subscription;
  
  constructor(
    private contextService: ContextService,
    private configService: ConfigService
  ) {}
  
  ngOnInit() {
    this.addLog('Component initialized');
    
    // Subscribe to context changes
    this.contextSubscription = this.contextService.context$.subscribe(context => {
      this.currentContext = context;
      this.addLog(`Context changed: ${JSON.stringify(context)}`);
    });
    
    // Subscribe to config changes
    this.configSubscription = this.configService.config$.subscribe(config => {
      this.currentConfig = config;
      this.addLog(`Configuration updated: ${config ? 'Loaded' : 'Null'}`);
    });
    
    // Get initial values
    this.currentContext = this.contextService.getContext();
    this.currentConfig = this.configService.getConfig();
  }
  
  ngOnDestroy() {
    this.contextSubscription?.unsubscribe();
    this.configSubscription?.unsubscribe();
  }
  
  testContextChange() {
    this.addLog('Testing context change...');
    
    // Simulate context change
    const testContext = {
      companyCode: 'TEST_COMP',
      branchCode: 'TEST_BRANCH',
      departmentCode: 'TEST_DEPT'
    };
    
    this.contextService.setContext(testContext);
    this.addLog('Context set to test values');
  }
  
  clearContext() {
    this.addLog('Clearing context...');
    this.contextService.clearContext();
    this.addLog('Context cleared');
  }
  
  private addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.testLogs.push(`[${timestamp}] ${message}`);
    
    // Keep only last 10 logs
    if (this.testLogs.length > 10) {
      this.testLogs = this.testLogs.slice(-10);
    }
  }
}