import { TestBed } from '@angular/core/testing';
import { Environment } from '../../../environments/environment.model';
import { ENVIRONMENT } from '../../shared/environment.token';
import { TmdbConfigService } from './tmdb-config.service';

const ENV: Environment = {
  production: false,
  tmdbToken: 'test-token',
  tmdbRegion: 'IT',
  platform: 'web',
};

describe('TmdbConfigService', () => {
  let service: TmdbConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TmdbConfigService, { provide: ENVIRONMENT, useValue: ENV }],
    });
    service = TestBed.inject(TmdbConfigService);
  });

  it('creates', () => expect(service).toBeTruthy());
  it('has correct baseUrl', () => expect(service.baseUrl).toBe('https://api.themoviedb.org/3'));
  it('has correct imageBaseUrl', () =>
    expect(service.imageBaseUrl).toBe('https://image.tmdb.org/t/p'));
  it('returns token from env', () => expect(service.token).toBe('test-token'));
  it('returns region from env', () => expect(service.region).toBe('IT'));

  it('imageUrl with default size', () => {
    expect(service.imageUrl('/poster.jpg')).toBe('https://image.tmdb.org/t/p/w342/poster.jpg');
  });

  it('imageUrl with custom size', () => {
    expect(service.imageUrl('/poster.jpg', 'w500')).toBe(
      'https://image.tmdb.org/t/p/w500/poster.jpg',
    );
  });

  it('falls back to browser language detection when tmdbRegion is empty', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        TmdbConfigService,
        { provide: ENVIRONMENT, useValue: { ...ENV, tmdbRegion: '' } },
      ],
    });
    const svc = TestBed.inject(TmdbConfigService);
    // jsdom sets navigator.language to 'en-US' → region 'US'
    expect(svc.region).toBe('US');
  });
});
