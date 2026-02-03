import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';
import { ConfigService } from './config.service';

export interface MasterVessel {
  id?: number;
  code: string;
  vessel_name: string;
  imo_number: string;
  flag: string;
  year_build: string;
  active: string | boolean;
  vessel_type?: string;
}

@Injectable({ providedIn: 'root' })
export class MasterVesselService {
  private apiUrl = `${environment.apiUrl}/api/master_vessel`;
  private cache: MasterVessel[] | null = null;
  private lastContextKey: string = '';

  constructor(
    private http: HttpClient,
    private contextPayload: ContextPayloadService,
    private contextService: ContextService,
    private configService: ConfigService
  ) { }

  getAll(): Observable<MasterVessel[]> {
    const context = this.contextService.getContext();
    const config = this.configService.getConfig();
    const vesselFilter = config?.validation?.vesselFilter || '';

    let params: any = {};

    // Only send context parameters based on IT setup validation settings
    if (vesselFilter.includes('C') && context.companyCode) {
      params.company_code = context.companyCode;
    }
    if (vesselFilter.includes('B') && context.branchCode) {
      params.branch_code = context.branchCode;
    }
    if (vesselFilter.includes('D') && context.departmentCode) {
      params.department_code = context.departmentCode;
    }

    const currentContextKey = JSON.stringify(params);
    if (this.cache && this.lastContextKey === currentContextKey) {
      console.log('Returning cached vessels');
      return of(this.cache);
    }

    return this.http.get<MasterVessel[]>(this.apiUrl, { params }).pipe(
      tap(data => {
        this.cache = data;
        this.lastContextKey = currentContextKey;
      })
    );
  }

  clearCache() {
    this.cache = null;
    this.lastContextKey = '';
  }

  create(data: MasterVessel): Observable<MasterVessel> {
    this.clearCache();
    return this.http.post<MasterVessel>(this.apiUrl, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  update(id: number, data: Partial<MasterVessel>): Observable<MasterVessel> {
    this.clearCache();
    return this.http.put<MasterVessel>(`${this.apiUrl}/${id}`, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  delete(id: number): Observable<any> {
    this.clearCache();
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}