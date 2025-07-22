import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Mapping {
  customerCode: string | null;
  vendorCode: string | null;
  employeeCode: string | null;
  customerQuote: string | null;
  invoiceNo: string | null;
  taxNo: string | null;
  jobcardNo: string | null;
  branchNo: string | null;
  departmentNo: string | null;
  vesselCode: string | null;
}

@Injectable({ providedIn: 'root' })
export class MappingService {
  private apiUrl = `${environment.apiUrl}/api/mapping`;

  constructor(private http: HttpClient) {}

  getMapping(): Observable<Mapping> {
    return this.http.get<Mapping>(this.apiUrl);
  }

  saveMapping(mapping: Mapping): Observable<any> {
    return this.http.post(this.apiUrl, mapping);
  }
} 