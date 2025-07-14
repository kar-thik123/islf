import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Department } from './department.service';

export interface Branch {
  code: string;
  company_code: string;
  name: string;
  description?: string;
  address?: string;
  gst?: string;
  incharge_name?: string;
  incharge_from?: string;
  status?: string;
  start_date?: string;
  close_date?: string;
  remarks?: string;
  departments?: Department[];
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class BranchService {
  private apiUrl = '/api/branch';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Branch[]> {
    return this.http.get<Branch[]>(this.apiUrl);
  }

  getByCode(code: string): Observable<Branch> {
    return this.http.get<Branch>(`${this.apiUrl}/${code}`);
  }

  create(branch: Branch): Observable<Branch> {
    return this.http.post<Branch>(this.apiUrl, branch);
  }

  update(code: string, branch: Branch): Observable<Branch> {
    return this.http.put<Branch>(`${this.apiUrl}/${code}`, branch);
  }

  delete(code: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${code}`);
  }
} 