import { TestBed } from '@angular/core/testing';
import { LunaBridge } from './platform.model';
import { LUNA_BRIDGE } from './platform.tokens';
import { WebProviderLauncherService } from './web-provider-launcher.service';

function makeLunaSpy(available = false): jest.Mocked<LunaBridge> {
  return {
    isAvailable: jest.fn().mockReturnValue(available),
    launchApp: jest.fn().mockResolvedValue(undefined),
  };
}

function setup(available = false): {
  service: WebProviderLauncherService;
  lunaSpy: jest.Mocked<LunaBridge>;
} {
  const lunaSpy = makeLunaSpy(available);
  TestBed.configureTestingModule({
    providers: [WebProviderLauncherService, { provide: LUNA_BRIDGE, useValue: lunaSpy }],
  });
  return { service: TestBed.inject(WebProviderLauncherService), lunaSpy };
}

describe('WebProviderLauncherService', () => {
  let openSpy: jest.SpyInstance;

  beforeEach(() => {
    openSpy = jest.spyOn(window, 'open').mockReturnValue(null);
  });

  afterEach(() => {
    openSpy.mockRestore();
  });

  it('creates', () => {
    const { service } = setup();
    expect(service).toBeTruthy();
  });

  it('opens URL in new tab when Luna not available', () => {
    const { service } = setup(false);
    service.launch({ url: 'https://netflix.com/title/123' });
    expect(openSpy).toHaveBeenCalledWith(
      'https://netflix.com/title/123',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('does not call window.open on webOS', () => {
    const { service } = setup(true);
    service.launch({ url: 'https://netflix.com', webosAppId: 'netflix' });
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('launches app via Luna when available and webosAppId provided', () => {
    const { service, lunaSpy } = setup(true);
    service.launch({ url: 'https://netflix.com', webosAppId: 'netflix' });
    expect(lunaSpy.launchApp).toHaveBeenCalledWith({ appId: 'netflix' });
  });

  it('skips Luna launch when webosAppId is absent', () => {
    const { service, lunaSpy } = setup(true);
    service.launch({ url: 'https://netflix.com' });
    expect(lunaSpy.launchApp).not.toHaveBeenCalled();
  });
});
