import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';
import { BasisService } from './basis.service';
import { ConfigService } from './config.service';

export interface EnquiryLineItem {
  id?: number;
  s_no: number;
  quantity?: number;
  type: string;
  service_area: string;
  basis: string;
  remarks: string;
  status: string;
  line_from_location_type?: string;
  line_from_location?: string;
  line_to_location_type?: string;
  line_to_location?: string;
  enquiry_id?: string | number;
  enquiry_summary?: EnquirySummary[];
  serviceAreaOptions?: any[];
  is_selected?: boolean;
  sourcing_vendors?: any[];
  tariff_vendors?: any[];
}

export interface EnquiryVendorCard {
  id?: number;
  vendor_name: string;
  vendor_type: string;
  is_active: boolean;
  charges: number;
  source_type: string;
  source_id: number;
  quantity?: number;
  enquiry_line_item_id?: number;
  // Additional sourcing details
  mode?: string;
  from_location?: string;
  to_location?: string;
  basis?: string;
  vendor_code?: string;
  effective_date?: string;
  expiry_date?: string;
  currency?: string;
  remarks?: string;
}

// Enquiry summary master interface
export interface EnquirySummary {
  master_type: string;
  selected_no: number;
  vendor_name: string;
  charge: number;
  sourced_no: number;
  sourced_time: string;
  sourced_list: SourcingOption[] | TariffOption[];
  selected_source_items?: any[];
  selected_tariff_items?: any[];
  summary_type: string;
  items: any[];
  finalizedItems?: any[];
}

