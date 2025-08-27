import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AccountDetail {
  id?: number;
  entity_type: string;
  entity_code: string;
  beneficiary?: string;
  bank_address?: string;
  bank_name?: string;
  account_number?: string;
  bank_branch_code?: string;
  rtgs_neft_code?: string;
  account_type?: string;
  swift_code?: string;
  is_primary?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any; // Add this index signature
}

@Injectable({ providedIn: 'root' })
export class AccountDetailsService {
  private apiUrl =`${environment.apiUrl}/api/account_details`;

  constructor(private http: HttpClient) {}

  getByEntity(entityType: string, entityCode: string): Observable<AccountDetail[]> {
    return this.http.get<AccountDetail[]>(`${this.apiUrl}/${entityType}/${entityCode}`);
  }

  create(accountDetail: AccountDetail): Observable<AccountDetail> {
    return this.http.post<AccountDetail>(this.apiUrl, accountDetail);
  }

  update(id: number, accountDetail: AccountDetail): Observable<AccountDetail> {
    return this.http.put<AccountDetail>(`${this.apiUrl}/${id}`, accountDetail);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}