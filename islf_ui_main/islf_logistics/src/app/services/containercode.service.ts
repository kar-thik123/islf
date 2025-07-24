import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ContainerCodeService {
  private apiUrl = `${environment.apiUrl}/api/container_code`;

  constructor(private http: HttpClient) {}

  getContainers(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  createContainer(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateContainer(code: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${code}`, data);
  }

  deleteContainer(code: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${code}`);
  }
} 