export interface EnquiryPreviewResponse {
  enquiry: Enquiry;
  line_items: EnquiryLineItem[];
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
  cargo_type: string;
  from_location: string;
  to_location: string;
  location_type_from: string;
  location_type_to: string;
  effective_date_from: string;
  effective_date_to: string;
  department: string;
  service_type: string;
  basis: string;
  status: string;
  enquiry_type?: string;
  remarks: string;
  line_items: EnquiryLineItem[];
  vendor_cards?: EnquiryVendorCard[];
  isNew?: boolean;
  is_new_customer?: boolean;
  source_sales_code?: string;
  service_area?: string;
  source_updates?: any[];
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
  currency: string;
  enquiry_line_item_id?: number;
  basis: string;
  charges: any[];
  buy_rate: number;
  sell_rate: number;
  start_date: string;
  end_date: string;
  effective_date: string;
  sub_charges?: any[];
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
  sub_charges?: any[];
  effective_date: string;
  expiry_date: string;
  enquiry_line_item_id?: number;
  mandatory: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class EnquiryService {
  private baseUrl = `${environment.apiUrl}/api/enquiry`;

  constructor(
    private http: HttpClient,
    private contextPayload: ContextPayloadService,
    private contextService: ContextService,
    private basisService: BasisService,
    private configService: ConfigService
  ) { }

  /** Get all enquiries with pagination and filtering */
  getAll(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    status: string = ''
  ): Observable<any> {
    const context = this.contextService.getContext();
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    if (context.companyCode)
      params = params.set('companyCode', context.companyCode);
    if (context.branchCode)
      params = params.set('branchCode', context.branchCode);
    if (context.departmentCode)
      params = params.set('departmentCode', context.departmentCode);

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

  getEnquiryPreviewByCode(code: string): Observable<EnquiryPreviewResponse> {
    return this.http.get<EnquiryPreviewResponse>(`${this.baseUrl}/${code}/preview`);
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

  /** Update Line Item  Selection**/
  updateEnquiryLineItemSelection(
    code: string,
    lineItemList: Partial<{ [key: string]: EnquiryLineItem[] }>
  ) {
    console.log('Enquiry Line Item Selection list,', lineItemList);
    return this.http.put<EnquiryLineItem[]>(
      `${this.baseUrl}/${code}/line-items/selection`,
      lineItemList
    );
  }

  // updated Vendor Card SELECTION
  updateVendorCardSelection(
    code: string,
    lineItemId: string | number,
    sourcingType: string,
    vendorCardList: EnquiryVendorCard[]
  ) {
    const payload = { vendorCardList, sourcingType };
    console.log('vendor card line items list payload,', payload);

    return this.http.put<EnquiryVendorCard[]>(
      `${this.baseUrl}/${code}/line-item/${lineItemId}/selection`,
      payload
    );
  }

  /** Create enquiry */
  create(enquiry: Partial<Enquiry>): Observable<Enquiry> {
    const payload = this.contextPayload.withContext(
      enquiry,
      this.contextService.getContext()
    );
    console.log(
      'Debug: enquiry value from create enquiry service method',
      enquiry,
      'payload value',
      payload
    );
    return this.http.post<Enquiry>(`${this.baseUrl}`, payload);
  }

  /** Update enquiry */
  update(code: string, enquiry: Partial<Enquiry>): Observable<Enquiry> {
    const payload = this.contextPayload.withContext(
      enquiry,
      this.contextService.getContext()
    );
    console.log('Update enquiry payload,', payload);
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
    return this.http.get<CustomerDropdown[]>(
      `${this.baseUrl}/customers/dropdown`,
      { params }
    );
  }

  getCustomerContacts(customerId: number): Observable<CustomerContact[]> {
    const payload = this.contextPayload.withContext(
      {},
      this.contextService.getContext()
    );
    return this.http.get<CustomerContact[]>(
      `${this.baseUrl}/customers/${customerId}/contacts`
    );
  }

  /** Get locations dropdown */
  getLocationsDropdown(search: string = ''): Observable<any[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<any[]>(`${this.baseUrl}/locations/dropdown`, {
      params,
    });
  }

  getDepartmentsDropdown(
    companyCode?: string,
    search?: string
  ): Observable<any[]> {
    const params: any = {};
    if (companyCode) params.company_code = companyCode;
    if (search) params.search = search;
    return this.http.get<any[]>(`${this.baseUrl}/departments/dropdown`, {
      params,
    });
  }

  getBasisDropdown(): Observable<any[]> {
    return this.basisService.getAll();
  }

  /** Get sourcing options */
  getSourcingOptions(
    enquiryCode: string,
    criteria: any
  ): Observable<SourcingOption[]> {
    console.log('get Sourcing Options:', enquiryCode, 'Criteria', criteria);
    return this.http.post<SourcingOption[]>(
      `${this.baseUrl}/${enquiryCode}/sourcing`,
      criteria
    );
  }

  /** Get tariff options */
  getTariffOptions(
    enquiryCode: string,
    criteria: any
  ): Observable<TariffOption[]> {
    console.log(
      'get Tariff options payload for code:',
      enquiryCode,
      'is:',
      criteria
    );
    return this.http.post<TariffOption[]>(
      `${this.baseUrl}/${enquiryCode}/tariff`,
      criteria
    );
  }

  /** Get tariff rates */
  getTariffRates(params: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tariff-rates`, { params });
  }

  /** Vendor card operations */
  addVendorCards(
    enquiryCode: string,
    vendorCard: any,
    vendorContext: {}
  ): Observable<any> {
    const lineItemId = (vendorContext as any)?.lineItemId;
    const masterType = (vendorContext as any)?.masterType || (vendorContext as any)?.sourcingType;

    const normalizeOne = (vc: any) => ({
      enquiry_line_item_id: vc.enquiry_line_item_id ?? lineItemId,
      master_type: masterType || vc.master_type || 'sourcing',
      department: vc.department,
      service_type: vc.service_type || vc.shipping_type,
      type: vc.type,
      service_area: vc.service_area,
      vendor_type: vc.vendor_type,
      vendor_name: vc.vendor_name || vc.vendor_code || vc.vendor || vc.code,
      basis: vc.basis,
      cargo: vc.cargo || vc.cargo_type,
      location_type_from: vc.location_type_from,
      from_location: vc.from_location,
      location_type_to: vc.location_type_to,
      to_location: vc.to_location,
      period_start_date: vc.period_start_date || vc.start_date,
      period_end_date: vc.period_end_date || vc.end_date,
      charges: Array.isArray(vc.charges)
        ? vc.charges
        : Array.isArray(vc.selected_subcharges)
          ? vc.selected_subcharges
          : []
    });

    const normalizedVendorCards = Array.isArray(vendorCard)
      ? vendorCard.map(normalizeOne)
      : [normalizeOne(vendorCard)];

    const payload = this.contextPayload.withContext(
      { vendorCards: normalizedVendorCards, masterType, lineItemId },
      this.contextService.getContext()
    );
    console.log('add Vendor Cards payload,', payload);
    return this.http.post(
      `${this.baseUrl}/${enquiryCode}/vendor-cards`,
      payload
    );
  }

  updateVendorCard(
    enquiryCode: string,
    cardId: number,
    vendorCard: Partial<EnquiryVendorCard>
  ): Observable<any> {
    const payload = this.contextPayload.withContext(
      vendorCard,
      this.contextService.getContext()
    );
    return this.http.put(
      `${this.baseUrl}/${enquiryCode}/vendor-cards/${cardId}/negotiate`,
      payload
    );
  }



  updateVendorSubCharges(
    enquiryCode: string,
    cardId: number,
    list: any[]
  ): Observable<any> {
    const payload = this.contextPayload.withContext(
      { list },
      this.contextService.getContext()
    );
    return this.http.put(
      `${this.baseUrl}/${enquiryCode}/vendor-cards/${cardId}/sub-charges`,
      payload
    );
  }

  getVendorSubCharges(enquiryCode: string, cardId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/${enquiryCode}/vendor-cards/${cardId}/sub-charges`
    );
  }

  deleteLineItemVendorData(
    enquiryCode: string,
    lineItemId: number,
    scope: 'all' | 'sourcing' | 'tariff' = 'all'
  ): Observable<{ deleted_cards: number; deleted_sub_charges: number }> {
    const params = new HttpParams().set('scope', scope);
    return this.http.delete<{ deleted_cards: number; deleted_sub_charges: number }>(
      `${this.baseUrl}/${enquiryCode}/line-item/${lineItemId}/vendor-cards`,
      { params }
    );
  }

  deleteVendorCard(enquiryCode: string, cardId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${enquiryCode}/vendor-cards/${cardId}`);
  }

  selectLineItemVendorCards(
    enquiryCode: string,
    lineItemId: number,
    vendorCardIds: number[],
    sourcingType: 'sourcing' | 'tariff'
  ): Observable<any> {
    const payload = this.contextPayload.withContext(
      { vendorCardList: vendorCardIds.map((id) => ({ id })), sourcingType },
      this.contextService.getContext()
    );
    return this.http.put(
      `${this.baseUrl}/${enquiryCode}/line-item/${lineItemId}/selection`,
      payload
    );
  }

  getTariffSubCharges(tariffId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl.replace('/enquiry', '')}/tariff/sub-charges/${tariffId}`);
  }

  /** Get all enquiries (alias for compatibility) */
  getAllEnquiryLineItem(enquiryCode: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${enquiryCode}/lineItem`);
  }

  /** Confirm enquiry */
  confirmEnquiry(enquiryCode: string): Observable<any> {
    const payload = this.contextPayload.withContext(
      {},
      this.contextService.getContext()
    );
    return this.http.post(`${this.baseUrl}/${enquiryCode}/confirm`, payload);
  }

  /** Mail template generation */
  generateMailTemplate(
    enquiryCode: string,
    templateType: string
  ): Observable<any> {
    const payload = this.contextPayload.withContext(
      { templateType },
      this.contextService.getContext()
    );
    return this.http.post(
      `${this.baseUrl}/${enquiryCode}/mail-template`,
      payload
    );
  }

  /** Client-side mail template generator */
  generateMailTemplateString(
    enquiry: Enquiry,
    activeVendorCard: EnquiryVendorCard
  ): string {
    const charges = activeVendorCard.charges;
    const chargesText = `Total Charges: ${charges}`;
    const lineItemsText = enquiry.line_items
      .map(
        (item) =>
          `${item.s_no}. Type: ${item.type}, Basis: ${item.basis}, From: ${item.line_from_location || ''} (${item.line_from_location_type || ''}) -> To: ${item.line_to_location || ''} (${item.line_to_location_type || ''})`
      )
      .join('\n');

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
      { label: 'Confirmed', value: 'Confirmed' },
    ];
  }

  getLineItemStatusOptions(): { label: string; value: string }[] {
    return [
      { label: 'Active', value: 'Active' },
      { label: 'Inactive', value: 'Inactive' },
      { label: 'Pending', value: 'Pending' },
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
    if (!enquiry.effective_date_from)
      errors.push('Effective date from is required');
    if (!enquiry.effective_date_to)
      errors.push('Effective date to is required');

    if (enquiry.effective_date_from && enquiry.effective_date_to) {
      if (
        new Date(enquiry.effective_date_from) >
        new Date(enquiry.effective_date_to)
      ) {
        errors.push(
          'Effective date from cannot be later than effective date to'
        );
      }
    }

    if (!enquiry.line_items || enquiry.line_items.length === 0) {
      errors.push('At least one line item is required');
    }

    enquiry.line_items.forEach((item, index) => {
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
      date: this.configService.formatDate(enquiry.date),
      effective_date_from: this.configService.formatDate(enquiry.effective_date_from),
      effective_date_to: this.configService.formatDate(enquiry.effective_date_to),
      customer_display: enquiry.company_name
        ? `${enquiry.customer_name} - ${enquiry.company_name}`
        : enquiry.customer_name,
    };
  }

  exportEnquiry(enquiry: Enquiry): any {
    return {
      enquiry_details: this.formatEnquiryForDisplay(enquiry),
      line_items: enquiry.line_items,
      vendor_cards: enquiry.vendor_cards || [],
      export_date: new Date().toISOString(),
    };
  }
}
