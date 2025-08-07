import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContextPayloadService } from './context-payload.service';

export interface Company {
  code: string;
  name: string;
  name2?: string;
  gst?: string;
  phone?: string;
  landline?: string;
  email?: string;
  website?: string;
  address1?: string;
  address2?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private apiUrl = '/api/company';

  constructor(private http: HttpClient, private contextPayload: ContextPayloadService) {}

  getAll(): Observable<Company[]> {
    return this.http.get<Company[]>(this.apiUrl);
  }

  getByCode(code: string): Observable<Company> {
    return this.http.get<Company>(`${this.apiUrl}/${code}`);
  }

  create(company: Company): Observable<Company> {
    return this.http.post<Company>(this.apiUrl, this.contextPayload.withContext(company));
  }

  update(code: string, company: Company): Observable<Company> {
    return this.http.put<Company>(`${this.apiUrl}/${code}`, this.contextPayload.withContext(company));
  }

  delete(code: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${code}`);
  }
} 