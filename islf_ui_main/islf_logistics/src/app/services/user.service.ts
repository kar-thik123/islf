import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = '/api/user';

  constructor(private http: HttpClient , private contextPayload: ContextPayloadService, private contextService: ContextService) {}

  createUser(user: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, this.contextPayload.withContext(user, this.contextService.getContext()));
  }

  getUsers(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
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