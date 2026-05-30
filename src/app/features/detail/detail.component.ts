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
        padding: 0 0 var(--sp-7);
        min-height: 60vh;
        position: relative;
      }

      /* ── Loading ──────────────────────────────────────────────── */

      .detail-screen__loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--sp-4);
        padding-top: var(--sp-8);
      }

      .detail-screen__loading-text {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: var(--font-size-h3);
        font-weight: var(--font-weight-regular);
      }

      /* ── Backdrop ─────────────────────────────────────────────── */

      .detail-screen__backdrop {
        position: relative;
        width: 100%;
        height: 300px;
        overflow: hidden;
      }

      .detail-screen__backdrop-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        opacity: 0.3;
      }

      .detail-screen__backdrop-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, transparent 0%, var(--navy-900) 100%);
      }

      /* ── Article ──────────────────────────────────────────────── */

      .detail-screen__content {
        padding: var(--sp-5) var(--sp-5) 0;
      }

      @media (min-width: 600px) {
        .detail-screen__content {
          padding: var(--sp-5) var(--sp-6) 0;
        }
      }

      /* ── Three-column main ────────────────────────────────────── */

      .detail-screen__main {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--sp-5);
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
          grid-template-columns: 220px 1fr 300px;
          gap: var(--sp-6);
          align-items: start;
        }
        .detail-screen__right-col {
          grid-column: auto;
        }
      }

      .detail-screen__poster-col {
        position: relative;
        top: -60px;
        margin-bottom: -60px;
        box-shadow: var(--shadow-poster);
      }

      @media (min-width: 960px) {
        .detail-screen__poster-col {
          top: -80px;
          margin-bottom: -80px;
        }
      }

      /* ── Info column ──────────────────────────────────────────── */

      /* Orange eyebrow label */
      .detail-screen__media-type-label {
        font-size: var(--font-size-caption);
        font-weight: var(--font-weight-extrabold);
        letter-spacing: var(--letter-spacing-widest);
        text-transform: uppercase;
        color: var(--orange-500);
        margin: 0 0 var(--sp-2);
      }

      /* Title band — navy-600 on stage */
      .detail-screen__title {
        background: var(--navy-600);
        border-radius: var(--r-xs);
        padding: var(--sp-3) var(--sp-4);
        font-size: var(--font-size-display);
        font-weight: var(--font-weight-extrabold);
        margin: 0 0 var(--sp-3);
        line-height: var(--line-height-tight);
        color: var(--white);
        letter-spacing: var(--letter-spacing-tight);
      }

      /* Info strip — navy-600 */
      .detail-screen__meta {
        display: flex;
        align-items: center;
        gap: var(--sp-4);
        margin-bottom: var(--sp-3);
        flex-wrap: wrap;
        background: var(--navy-600);
        border-radius: var(--r-xs);
        padding: var(--sp-2) var(--sp-4);
      }

      .detail-screen__year,
      .detail-screen__runtime {
        font-size: var(--font-size-ui);
        color: var(--white);
        font-weight: var(--font-weight-semibold);
      }

      .detail-screen__genres {
        display: flex;
        flex-wrap: wrap;
        gap: var(--sp-2);
        margin-bottom: var(--sp-4);
      }

      .detail-screen__overview {
        color: var(--color-text-secondary);
        line-height: var(--line-height-relaxed);
        margin: 0 0 var(--sp-5);
        font-size: var(--font-size-body);
      }

      .detail-screen__section-title {
        font-size: var(--font-size-caption);
        font-weight: var(--font-weight-extrabold);
        color: var(--orange-500);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-widest);
        margin: 0 0 var(--sp-3);
      }

      .detail-screen__crew {
        margin-bottom: var(--sp-4);
      }

      .detail-screen__crew-names {
        margin: 0;
        color: var(--color-text-primary);
        font-weight: var(--font-weight-semibold);
      }

      .detail-screen__actions {
        display: flex;
        gap: var(--sp-3);
        flex-wrap: wrap;
        margin-top: var(--sp-4);
      }

      /* ── Right column ─────────────────────────────────────────── */

      .detail-screen__right-col {
        display: flex;
        flex-direction: column;
        gap: var(--sp-5);
      }

      /* ── Cast — white info card ───────────────────────────────── */

      .detail-screen__cast {
        padding: var(--sp-5) var(--sp-5);
        margin-top: var(--sp-6);
        background: var(--color-bg-card);
        border-radius: var(--r-md);
        box-shadow: var(--shadow-card);
      }

      .detail-screen__cast .detail-screen__section-title {
        color: var(--ink-900);
      }

      .detail-screen__cast-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: var(--sp-3);
      }

      .detail-screen__cast-member {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: var(--sp-2) 0;
        border-top: 1px solid #f1f3f4;
      }

      .detail-screen__cast-name {
        font-weight: var(--font-weight-semibold);
        color: var(--ink-900);
        font-size: var(--font-size-body);
      }

      .detail-screen__cast-character {
        font-size: var(--font-size-caption);
        color: var(--ink-600);
      }

      /* ── Error / state ────────────────────────────────────────── */

      .detail-screen__state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--sp-4);
        padding-top: var(--sp-8);
        text-align: center;
        padding-inline: var(--sp-5);
      }

      .detail-screen__state-heading {
        margin: 0;
        font-size: var(--font-size-display);
        font-weight: var(--font-weight-extrabold);
        letter-spacing: var(--letter-spacing-tight);
        line-height: var(--line-height-tight);
      }

      .detail-screen__error {
        font-size: var(--font-size-h3);
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
