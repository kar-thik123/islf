import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';
import { ConfigService } from './config.service';

export interface ServiceArea {
  id?: number;
  code: string;
  type: string;
  service_area: string;
  from_location: boolean;
  to_location: boolean;
  status: string;
  isEditing?: boolean;
  isNew?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceAreaService {

  private apiUrl = `${environment.apiUrl}/api/service_area`;

  constructor(
    private http: HttpClient,
    private contextPayloadService: ContextPayloadService,
    private contextService: ContextService,
    private configService: ConfigService
  ) {}

  getServiceAreas(): Observable<ServiceArea[]> {
    const context = this.contextService.getContext();
    const config = this.configService.getConfig();
    const filter = config?.validation?.serviceAreaFilter || '';
    
    let params: any = {};
    if (filter.includes('C') && context.companyCode) params.company_code = context.companyCode;
    if (filter.includes('B') && context.branchCode) params.branch_code = context.branchCode;
    if (filter.includes('D') && context.departmentCode) params.department_code = context.departmentCode;
    if (filter.includes('ST') && context.serviceType) params.service_type_code = context.serviceType;
    
    return this.http.get<ServiceArea[]>(this.apiUrl, { params });
  }

  getServiceAreaById(id: number): Observable<ServiceArea> {
    return this.http.get<ServiceArea>(`${this.apiUrl}/${id}`);
  }

  createServiceArea(serviceArea: ServiceArea): Observable<ServiceArea> {
    const context = this.contextService.getContext();
    return this.http.post<ServiceArea>(
      `${this.apiUrl}`,
      this.contextPayloadService.withContext(serviceArea, context)
    );
  }

  updateServiceArea(id: number, serviceArea: ServiceArea): Observable<ServiceArea> {
    const context = this.contextService.getContext();
    return this.http.put<ServiceArea>(
      `${this.apiUrl}/${id}`,
      this.contextPayloadService.withContext(serviceArea, context)
    );
  }

  deleteServiceArea(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getServiceAreaTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/types/all`);
  }
}
