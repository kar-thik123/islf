import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
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
  private cache: any[] | null = null;
  private lastContextKey: string = '';

  constructor(
    private http: HttpClient,
    private contextPayload: ContextPayloadService,
    private contextService: ContextService,
    private configService: ConfigService
  ) { }

  // Enhanced getAll method with in-memory caching
  getAll(): Observable<any[]> {
    const context = this.contextService.getContext();
    const config = this.configService.getConfig();
    const locationFilter = config?.validation?.locationFilter || '';

    let params: any = {};

    // Only send context parameters based on the validation/filter settings
    if (locationFilter.includes('C') && context.companyCode) {
      params.companyCode = context.companyCode;
    }
    if (locationFilter.includes('B') && context.branchCode) {
      params.branchCode = context.branchCode;
    }
    if (locationFilter.includes('D') && context.departmentCode) {
      params.departmentCode = context.departmentCode;
    }

    const currentContextKey = JSON.stringify(params);
    if (this.cache && this.lastContextKey === currentContextKey) {
      console.log('Returning cached locations');
      return of(this.cache);
    }

    return this.http.get<{ data: any[], total: number }>(this.apiUrl, { params }).pipe(
      map(response => {
        // Extract the data array from the paginated response
        const data = response.data || [];
        this.cache = data;
        this.lastContextKey = currentContextKey;
        return data;
      })
    );
  }

  clearCache() {
    this.cache = null;
    this.lastContextKey = '';
  }

  create(data: MasterLocation): Observable<MasterLocation> {
    this.clearCache();
    return this.http.post<MasterLocation>(this.apiUrl, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  update(code: string, data: Partial<MasterLocation>): Observable<MasterLocation> {
    this.clearCache();
    return this.http.put<MasterLocation>(`${this.apiUrl}/${code}`, this.contextPayload.withContext(data, this.contextService.getContext()));
  }


  delete(code: string): Observable<any> {
    this.clearCache();
    return this.http.delete(`${this.apiUrl}/${code}`);
  }
}