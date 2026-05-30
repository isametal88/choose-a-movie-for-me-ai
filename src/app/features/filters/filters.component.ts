import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { ChipComponent } from '../../design-system/components/chip/chip.component';
import { SliderComponent } from '../../design-system/components/slider/slider.component';
import { TextFieldComponent } from '../../design-system/components/text-field/text-field.component';
import { ButtonComponent } from '../../design-system/primitives/button/button.component';
import { TmdbClient } from '../../core/tmdb/tmdb.client';
import { TmdbConfigService } from '../../core/tmdb/tmdb-config.service';
import { TmdbWatchProvider } from '../../core/tmdb/tmdb.models';
import { IT_PROVIDER_IDS, IT_PROVIDER_ORDER } from '../../core/providers/it-providers.const';
import { SpatialNavZoneDirective } from '../../core/spatial-navigation/spatial-nav-zone.directive';
import { CriteriaStore } from '../criteria/criteria.store';

@Component({
  selector: 'app-filters',
  imports: [
    ButtonComponent,
    ChipComponent,
    SliderComponent,
    TextFieldComponent,
    SpatialNavZoneDirective,
  ],
  template: `
    <main class="filters-screen" appSpatialNavZone>
      <!-- Search — full-width at top -->
      <section class="filters-screen__search-section" aria-labelledby="search-label">
        <ds-text-field
          label="Cerca per titolo"
          type="search"
          placeholder="es. Inception, Breaking Bad…"
          [value]="store.query()"
          (valueChange)="store.setQuery($event)"
        />
        @if (store.query()) {
          <p class="filters-screen__search-note">
            Con la ricerca testuale gli altri filtri vengono ignorati.
          </p>
        }
      </section>

      <!-- Two-column body: filters left, CTA right -->
      @if (!store.query()) {
        <div class="filters-screen__body">
          <!-- Left: all filter controls -->
          <div class="filters-screen__controls">
            <section class="filters-screen__section" aria-labelledby="media-type-label">
              <h2 id="media-type-label" class="filters-screen__section-title">Tipo</h2>
              <div role="group" aria-label="Tipo di contenuto" class="filters-screen__toggle">
                <ds-button
                  [variant]="store.mediaType() === 'movie' ? 'primary' : 'secondary'"
                  size="sm"
                  [ariaLabel]="store.mediaType() === 'movie' ? 'Film, selezionato' : 'Film'"
                  (click)="store.setMediaType('movie')"
                  >Film</ds-button
                >
                <ds-button
                  [variant]="store.mediaType() === 'tv' ? 'primary' : 'secondary'"
                  size="sm"
                  [ariaLabel]="store.mediaType() === 'tv' ? 'Serie TV, selezionata' : 'Serie TV'"
                  (click)="store.setMediaType('tv')"
                  >Serie TV</ds-button
                >
              </div>
            </section>

            <section class="filters-screen__section" aria-labelledby="genres-label">
              <h2 id="genres-label" class="filters-screen__section-title">Generi</h2>
              <div class="filters-screen__chips" role="group" aria-label="Selezione generi">
                @for (genre of genres(); track genre.id) {
                  <ds-chip
                    [selected]="store.genreIds().includes(genre.id)"
                    [ariaLabel]="genre.name"
                    (selectedChange)="store.toggleGenre(genre.id)"
                    >{{ genre.name }}</ds-chip
                  >
                }
                @if (genres().length === 0) {
                  <span class="filters-screen__loading">Caricamento generi…</span>
                }
              </div>
            </section>

            <section class="filters-screen__section" aria-labelledby="providers-label">
              <h2 id="providers-label" class="filters-screen__section-title">Streaming</h2>
              <div class="filters-screen__chips" role="group" aria-label="Selezione streaming">
                @for (provider of watchProviders(); track provider.provider_id) {
                  <ds-chip
                    [selected]="store.providerIds().includes(provider.provider_id)"
                    [ariaLabel]="provider.provider_name"
                    (selectedChange)="store.toggleProvider(provider.provider_id)"
                  >
                    <img
                      class="filters-screen__provider-logo"
                      [src]="logoUrl(provider.logo_path)"
                      alt=""
                      loading="lazy"
                    />
                    {{ provider.provider_name }}
                  </ds-chip>
                }
                @if (watchProviders().length === 0) {
                  <span class="filters-screen__loading">Caricamento…</span>
                }
              </div>
            </section>

            <section class="filters-screen__section" aria-labelledby="rating-label">
              <h2 id="rating-label" class="filters-screen__section-title">Voto minimo</h2>
              <ds-slider
                label="Voto minimo"
                [min]="0"
                [max]="9"
                [step]="1"
                [value]="store.minRating()"
                (valueChange)="store.setMinRating($event)"
              />
            </section>
          </div>
          <!-- /.filters-screen__controls -->

          <!-- Right: CTA card -->
          <aside class="filters-screen__cta-panel">
            <div class="filters-screen__cta-card">
              <p class="filters-screen__cta-headline">Pronto?</p>
              <p class="filters-screen__cta-sub">Ti scegliamo un titolo in base ai tuoi filtri.</p>
              <ds-button variant="primary" size="lg" (click)="pick()">Scegli per me</ds-button>
              @if (store.hasFilters()) {
                <ds-button variant="ghost" (click)="store.reset()">Azzera filtri</ds-button>
              }
            </div>
          </aside>
        </div>
        <!-- /.filters-screen__body -->
      } @else {
        <!-- When searching: full-width CTA -->
        <div class="filters-screen__search-cta">
          <ds-button variant="primary" size="lg" (click)="pick()">Scegli per me</ds-button>
          @if (store.hasFilters()) {
            <ds-button variant="ghost" (click)="store.reset()">Azzera</ds-button>
          }
        </div>
      }
    </main>
  `,
  styles: [
    `
      .filters-screen {
        max-width: 1100px;
        margin: 0 auto;
        padding: var(--sp-6) var(--sp-5);
      }

      @media (min-width: 600px) {
        .filters-screen {
          padding: var(--sp-7) var(--sp-6);
        }
      }

      /* ── Search bar ─────────────────────────────────────────── */

      .filters-screen__search-section {
        margin-bottom: var(--sp-6);
      }

      .filters-screen__search-note {
        margin: var(--sp-2) 0 0;
        font-size: var(--font-size-caption);
        color: var(--color-text-muted);
        font-style: italic;
      }

      .filters-screen__search-cta {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: var(--sp-3);
        padding-top: var(--sp-4);
      }

      /* ── Two-column body ────────────────────────────────────── */

      .filters-screen__body {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--sp-6);
      }

      @media (min-width: 900px) {
        .filters-screen__body {
          grid-template-columns: 1fr 300px;
          align-items: start;
        }
      }

      /* ── Individual sections ────────────────────────────────── */

      .filters-screen__section {
        margin-bottom: var(--sp-5);
      }

      .filters-screen__section:last-child {
        margin-bottom: 0;
      }

      .filters-screen__section-title {
        font-size: var(--font-size-caption);
        font-weight: var(--font-weight-extrabold);
        color: var(--orange-500);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-widest);
        margin: 0 0 var(--sp-3);
      }

      .filters-screen__toggle {
        display: flex;
        gap: var(--sp-2);
      }

      .filters-screen__chips {
        display: flex;
        flex-wrap: wrap;
        gap: var(--sp-2);
      }

      .filters-screen__loading {
        font-size: var(--font-size-caption);
        color: var(--color-text-muted);
        font-style: italic;
      }

      .filters-screen__provider-logo {
        width: 18px;
        height: 18px;
        border-radius: var(--r-xs);
        object-fit: cover;
        margin-inline-end: var(--sp-1);
        vertical-align: middle;
        flex-shrink: 0;
      }

      /* ── CTA panel (right column) — white card on navy stage ── */

      .filters-screen__cta-panel {
        position: sticky;
        top: calc(var(--sp-8) + var(--sp-4));
      }

      .filters-screen__cta-card {
        background: var(--color-bg-card);
        border-radius: var(--r-md);
        box-shadow: var(--shadow-card);
        padding: var(--sp-6) var(--sp-5);
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: var(--sp-4);
        text-align: center;
      }

      .filters-screen__cta-headline {
        font-family: var(--font-family-base);
        font-size: var(--font-size-h1);
        font-weight: var(--font-weight-extrabold);
        color: var(--ink-900);
        margin: 0;
        letter-spacing: var(--letter-spacing-tight);
      }

      .filters-screen__cta-sub {
        font-size: var(--font-size-body);
        color: var(--ink-600);
        margin: 0;
        line-height: var(--line-height-relaxed);
      }
    `,
  ],
})
export class FiltersComponent {
  protected readonly store = inject(CriteriaStore);
  private readonly router = inject(Router);
  private readonly tmdb = inject(TmdbClient);
  private readonly config = inject(TmdbConfigService);

