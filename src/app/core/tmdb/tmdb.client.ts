import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, shareReplay } from 'rxjs/operators';
import {
  TmdbDiscoverParams,
  TmdbDiscoverResponse,
  TmdbGenresResponse,
  TmdbMovie,
  TmdbMovieDetail,
  TmdbSearchParams,
  TmdbTvDetail,
  TmdbTvShow,
  TmdbWatchProvidersResponse,
} from './tmdb.models';
import { TmdbConfigService } from './tmdb-config.service';

const RETRY_COUNT = 2;
const CACHE_SIZE = 1;

@Injectable({ providedIn: 'root' })
export class TmdbClient {
  private readonly http = inject(HttpClient);
  private readonly config = inject(TmdbConfigService);

  private readonly genresMovie$ = this.fetchGenres('movie');
  private readonly genresTv$ = this.fetchGenres('tv');
  private readonly watchProvidersMovie$ = this.fetchWatchProviders('movie');
  private readonly watchProvidersTv$ = this.fetchWatchProviders('tv');

  private get authHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${this.config.token}` };
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    const message = err.error?.status_message ?? `HTTP ${err.status}: ${err.statusText}`;
    return throwError(() => new Error(message));
  }

  private fetchGenres(mediaType: 'movie' | 'tv'): Observable<TmdbGenresResponse> {
    return this.http
      .get<TmdbGenresResponse>(`${this.config.baseUrl}/genre/${mediaType}/list`, {
        headers: this.authHeaders,
        params: new HttpParams().set('language', 'it-IT'),
      })
      .pipe(
        retry(RETRY_COUNT),
        catchError((e) => this.handleError(e)),
        shareReplay(CACHE_SIZE),
      );
  }

  private fetchWatchProviders(mediaType: 'movie' | 'tv'): Observable<TmdbWatchProvidersResponse> {
    return this.http
      .get<TmdbWatchProvidersResponse>(`${this.config.baseUrl}/watch/providers/${mediaType}`, {
        headers: this.authHeaders,
        params: new HttpParams().set('language', 'it-IT').set('watch_region', this.config.region),
      })
      .pipe(
        retry(RETRY_COUNT),
        catchError((e) => this.handleError(e)),
        shareReplay(CACHE_SIZE),
      );
  }

  getMovieGenres(): Observable<TmdbGenresResponse> {
    return this.genresMovie$;
  }

  getTvGenres(): Observable<TmdbGenresResponse> {
    return this.genresTv$;
  }

  getWatchProviders(mediaType: 'movie' | 'tv' = 'movie'): Observable<TmdbWatchProvidersResponse> {
    return mediaType === 'movie' ? this.watchProvidersMovie$ : this.watchProvidersTv$;
  }

  discover(params: TmdbDiscoverParams): Observable<TmdbDiscoverResponse<TmdbMovie | TmdbTvShow>> {
    const {
      mediaType,
      page = 1,
      withGenres,
      withWatchProviders,
      watchRegion,
      voteAverageGte,
      sortBy,
    } = params;
    let httpParams = new HttpParams()
      .set('language', 'it-IT')
      .set('page', page.toString())
      .set('sort_by', sortBy ?? 'popularity.desc');

    if (withGenres?.length) {
      httpParams = httpParams.set('with_genres', withGenres.join('|'));
    }
    if (withWatchProviders?.length) {
      httpParams = httpParams.set('with_watch_providers', withWatchProviders.join('|'));
      // flatrate = subscription streaming; without this TMDB includes rent/buy too, making the filter ineffective
      httpParams = httpParams.set('with_watch_monetization_types', 'flatrate');
    }
    if (watchRegion ?? this.config.region) {
      httpParams = httpParams.set('watch_region', watchRegion ?? this.config.region);
    }
    if (voteAverageGte !== undefined) {
      httpParams = httpParams.set('vote_average.gte', voteAverageGte.toString());
    }

    return this.http
      .get<
        TmdbDiscoverResponse<TmdbMovie | TmdbTvShow>
      >(`${this.config.baseUrl}/discover/${mediaType}`, { headers: this.authHeaders, params: httpParams })
      .pipe(
        retry(RETRY_COUNT),
        catchError((e) => this.handleError(e)),
      );
  }

  getMovieDetail(id: number): Observable<TmdbMovieDetail> {
    return this.http
      .get<TmdbMovieDetail>(`${this.config.baseUrl}/movie/${id}`, {
        headers: this.authHeaders,
        params: new HttpParams()
          .set('language', 'it-IT')
          .set('append_to_response', 'credits,videos,watch/providers')
          .set('watch_region', this.config.region),
      })
      .pipe(
        retry(RETRY_COUNT),
        catchError((e) => this.handleError(e)),
      );
  }

  getTvDetail(id: number): Observable<TmdbTvDetail> {
    return this.http
      .get<TmdbTvDetail>(`${this.config.baseUrl}/tv/${id}`, {
        headers: this.authHeaders,
        params: new HttpParams()
          .set('language', 'it-IT')
          .set('append_to_response', 'credits,videos,watch/providers')
          .set('watch_region', this.config.region),
      })
      .pipe(
        retry(RETRY_COUNT),
        catchError((e) => this.handleError(e)),
      );
  }

  search(params: TmdbSearchParams): Observable<TmdbDiscoverResponse<TmdbMovie | TmdbTvShow>> {
    const { mediaType, query, page = 1 } = params;
    const httpParams = new HttpParams()
      .set('query', query)
      .set('language', 'it-IT')
      .set('page', page.toString());

    return this.http
      .get<
        TmdbDiscoverResponse<TmdbMovie | TmdbTvShow>
      >(`${this.config.baseUrl}/search/${mediaType}`, { headers: this.authHeaders, params: httpParams })
      .pipe(
        retry(RETRY_COUNT),
        catchError((e) => this.handleError(e)),
      );
  }
}
