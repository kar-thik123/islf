import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';

export interface JobCardRecord {
  id?: number;
  job_card_no?: string;
  job_date: string;
  enquiry_type?: string;
  company_name?: string;
  sales_person?: string;
  department?: string;
  service_type?: string;
  from_location_type?: string;
  from_location?: string;
  to_location_type?: string;
  to_location?: string;
  job_month?: string;
  general_remarks?: string;
  booking_id?: number;
  booking_no?: string;
  linked_bookings?: any[];
  customer_remarks?: string;
  vendor_remarks?: string;
  job_remarks?: string;
  line_items?: any[];
  cargo?: any[];
  schedules?: any[];
  breakup?: any[];
  status?: string;
  is_active?: boolean;
  company_code?: string;
  branch_code?: string;
  department_code?: string;
  service_type_code?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

@Injectable({ providedIn: 'root' })
export class JobCardService {
  private baseUrl = `${environment.apiUrl}/api/job_card`;

  constructor(
    private http: HttpClient,
    private contextPayload: ContextPayloadService,
    private contextService: ContextService
  ) { }

  getAll(page: number = 1, limit: number = 10, search: string = '', status: string = ''): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<any>(`${this.baseUrl}`, { params });
  }

  getByNo(jobCardNo: string): Observable<JobCardRecord> {
    const headers = new HttpHeaders({ 'X-Show-Loading': 'true' });
    return this.http.get<JobCardRecord>(`${this.baseUrl}/${jobCardNo}`, { headers });
  }

  create(record: JobCardRecord): Observable<any> {
    const payload = this.contextPayload.withContext(
      record,
      this.contextService.getContext()
    );
    return this.http.post<any>(`${this.baseUrl}`, payload);
  }

  update(id: number, record: JobCardRecord): Observable<any> {
    const payload = this.contextPayload.withContext(
      record,
      this.contextService.getContext()
    );
    return this.http.put<any>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/status`, { status });
  }

  getAllocationsByBooking(bookingId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/booking/${bookingId}/allocations`);
  }
}
