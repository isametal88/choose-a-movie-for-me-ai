export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  profilePath: string | null;
}

export interface WatchProviderItem {
  id: number;
  name: string;
  logoPath: string;
}

export interface WatchProviders {
  link?: string;
  flatrate: WatchProviderItem[];
  rent: WatchProviderItem[];
  buy: WatchProviderItem[];
}

export interface MediaDetail {
  id: number;
  title: string;
  mediaType: 'movie' | 'tv';
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  voteAverage: number;
  releaseDate: string;
  runtime: number | null;
  genres: { id: number; name: string }[];
  cast: CastMember[];
  crew: CrewMember[];
  trailerKey: string | null;
  watchProviders: WatchProviders | null;
}
