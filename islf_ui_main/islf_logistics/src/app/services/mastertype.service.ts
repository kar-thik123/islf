import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';

@Injectable({ providedIn: 'root' })
export class MasterTypeService {
  private apiUrl = `${environment.apiUrl}/api/master_type`;

  constructor(private http: HttpClient, private contextPayload: ContextPayloadService, private contextService: ContextService) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  create(type: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, this.contextPayload.withContext(type, this.contextService.getContext()));
  }

  update(id: number, type: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, this.contextPayload.withContext(type, this.contextService.getContext()));
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}