  private readonly movieGenres = toSignal(this.tmdb.getMovieGenres().pipe(map((r) => r.genres)), {
    initialValue: [],
  });
  private readonly tvGenres = toSignal(this.tmdb.getTvGenres().pipe(map((r) => r.genres)), {
    initialValue: [],
  });
  private readonly movieProviders = toSignal(
    this.tmdb.getWatchProviders('movie').pipe(map((r) => r.results)),
    { initialValue: [] as TmdbWatchProvider[] },
  );
  private readonly tvProviders = toSignal(
    this.tmdb.getWatchProviders('tv').pipe(map((r) => r.results)),
    { initialValue: [] as TmdbWatchProvider[] },
  );

  protected readonly genres = computed(() =>
    this.store.mediaType() === 'movie' ? this.movieGenres() : this.tvGenres(),
  );

  protected readonly watchProviders = computed(() => {
    const raw = this.store.mediaType() === 'movie' ? this.movieProviders() : this.tvProviders();
    return raw
      .filter((p) => IT_PROVIDER_IDS.has(p.provider_id))
      .sort((a, b) => IT_PROVIDER_ORDER[a.provider_id] - IT_PROVIDER_ORDER[b.provider_id]);
  });

  protected logoUrl(path: string): string {
    return this.config.imageUrl(path, 'original');
  }

  protected pick(): void {
    void this.router.navigate(['/pick']);
  }
}
