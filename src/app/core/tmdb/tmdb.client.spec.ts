import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Environment } from '../../../environments/environment.model';
import { ENVIRONMENT } from '../../shared/environment.token';
import { TmdbConfigService } from './tmdb-config.service';
import { TmdbClient } from './tmdb.client';

const ENV: Environment = {
  production: false,
  tmdbToken: 'test-token',
  tmdbRegion: 'IT',
  platform: 'web',
};

const GENRE_MOVIE_URL = '/genre/movie/list';
const GENRE_TV_URL = '/genre/tv/list';
const PROVIDERS_URL = '/watch/providers/movie';
const PROVIDERS_TV_URL = '/watch/providers/tv';
const DISCOVER_MOVIE_URL = '/discover/movie';
const DISCOVER_TV_URL = '/discover/tv';
const SEARCH_MOVIE_URL = '/search/movie';
const SEARCH_TV_URL = '/search/tv';

const MOCK_GENRES = { genres: [{ id: 28, name: 'Action' }] };
const MOCK_PROVIDERS = {
  results: [{ logo_path: '/n.png', provider_id: 8, provider_name: 'Netflix', display_priority: 0 }],
};
const MOCK_DISCOVER = { page: 1, results: [], total_pages: 1, total_results: 0 };

/** Flush N requests matching urlFragment with an error (for retry handling). */
function flushError(http: HttpTestingController, urlFragment: string, retries = 2): void {
  for (let i = 0; i <= retries; i++) {
    http
      .expectOne((r) => r.url.includes(urlFragment))
      .flush({ status_message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  }
}

describe('TmdbClient', () => {
  let client: TmdbClient;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        TmdbClient,
        TmdbConfigService,
        { provide: ENVIRONMENT, useValue: ENV },
      ],
    });
    client = TestBed.inject(TmdbClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  describe('getMovieGenres()', () => {
    it('GETs the genres/movie/list endpoint with auth', () => {
      let result = {};
      client.getMovieGenres().subscribe((r) => (result = r));
      const req = http.expectOne((r) => r.url.includes(GENRE_MOVIE_URL));
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush(MOCK_GENRES);
      expect(result).toEqual(MOCK_GENRES);
    });

    it('caches the result on second subscription', () => {
      let count = 0;
      client.getMovieGenres().subscribe(() => count++);
      client.getMovieGenres().subscribe(() => count++);
      const req = http.expectOne((r) => r.url.includes(GENRE_MOVIE_URL));
      req.flush(MOCK_GENRES);
      expect(count).toBe(2);
    });

    it('propagates error after all retries exhausted', () => {
      let error!: Error;
      client.getMovieGenres().subscribe({ error: (e) => (error = e) });
      flushError(http, GENRE_MOVIE_URL);
      expect(error?.message).toContain('Unauthorized');
    });

    it('falls back to HTTP status text when no status_message', () => {
      let error!: Error;
      client.getMovieGenres().subscribe({ error: (e) => (error = e) });
      for (let i = 0; i <= 2; i++) {
        http
          .expectOne((r) => r.url.includes(GENRE_MOVIE_URL))
          .flush(null, { status: 500, statusText: 'Server Error' });
      }
      expect(error?.message).toContain('500');
    });
  });

  describe('getTvGenres()', () => {
    it('GETs the genres/tv/list endpoint', () => {
      client.getTvGenres().subscribe();
      const req = http.expectOne((r) => r.url.includes(GENRE_TV_URL));
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_GENRES);
    });

    it('caches the result', () => {
      let count = 0;
      client.getTvGenres().subscribe(() => count++);
      client.getTvGenres().subscribe(() => count++);
      http.expectOne((r) => r.url.includes(GENRE_TV_URL)).flush(MOCK_GENRES);
      expect(count).toBe(2);
    });
  });

  describe('getWatchProviders()', () => {
    it('GETs the watch/providers/movie endpoint with watch_region', () => {
      client.getWatchProviders().subscribe();
      const req = http.expectOne((r) => r.url.includes(PROVIDERS_URL));
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('watch_region')).toBe('IT');
      req.flush(MOCK_PROVIDERS);
    });

    it('GETs the watch/providers/tv endpoint for tv mediaType', () => {
      client.getWatchProviders('tv').subscribe();
      const req = http.expectOne((r) => r.url.includes(PROVIDERS_TV_URL));
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('watch_region')).toBe('IT');
      req.flush(MOCK_PROVIDERS);
    });

    it('caches the movie result', () => {
      let count = 0;
      client.getWatchProviders().subscribe(() => count++);
      client.getWatchProviders().subscribe(() => count++);
      http.expectOne((r) => r.url.includes(PROVIDERS_URL)).flush(MOCK_PROVIDERS);
      expect(count).toBe(2);
    });

    it('caches the tv result separately', () => {
      let count = 0;
      client.getWatchProviders('tv').subscribe(() => count++);
      client.getWatchProviders('tv').subscribe(() => count++);
      http.expectOne((r) => r.url.includes(PROVIDERS_TV_URL)).flush(MOCK_PROVIDERS);
      expect(count).toBe(2);
    });

    it('propagates error after retries', () => {
      let error!: Error;
      client.getWatchProviders().subscribe({ error: (e) => (error = e) });
      flushError(http, PROVIDERS_URL);
      expect(error?.message).toContain('Unauthorized');
    });
  });

  describe('discover()', () => {
    it('GETs discover/movie with default params', () => {
      client.discover({ mediaType: 'movie' }).subscribe();
      const req = http.expectOne((r) => r.url.includes(DISCOVER_MOVIE_URL));
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('sort_by')).toBe('popularity.desc');
      req.flush(MOCK_DISCOVER);
    });

    it('passes genre filter as pipe-separated ids', () => {
      client.discover({ mediaType: 'movie', withGenres: [28, 12] }).subscribe();
      const req = http.expectOne((r) => r.url.includes(DISCOVER_MOVIE_URL));
      expect(req.request.params.get('with_genres')).toBe('28|12');
      req.flush(MOCK_DISCOVER);
    });

    it('omits genre param when empty array', () => {
      client.discover({ mediaType: 'movie', withGenres: [] }).subscribe();
      const req = http.expectOne((r) => r.url.includes(DISCOVER_MOVIE_URL));
      expect(req.request.params.has('with_genres')).toBe(false);
      req.flush(MOCK_DISCOVER);
    });

    it('passes watch provider filter and sets flatrate monetization', () => {
      client.discover({ mediaType: 'movie', withWatchProviders: [8] }).subscribe();
      const req = http.expectOne((r) => r.url.includes(DISCOVER_MOVIE_URL));
      expect(req.request.params.get('with_watch_providers')).toBe('8');
      expect(req.request.params.get('with_watch_monetization_types')).toBe('flatrate');
      req.flush(MOCK_DISCOVER);
    });

    it('omits provider and monetization params when empty array', () => {
      client.discover({ mediaType: 'movie', withWatchProviders: [] }).subscribe();
      const req = http.expectOne((r) => r.url.includes(DISCOVER_MOVIE_URL));
      expect(req.request.params.has('with_watch_providers')).toBe(false);
      expect(req.request.params.has('with_watch_monetization_types')).toBe(false);
      req.flush(MOCK_DISCOVER);
    });

    it('passes vote_average.gte filter', () => {
      client.discover({ mediaType: 'movie', voteAverageGte: 7 }).subscribe();
      const req = http.expectOne((r) => r.url.includes(DISCOVER_MOVIE_URL));
      expect(req.request.params.get('vote_average.gte')).toBe('7');
      req.flush(MOCK_DISCOVER);
    });

    it('uses custom watchRegion when provided', () => {
      client.discover({ mediaType: 'movie', watchRegion: 'US' }).subscribe();
      const req = http.expectOne((r) => r.url.includes(DISCOVER_MOVIE_URL));
      expect(req.request.params.get('watch_region')).toBe('US');
      req.flush(MOCK_DISCOVER);
    });

    it('defaults watchRegion to config region', () => {
      client.discover({ mediaType: 'movie' }).subscribe();
      const req = http.expectOne((r) => r.url.includes(DISCOVER_MOVIE_URL));
      expect(req.request.params.get('watch_region')).toBe('IT');
      req.flush(MOCK_DISCOVER);
    });

    it('falls back to browser-detected region when config tmdbRegion is empty', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          TmdbClient,
          TmdbConfigService,
          { provide: ENVIRONMENT, useValue: { ...ENV, tmdbRegion: '' } },
        ],
      });
      const localClient = TestBed.inject(TmdbClient);
      const localHttp = TestBed.inject(HttpTestingController);

      localClient.discover({ mediaType: 'movie' }).subscribe();
      const req = localHttp.expectOne((r) => r.url.includes(DISCOVER_MOVIE_URL));
      // jsdom navigator.language is 'en-US' → detectRegion returns 'US'
      expect(req.request.params.get('watch_region')).toBe('US');
      req.flush(MOCK_DISCOVER);
      localHttp.verify();
    });

    it('uses custom sortBy', () => {
      client.discover({ mediaType: 'movie', sortBy: 'vote_average.desc' }).subscribe();
      const req = http.expectOne((r) => r.url.includes(DISCOVER_MOVIE_URL));
      expect(req.request.params.get('sort_by')).toBe('vote_average.desc');
      req.flush(MOCK_DISCOVER);
    });

    it('GETs discover/tv for tv mediaType', () => {
      client.discover({ mediaType: 'tv' }).subscribe();
      http.expectOne((r) => r.url.includes(DISCOVER_TV_URL)).flush(MOCK_DISCOVER);
    });

    it('passes custom page', () => {
      client.discover({ mediaType: 'movie', page: 3 }).subscribe();
      const req = http.expectOne((r) => r.url.includes(DISCOVER_MOVIE_URL));
      expect(req.request.params.get('page')).toBe('3');
      req.flush(MOCK_DISCOVER);
    });

    it('propagates error after retries', () => {
      let error!: Error;
      client.discover({ mediaType: 'movie' }).subscribe({ error: (e) => (error = e) });
      flushError(http, DISCOVER_MOVIE_URL);
      expect(error?.message).toContain('Unauthorized');
    });
  });

  describe('search()', () => {
    it('GETs search/movie with query and default page', () => {
      client.search({ mediaType: 'movie', query: 'Inception' }).subscribe();
      const req = http.expectOne((r) => r.url.includes(SEARCH_MOVIE_URL));
      expect(req.request.params.get('query')).toBe('Inception');
      expect(req.request.params.get('page')).toBe('1');
      req.flush(MOCK_DISCOVER);
    });

    it('GETs search/tv for tv mediaType', () => {
      client.search({ mediaType: 'tv', query: 'Breaking Bad' }).subscribe();
      const req = http.expectOne((r) => r.url.includes(SEARCH_TV_URL));
      expect(req.request.params.get('query')).toBe('Breaking Bad');
      req.flush(MOCK_DISCOVER);
    });

    it('passes custom page', () => {
      client.search({ mediaType: 'movie', query: 'test', page: 2 }).subscribe();
      const req = http.expectOne((r) => r.url.includes(SEARCH_MOVIE_URL));
      expect(req.request.params.get('page')).toBe('2');
      req.flush(MOCK_DISCOVER);
    });

    it('propagates error after retries', () => {
      let error!: Error;
      client.search({ mediaType: 'movie', query: 'x' }).subscribe({ error: (e) => (error = e) });
      flushError(http, SEARCH_MOVIE_URL);
      expect(error?.message).toContain('Unauthorized');
    });
  });

  describe('getMovieDetail()', () => {
    const MOVIE_DETAIL_URL = '/movie/42';
    const MOCK_DETAIL = {
      id: 42,
      title: 'Inception',
      overview: '',
      poster_path: null,
      backdrop_path: null,
      release_date: '2010-07-16',
      vote_average: 8.8,
      vote_count: 30000,
      genre_ids: [],
      adult: false,
      original_language: 'en',
      popularity: 500,
      runtime: 148,
      genres: [],
      credits: { cast: [], crew: [] },
      videos: { results: [] },
      'watch/providers': { results: {} },
    };

    it('GETs /movie/{id} with append_to_response and watch_region', () => {
      client.getMovieDetail(42).subscribe();
      const req = http.expectOne((r) => r.url.includes(MOVIE_DETAIL_URL));
      expect(req.request.params.get('append_to_response')).toBe('credits,videos,watch/providers');
      expect(req.request.params.get('watch_region')).toBe('IT');
      req.flush(MOCK_DETAIL);
    });

    it('propagates error after retries', () => {
      let error!: Error;
      client.getMovieDetail(42).subscribe({ error: (e) => (error = e) });
      flushError(http, MOVIE_DETAIL_URL);
      expect(error?.message).toContain('Unauthorized');
    });
  });

  describe('getTvDetail()', () => {
    const TV_DETAIL_URL = '/tv/1';
    const MOCK_TV_DETAIL = {
      id: 1,
      name: 'Breaking Bad',
      overview: '',
      poster_path: null,
      backdrop_path: null,
      first_air_date: '2008-01-20',
      vote_average: 9.5,
      vote_count: 10000,
      genre_ids: [],
      original_language: 'en',
      popularity: 300,
      episode_run_time: [47],
      genres: [],
      credits: { cast: [], crew: [] },
      videos: { results: [] },
      'watch/providers': { results: {} },
    };

    it('GETs /tv/{id} with append_to_response and watch_region', () => {
      client.getTvDetail(1).subscribe();
      const req = http.expectOne((r) => r.url.includes(TV_DETAIL_URL));
      expect(req.request.params.get('append_to_response')).toBe('credits,videos,watch/providers');
      expect(req.request.params.get('watch_region')).toBe('IT');
      req.flush(MOCK_TV_DETAIL);
    });

    it('propagates error after retries', () => {
      let error!: Error;
      client.getTvDetail(1).subscribe({ error: (e) => (error = e) });
      flushError(http, TV_DETAIL_URL);
      expect(error?.message).toContain('Unauthorized');
    });
  });
});
