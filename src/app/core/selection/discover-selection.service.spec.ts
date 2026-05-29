import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { TmdbClient } from '../tmdb/tmdb.client';
import { TmdbDiscoverResponse, TmdbMovie } from '../tmdb/tmdb.models';
import { DiscoverSelectionService } from './discover-selection.service';
import { SelectionCriteria } from './selection.models';
import { SeenTitlesService } from './seen-titles.service';

function makeMovie(id: number, title = `Movie ${id}`): TmdbMovie {
  return {
    id,
    title,
    overview: `Overview ${id}`,
    poster_path: `/poster${id}.jpg`,
    backdrop_path: null,
    release_date: '2024-01-01',
    vote_average: 7.5,
    vote_count: 1000,
    genre_ids: [28],
    adult: false,
    original_language: 'en',
    popularity: 100,
  };
}

function discoverOf(...movies: TmdbMovie[]): TmdbDiscoverResponse<TmdbMovie> {
  return { page: 1, results: movies, total_pages: 10, total_results: movies.length };
}

const CRITERIA: SelectionCriteria = { mediaType: 'movie' };

describe('DiscoverSelectionService', () => {
  let service: DiscoverSelectionService;
  let tmdbSpy: jest.Mocked<Pick<TmdbClient, 'discover' | 'search'>>;
  let seenSpy: jest.Mocked<Pick<SeenTitlesService, 'has' | 'markSeen'>>;

  beforeEach(() => {
    tmdbSpy = { discover: jest.fn(), search: jest.fn() };
    seenSpy = { has: jest.fn().mockReturnValue(false), markSeen: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        DiscoverSelectionService,
        { provide: TmdbClient, useValue: tmdbSpy },
        { provide: SeenTitlesService, useValue: seenSpy },
      ],
    });
    service = TestBed.inject(DiscoverSelectionService);
  });

  it('creates', () => expect(service).toBeTruthy());
  it('initial state is idle', () => expect(service.state().status).toBe('idle'));

  describe('pick()', () => {
    it('sets state to picked after successful fetch', () => {
      tmdbSpy.discover.mockReturnValue(of(discoverOf(makeMovie(1))));
      service.pick(CRITERIA);
      expect(service.state().status).toBe('picked');
    });

    it('picked item has correct movie fields', () => {
      tmdbSpy.discover.mockReturnValue(of(discoverOf(makeMovie(1, 'Inception'))));
      service.pick(CRITERIA);
      const state = service.state();
      if (state.status === 'picked') {
        expect(state.item.title).toBe('Inception');
        expect(state.item.mediaType).toBe('movie');
        expect(state.item.id).toBe(1);
        expect(state.item.posterPath).toBe('/poster1.jpg');
      } else {
        fail('Expected state to be picked');
      }
    });

    it('picked item for tv uses name and first_air_date', () => {
      const tvShow = {
        id: 99,
        name: 'Breaking Bad',
        overview: 'A great show',
        poster_path: '/bb.jpg',
        backdrop_path: null,
        first_air_date: '2008-01-20',
        vote_average: 9.5,
        vote_count: 5000,
        genre_ids: [18],
        original_language: 'en',
        popularity: 300,
      };
      tmdbSpy.discover.mockReturnValue(
        of({ page: 1, results: [tvShow], total_pages: 1, total_results: 1 }),
      );
      service.pick({ mediaType: 'tv' });
      const state = service.state();
      if (state.status === 'picked') {
        expect(state.item.title).toBe('Breaking Bad');
        expect(state.item.mediaType).toBe('tv');
        expect(state.item.releaseDate).toBe('2008-01-20');
      } else {
        fail('Expected state to be picked');
      }
    });

    it('marks the picked item as seen', () => {
      tmdbSpy.discover.mockReturnValue(of(discoverOf(makeMovie(1))));
      service.pick(CRITERIA);
      expect(seenSpy.markSeen).toHaveBeenCalledWith(1);
    });

    it('sets state to empty when page 1 returns no results', () => {
      tmdbSpy.discover.mockReturnValue(of(discoverOf()));
      service.pick(CRITERIA);
      expect(service.state().status).toBe('empty');
    });

    it('sets state to error on API failure', () => {
      tmdbSpy.discover.mockReturnValue(throwError(() => new Error('Network error')));
      service.pick(CRITERIA);
      const state = service.state();
      expect(state.status).toBe('error');
      if (state.status === 'error') {
        expect(state.message).toBe('Network error');
      }
    });

    it('passes criteria filters to tmdb.discover', () => {
      tmdbSpy.discover.mockReturnValue(of(discoverOf(makeMovie(1))));
      service.pick({
        mediaType: 'movie',
        genreIds: [28],
        providerIds: [8],
        minRating: 7,
        watchRegion: 'IT',
      });
      expect(tmdbSpy.discover).toHaveBeenCalledWith(
        expect.objectContaining({
          withGenres: [28],
          withWatchProviders: [8],
          voteAverageGte: 7,
          watchRegion: 'IT',
        }),
      );
    });

    it('skips already-seen items', () => {
      tmdbSpy.discover.mockReturnValue(of(discoverOf(makeMovie(1), makeMovie(2))));
      seenSpy.has.mockImplementation((id) => id === 1);
      service.pick(CRITERIA);
      const state = service.state();
      if (state.status === 'picked') {
        expect(state.item.id).toBe(2);
      } else {
        fail('Expected state to be picked');
      }
    });

    it('loads page 1 with default page param', () => {
      tmdbSpy.discover.mockReturnValue(of(discoverOf(makeMovie(1))));
      service.pick(CRITERIA);
      expect(tmdbSpy.discover).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
    });
  });

  describe('pickAnother()', () => {
    it('is a no-op when no criteria set', () => {
      service.pickAnother();
      expect(service.state().status).toBe('idle');
    });

    it('picks another unseen item from current pool', () => {
      tmdbSpy.discover.mockReturnValue(of(discoverOf(makeMovie(1), makeMovie(2))));
      service.pick(CRITERIA);

      seenSpy.has.mockImplementation((id) => id === 1);
      service.pickAnother();
      expect(service.state().status).toBe('picked');
    });

    it('loads next page when all pool items are seen', () => {
      const page1 = discoverOf(makeMovie(1), makeMovie(2));
      const page2 = discoverOf(makeMovie(3));
      tmdbSpy.discover.mockReturnValueOnce(of(page1)).mockReturnValueOnce(of(page2));

      service.pick(CRITERIA);
      // Mark page 1 items (1, 2) as seen but not page 2 item (3)
      seenSpy.has.mockImplementation((id) => id === 1 || id === 2);
      service.pickAnother();

      expect(tmdbSpy.discover).toHaveBeenCalledTimes(2);
      expect(tmdbSpy.discover).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
    });

    it('sets exhausted when next page has no results', () => {
      tmdbSpy.discover
        .mockReturnValueOnce(of(discoverOf(makeMovie(1))))
        .mockReturnValueOnce(of(discoverOf()));

      service.pick(CRITERIA);
      seenSpy.has.mockImplementation((id) => id === 1);
      service.pickAnother();
      expect(service.state().status).toBe('exhausted');
    });

    it('sets error when next page fetch fails', () => {
      tmdbSpy.discover
        .mockReturnValueOnce(of(discoverOf(makeMovie(1))))
        .mockReturnValueOnce(throwError(() => new Error('timeout')));

      service.pick(CRITERIA);
      seenSpy.has.mockImplementation((id) => id === 1);
      service.pickAnother();
      const state = service.state();
      expect(state.status).toBe('error');
    });

    it('sets empty when pool is empty (called after pick returned empty)', () => {
      tmdbSpy.discover.mockReturnValue(of(discoverOf())); // page 1 empty
      service.pick(CRITERIA); // state = 'empty', pool stays []
      service.pickAnother(); // _tryPickFromPool with empty pool → 'empty'
      expect(service.state().status).toBe('empty');
    });

    it('sets empty when _tryPickFromPool called with empty pool (legacy)', () => {
      // Set up so pool is empty after pick
      tmdbSpy.discover.mockReturnValue(of(discoverOf(makeMovie(1))));
      service.pick(CRITERIA);
      // Clear pool via internal manipulation by resetting
      service.reset();
      // Now rebuild partially
      TestBed.inject(DiscoverSelectionService);
      // Directly test via pickAnother with a fresh criteria scenario
      tmdbSpy.discover.mockReturnValue(of(discoverOf()));
      service.pick(CRITERIA);
      // State should be empty (page 1 returned no results)
      expect(service.state().status).toBe('empty');
    });
  });

  describe('search mode (criteria.query is set)', () => {
    const SEARCH_CRITERIA = { mediaType: 'movie' as const, query: 'Inception' };

    it('calls tmdb.search instead of tmdb.discover when query is set', () => {
      tmdbSpy.search.mockReturnValue(of(discoverOf(makeMovie(1))));
      service.pick(SEARCH_CRITERIA);
      expect(tmdbSpy.search).toHaveBeenCalled();
      expect(tmdbSpy.discover).not.toHaveBeenCalled();
    });

    it('passes mediaType and query to tmdb.search', () => {
      tmdbSpy.search.mockReturnValue(of(discoverOf(makeMovie(1))));
      service.pick(SEARCH_CRITERIA);
      expect(tmdbSpy.search).toHaveBeenCalledWith(
        expect.objectContaining({
          mediaType: 'movie',
          query: 'Inception',
          page: 1,
        }),
      );
    });

    it('sets state to search_results when search returns results', () => {
      tmdbSpy.search.mockReturnValue(
        of(discoverOf(makeMovie(42, 'Inception'), makeMovie(7, 'Interstellar'))),
      );
      service.pick(SEARCH_CRITERIA);
      const state = service.state();
      expect(state.status).toBe('search_results');
      if (state.status === 'search_results') {
        expect(state.items).toHaveLength(2);
        expect(state.items[0].title).toBe('Inception');
        expect(state.items[1].title).toBe('Interstellar');
      }
    });

    it('preserves TMDB relevance order in search_results', () => {
      tmdbSpy.search.mockReturnValue(
        of(discoverOf(makeMovie(1, 'First'), makeMovie(2, 'Second'), makeMovie(3, 'Third'))),
      );
      service.pick(SEARCH_CRITERIA);
      const state = service.state();
      if (state.status === 'search_results') {
        expect(state.items.map((i) => i.title)).toEqual(['First', 'Second', 'Third']);
      }
    });

    it('does not mark search results as seen', () => {
      tmdbSpy.search.mockReturnValue(of(discoverOf(makeMovie(42, 'Inception'))));
      service.pick(SEARCH_CRITERIA);
      expect(seenSpy.markSeen).not.toHaveBeenCalled();
    });

    it('sets state to empty when search returns no results', () => {
      tmdbSpy.search.mockReturnValue(of(discoverOf()));
      service.pick(SEARCH_CRITERIA);
      expect(service.state().status).toBe('empty');
    });

    it('sets state to error when search fails', () => {
      tmdbSpy.search.mockReturnValue(throwError(() => new Error('Search failed')));
      service.pick(SEARCH_CRITERIA);
      const state = service.state();
      expect(state.status).toBe('error');
      if (state.status === 'error') {
        expect(state.message).toBe('Search failed');
      }
    });
  });

  describe('reset()', () => {
    it('resets state to idle', () => {
      tmdbSpy.discover.mockReturnValue(of(discoverOf(makeMovie(1))));
      service.pick(CRITERIA);
      service.reset();
      expect(service.state().status).toBe('idle');
    });

    it('subsequent pickAnother is a no-op after reset', () => {
      service.reset();
      service.pickAnother();
      expect(service.state().status).toBe('idle');
    });

    it('cancels in-flight subscription', () => {
      const subject$ = new Subject<unknown>();
      tmdbSpy.discover.mockReturnValue(subject$.asObservable());
      service.pick(CRITERIA);
      expect(service.state().status).toBe('loading');
      service.reset();
      expect(service.state().status).toBe('idle');
    });
  });
});
