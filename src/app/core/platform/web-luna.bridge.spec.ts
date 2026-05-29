import { TestBed } from '@angular/core/testing';
import { WebLunaBridge } from './web-luna.bridge';

describe('WebLunaBridge', () => {
  let bridge: WebLunaBridge;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [WebLunaBridge] });
    bridge = TestBed.inject(WebLunaBridge);
  });

  it('creates', () => expect(bridge).toBeTruthy());
  it('isAvailable() returns false (no Luna on web)', () =>
    expect(bridge.isAvailable()).toBe(false));
  it('launchApp() resolves without throwing', async () => {
    await expect(bridge.launchApp({ appId: 'netflix' })).resolves.toBeUndefined();
  });
  it('launchApp() resolves for any appId', async () => {
    await expect(
      bridge.launchApp({ appId: 'prime', params: { query: 'Inception' } }),
    ).resolves.toBeUndefined();
  });
});
