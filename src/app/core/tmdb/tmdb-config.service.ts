import { Injectable, inject } from '@angular/core';
import { ENVIRONMENT } from '../../shared/environment.token';
import { detectRegion } from './detect-region';

@Injectable({ providedIn: 'root' })
export class TmdbConfigService {
  private readonly env = inject(ENVIRONMENT);

  readonly baseUrl = 'https://api.themoviedb.org/3' as const;
  readonly imageBaseUrl = 'https://image.tmdb.org/t/p' as const;

  get token(): string {
    return this.env.tmdbToken;
  }

  get region(): string {
    return this.env.tmdbRegion || detectRegion();
  }

  imageUrl(path: string, size = 'w342'): string {
    return `${this.imageBaseUrl}/${size}${path}`;
  }
}
