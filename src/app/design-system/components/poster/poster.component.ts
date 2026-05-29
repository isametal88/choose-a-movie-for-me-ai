import { Component, computed, input, signal } from '@angular/core';

@Component({
  selector: 'ds-poster',
  template: `
    <div
      class="ds-poster"
      [class.ds-poster--loading]="loading()"
      [class.ds-poster--error]="hasError()"
    >
      @if (!hasError()) {
        <img
          [src]="src()"
          [alt]="alt()"
          loading="lazy"
          class="ds-poster__img"
          (load)="onLoad()"
          (error)="onError()"
        />
      }
      @if (loading()) {
        <div class="ds-poster__placeholder" aria-hidden="true">
          <span class="ds-poster__shimmer"></span>
        </div>
      }
      @if (hasError()) {
        <div class="ds-poster__error-state" [attr.aria-label]="'Poster not available for ' + alt()">
          <span class="ds-poster__error-icon" aria-hidden="true">🎬</span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ds-poster {
        position: relative;
        width: 100%;
        aspect-ratio: 2/3;
        background: var(--color-surface-2);
        border-radius: var(--radius-md);
        overflow: hidden;
      }
      .ds-poster__img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .ds-poster__placeholder {
        position: absolute;
        inset: 0;
        background: var(--color-surface-2);
      }
      .ds-poster__shimmer {
        display: block;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          var(--color-surface-2) 25%,
          var(--color-surface-3, #374151) 50%,
          var(--color-surface-2) 75%
        );
        background-size: 200% 100%;
        animation: shimmer var(--duration-slower, 1.5s) infinite;
      }
      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
      .ds-poster__error-state {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-surface-2);
      }
      .ds-poster__error-icon {
        font-size: var(--font-size-4xl);
      }
    `,
  ],
})
export class PosterComponent {
  readonly src = input.required<string>();
  readonly alt = input.required<string>();

  protected readonly loading = signal(true);
  protected readonly hasError = signal(false);

  protected readonly isReady = computed(() => !this.loading() && !this.hasError());

  onLoad(): void {
    this.loading.set(false);
  }

  onError(): void {
    this.loading.set(false);
    this.hasError.set(true);
  }
}
