import { Injectable, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { TmdbClient } from '../tmdb/tmdb.client';
import { TmdbMovie, TmdbTvShow } from '../tmdb/tmdb.models';
import { pickRandom } from './random-picker';
import { PickedItem, SelectionCriteria, SelectionState } from './selection.models';
import { SeenTitlesService } from './seen-titles.service';

function toPickedItem(item: TmdbMovie | TmdbTvShow, mediaType: 'movie' | 'tv'): PickedItem {
  if (mediaType === 'movie') {
    const m = item as TmdbMovie;
    return {
      id: m.id,
      title: m.title,
      mediaType,
      posterPath: m.poster_path,
      overview: m.overview,
      voteAverage: m.vote_average,
      releaseDate: m.release_date,
    };
  }
  const t = item as TmdbTvShow;
  return {
    id: t.id,
    title: t.name,
    mediaType,
    posterPath: t.poster_path,
    overview: t.overview,
    voteAverage: t.vote_average,
    releaseDate: t.first_air_date,
  };
}

@Injectable({ providedIn: 'root' })
export class DiscoverSelectionService {
  private readonly tmdb = inject(TmdbClient);
  private readonly seen = inject(SeenTitlesService);

  readonly state = signal<SelectionState>({ status: 'idle' });

  private _currentCriteria: SelectionCriteria | null = null;
  private _currentPool: PickedItem[] = [];
  private _currentPage = 1;
  private _sub: Subscription | null = null;

  pick(criteria: SelectionCriteria): void {
    this._currentCriteria = criteria;
    this._currentPool = [];
    this._currentPage = 1;
    this._fetchPage();
  }

  pickAnother(): void {
    if (!this._currentCriteria) return;
    this._tryPickFromPool();
  }

  reset(): void {
    this._sub?.unsubscribe();
    this._currentCriteria = null;
    this._currentPool = [];
    this._currentPage = 1;
    this.state.set({ status: 'idle' });
  }

  private _fetchPage(): void {
    this.state.set({ status: 'loading' });

    const { mediaType, genreIds, providerIds, minRating, watchRegion, query } =
      this._currentCriteria!;

    const request$ = query
      ? this.tmdb.search({ mediaType, query, page: this._currentPage })
      : this.tmdb.discover({
          mediaType,
          page: this._currentPage,
          withGenres: genreIds,
          withWatchProviders: providerIds,
          voteAverageGte: minRating,
          watchRegion,
        });

    this._sub?.unsubscribe();
    this._sub = request$
      .pipe(
        map((response) =>
          response.results.map((item) => toPickedItem(item as TmdbMovie | TmdbTvShow, mediaType)),
        ),
      )
      .subscribe({
        next: (items) => {
          if (query) {
            this.state.set(
              items.length === 0 ? { status: 'empty' } : { status: 'search_results', items },
            );
            return;
          }
          if (items.length === 0 && this._currentPage === 1) {
            this.state.set({ status: 'empty' });
            return;
          }
          if (items.length === 0) {
            this.state.set({ status: 'exhausted' });
            return;
          }
          this._currentPool = items;
          this._tryPickFromPool();
        },
        error: (err: Error) => {
          this.state.set({ status: 'error', message: err.message });
        },
      });
  }

  private _tryPickFromPool(): void {
    const unseen = this._currentPool.filter((item) => !this.seen.has(item.id));

    if (unseen.length > 0) {
      const picked = pickRandom(unseen);
      this.seen.markSeen(picked.id);
      this.state.set({ status: 'picked', item: picked });
      return;
    }

    if (this._currentPool.length === 0) {
      this.state.set({ status: 'empty' });
      return;
    }

    // All items in current page are seen; advance to next page
    this._currentPage += 1;
    this._fetchPage();
  }
}
