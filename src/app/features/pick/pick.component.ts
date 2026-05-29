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
        padding: var(--space-8) var(--space-6);
        min-height: 70vh;
      }

      /* ── Loading ──────────────────────────────────────────────── */

      .pick-screen__loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-6);
        padding-top: var(--space-16);
      }

      .pick-screen__loading-text {
        margin: 0;
        color: var(--color-text-secondary);
        font-size: var(--font-size-xl);
        font-weight: var(--font-weight-medium);
      }

      /* ── Picked result ────────────────────────────────────────── */

      .pick-screen__result {
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--space-6);
      }

      @media (min-width: 640px) {
        .pick-screen__result {
          grid-template-columns: 220px 1fr;
          gap: var(--space-8);
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

      .pick-screen__label {
        font-family: var(--font-family-display);
        font-size: var(--font-size-xs);
        font-weight: 700;
        letter-spacing: var(--letter-spacing-widest);
        text-transform: uppercase;
        color: var(--color-brand-500);
        margin: 0 0 var(--space-2);
      }

      .pick-screen__title {
        font-size: var(--font-size-4xl);
        font-weight: var(--font-weight-bold);
        margin: 0 0 var(--space-3);
        line-height: var(--line-height-tight);
      }

      .pick-screen__meta {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        margin-bottom: var(--space-5);
        flex-wrap: wrap;
      }

      .pick-screen__year {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        font-weight: var(--font-weight-medium);
      }

      .pick-screen__overview {
        color: var(--color-text-secondary);
        line-height: var(--line-height-relaxed);
        margin: 0 0 var(--space-8);
        font-size: var(--font-size-md);
      }

      .pick-screen__actions {
        display: flex;
        gap: var(--space-3);
        flex-wrap: wrap;
      }

      /* ── Search results grid ──────────────────────────────────── */

      .pick-screen__search-results {
        width: 100%;
      }

      .pick-screen__search-header {
        margin-bottom: var(--space-6);
      }

      .pick-screen__search-title {
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        margin: 0 0 var(--space-2);
      }

      .pick-screen__search-note {
        font-size: var(--font-size-sm);
        color: var(--color-text-muted);
        margin: 0;
      }

      .pick-screen__search-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: var(--space-4);
        margin-bottom: var(--space-6);
      }

      .pick-screen__search-item {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        text-decoration: none;
        color: inherit;
        border-radius: var(--radius-md);
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
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .pick-screen__search-placeholder {
        aspect-ratio: 2/3;
        background: var(--color-bg-elevated);
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        padding: var(--space-2);
        text-align: center;
      }

      .pick-screen__search-footer {
        padding-top: var(--space-4);
        border-top: 1px solid var(--color-border);
      }

      /* ── Empty / exhausted / error ───────────────────────────── */

      .pick-screen__state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-4);
        padding-top: var(--space-16);
        width: 100%;
        text-align: center;
      }

      .pick-screen__state-heading {
        margin: 0;
        font-family: var(--font-family-display);
        font-size: var(--font-size-3xl);
        font-weight: 700;
        letter-spacing: var(--letter-spacing-wide);
      }

      .pick-screen__state-message {
        font-size: var(--font-size-lg);
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
