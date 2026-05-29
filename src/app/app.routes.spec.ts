import { routes } from './app.routes';

describe('routes', () => {
  it('has a default route', () => {
    const defaultRoute = routes.find((r) => r.path === '');
    expect(defaultRoute).toBeTruthy();
  });

  it('default route uses lazy-loaded FiltersComponent', () => {
    const defaultRoute = routes.find((r) => r.path === '');
    expect(defaultRoute?.loadComponent).toBeDefined();
  });
});
