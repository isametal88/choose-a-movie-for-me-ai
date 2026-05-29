export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbGenresResponse {
  genres: TmdbGenre[];
}

export interface TmdbWatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface TmdbWatchProvidersResponse {
  results: TmdbWatchProvider[];
}

export interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
}

export interface TmdbTvShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  original_language: string;
  popularity: number;
}

export type TmdbMediaType = 'movie' | 'tv';

export interface TmdbDiscoverResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  iso_639_1: string;
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TmdbCredits {
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export interface TmdbWatchProvidersByRegion {
  link?: string;
  flatrate?: TmdbWatchProvider[];
  rent?: TmdbWatchProvider[];
  buy?: TmdbWatchProvider[];
}

export interface TmdbMovieDetail extends TmdbMovie {
  runtime: number | null;
  genres: TmdbGenre[];
  credits?: TmdbCredits;
  videos?: { results: TmdbVideo[] };
  'watch/providers'?: { results: Record<string, TmdbWatchProvidersByRegion> };
}

export interface TmdbTvCreator {
  id: number;
  name: string;
  profile_path: string | null;
}

export interface TmdbTvDetail extends TmdbTvShow {
  episode_run_time: number[];
  genres: TmdbGenre[];
  created_by?: TmdbTvCreator[];
  credits?: TmdbCredits;
  videos?: { results: TmdbVideo[] };
  'watch/providers'?: { results: Record<string, TmdbWatchProvidersByRegion> };
}

export interface TmdbError {
  status_code: number;
  status_message: string;
}

export interface TmdbDiscoverParams {
  mediaType: TmdbMediaType;
  page?: number;
  withGenres?: number[];
  withWatchProviders?: number[];
  watchRegion?: string;
  voteAverageGte?: number;
  sortBy?: string;
}

export interface TmdbSearchParams {
  mediaType: TmdbMediaType;
  query: string;
  page?: number;
}
