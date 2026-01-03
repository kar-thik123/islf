import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private requestCount = 0;
    private loadingSubject = new BehaviorSubject<boolean>(false);

    // Public observable for components that want to react to loading state
    public isLoading$: Observable<boolean> = this.loadingSubject.asObservable();

    constructor(private spinner: NgxSpinnerService) { }

    /**
     * Increment request counter and show spinner if it's the first request
     */
    show(): void {
        this.requestCount++;
        if (this.requestCount === 1) {
            this.loadingSubject.next(true);
            this.spinner.show();
            console.log('🔄 Global Loader: Active (Request started)');
        }
    }

    /**
     * Decrement request counter and hide spinner if all requests completed
     */
    hide(): void {
        if (this.requestCount > 0) {
            this.requestCount--;
        }

        if (this.requestCount === 0) {
            this.loadingSubject.next(false);
            this.spinner.hide();
            console.log('✅ Global Loader: Hidden (All requests finalized)');
        }
    }

    /**
     * Reset the counter in case of catastrophic errors or route changes
     */
    reset(): void {
        this.requestCount = 0;
        this.loadingSubject.next(false);
        this.spinner.hide();
    }
}
