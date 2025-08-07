import { Injectable } from '@angular/core';
import { ContextService } from './context.service';

@Injectable({ providedIn: 'root' })
export class ContextPayloadService {
  constructor(private contextService: ContextService) {}

  withContext<T extends object>(payload: T): T & {
    companyCode?: string;
    branchCode?: string;
    departmentCode?: string;
  } {
    const ctx = this.contextService.getContext();
    return {
      ...payload,
      companyCode: ctx.companyCode,
      branchCode: ctx.branchCode,
      departmentCode: ctx.departmentCode
    };
  }
}
