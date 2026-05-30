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
          <svg
            class="ds-poster__error-icon"
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <rect x="2" y="6" width="20" height="14" rx="2" />
            <path d="M8 6V4M16 6V4M2 10h20" />
          </svg>
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
        aspect-ratio: 11/16;
        background: var(--navy-800);
        border-radius: 0;
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
        background: repeating-linear-gradient(
          135deg,
          var(--navy-800),
          var(--navy-800) 12px,
          var(--navy-700) 12px,
          var(--navy-700) 24px
        );
      }
      .ds-poster__shimmer {
        display: block;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent 25%,
          rgba(255, 255, 255, 0.04) 50%,
          transparent 75%
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
        background: repeating-linear-gradient(
          135deg,
          var(--navy-800),
          var(--navy-800) 12px,
          var(--navy-700) 12px,
          var(--navy-700) 24px
        );
      }
      .ds-poster__error-icon {
        width: 48px;
        height: 48px;
        color: var(--ink-600);
        opacity: 0.5;
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
