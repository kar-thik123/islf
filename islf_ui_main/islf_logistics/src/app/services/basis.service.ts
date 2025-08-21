import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BaseMasterService } from './base-master.service';
import { ConfigService } from './config.service';
import { ContextService } from './context.service';
import { ContextPayloadService } from './context-payload.service';

@Injectable({ providedIn: 'root' })
export class BasisService extends BaseMasterService<any> {
  protected apiUrl = `${environment.apiUrl}/api/basis`;

  constructor(
    protected override http: HttpClient,
    protected override contextPayload: ContextPayloadService,
    protected override contextService: ContextService,
    private configService: ConfigService
  ) {
    super(http, contextPayload, contextService);
  }

  // Override getAll to implement conditional context filtering
  override getAll(): Observable<any[]> {
    const context = this.contextService.getContext();
    const config = this.configService.getConfig();
    const basisFilter = config?.validation?.basisFilter || '';
    
    let params: any = {};
    
    // Only send context parameters based on the validation/filter settings
    if (basisFilter.includes('C') && context.companyCode) {
      params.companyCode = context.companyCode;
    }
    if (basisFilter.includes('B') && context.branchCode) {
      params.branchCode = context.branchCode;
    }
    if (basisFilter.includes('D') && context.departmentCode) {
      params.departmentCode = context.departmentCode;
    }
    
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  // Backward compatibility methods
  getBasis() {
    return this.getAll();
  }

  createBasis(data: any) {
    return this.create(data);
  }

  updateBasis(id: string, data: any) {
    return this.update(id, data);
  }

  deleteBasis(id: string) {
    return this.delete(id);
  }
}