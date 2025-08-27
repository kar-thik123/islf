import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface Company {
  code: string;
  name: string;
  name2?: string;
  gst?: string;
  phone?: string;
  landline?: string;
  email?: string;
  website?: string;
  pan_number?: string;
  register_number?: string;
  register_address?: string;
  head_office_address?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private apiUrl = `${environment.apiUrl}/api/company`;

  constructor(
    private http: HttpClient,
 
  ) {}

  getAll(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl);
  }

  getByCode(code: string): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${code}`);
  }

  create(company: Company): Observable<Company> {
    return this.http.post<Company>(this.apiUrl, company);  // Remove contextPayload.withContext
  }

  update(code: string, company: Company): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/${code}`, company);  // Remove contextPayload.withContext
  }

  delete(code: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${code}`);
  }
}