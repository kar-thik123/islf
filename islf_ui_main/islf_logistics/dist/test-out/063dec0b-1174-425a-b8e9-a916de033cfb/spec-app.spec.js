import {
  ActivatedRoute,
  CommonModule,
  Component,
  Injectable,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
  TestBed,
  Title,
  ToastModule,
  __decorate,
  filter,
  init_common,
  init_core,
  init_operators,
  init_platform_browser,
  init_primeng_toast,
  init_router,
  init_testing,
  init_tslib_es6,
  map,
  mergeMap,
  provideZoneChangeDetection
} from "./chunk-YQBA5TKC.js";
import {
  __async,
  __commonJS,
  __esm
} from "./chunk-TTULUY32.js";

// angular:jit:template:src\app\app.html
var app_default;
var init_app = __esm({
  "angular:jit:template:src\\app\\app.html"() {
    app_default = '<p-toast></p-toast>\r\n\r\n<div *ngIf="loading" class="loader-overlay">\r\n  <div class="loader-spinner">\r\n    <img src="assets/layout/images/logo.jpg" alt="Logo" class="loader-logo" />\r\n    <div class="loader-circle"></div>\r\n  </div>\r\n</div>\r\n\r\n<router-outlet></router-outlet>\r\n';
  }
});

// angular:jit:style:src\app\app.scss
var app_default2;
var init_app2 = __esm({
  "angular:jit:style:src\\app\\app.scss"() {
    app_default2 = "/* src/app/app.scss */\n.loader-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100vw;\n  height: 100vh;\n  background: rgba(255, 255, 255, 0.85);\n  z-index: 9999;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.loader-spinner {\n  position: relative;\n  width: 120px;\n  height: 120px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.loader-logo {\n  width: 64px;\n  height: 64px;\n  border-radius: 50%;\n  z-index: 2;\n  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);\n}\n.loader-circle {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  width: 100px;\n  height: 100px;\n  border: 6px solid #1976d2;\n  border-top: 6px solid transparent;\n  border-radius: 50%;\n  transform: translate(-50%, -50%);\n  animation: spin 1s linear infinite;\n  z-index: 1;\n}\n@keyframes spin {\n  0% {\n    transform: translate(-50%, -50%) rotate(0deg);\n  }\n  100% {\n    transform: translate(-50%, -50%) rotate(360deg);\n  }\n}\n/*# sourceMappingURL=app.css.map */\n";
  }
});

// src/app/services/title.service.ts
var TitleService;
var init_title_service = __esm({
  "src/app/services/title.service.ts"() {
    "use strict";
    init_tslib_es6();
    init_core();
    init_platform_browser();
    init_router();
    init_operators();
    TitleService = class TitleService2 {
      title;
      router;
      activatedRoute;
      constructor(title, router, activatedRoute) {
        this.title = title;
        this.router = router;
        this.activatedRoute = activatedRoute;
      }
      init(defaultTitle = "ISLF") {
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd), map(() => {
          let route = this.activatedRoute.firstChild;
          let child = route;
          while (child) {
            if (child.firstChild) {
              child = child.firstChild;
              route = child;
            } else {
              child = null;
            }
          }
          return route;
        }), mergeMap((route) => route?.data ?? [])).subscribe((data) => {
          this.title.setTitle(data["title"] || defaultTitle);
        });
      }
      static ctorParameters = () => [
        { type: Title },
        { type: Router },
        { type: ActivatedRoute }
      ];
    };
    TitleService = __decorate([
      Injectable({ providedIn: "root" })
    ], TitleService);
  }
});

// src/app/app.ts
var App;
var init_app3 = __esm({
  "src/app/app.ts"() {
    "use strict";
    init_tslib_es6();
    init_app();
    init_app2();
    init_core();
    init_router();
    init_title_service();
    init_primeng_toast();
    init_common();
    App = class App2 {
      titleService;
      router;
      title = "ISLF";
      loading = false;
      lockTimeout = null;
      LOCK_DELAY_MS = 36e5;
      // 1 hour
      constructor(titleService, router) {
        this.titleService = titleService;
        this.router = router;
        this.titleService.init("ISLF");
        this.router.events.subscribe((event) => {
          if (event instanceof NavigationStart) {
            this.loading = true;
          } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
            this.loading = false;
          }
        });
        document.addEventListener("visibilitychange", this.handleVisibilityChange.bind(this));
        window.addEventListener("blur", this.handleBlur.bind(this));
        window.addEventListener("focus", this.handleFocus.bind(this));
      }
      handleVisibilityChange() {
        if (document.hidden) {
          this.startLockTimer();
        } else {
          this.clearLockTimer();
        }
      }
      handleBlur() {
        this.startLockTimer();
      }
      handleFocus() {
        this.clearLockTimer();
      }
      startLockTimer() {
        if (this.lockTimeout)
          return;
        this.lockTimeout = setTimeout(() => {
          this.router.navigate(["/auth/lockscreen"]);
          this.lockTimeout = null;
        }, this.LOCK_DELAY_MS);
      }
      clearLockTimer() {
        if (this.lockTimeout) {
          clearTimeout(this.lockTimeout);
          this.lockTimeout = null;
        }
      }
      static ctorParameters = () => [
        { type: TitleService },
        { type: Router }
      ];
    };
    App = __decorate([
      Component({
        selector: "app-root",
        imports: [RouterOutlet, ToastModule, CommonModule],
        template: app_default,
        styles: [app_default2]
      })
    ], App);
  }
});

// src/app/app.spec.ts
var require_app_spec = __commonJS({
  "src/app/app.spec.ts"(exports) {
    init_core();
    init_testing();
    init_app3();
    describe("App", () => {
      beforeEach(() => __async(null, null, function* () {
        yield TestBed.configureTestingModule({
          imports: [App],
          providers: [provideZoneChangeDetection()]
        }).compileComponents();
      }));
      it("should create the app", () => {
        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
      });
      it("should render title", () => {
        const fixture = TestBed.createComponent(App);
        fixture.detectChanges();
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector("h1")?.textContent).toContain("Hello, islf_logistics");
      });
    });
  }
});
export default require_app_spec();
//# sourceMappingURL=spec-app.spec.js.map
