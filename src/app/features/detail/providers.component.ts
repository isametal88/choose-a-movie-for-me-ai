import { Component, inject, input } from '@angular/core';
import { WatchProviderItem, WatchProviders } from '../../core/detail/detail.models';
import { ProviderDeepLinkService } from '../../core/providers/provider-deep-link.service';
import { TmdbConfigService } from '../../core/tmdb/tmdb-config.service';
import { WebProviderLauncherService } from '../../core/platform/web-provider-launcher.service';

@Component({
  selector: 'app-providers',
  template: `
    @if (watchProviders()) {
      <section class="providers" aria-labelledby="providers-heading">
        <h2 id="providers-heading" class="providers__title">Where to watch</h2>

        @if (watchProviders()!.flatrate.length > 0) {
          <div class="providers__group">
            <h3 class="providers__group-title">Stream</h3>
            <ul class="providers__list" role="list">
              @for (provider of watchProviders()!.flatrate; track provider.id) {
                <li>
                  <button
                    class="providers__item"
                    (click)="launch(provider)"
                    [attr.aria-label]="'Watch on ' + provider.name"
                  >
                    <img
                      [src]="logoUrl(provider.logoPath)"
                      [alt]="provider.name"
                      class="providers__logo"
                      loading="lazy"
                    />
                    <span class="providers__name">{{ provider.name }}</span>
                  </button>
                </li>
              }
            </ul>
          </div>
        }

        @if (watchProviders()!.rent.length > 0) {
          <div class="providers__group">
            <h3 class="providers__group-title">Rent</h3>
            <ul class="providers__list" role="list">
              @for (provider of watchProviders()!.rent; track provider.id) {
                <li>
                  <button
                    class="providers__item"
                    (click)="launch(provider)"
                    [attr.aria-label]="'Rent on ' + provider.name"
                  >
                    <img
                      [src]="logoUrl(provider.logoPath)"
                      [alt]="provider.name"
                      class="providers__logo"
                      loading="lazy"
                    />
                    <span class="providers__name">{{ provider.name }}</span>
                  </button>
                </li>
              }
            </ul>
          </div>
        }

        @if (watchProviders()!.buy.length > 0) {
          <div class="providers__group">
            <h3 class="providers__group-title">Buy</h3>
            <ul class="providers__list" role="list">
              @for (provider of watchProviders()!.buy; track provider.id) {
                <li>
                  <button
                    class="providers__item"
                    (click)="launch(provider)"
                    [attr.aria-label]="'Buy on ' + provider.name"
                  >
                    <img
                      [src]="logoUrl(provider.logoPath)"
                      [alt]="provider.name"
                      class="providers__logo"
                      loading="lazy"
                    />
                    <span class="providers__name">{{ provider.name }}</span>
                  </button>
                </li>
              }
            </ul>
          </div>
        }

        @if (watchProviders()!.link) {
          <a
            [href]="watchProviders()!.link"
            target="_blank"
            rel="noopener noreferrer"
            class="providers__justwatch"
            >Browse all on JustWatch</a
          >
        }
      </section>
    }
  `,
  styles: [
    `
      .providers__title {
        font-size: var(--font-size-caption);
        font-weight: var(--font-weight-extrabold);
        color: var(--orange-500);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-widest);
        margin: 0 0 var(--sp-3);
      }

      .providers__group {
        margin-bottom: var(--sp-4);
      }

      .providers__group-title {
        font-size: var(--font-size-caption);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: var(--letter-spacing-wide);
        margin: 0 0 var(--sp-2);
      }

      .providers__list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-wrap: wrap;
        gap: var(--sp-2);
      }

      .providers__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--sp-1);
        background: var(--navy-600);
        border: none;
        border-radius: var(--r-xs);
        padding: var(--sp-2) var(--sp-3);
        cursor: pointer;
        min-width: 64px;
        text-align: center;
        font-family: var(--font-family-base);
        transition: background var(--transition-fast);
      }

      .providers__item:hover {
        background: var(--navy-700);
      }

      .providers__item:focus-visible {
        outline: var(--focus-ring-width) solid var(--color-focus-ring);
        outline-offset: var(--focus-ring-offset);
      }

      .providers__logo {
        width: 40px;
        height: 40px;
        border-radius: var(--r-xs);
        object-fit: cover;
      }

      .providers__name {
        font-size: var(--font-size-caption);
        color: var(--color-text-primary);
        max-width: 72px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .providers__justwatch {
        display: inline-block;
        font-size: var(--font-size-caption);
        color: var(--color-text-muted);
        margin-top: var(--sp-2);
        text-decoration: underline;
        text-underline-offset: 3px;
      }

      .providers__justwatch:focus-visible {
        outline: var(--focus-ring-width) solid var(--color-focus-ring);
        outline-offset: var(--focus-ring-offset);
      }
    `,
  ],
})
export class ProvidersComponent {
  private readonly deepLink = inject(ProviderDeepLinkService);
  private readonly launcher = inject(WebProviderLauncherService);
  private readonly config = inject(TmdbConfigService);

  readonly watchProviders = input<WatchProviders | null>(null);
  readonly title = input('');

  protected logoUrl(path: string): string {
    return this.config.imageUrl(path, 'w45') ?? '';
  }

  protected launch(provider: WatchProviderItem): void {
    const payload = this.deepLink.build(provider.id, this.title(), this.watchProviders()?.link);
    this.launcher.launch(payload);
  }
}
