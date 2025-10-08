import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';
import { ConfigService } from './config.service';

export interface MasterLocation {
 
  type: string;
  code: string;
  name: string;
  country: string;
  state: string;
  city: string;
  gst_state_code: string;
  pin_code: string;
  active: boolean;
  
}

@Injectable({ providedIn: 'root' })
export class MasterLocationService {
  private apiUrl = `${environment.apiUrl}/api/master_location`;

  constructor(
    private http: HttpClient, 
    private contextPayload: ContextPayloadService, 
    private contextService: ContextService,
    private configService: ConfigService
  ) {}

  // Enhanced getAll method with cache-busting and debugging
  getAll(): Observable<any[]> {
    const context = this.contextService.getContext();
    const config = this.configService.getConfig();
    const locationFilter = config?.validation?.locationFilter || '';
    
    console.log('MasterLocationService.getAll() called with context:', context);
    console.log('LocationFilter setting:', locationFilter);
    
    let params: any = {
      // Add timestamp to prevent caching
      _t: new Date().getTime().toString()
    };
    
    // Only send context parameters based on the validation/filter settings
    if (locationFilter.includes('C') && context.companyCode) {
      params.companyCode = context.companyCode;
      console.log('Adding companyCode to request:', context.companyCode);
    }
    if (locationFilter.includes('B') && context.branchCode) {
      params.branchCode = context.branchCode;
      console.log('Adding branchCode to request:', context.branchCode);
    }
    if (locationFilter.includes('D') && context.departmentCode) {
      params.departmentCode = context.departmentCode;
      console.log('Adding departmentCode to request:', context.departmentCode);
    }
    
    console.log('Final request params:', params);
    
    // Add cache-busting headers
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    return this.http.get<any[]>(this.apiUrl, { params, headers });
  }

  create(data: MasterLocation): Observable<MasterLocation> {
    return this.http.post<MasterLocation>(this.apiUrl, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  update(code: string, data: Partial<MasterLocation>): Observable<MasterLocation> {
    return this.http.put<MasterLocation>(`${this.apiUrl}/${code}`, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  delete(code: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${code}`);
  }
}