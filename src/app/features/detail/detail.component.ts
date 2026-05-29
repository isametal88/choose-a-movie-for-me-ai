import { SlicePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { BadgeComponent } from '../../design-system/components/badge/badge.component';
import { PosterComponent } from '../../design-system/components/poster/poster.component';
import { RatingComponent } from '../../design-system/components/rating/rating.component';
import { ButtonComponent } from '../../design-system/primitives/button/button.component';
import { SpinnerComponent } from '../../design-system/primitives/spinner/spinner.component';
import { DetailService } from '../../core/detail/detail.service';
import { MediaDetail, CrewMember } from '../../core/detail/detail.models';
import { TmdbConfigService } from '../../core/tmdb/tmdb-config.service';
import { SpatialNavZoneDirective } from '../../core/spatial-navigation/spatial-nav-zone.directive';
import { TrailerComponent } from './trailer.component';
import { ProvidersComponent } from './providers.component';

type DetailState =
  | { status: 'loading' }
  | { status: 'loaded'; detail: MediaDetail }
  | { status: 'error'; message: string };

@Component({
  selector: 'app-detail',
  imports: [
    RouterLink,
    SlicePipe,
    BadgeComponent,
    PosterComponent,
    RatingComponent,
    ButtonComponent,
    SpinnerComponent,
    TrailerComponent,
    ProvidersComponent,
    SpatialNavZoneDirective,
  ],
  template: `
    <main class="detail-screen" appSpatialNavZone>
      @switch (state().status) {
        @case ('loading') {
          <div class="detail-screen__loading" aria-live="polite" aria-busy="true">
            <ds-spinner size="lg" />
            <p class="detail-screen__loading-text">Caricamento…</p>
          </div>
        }

        @case ('loaded') {
          @if (detail(); as item) {
            <!-- Full-bleed backdrop -->
            @if (imageUrl(item.backdropPath, 'original'); as backdropUrl) {
              <div class="detail-screen__backdrop" aria-hidden="true">
                <img [src]="backdropUrl" alt="" class="detail-screen__backdrop-img" />
                <div class="detail-screen__backdrop-overlay"></div>
              </div>
            }

            <article class="detail-screen__content" [attr.aria-label]="item.title">
              <!-- Three-column layout: poster | info | right-col -->
              <div class="detail-screen__main">
                <!-- Poster -->
                <aside class="detail-screen__poster-col" aria-hidden="true">
                  @if (imageUrl(item.posterPath, 'w342'); as posterUrl) {
                    <ds-poster [src]="posterUrl" [alt]="item.title" />
                  }
                </aside>

                <!-- Info -->
                <div class="detail-screen__info-col">
                  <p class="detail-screen__media-type-label">
                    {{ item.mediaType === 'movie' ? 'Film' : 'Serie TV' }}
                  </p>
                  <h1 class="detail-screen__title">{{ item.title }}</h1>

                  <div class="detail-screen__meta">
                    <span class="detail-screen__year">{{ item.releaseDate | slice: 0 : 4 }}</span>
                    @if (formatRuntime(item.runtime); as rt) {
                      <span class="detail-screen__runtime">{{ rt }}</span>
                    }
                    <ds-rating [value]="item.voteAverage" />
                  </div>

                  @if (item.genres.length > 0) {
                    <div class="detail-screen__genres" aria-label="Generi">
                      @for (genre of item.genres; track genre.id) {
                        <ds-badge>{{ genre.name }}</ds-badge>
                      }
                    </div>
                  }

                  <p class="detail-screen__overview">{{ item.overview }}</p>

                  @if (item.crew.length > 0) {
                    <div class="detail-screen__crew">
                      <h2 class="detail-screen__section-title">
                        {{ item.mediaType === 'movie' ? 'Regia' : 'Ideato da' }}
                      </h2>
                      <p class="detail-screen__crew-names">{{ crewNames(item.crew) }}</p>
                    </div>
                  }

                  <div class="detail-screen__actions">
                    <ds-button variant="secondary" routerLink="/">Torna ai filtri</ds-button>
                  </div>
                </div>

                <!-- Right column: trailer + providers -->
                <div class="detail-screen__right-col">
                  @if (item.trailerKey) {
                    <div class="detail-screen__trailer">
                      <h2 class="detail-screen__section-title">Trailer</h2>
                      <app-trailer [trailerKey]="item.trailerKey" />
                    </div>
                  }

                  @if (item.watchProviders) {
                    <div class="detail-screen__providers-inline">
                      <h2 class="detail-screen__section-title">Dove guardarlo</h2>
                      <app-providers [watchProviders]="item.watchProviders" [title]="item.title" />
                    </div>
                  }
                </div>
              </div>
              <!-- /.detail-screen__main -->

              @if (item.cast.length > 0) {
                <section class="detail-screen__cast" aria-labelledby="cast-heading">
                  <h2 id="cast-heading" class="detail-screen__section-title">Cast</h2>
                  <ul class="detail-screen__cast-list" role="list">
                    @for (member of item.cast; track member.id) {
                      <li class="detail-screen__cast-member">
                        <span class="detail-screen__cast-name">{{ member.name }}</span>
                        @if (member.character) {
                          <span class="detail-screen__cast-character">{{ member.character }}</span>
                        }
                      </li>
                    }
                  </ul>
                </section>
              }
            </article>
          }
        }

        @case ('error') {
          <div class="detail-screen__state" aria-live="polite" role="alert">
            <h1 class="detail-screen__state-heading">Qualcosa è andato storto</h1>
            <p class="detail-screen__error">{{ errorMessage() }}</p>
            <div class="detail-screen__actions">
              <ds-button variant="primary" (click)="retry()">Riprova</ds-button>
              <ds-button variant="secondary" routerLink="/">Torna ai filtri</ds-button>
            </div>
          </div>
        }
      }
    </main>
  `,
  styles: [
    `
      /* ── Shell ────────────────────────────────────────────────── */

      .detail-screen {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 0 var(--space-12);
        min-height: 60vh;
        position: relative;
      }

      /* ── Loading ──────────────────────────────────────────────── */

      .detail-screen__loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-4);
        padding-top: var(--space-16);
      }

      .detail-screen__loading-text {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-regular);
      }

      /* ── Backdrop ─────────────────────────────────────────────── */

      .detail-screen__backdrop {
        position: relative;
        width: 100%;
        height: 300px;
        overflow: hidden;
        margin-bottom: 0;
      }

      .detail-screen__backdrop-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .detail-screen__backdrop-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          to bottom,
          rgba(14, 27, 42, 0.3) 0%,
          rgba(14, 27, 42, 0.85) 80%,
          var(--color-bg-base) 100%
        );
      }

      /* ── Article ──────────────────────────────────────────────── */

      .detail-screen__content {
        padding: var(--space-6);
      }

      /* ── Three-column main ────────────────────────────────────── */

      .detail-screen__main {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--space-6);
      }

      @media (min-width: 640px) {
        .detail-screen__main {
          grid-template-columns: 200px 1fr;
        }
        .detail-screen__right-col {
          grid-column: 1 / -1;
        }
      }

      @media (min-width: 960px) {
        .detail-screen__main {
          grid-template-columns: 220px 1fr 280px;
          gap: var(--space-8);
          align-items: start;
        }
        .detail-screen__right-col {
          grid-column: auto;
        }
      }

      .detail-screen__poster-col {
        position: relative;
        top: -60px; /* overlap the backdrop */
        margin-bottom: -60px;
      }

      @media (min-width: 960px) {
        .detail-screen__poster-col {
          top: -80px;
          margin-bottom: -80px;
        }
      }

      /* ── Info column ──────────────────────────────────────────── */

      .detail-screen__media-type-label {
        font-family: var(--font-family-display);
        font-size: var(--font-size-xs);
        font-weight: 700;
        letter-spacing: var(--letter-spacing-widest);
        text-transform: uppercase;
        color: var(--color-brand-500);
        margin: 0 0 var(--space-2);
      }

      .detail-screen__title {
        font-size: var(--font-size-4xl);
        font-weight: var(--font-weight-bold);
        margin: 0 0 var(--space-3);
        line-height: var(--line-height-tight);
      }

      .detail-screen__meta {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        margin-bottom: var(--space-4);
        flex-wrap: wrap;
      }

      .detail-screen__year,
      .detail-screen__runtime {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        font-weight: var(--font-weight-medium);
      }

      .detail-screen__genres {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
        margin-bottom: var(--space-5);
      }

      .detail-screen__overview {
        color: var(--color-text-secondary);
        line-height: var(--line-height-relaxed);
        margin: 0 0 var(--space-6);
        font-size: var(--font-size-md);
      }

      .detail-screen__section-title {
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-widest);
        margin: 0 0 var(--space-3);
      }

      .detail-screen__crew {
        margin-bottom: var(--space-5);
      }

      .detail-screen__crew-names {
        margin: 0;
        color: var(--color-text-primary);
        font-weight: var(--font-weight-medium);
      }

      .detail-screen__actions {
        display: flex;
        gap: var(--space-3);
        flex-wrap: wrap;
        margin-top: var(--space-4);
      }

      /* ── Right column ─────────────────────────────────────────── */

      .detail-screen__right-col {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
      }

      .detail-screen__trailer,
      .detail-screen__providers-inline {
        /* inherits section-title margin */
      }

      /* ── Cast ─────────────────────────────────────────────────── */

      .detail-screen__cast {
        border-top: 1px solid var(--color-border);
        padding-top: var(--space-6);
        margin-top: var(--space-8);
      }

      .detail-screen__cast-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: var(--space-3);
      }

      .detail-screen__cast-member {
        display: flex;
        flex-direction: column;
      }

      .detail-screen__cast-name {
        font-weight: var(--font-weight-medium);
        color: var(--color-text-primary);
      }

      .detail-screen__cast-character {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
      }

      /* ── Error / state ────────────────────────────────────────── */

      .detail-screen__state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-4);
        padding-top: var(--space-16);
        text-align: center;
        padding-inline: var(--space-6);
      }

      .detail-screen__state-heading {
        margin: 0;
        font-family: var(--font-family-display);
        font-size: var(--font-size-3xl);
        font-weight: 700;
        letter-spacing: var(--letter-spacing-wide);
      }

      .detail-screen__error {
        font-size: var(--font-size-lg);
        color: var(--color-text-secondary);
        margin: 0;
      }
    `,
  ],
})
export class DetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly detailService = inject(DetailService);
  private readonly config = inject(TmdbConfigService);

  protected readonly state = signal<DetailState>({ status: 'loading' });

  protected readonly detail = computed(() => {
    const s = this.state();
    return s.status === 'loaded' ? s.detail : null;
  });

  protected readonly errorMessage = computed(() => {
    const s = this.state();
    return s.status === 'error' ? s.message : null;
  });

  private sub = new Subscription();

  ngOnInit(): void {
    this.loadDetail();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  protected retry(): void {
    this.loadDetail();
  }

  private loadDetail(): void {
    const mediaType = this.route.snapshot.paramMap.get('mediaType') as 'movie' | 'tv';
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const detail$ =
      mediaType === 'movie'
        ? this.detailService.getMovieDetail(id)
        : this.detailService.getTvDetail(id);
    this.state.set({ status: 'loading' });
    this.sub.unsubscribe();
    this.sub = new Subscription();
    this.sub.add(
      detail$.subscribe({
        next: (detail) => this.state.set({ status: 'loaded', detail }),
        error: (err: Error) => this.state.set({ status: 'error', message: err.message }),
      }),
    );
  }

  protected imageUrl(path: string | null, size: string): string | null {
    return path ? this.config.imageUrl(path, size) : null;
  }

  protected formatRuntime(minutes: number | null): string | null {
    if (!minutes) return null;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  protected crewNames(crew: CrewMember[]): string {
    return crew.map((c) => c.name).join(', ');
  }
}
