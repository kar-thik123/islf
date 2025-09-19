import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';
import { BasisService } from './basis.service';

export interface EnquiryLineItem {
  id?: number;
  s_no: number;
  quantity: number;
  basis: string;
  remarks: string;
  status: string;
}

export interface EnquiryVendorCard {
  id?: number;
  vendor_name: string;
  vendor_type: string;
  is_active: boolean;
  charges: any[];
  source_type: string;
  source_id: number;
  negotiated_charges?: any[];
}

export interface Enquiry {
  id?: number;
  enquiry_no?: string;
  code?: string;
  date: string;
  customer_id?: number;
  customer_name: string;
  name?: string;
  email: string;
  mobile: string;
  landline: string;
  company_name: string;
  from_location: string;
  to_location: string;
  effective_date_from: string;
  effective_date_to: string;
  department: string;
  basis: string;
  status: string;
  remarks: string;
  line_items: EnquiryLineItem[];
  vendor_cards?: EnquiryVendorCard[];
  isNew?: boolean;
  is_new_customer?: boolean;
}

export interface CustomerContact {
  id?: number;
  name: string;
  department: string;
  email: string;
  mobile: string;
  landline: string;
  is_primary: boolean;
}

export interface CustomerDropdown {
  id?: number;
  name: string;
  company_name: string;
  email: string;
  mobile: string;
  landline: string;
  contact_name: string;
  contact_department: string;
  contact_count: number;
  display_name: string;
}

export interface SourcingOption {
  id: number;
  vendor_code: string;
  vendor_name: string;
  vendor_type: string;
  mode: string;
  from_location: string;
  to_location: string;
  basis: string;
  charges: any[];
  start_date: string;
  end_date: string;
  effective_date: string;
}

