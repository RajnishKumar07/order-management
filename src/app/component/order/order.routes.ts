import { Route } from '@angular/router';
import { pageDataResolver } from '../../core/resolvers/page-data.resolver';

export const orderRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./list/list.component'),
  },
  {
    path: 'create',
    loadComponent: () => import('./manages/manages.component'),
  },
  {
    path: ':id',
    loadComponent: () => import('./manages/manages.component'),
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./products/products.component'),
  },
];
