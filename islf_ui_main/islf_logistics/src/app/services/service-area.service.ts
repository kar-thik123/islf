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
  constructor(
    private http: HttpClient,
    private contextPayloadService: ContextPayloadService,
    private contextService: ContextService,
    private configService: ConfigService
  ) {}

  getServiceAreas(): Observable<ServiceArea[]> {
    return this.http.get<ServiceArea[]>(`${environment.apiUrl}/service_area`);
  }

  getServiceAreaById(id: number): Observable<ServiceArea> {
    return this.http.get<ServiceArea>(`${environment.apiUrl}/service_area/${id}`);
  }

  createServiceArea(serviceArea: ServiceArea): Observable<ServiceArea> {
    return this.http.post<ServiceArea>(`${environment.apiUrl}/service_area`, serviceArea);
  }

  updateServiceArea(id: number, serviceArea: ServiceArea): Observable<ServiceArea> {
    return this.http.put<ServiceArea>(`${environment.apiUrl}/service_area/${id}`, serviceArea);
  }

  deleteServiceArea(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/service_area/${id}`);
  }

  getServiceAreaTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/service_area/types/all`);
  }
}