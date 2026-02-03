import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { MasterLocationService } from './master-location.service';
import { VendorService } from './vendor.service';
import { EnquiryService } from './enquiry.service';
import { MasterTypeService } from './mastertype.service';
import { MasterItemService } from './master-item.service';
import { ServiceTypeService } from './servicetype.service';
import { MasterAirlineService } from './master-airline.service';
import { MasterVesselService } from './master-vessel.service';
import { ContextService } from './context.service';
import { BasisService } from './basis.service';
import { ServiceAreaService } from './service-area.service';
import { SourceSalesService } from './source-sales.service';
import { CurrencyCodeService } from './currencycode.service';
import { ContainerCodeService } from './containercode.service';
import { MasterUOMService } from './master-uom.service';
import { MasterCodeService } from './mastercode.service';
import { CustomerService } from './customer.service';

@Injectable({
    providedIn: 'root'
})
export class MasterCacheService {
    private cache = new Map<string, Observable<any>>();
    private lastContextStr = '';

    constructor(
        private locationService: MasterLocationService,
        private vendorService: VendorService,
        private enquiryService: EnquiryService,
        private masterTypeService: MasterTypeService,
        private serviceTypeService: ServiceTypeService,
        private airlineService: MasterAirlineService,
        private vesselService: MasterVesselService,
        private contextService: ContextService,
        private basisService: BasisService,
        private serviceAreaService: ServiceAreaService,
        private sourceSalesService: SourceSalesService,
        private currencyCodeService: CurrencyCodeService,
        private containerService: ContainerCodeService,
        private itemService: MasterItemService,
        private uomService: MasterUOMService,
        private masterCodeService: MasterCodeService,
        private customerService: CustomerService
    ) { }

    private getContextKey(): string {
        const ctx = this.contextService.getContext();
        return JSON.stringify(ctx);
    }

    private checkContextRefresh() {
        const currentContext = this.getContextKey();
        if (this.lastContextStr !== currentContext) {
            this.clearCache();
            this.lastContextStr = currentContext;
        }
    }

    public clearCache() {
        this.cache.clear();
        console.log('🔄 Master Cache Cleared');
    }

    private getCachedObservable(key: string, fetchFn: () => Observable<any>): Observable<any> {
        this.checkContextRefresh();
        if (!this.cache.has(key)) {
            console.log(`📡 Fetching and Caching Master Data: ${key}`);
            const obs = fetchFn().pipe(
                shareReplay(1)
            );
            this.cache.set(key, obs);
        } else {
            console.log(`⚡ Cache Hit: ${key}`);
        }
        return this.cache.get(key)!;
    }

    // --- Public Cache Accessors ---

    getLocations(): Observable<any[]> {
        return this.getCachedObservable('locations', () => this.locationService.getAll());
    }

    getVendors(): Observable<any[]> {
        return this.getCachedObservable('vendors', () => this.vendorService.getAll());
    }

    getServiceTypes(): Observable<any[]> {
        return this.getCachedObservable('serviceTypes', () => this.serviceTypeService.getAll());
    }

    getDepartments(): Observable<any[]> {
        const ctx = this.contextService.getContext();
        return this.getCachedObservable(`departments_${ctx.companyCode}`, () =>
            this.enquiryService.getDepartmentsDropdown(ctx.companyCode)
        );
    }

    getMasterTypes(type: string): Observable<any[]> {
        return this.getCachedObservable(`masterTypes_${type}`, () => this.masterTypeService.getAllByType(type));
    }

    getAllMasterTypes(): Observable<any[]> {
        return this.getCachedObservable('allMasterTypes', () => this.masterTypeService.getAll());
    }

    getAirlines(): Observable<any[]> {
        return this.getCachedObservable('airlines', () => this.airlineService.getAll());
    }

    getVessels(): Observable<any[]> {
        return this.getCachedObservable('vessels', () => this.vesselService.getAll());
    }

    getBasis(): Observable<any[]> {
        return this.getCachedObservable('basis', () => this.basisService.getAll());
    }

    getServiceAreas(): Observable<any[]> {
        return this.getCachedObservable('serviceAreas', () => this.serviceAreaService.getServiceAreas());
    }

    getSourceSales(): Observable<any[]> {
        return this.getCachedObservable('sourceSales', () => this.sourceSalesService.getSourceSales());
    }

    getCurrencies(): Observable<any[]> {
        return this.getCachedObservable('currencies', () => this.currencyCodeService.getCurrencies());
    }

    getContainers(): Observable<any[]> {
        return this.getCachedObservable('containers', () => this.containerService.getContainers());
    }

    getItems(): Observable<any[]> {
        return this.getCachedObservable('items', () => this.itemService.getAll());
    }

    getMasterItems(): Observable<any[]> {
        return this.getItems();
    }

    getUOMs(): Observable<any[]> {
        return this.getCachedObservable('uoms', () => this.uomService.getAll());
    }

    getCodes(): Observable<any[]> {
        return this.getCachedObservable('codes', () => this.masterCodeService.getMasters());
    }

    getCustomers(): Observable<any[]> {
        return this.getCachedObservable('customers', () => this.customerService.getAll());
    }
}
