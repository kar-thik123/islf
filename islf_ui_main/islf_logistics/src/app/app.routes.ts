import { Routes } from '@angular/router';
import authRoutes from './pages/auth/auth.routes';
import { NumberSeriesComponent } from './pages/setup/numberseries';
import { NumberSeriesRelationComponent } from './pages/setup/numberseriesrelation';
import { AppLayout } from './layout/components/app.layout';

import logsRoutes from './pages/logs/logs.routes';
import setupRoutes from './pages/setup/setup.routes';

export const routes: Routes = [
  // Auth routes (no layout)
  {
    path: 'auth',
    children: [...authRoutes],
  },

  // Layout-wrapped routes
  {
    path: '',
    component: AppLayout,
    children: [
      { path: 'logs', children:[...logsRoutes]},
      { path: 'setup', children:[...setupRoutes]},
      
      // Add more layout-wrapped routes here
    ]
  },

  // Fallback
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