export interface TariffOption {
  id: number;
  vendor_code: string;
  vendor_name: string;
  vendor_type: string;
  mode: string;
  from_location: string;
  to_location: string;
  charges: any[];
  effective_date: string;
  expiry_date: string;
  mandatory: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EnquiryService {
  private baseUrl = `${environment.apiUrl}/api/enquiry`;

  constructor(
    private http: HttpClient,
    private contextPayload: ContextPayloadService,
    private contextService: ContextService,
    private basisService: BasisService
  ) {}

  /** Get all enquiries with pagination and filtering */
  getAll(page: number = 1, limit: number = 10, search: string = '', status: string = ''): Observable<any> {
    const context = this.contextService.getContext();
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    if (context.companyCode) params = params.set('companyCode', context.companyCode);
    if (context.branchCode) params = params.set('branchCode', context.branchCode);
    if (context.departmentCode) params = params.set('departmentCode', context.departmentCode);

    return this.http.get<any>(`${this.baseUrl}`, { params });
  }

  /** Get all enquiries (alias for compatibility) */
  getAllEnquiries(): Observable<Enquiry[]> {
    return this.http.get<Enquiry[]>(`${this.baseUrl}`);
  }

  /** Get enquiry by code (preferred) */
  getByCode(code: string): Observable<Enquiry> {
    return this.http.get<Enquiry>(`${this.baseUrl}/${code}`);
  }

  /** Get enquiry by ID (deprecated – use getByCode) */
  getById(id: number): Observable<Enquiry> {
    return this.http.get<Enquiry>(`${this.baseUrl}/${id}`);
  }

  /** Aliases for backwards compatibility */
  getEnquiryByCode(code: string): Observable<Enquiry> {
    return this.getByCode(code);
  }
  getEnquiryById(id: number): Observable<Enquiry> {
    return this.getById(id);
  }
  createEnquiry(enquiry: Partial<Enquiry>): Observable<Enquiry> {
    return this.create(enquiry);
  }
  updateEnquiry(code: string, enquiry: Partial<Enquiry>): Observable<Enquiry> {
    return this.update(code, enquiry);
  }

  /** Create enquiry */
  create(enquiry: Partial<Enquiry>): Observable<Enquiry> {
    const payload = this.contextPayload.withContext(enquiry, this.contextService.getContext());
    return this.http.post<Enquiry>(`${this.baseUrl}`, payload);
  }

  /** Update enquiry */
  update(code: string, enquiry: Partial<Enquiry>): Observable<Enquiry> {
    const payload = this.contextPayload.withContext(enquiry, this.contextService.getContext());
    return this.http.put<Enquiry>(`${this.baseUrl}/${code}`, payload);
  }

  /** Delete enquiry */
  delete(code: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${code}`);
  }

  /** Get customers for dropdown */
  getCustomersDropdown(search: string = ''): Observable<CustomerDropdown[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<CustomerDropdown[]>(`${this.baseUrl}/customers/dropdown`, { params });
  }

  getCustomerContacts(customerId: number): Observable<CustomerContact[]> {
    const payload = this.contextPayload.withContext({}, this.contextService.getContext());
    return this.http.get<CustomerContact[]>(`${this.baseUrl}/customers/${customerId}/contacts`);
  }

  /** Get locations dropdown */
  getLocationsDropdown(search: string = ''): Observable<any[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<any[]>(`${this.baseUrl}/locations/dropdown`, { params });
  }

  getDepartmentsDropdown(companyCode?: string, search?: string): Observable<any[]> {
    const params: any = {};
    if (companyCode) params.company_code = companyCode;
    if (search) params.search = search;
    return this.http.get<any[]>(`${this.baseUrl}/departments/dropdown`, { params });
  }

  getBasisDropdown(): Observable<any[]> {
    return this.basisService.getAll();
  }

  /** Get sourcing options */
  getSourcingOptions(enquiryCode: string, criteria: any): Observable<SourcingOption[]> {
    return this.http.post<SourcingOption[]>(`${this.baseUrl}/${enquiryCode}/sourcing`, criteria);
  }

  /** Get tariff options */
  getTariffOptions(enquiryCode: string, criteria: any): Observable<TariffOption[]> {
    return this.http.post<TariffOption[]>(`${this.baseUrl}/${enquiryCode}/tariff`, criteria);
  }

  /** Get tariff rates */
  getTariffRates(params: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tariff-rates`, { params });
  }

  /** Vendor card operations */
  addVendorCards(enquiryCode: string, vendorCards: EnquiryVendorCard[]): Observable<any> {
    const payload = this.contextPayload.withContext({ vendorCards }, this.contextService.getContext());
    return this.http.post(`${this.baseUrl}/${enquiryCode}/vendor-cards`, payload);
  }

  updateVendorCard(enquiryCode: string, cardId: number, vendorCard: Partial<EnquiryVendorCard>): Observable<any> {
    const payload = this.contextPayload.withContext(vendorCard, this.contextService.getContext());
    return this.http.put(`${this.baseUrl}/${enquiryCode}/vendor-cards/${cardId}/negotiate`, payload);
  }

  updateNegotiatedCharges(enquiryCode: string, cardId: number, negotiatedCharges: any[]): Observable<any> {
    const payload = this.contextPayload.withContext({ negotiatedCharges }, this.contextService.getContext());
    return this.http.put(`${this.baseUrl}/${enquiryCode}/vendor-cards/${cardId}/charges`, payload);
  }

  /** Confirm enquiry */
  confirmEnquiry(enquiryCode: string): Observable<any> {
    const payload = this.contextPayload.withContext({}, this.contextService.getContext());
    return this.http.post(`${this.baseUrl}/${enquiryCode}/confirm`, payload);
  }

  /** Mail template generation */
  generateMailTemplate(enquiryCode: string, templateType: string): Observable<any> {
    const payload = this.contextPayload.withContext({ templateType }, this.contextService.getContext());
    return this.http.post(`${this.baseUrl}/${enquiryCode}/mail-template`, payload);
  }

