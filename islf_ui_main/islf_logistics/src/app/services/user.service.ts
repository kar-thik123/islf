import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/user';

  constructor(
    private http: HttpClient, 
    private contextPayload: ContextPayloadService, 
    private contextService: ContextService,
    private configService: ConfigService
  ) {}

  createUser(user: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, this.contextPayload.withContext(user, this.contextService.getContext()));
  }

  getUsers(): Observable<any> {
    // Get filter configuration
    const config = this.configService.getConfig();
    const filter = config?.validation?.userListFilter || '';
    const context = this.contextService.getContext();
    
    let params = new HttpParams();
    
    // Add context parameters based on filter configuration
    if (filter) {
      if (filter.includes('C') && context.companyCode) {
        params = params.set('companyCode', context.companyCode);
      }
      if (filter.includes('B') && context.branchCode) {
        params = params.set('branchCode', context.branchCode);
      }
      if (filter.includes('D') && context.departmentCode) {
        params = params.set('departmentCode', context.departmentCode);
      }
    }
    
    return this.http.get<any>(this.apiUrl, { params });
  }

  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: string, user: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, this.contextPayload.withContext(user, this.contextService.getContext()));
  }

  getUserByUsername(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/by-username/${username}`);
  }
}