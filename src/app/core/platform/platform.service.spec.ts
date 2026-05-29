import { TestBed } from '@angular/core/testing';
import { Environment } from '../../../environments/environment.model';
import { ENVIRONMENT } from '../../shared/environment.token';
import { PlatformService } from './platform.service';

function makeEnv(platform: 'web' | 'webos'): Environment {
  return { production: false, tmdbToken: '', tmdbRegion: 'IT', platform };
}

describe('PlatformService — web', () => {
  let service: PlatformService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlatformService, { provide: ENVIRONMENT, useValue: makeEnv('web') }],
    });
    service = TestBed.inject(PlatformService);
  });

  it('creates', () => expect(service).toBeTruthy());
  it('platform is web', () => expect(service.platform).toBe('web'));
  it('isWeb is true', () => expect(service.isWeb).toBe(true));
  it('isWebOS is false', () => expect(service.isWebOS).toBe(false));
});

describe('PlatformService — webOS', () => {
  let service: PlatformService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlatformService, { provide: ENVIRONMENT, useValue: makeEnv('webos') }],
    });
    service = TestBed.inject(PlatformService);
  });

  it('platform is webos', () => expect(service.platform).toBe('webos'));
  it('isWebOS is true', () => expect(service.isWebOS).toBe(true));
  it('isWeb is false', () => expect(service.isWeb).toBe(false));
});
