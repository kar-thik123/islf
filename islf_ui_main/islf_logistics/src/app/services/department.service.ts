import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Department {
  code: string;
  company_code: string;
  branch_code: string;
  name: string;
  description?: string;
  incharge_name?: string;
  incharge_from?: string;
  status?: string;
  start_date?: string;
  close_date?: string;
  remarks?: string;
  serviceTypes?: any[];
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private apiUrl = '/api/department';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>(this.apiUrl);
  }

  getByCode(code: string): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/${code}`);
  }

  create(department: Department): Observable<Department> {
    return this.http.post<Department>(this.apiUrl, department);
  }

  update(code: string, department: Department): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/${code}`, department);
  }

  delete(code: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${code}`);
  }
} 