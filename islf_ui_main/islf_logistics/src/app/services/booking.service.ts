import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';

export interface BookingGeneral {
  booking_no?: string;
  booking_type: 'from_enquiry' | 'manual';
  enquiry_type?: string;
  customer_id?: number;
  customer_name?: string;
  company_name?: string;
  department?: string;
  service_type?: string;
  from_location?: string;
  to_location?: string;
  effective_date_from?: string;
  effective_date_to?: string;
  status?: string;
  remarks?: string;
  source_sales_person?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BookingRecord extends BookingGeneral {
  id?: number;
  vendor_details?: any;
  line_items?: any[];
  charges?: any[];
  cargo?: any[];
  carriage_map?: any[];
  schedules?: any;
  booking_breakup?: any[];
  selected_enquiries?: Array<{ id: number; code: string }>;
  sub_breakup_vendor_type?: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private baseUrl = `${environment.apiUrl}/api/booking`;

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

  searchEnquiries(criteria: any): Observable<any[]> {
    const payload = this.contextPayload.withContext(criteria, this.contextService.getContext());
    return this.http.post<any[]>(`${this.baseUrl}/search-enquiries`, payload);
  }

  createFromEnquiries(criteria: any, selectedEnquiries: Array<{ id: number; code: string }>, overrides?: any): Observable<BookingRecord> {
    const payload = this.contextPayload.withContext(
      { booking_type: 'from_enquiry', criteria, selected_enquiries: selectedEnquiries, freeze: true, ...overrides },
      this.contextService.getContext()
    );
    return this.http.post<BookingRecord>(`${this.baseUrl}`, payload);
  }

  createManualBooking(record: BookingRecord): Observable<BookingRecord> {
    const body: BookingRecord = { ...record };
    if (!body.booking_type) body.booking_type = 'manual';
    const payload = this.contextPayload.withContext(
      body,
      this.contextService.getContext()
    );
    return this.http.post<BookingRecord>(`${this.baseUrl}`, payload);
  }

  updateBooking(id: number, record: BookingRecord): Observable<BookingRecord> {
    const payload = this.contextPayload.withContext(
      record,
      this.contextService.getContext()
    );
    return this.http.put<BookingRecord>(`${this.baseUrl}/${id}`, payload);
  }

  getByNo(bookingNo: string): Observable<BookingRecord> {
    return this.http.get<BookingRecord>(`${this.baseUrl}/${bookingNo}`);
  }
}
