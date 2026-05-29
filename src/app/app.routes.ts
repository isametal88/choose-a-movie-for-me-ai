import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/filters/filters.component').then((m) => m.FiltersComponent),
  },
  {
    path: 'pick',
    loadComponent: () => import('./features/pick/pick.component').then((m) => m.PickComponent),
  },
  {
    path: 'detail/:mediaType/:id',
    loadComponent: () =>
      import('./features/detail/detail.component').then((m) => m.DetailComponent),
  },
];
