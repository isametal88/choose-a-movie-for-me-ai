import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TmdbConfigService } from '../tmdb/tmdb-config.service';
import { TmdbClient } from '../tmdb/tmdb.client';
import {
  TmdbCastMember,
  TmdbCrewMember,
  TmdbTvCreator,
  TmdbVideo,
  TmdbWatchProvider,
} from '../tmdb/tmdb.models';
import {
  CastMember,
  CrewMember,
  MediaDetail,
  WatchProviderItem,
  WatchProviders,
} from './detail.models';

const CAST_LIMIT = 10;
const LANG_PRIORITY: Record<string, number> = { it: 0, en: 1 };

export function pickTrailer(videos: TmdbVideo[]): string | null {
  const candidates = videos.filter((v) => v.site === 'YouTube' && v.type === 'Trailer');
  if (candidates.length === 0) return null;
  const sorted = [...candidates].sort((a, b) => {
    if (a.official !== b.official) return a.official ? -1 : 1;
    const pa = LANG_PRIORITY[a.iso_639_1] ?? 2;
    const pb = LANG_PRIORITY[b.iso_639_1] ?? 2;
    return pa - pb;
  });
  return sorted[0].key;
}

function toWatchProviderItem(p: TmdbWatchProvider): WatchProviderItem {
  return { id: p.provider_id, name: p.provider_name, logoPath: p.logo_path };
}

function toCastMember(c: TmdbCastMember): CastMember {
  return { id: c.id, name: c.name, character: c.character, profilePath: c.profile_path };
}

function toCrewMemberFromCrew(c: TmdbCrewMember): CrewMember {
  return { id: c.id, name: c.name, job: c.job, profilePath: c.profile_path };
}

function toCrewMemberFromCreator(c: TmdbTvCreator): CrewMember {
  return { id: c.id, name: c.name, job: 'Creator', profilePath: c.profile_path };
}

function toWatchProviders(region: {
  link?: string;
  flatrate?: TmdbWatchProvider[];
  rent?: TmdbWatchProvider[];
  buy?: TmdbWatchProvider[];
}): WatchProviders {
  return {
    link: region.link,
    flatrate: (region.flatrate ?? []).map(toWatchProviderItem),
    rent: (region.rent ?? []).map(toWatchProviderItem),
    buy: (region.buy ?? []).map(toWatchProviderItem),
  };
}

@Injectable({ providedIn: 'root' })
export class DetailService {
  private readonly tmdb = inject(TmdbClient);
  private readonly config = inject(TmdbConfigService);

  getMovieDetail(id: number): Observable<MediaDetail> {
    return this.tmdb.getMovieDetail(id).pipe(
      map((detail) => {
        const regionProviders = detail['watch/providers']?.results[this.config.region] ?? null;
        return {
          id: detail.id,
          title: detail.title,
          mediaType: 'movie' as const,
          posterPath: detail.poster_path,
          backdropPath: detail.backdrop_path,
          overview: detail.overview,
          voteAverage: detail.vote_average,
          releaseDate: detail.release_date,
          runtime: detail.runtime,
          genres: detail.genres,
          cast: (detail.credits?.cast ?? []).slice(0, CAST_LIMIT).map(toCastMember),
          crew: (detail.credits?.crew ?? [])
            .filter((c) => c.job === 'Director')
            .map(toCrewMemberFromCrew),
          trailerKey: pickTrailer(detail.videos?.results ?? []),
          watchProviders: regionProviders ? toWatchProviders(regionProviders) : null,
        };
      }),
    );
  }

  getTvDetail(id: number): Observable<MediaDetail> {
    return this.tmdb.getTvDetail(id).pipe(
      map((detail) => {
        const regionProviders = detail['watch/providers']?.results[this.config.region] ?? null;
        const runtime = detail.episode_run_time[0] ?? null;
        return {
          id: detail.id,
          title: detail.name,
          mediaType: 'tv' as const,
          posterPath: detail.poster_path,
          backdropPath: detail.backdrop_path,
          overview: detail.overview,
          voteAverage: detail.vote_average,
          releaseDate: detail.first_air_date,
          runtime,
          genres: detail.genres,
          cast: (detail.credits?.cast ?? []).slice(0, CAST_LIMIT).map(toCastMember),
          crew: (detail.created_by ?? []).map(toCrewMemberFromCreator),
          trailerKey: pickTrailer(detail.videos?.results ?? []),
          watchProviders: regionProviders ? toWatchProviders(regionProviders) : null,
        };
      }),
    );
  }
}
