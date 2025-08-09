import { Injectable } from '@angular/core';
import { UserContext } from './context.service';

@Injectable({ providedIn: 'root' })
export class ContextPayloadService {
  constructor() {}

  withContext<T extends object>(payload: T, context: UserContext): T & {
    companyCode?: string;
    branchCode?: string;
    departmentCode?: string;
    serviceTypeCode?: string;
  } {
    return {
      ...payload,
      companyCode: context.companyCode,
      branchCode: context.branchCode,
      departmentCode: context.departmentCode,
      serviceTypeCode: context.serviceType || undefined
    };
  }
}
