import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ServiceType {
  id?: number;
  company_code: string;
  branch_code: string;
  department_code: string;
  code: string;
  name: string;
  department_name: string;
  description?: string;
  incharge_name?: string;
  incharge_from?: string;
  status?: string;
  start_date?: string;
  close_date?: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceTypeService {
    private apiUrl = `${environment.apiUrl}/api/service_types`; // Fixed: was /api/number_series

  constructor(private http: HttpClient) { }

  getAll(): Observable<ServiceType[]> {
    return this.http.get<ServiceType[]>(this.apiUrl);
  }

  getByDepartment(departmentCode: string): Observable<ServiceType[]> {
    return this.http.get<ServiceType[]>(`${this.apiUrl}/department/${departmentCode}`);
  }

  getByCode(code: string): Observable<ServiceType> {
    return this.http.get<ServiceType>(`${this.apiUrl}/${code}`);
  }

  create(serviceType: ServiceType): Observable<ServiceType> {
    return this.http.post<ServiceType>(this.apiUrl, serviceType);
  }

  update(code: string, serviceType: ServiceType): Observable<ServiceType> {
    return this.http.put<ServiceType>(`${this.apiUrl}/${code}`, serviceType);
  }

  delete(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`);
  }
}