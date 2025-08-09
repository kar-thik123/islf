import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';

@Injectable({ providedIn: 'root' })
export class CurrencyCodeService {
  private apiUrl = `${environment.apiUrl}/api/currency_code`;

  constructor(private http: HttpClient, private contextPayload: ContextPayloadService, private contextService: ContextService) {}

  getCurrencies(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  createCurrency(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  updateCurrency(code: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${code}`, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  deleteCurrency(code: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${code}`);
  }
}