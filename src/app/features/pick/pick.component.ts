import { SlicePipe } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PosterComponent } from '../../design-system/components/poster/poster.component';
import { RatingComponent } from '../../design-system/components/rating/rating.component';
import { ButtonComponent } from '../../design-system/primitives/button/button.component';
import { SpinnerComponent } from '../../design-system/primitives/spinner/spinner.component';
import { DiscoverSelectionService } from '../../core/selection/discover-selection.service';
import { SeenTitlesService } from '../../core/selection/seen-titles.service';
import { SpatialNavZoneDirective } from '../../core/spatial-navigation/spatial-nav-zone.directive';
import { TmdbConfigService } from '../../core/tmdb/tmdb-config.service';
import { CriteriaStore } from '../criteria/criteria.store';

@Component({
  selector: 'app-pick',
  imports: [
    RouterLink,
    SlicePipe,
    ButtonComponent,
    SpinnerComponent,
    PosterComponent,
    RatingComponent,
    SpatialNavZoneDirective,
  ],
  template: `
    <main class="pick-screen" appSpatialNavZone>
      @switch (service.state().status) {
        @case ('loading') {
          <div class="pick-screen__loading" aria-live="polite" aria-busy="true">
            <ds-spinner size="lg" />
            <p class="pick-screen__loading-text">Sto cercando…</p>
          </div>
        }

        @case ('picked') {
          @if (pickedItem(); as item) {
            <article class="pick-screen__result" aria-label="Titolo scelto">
              <!-- Poster column -->
              <div class="pick-screen__poster-col">
                @if (posterUrl(item.posterPath); as url) {
                  <ds-poster [src]="url" [alt]="item.title" />
                }
              </div>

              <!-- Info column -->
              <div class="pick-screen__info-col">
                <p class="pick-screen__label">La tua scelta</p>
                <h1 class="pick-screen__title">{{ item.title }}</h1>
                <div class="pick-screen__meta">
                  <span class="pick-screen__year">{{ item.releaseDate | slice: 0 : 4 }}</span>
                  <ds-rating [value]="item.voteAverage" />
                </div>
                <p class="pick-screen__overview">{{ item.overview }}</p>
                <div class="pick-screen__actions">
                  <ds-button
                    variant="primary"
                    size="lg"
                    [routerLink]="['/detail', item.mediaType, item.id]"
                    >Vedi dettagli</ds-button
                  >
                  <ds-button variant="ghost" (click)="showAnother()"
                    >Già visto? Mostrami un altro</ds-button
                  >
                  <ds-button variant="secondary" routerLink="/">Torna ai filtri</ds-button>
                </div>
              </div>
            </article>
          }
        }

        @case ('search_results') {
          <div class="pick-screen__search-results">
            <header class="pick-screen__search-header">
              <h1 class="pick-screen__search-title">Risultati per "{{ searchQuery() }}"</h1>
              <p class="pick-screen__search-note">
                In ordine di rilevanza · Seleziona un titolo per i dettagli
              </p>
            </header>
            <div class="pick-screen__search-grid" role="list">
              @for (item of searchItems(); track item.id) {
                <a
                  class="pick-screen__search-item"
                  role="listitem"
                  [routerLink]="['/detail', item.mediaType, item.id]"
                  [attr.aria-label]="item.title"
                >
                  @if (posterUrl(item.posterPath); as url) {
                    <ds-poster [src]="url" [alt]="item.title" />
                  } @else {
                    <div class="pick-screen__search-placeholder">{{ item.title }}</div>
                  }
                  <p class="pick-screen__search-item-title">{{ item.title }}</p>
                </a>
              }
            </div>
            <div class="pick-screen__search-footer">
              <ds-button variant="secondary" routerLink="/">Torna ai filtri</ds-button>
            </div>
          </div>
        }

        @case ('empty') {
          <div class="pick-screen__state" aria-live="polite">
            <h1 class="pick-screen__state-heading">Nessun risultato</h1>
            <p class="pick-screen__state-message">Nessun titolo con i filtri selezionati.</p>
            <ds-button variant="primary" routerLink="/">Modifica filtri</ds-button>
          </div>
        }

        @case ('exhausted') {
          <div class="pick-screen__state" aria-live="polite">
            <h1 class="pick-screen__state-heading">Tutto visto!</h1>
            <p class="pick-screen__state-message">Hai già visto tutto in questa categoria!</p>
            <div class="pick-screen__actions">
              <ds-button variant="primary" (click)="resetAndPick()">Ricomincia</ds-button>
              <ds-button variant="secondary" routerLink="/">Torna ai filtri</ds-button>
            </div>
          </div>
        }

        @case ('error') {
          <div class="pick-screen__state" aria-live="polite" role="alert">
            <h1 class="pick-screen__state-heading">Qualcosa è andato storto</h1>
            <p class="pick-screen__state-message">{{ errorMessage() }}</p>
            <div class="pick-screen__actions">
              <ds-button variant="primary" (click)="retry()">Riprova</ds-button>
              <ds-button variant="secondary" routerLink="/">Torna ai filtri</ds-button>
            </div>
          </div>
        }

        @default {
          <!-- idle: transitional state while ngOnInit fires pick() -->
        }
      }
    </main>
  `,
  styles: [
    `
      /* ── Shell ────────────────────────────────────────────────── */

      .pick-screen {
        max-width: 1100px;
        margin: 0 auto;
        padding: var(--sp-6) var(--sp-5);
        min-height: 70vh;
      }

      @media (min-width: 600px) {
        .pick-screen {
          padding: var(--sp-7) var(--sp-6);
        }
      }

      /* ── Loading ──────────────────────────────────────────────── */

      .pick-screen__loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--sp-5);
        padding-top: var(--sp-8);
      }

      .pick-screen__loading-text {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: var(--font-size-h3);
        font-weight: var(--font-weight-semibold);
      }

      /* ── Picked result ────────────────────────────────────────── */

      .pick-screen__result {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--sp-5);
      }

      @media (min-width: 640px) {
        .pick-screen__result {
          grid-template-columns: 220px 1fr;
          gap: var(--sp-6);
          align-items: start;
        }
      }

      .pick-screen__poster-col {
        max-width: 220px;
      }

      @media (min-width: 640px) {
        .pick-screen__poster-col {
          max-width: none;
        }
      }

      /* Orange eyebrow label — "La tua scelta" */
      .pick-screen__label {
        font-size: var(--font-size-caption);
        font-weight: var(--font-weight-extrabold);
        letter-spacing: var(--letter-spacing-widest);
        text-transform: uppercase;
        color: var(--orange-500);
        margin: 0 0 var(--sp-2);
      }

      /* Title band — navy-600 on navy stage */
      .pick-screen__title {
        background: var(--navy-600);
        border-radius: var(--r-xs);
        padding: var(--sp-3) var(--sp-4);
        font-size: var(--font-size-display);
        font-weight: var(--font-weight-extrabold);
        margin: 0 0 var(--sp-3);
        line-height: var(--line-height-tight);
        color: var(--white);
      }

      /* Info strip — navy-600 */
      .pick-screen__meta {
        display: flex;
        align-items: center;
        gap: var(--sp-4);
        margin-bottom: var(--sp-4);
        flex-wrap: wrap;
        background: var(--navy-600);
        border-radius: var(--r-xs);
        padding: var(--sp-2) var(--sp-4);
      }

      .pick-screen__year {
        font-size: var(--font-size-ui);
        color: var(--white);
        font-weight: var(--font-weight-semibold);
      }

      .pick-screen__overview {
        color: var(--color-text-secondary);
        line-height: var(--line-height-relaxed);
        margin: 0 0 var(--sp-6);
        font-size: var(--font-size-body);
      }

      .pick-screen__actions {
        display: flex;
        gap: var(--sp-3);
        flex-wrap: wrap;
      }

      /* ── Search results grid ──────────────────────────────────── */

      .pick-screen__search-results {
        width: 100%;
      }

      .pick-screen__search-header {
        margin-bottom: var(--sp-5);
      }

      .pick-screen__search-title {
        font-size: var(--font-size-h1);
        font-weight: var(--font-weight-extrabold);
        margin: 0 0 var(--sp-2);
        letter-spacing: var(--letter-spacing-tight);
      }

      .pick-screen__search-note {
        font-size: var(--font-size-caption);
        color: var(--color-text-muted);
        margin: 0;
      }

      .pick-screen__search-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: var(--sp-4);
        margin-bottom: var(--sp-5);
      }

      .pick-screen__search-item {
        display: flex;
        flex-direction: column;
        gap: var(--sp-2);
        text-decoration: none;
        color: inherit;
        transition: transform var(--transition-fast);
      }

      .pick-screen__search-item:hover {
        transform: scale(1.03);
      }

      .pick-screen__search-item:focus-visible {
        outline: var(--focus-ring-width) solid var(--color-focus-ring);
        outline-offset: var(--focus-ring-offset);
      }

      .pick-screen__search-item-title {
        font-size: var(--font-size-caption);
        font-weight: var(--font-weight-semibold);
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .pick-screen__search-placeholder {
        aspect-ratio: 11/16;
        background: var(--navy-700);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-caption);
        color: var(--color-text-secondary);
        padding: var(--sp-2);
        text-align: center;
      }

      .pick-screen__search-footer {
        padding-top: var(--sp-4);
      }

      /* ── Empty / exhausted / error ───────────────────────────── */

      .pick-screen__state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--sp-4);
        padding-top: var(--sp-8);
        width: 100%;
        text-align: center;
      }

      .pick-screen__state-heading {
        margin: 0;
        font-size: var(--font-size-display);
        font-weight: var(--font-weight-extrabold);
        letter-spacing: var(--letter-spacing-tight);
        line-height: var(--line-height-tight);
      }

      .pick-screen__state-message {
        font-size: var(--font-size-h3);
        color: var(--color-text-secondary);
        max-width: 440px;
        margin: 0;
        line-height: var(--line-height-relaxed);
      }
    `,
  ],
})
export class PickComponent implements OnInit {
  protected readonly service = inject(DiscoverSelectionService);
  protected readonly store = inject(CriteriaStore);
  private readonly seen = inject(SeenTitlesService);
  private readonly config = inject(TmdbConfigService);

  protected readonly pickedItem = computed(() => {
    const s = this.service.state();
    return s.status === 'picked' ? s.item : null;
  });

  protected readonly searchItems = computed(() => {
    const s = this.service.state();
    return s.status === 'search_results' ? s.items : [];
  });

  protected readonly searchQuery = computed(() => this.store.query());

  protected readonly errorMessage = computed(() => {
    const s = this.service.state();
    return s.status === 'error' ? s.message : null;
  });

  ngOnInit(): void {
    this.service.pick(this.store.selectionCriteria());
  }

  protected showAnother(): void {
    this.service.pickAnother();
  }

  protected resetAndPick(): void {
    this.seen.clear();
    this.service.pick(this.store.selectionCriteria());
  }

  protected retry(): void {
    this.service.pick(this.store.selectionCriteria());
  }

  protected posterUrl(path: string | null): string | null {
    return path ? this.config.imageUrl(path, 'w342') : null;
  }
}
