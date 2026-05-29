import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { SelectionCriteria } from '../../core/selection/selection.models';
import { TmdbConfigService } from '../../core/tmdb/tmdb-config.service';

export interface CriteriaState {
  mediaType: 'movie' | 'tv';
  genreIds: number[];
  providerIds: number[];
  minRating: number;
  query: string;
}

const initialState: CriteriaState = {
  mediaType: 'movie',
  genreIds: [],
  providerIds: [],
  minRating: 0,
  query: '',
};

export const CriteriaStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    const config = inject(TmdbConfigService);
    return {
      activeFilterCount: computed(
        () =>
          (store.genreIds().length > 0 ? 1 : 0) +
          (store.providerIds().length > 0 ? 1 : 0) +
          (store.minRating() > 0 ? 1 : 0) +
          (store.query().length > 0 ? 1 : 0),
      ),
      hasFilters: computed(
        () =>
          store.genreIds().length > 0 ||
          store.providerIds().length > 0 ||
          store.minRating() > 0 ||
          store.query().length > 0,
      ),
      selectionCriteria: computed(
        (): SelectionCriteria => ({
          mediaType: store.mediaType(),
          genreIds: store.genreIds().length > 0 ? store.genreIds() : undefined,
          providerIds: store.providerIds().length > 0 ? store.providerIds() : undefined,
          minRating: store.minRating() > 0 ? store.minRating() : undefined,
          watchRegion: config.region || undefined,
          query: store.query() || undefined,
        }),
      ),
    };
  }),
  withMethods((store) => ({
    setMediaType(mediaType: 'movie' | 'tv'): void {
      patchState(store, { mediaType });
    },
    toggleGenre(id: number): void {
      const current = store.genreIds();
      patchState(store, {
        genreIds: current.includes(id) ? current.filter((g) => g !== id) : [...current, id],
      });
    },
    toggleProvider(id: number): void {
      const current = store.providerIds();
      patchState(store, {
        providerIds: current.includes(id) ? current.filter((p) => p !== id) : [...current, id],
      });
    },
    setMinRating(minRating: number): void {
      patchState(store, { minRating });
    },
    setQuery(query: string): void {
      patchState(store, { query });
    },
    reset(): void {
      patchState(store, initialState);
    },
  })),
);
