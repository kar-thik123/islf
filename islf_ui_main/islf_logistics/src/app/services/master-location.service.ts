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

  constructor(
    private http: HttpClient,
    private contextPayload: ContextPayloadService,
    private contextService: ContextService,
    private configService: ConfigService
  ) { }

  /**
   * Centralized Active Filter
   * Accepts: true, 'true', 1, '1'
   * Rejects: false, 'false', 0, null, undefined
   */
  isActiveLocation(loc: any): boolean {
    if (!loc) return false;
    const active = loc.active;
    return active === true || active === 'true' || active === 1 || active === '1';
  }

  // Stateless getAll method
  getAll(): Observable<any[]> {
    const context = this.contextService.getContext();
    const config = this.configService.getConfig();
    const locationFilter = config?.validation?.locationFilter || '';

    let params: any = {
      limit: 5000 // Large dataset safety
    };

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

    return this.http.get<{ data: any[], total: number }>(this.apiUrl, { params }).pipe(
      map(response => response.data || [])
    );
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