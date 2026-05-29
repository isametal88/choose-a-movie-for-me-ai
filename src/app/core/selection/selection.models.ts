import { TmdbMediaType } from '../tmdb/tmdb.models';

export interface SelectionCriteria {
  mediaType: TmdbMediaType;
  genreIds?: number[];
  providerIds?: number[];
  minRating?: number;
  watchRegion?: string;
  query?: string;
}

export interface PickedItem {
  id: number;
  title: string;
  mediaType: TmdbMediaType;
  posterPath: string | null;
  overview: string;
  voteAverage: number;
  releaseDate: string;
}

export type SelectionState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'picked'; item: PickedItem }
  | { status: 'search_results'; items: PickedItem[] }
  | { status: 'exhausted' }
  | { status: 'empty' }
  | { status: 'error'; message: string };

export const SEEN_TITLES_KEY = 'choose-movie:seen-titles';
export const PAGE_SIZE = 50;
