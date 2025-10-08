import 'zone.js'; // for global change detection
import { bootstrapApplication } from '@angular/platform-browser'; //for boot strapping the application
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
