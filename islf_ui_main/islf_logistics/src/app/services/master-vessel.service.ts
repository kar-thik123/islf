import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  active: boolean;
  vessel_type?: string;
}

@Injectable({ providedIn: 'root' })
export class MasterVesselService {
  private apiUrl = `${environment.apiUrl}/api/master_vessel`;

  constructor(
    private http: HttpClient, 
    private contextPayload: ContextPayloadService, 
    private contextService: ContextService,
    private configService: ConfigService
  ) {}

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
    // Note: Service Type not applicable for vessels
    
    return this.http.get<MasterVessel[]>(this.apiUrl, { params });
  }

  create(data: MasterVessel): Observable<MasterVessel> {
    return this.http.post<MasterVessel>(this.apiUrl, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  update(id: number, data: Partial<MasterVessel>): Observable<MasterVessel> {
    return this.http.put<MasterVessel>(`${this.apiUrl}/${id}`, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
export interface MasterVessel {
  id?: number;
  code: string;
  vessel_name: string;
  imo_number: string;
  flag: string;
  year_build: string;
  active: boolean;
  vessel_type?: string;
}