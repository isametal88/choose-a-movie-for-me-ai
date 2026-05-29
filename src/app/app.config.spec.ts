import { appConfig } from './app.config';

describe('appConfig', () => {
  it('defines providers', () => {
    expect(appConfig).toBeDefined();
    expect(Array.isArray(appConfig.providers)).toBe(true);
    expect(appConfig.providers!.length).toBeGreaterThan(0);
  });
});
