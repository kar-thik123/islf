import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MasterTypeService {
  private apiUrl = `${environment.apiUrl}/api/master_type`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  create(type: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, type);
  }

  update(id: number, type: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, type);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}