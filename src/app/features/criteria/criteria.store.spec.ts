import { TestBed } from '@angular/core/testing';
import { TmdbConfigService } from '../../core/tmdb/tmdb-config.service';
import { CriteriaStore } from './criteria.store';

function makeConfig(region = 'IT'): Partial<TmdbConfigService> {
  return { region };
}

describe('CriteriaStore', () => {
  let store: InstanceType<typeof CriteriaStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CriteriaStore, { provide: TmdbConfigService, useValue: makeConfig() }],
    });
    store = TestBed.inject(CriteriaStore);
  });

  // ── Initial state ────────────────────────────────────────────────────────────

  it('initial mediaType is movie', () => expect(store.mediaType()).toBe('movie'));
  it('initial genreIds is empty', () => expect(store.genreIds()).toEqual([]));
  it('initial providerIds is empty', () => expect(store.providerIds()).toEqual([]));
  it('initial minRating is 0', () => expect(store.minRating()).toBe(0));
  it('initial activeFilterCount is 0', () => expect(store.activeFilterCount()).toBe(0));
  it('initial hasFilters is false', () => expect(store.hasFilters()).toBe(false));

  it('initial query is empty string', () => expect(store.query()).toBe(''));

  it('initial selectionCriteria has only mediaType and watchRegion', () => {
    expect(store.selectionCriteria()).toEqual({
      mediaType: 'movie',
      genreIds: undefined,
      providerIds: undefined,
      minRating: undefined,
      watchRegion: 'IT',
      query: undefined,
    });
  });

  // ── setMediaType() ───────────────────────────────────────────────────────────

  it('setMediaType() updates mediaType to tv', () => {
    store.setMediaType('tv');
    expect(store.mediaType()).toBe('tv');
  });

  it('setMediaType() updates selectionCriteria.mediaType', () => {
    store.setMediaType('tv');
    expect(store.selectionCriteria().mediaType).toBe('tv');
  });

  // ── toggleGenre() ────────────────────────────────────────────────────────────

  it('toggleGenre() adds genre when not present', () => {
    store.toggleGenre(28);
    expect(store.genreIds()).toEqual([28]);
  });

  it('toggleGenre() removes genre when already present', () => {
    store.toggleGenre(28);
    store.toggleGenre(28);
    expect(store.genreIds()).toEqual([]);
  });

  it('toggleGenre() handles multiple genres independently', () => {
    store.toggleGenre(28);
    store.toggleGenre(18);
    expect(store.genreIds()).toEqual(expect.arrayContaining([28, 18]));
    store.toggleGenre(28);
    expect(store.genreIds()).toEqual([18]);
  });

  it('genreIds in selectionCriteria is set when non-empty', () => {
    store.toggleGenre(28);
    expect(store.selectionCriteria().genreIds).toEqual([28]);
  });

  it('genreIds in selectionCriteria is undefined when empty', () => {
    expect(store.selectionCriteria().genreIds).toBeUndefined();
  });

  // ── toggleProvider() ─────────────────────────────────────────────────────────

  it('toggleProvider() adds provider when not present', () => {
    store.toggleProvider(8);
    expect(store.providerIds()).toEqual([8]);
  });

  it('toggleProvider() removes provider when already present', () => {
    store.toggleProvider(8);
    store.toggleProvider(8);
    expect(store.providerIds()).toEqual([]);
  });

  it('providerIds in selectionCriteria is set when non-empty', () => {
    store.toggleProvider(8);
    expect(store.selectionCriteria().providerIds).toEqual([8]);
  });

  it('providerIds in selectionCriteria is undefined when empty', () => {
    expect(store.selectionCriteria().providerIds).toBeUndefined();
  });

  // ── setMinRating() ───────────────────────────────────────────────────────────

  it('setMinRating() updates minRating', () => {
    store.setMinRating(7);
    expect(store.minRating()).toBe(7);
  });

  it('minRating in selectionCriteria is set when > 0', () => {
    store.setMinRating(6);
    expect(store.selectionCriteria().minRating).toBe(6);
  });

  it('minRating in selectionCriteria is undefined when 0', () => {
    expect(store.selectionCriteria().minRating).toBeUndefined();
  });

  // ── setQuery() ───────────────────────────────────────────────────────────────

  it('setQuery() updates query', () => {
    store.setQuery('Inception');
    expect(store.query()).toBe('Inception');
  });

  it('query in selectionCriteria is set when non-empty', () => {
    store.setQuery('Inception');
    expect(store.selectionCriteria().query).toBe('Inception');
  });

  it('query in selectionCriteria is undefined when empty', () => {
    expect(store.selectionCriteria().query).toBeUndefined();
  });

  // ── activeFilterCount and hasFilters ─────────────────────────────────────────

  it('activeFilterCount increments for each active filter', () => {
    store.toggleGenre(28);
    expect(store.activeFilterCount()).toBe(1);
    store.toggleProvider(8);
    expect(store.activeFilterCount()).toBe(2);
    store.setMinRating(7);
    expect(store.activeFilterCount()).toBe(3);
    store.setQuery('Inception');
    expect(store.activeFilterCount()).toBe(4);
  });

  it('hasFilters is true when at least one filter is set', () => {
    store.toggleGenre(28);
    expect(store.hasFilters()).toBe(true);
  });

  it('hasFilters is true with only providers set', () => {
    store.toggleProvider(8);
    expect(store.hasFilters()).toBe(true);
  });

  it('hasFilters is true with only minRating set', () => {
    store.setMinRating(5);
    expect(store.hasFilters()).toBe(true);
  });

  it('hasFilters is false when no filters are set', () => {
    expect(store.hasFilters()).toBe(false);
  });

  it('hasFilters is true when only query is set', () => {
    store.setQuery('Inception');
    expect(store.hasFilters()).toBe(true);
  });

  // ── watchRegion ──────────────────────────────────────────────────────────────

  it('selectionCriteria.watchRegion is set from config region', () => {
    expect(store.selectionCriteria().watchRegion).toBe('IT');
  });

  it('selectionCriteria.watchRegion is undefined when config region is empty', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [CriteriaStore, { provide: TmdbConfigService, useValue: makeConfig('') }],
    });
    const localStore = TestBed.inject(CriteriaStore);
    expect(localStore.selectionCriteria().watchRegion).toBeUndefined();
  });

  // ── reset() ──────────────────────────────────────────────────────────────────

  it('reset() restores all state to initial values', () => {
    store.setMediaType('tv');
    store.toggleGenre(28);
    store.toggleProvider(8);
    store.setMinRating(7);
    store.setQuery('Inception');
    store.reset();
    expect(store.mediaType()).toBe('movie');
    expect(store.genreIds()).toEqual([]);
    expect(store.providerIds()).toEqual([]);
    expect(store.minRating()).toBe(0);
    expect(store.query()).toBe('');
  });

  it('reset() clears activeFilterCount', () => {
    store.toggleGenre(28);
    store.reset();
    expect(store.activeFilterCount()).toBe(0);
  });

  it('reset() clears hasFilters', () => {
    store.setMinRating(5);
    store.reset();
    expect(store.hasFilters()).toBe(false);
  });
});