  /** Client-side mail template generator */
  generateMailTemplateString(enquiry: Enquiry, activeVendorCard: EnquiryVendorCard): string {
    const charges = activeVendorCard.negotiated_charges || activeVendorCard.charges;
    const chargesText = charges.map(charge => `${charge.charge_type}: ${charge.currency} ${charge.amount}`).join('\n');
    const lineItemsText = enquiry.line_items.map(item =>
      `${item.s_no}. Quantity: ${item.quantity}, Basis: ${item.basis}, Remarks: ${item.remarks}`
    ).join('\n');

    return `
Dear ${enquiry.customer_name},

Thank you for your enquiry. Please find below the quotation details:

ENQUIRY DETAILS:
Enquiry No: ${enquiry.enquiry_no}
Date: ${enquiry.date}
From: ${enquiry.from_location}
To: ${enquiry.to_location}
Department: ${enquiry.department}
Effective Period: ${enquiry.effective_date_from} to ${enquiry.effective_date_to}

LINE ITEMS:
${lineItemsText}

VENDOR DETAILS:
Vendor: ${activeVendorCard.vendor_name}
Type: ${activeVendorCard.vendor_type}

CHARGES:
${chargesText}

REMARKS:
${enquiry.remarks}

Please let us know if you have any questions or require any clarifications.

Best regards,
ISLF Logistics Team
    `.trim();
  }

  /** Status dropdowns */
  getStatusOptions(): { label: string; value: string }[] {
    return [
      { label: 'Open', value: 'Open' },
      { label: 'Pending', value: 'Pending' },
      { label: 'Closed', value: 'Closed' },
      { label: 'Confirmed', value: 'Confirmed' }
    ];
  }

  getLineItemStatusOptions(): { label: string; value: string }[] {
    return [
      { label: 'Active', value: 'Active' },
      { label: 'Inactive', value: 'Inactive' },
      { label: 'Pending', value: 'Pending' }
    ];
  }

  /** Validation */
  validateEnquiry(enquiry: Enquiry): string[] {
    const errors: string[] = [];

    if (!enquiry.date) errors.push('Date is required');
    if (!enquiry.customer_name) errors.push('Customer name is required');
    if (!enquiry.from_location) errors.push('From location is required');
    if (!enquiry.to_location) errors.push('To location is required');
    if (!enquiry.department) errors.push('Department is required');
    if (!enquiry.effective_date_from) errors.push('Effective date from is required');
    if (!enquiry.effective_date_to) errors.push('Effective date to is required');

    if (enquiry.effective_date_from && enquiry.effective_date_to) {
      if (new Date(enquiry.effective_date_from) > new Date(enquiry.effective_date_to)) {
        errors.push('Effective date from cannot be later than effective date to');
      }
    }

    if (!enquiry.line_items || enquiry.line_items.length === 0) {
      errors.push('At least one line item is required');
    }

    enquiry.line_items.forEach((item, index) => {
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Line item ${index + 1}: Quantity must be greater than 0`);
      }
      if (!item.basis) {
        errors.push(`Line item ${index + 1}: Basis is required`);
      }
    });

    return errors;
  }

  /** Display helpers */
  formatEnquiryForDisplay(enquiry: Enquiry): any {
    return {
      ...enquiry,
      date: new Date(enquiry.date).toLocaleDateString(),
      effective_date_from: enquiry.effective_date_from ? new Date(enquiry.effective_date_from).toLocaleDateString() : '',
      effective_date_to: enquiry.effective_date_to ? new Date(enquiry.effective_date_to).toLocaleDateString() : '',
      customer_display: enquiry.company_name ? `${enquiry.customer_name} - ${enquiry.company_name}` : enquiry.customer_name
    };
  }

  exportEnquiry(enquiry: Enquiry): any {
    return {
      enquiry_details: this.formatEnquiryForDisplay(enquiry),
      line_items: enquiry.line_items,
      vendor_cards: enquiry.vendor_cards || [],
      export_date: new Date().toISOString()
    };
  }
}