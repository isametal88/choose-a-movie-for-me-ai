import { Component, HostListener, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-trailer',
  template: `
    @if (trailerKey()) {
      @if (!isPlaying()) {
        <button class="trailer__play-btn" (click)="play()" aria-label="Watch trailer">
          <span class="trailer__play-icon" aria-hidden="true">
            <span class="trailer__play-arrow"></span>
          </span>
        </button>
      } @else {
        <div class="trailer__player" role="region" aria-label="Trailer player">
          <div class="trailer__iframe-wrapper">
            <iframe
              [src]="trailerUrl()"
              class="trailer__iframe"
              title="YouTube video player"
              allow="autoplay; fullscreen"
              allowfullscreen
              frameborder="0"
            ></iframe>
          </div>
          <button class="trailer__close-btn" (click)="close()" aria-label="Close trailer">
            ✕ Close
          </button>
        </div>
      }
    }
  `,
  styles: [
    `
      /* Idle state: desaturated thumbnail with centered play button */
      .trailer__play-btn {
        position: relative;
        display: block;
        width: 100%;
        aspect-ratio: 16/9;
        border-radius: var(--r-xs);
        overflow: hidden;
        filter: grayscale(1);
        background: repeating-linear-gradient(
          135deg,
          #161616,
          #161616 16px,
          #202020 16px,
          #202020 32px
        );
        border: none;
        cursor: pointer;
        padding: 0;
      }

      .trailer__play-btn:focus-visible {
        outline: var(--focus-ring-width) solid var(--color-focus-ring);
        outline-offset: var(--focus-ring-offset);
      }

      /* Translucent white circle with play icon */
      .trailer__play-icon {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .trailer__play-icon::after {
        content: '';
        display: block;
        width: 76px;
        height: 76px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.85);
        /* SVG play triangle via clip-path */
        mask-image: none;
      }

      /* Layered over the circle — the play arrow */
      .trailer__play-arrow {
        position: absolute;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 14px 0 14px 26px;
        border-color: transparent transparent transparent var(--navy-800);
        margin-left: 4px;
      }

      .trailer__player {
        margin-top: 0;
      }

      .trailer__iframe-wrapper {
        position: relative;
        width: 100%;
        padding-bottom: 56.25%;
        height: 0;
        overflow: hidden;
        border-radius: var(--r-xs);
      }

      .trailer__iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 0;
      }

      .trailer__close-btn {
        margin-top: var(--sp-2);
        background: var(--color-interactive-bg);
        border: none;
        border-radius: var(--r-xs);
        padding: var(--sp-2) var(--sp-3);
        cursor: pointer;
        font-family: var(--font-family-base);
        font-size: var(--font-size-caption);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
        transition: background var(--transition-fast);
      }

      .trailer__close-btn:hover {
        background: var(--color-interactive-bg-hover);
      }

      .trailer__close-btn:focus-visible {
        outline: var(--focus-ring-width) solid var(--color-focus-ring);
        outline-offset: var(--focus-ring-offset);
      }
    `,
  ],
})
export class TrailerComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly trailerKey = input<string | null>(null);
  protected readonly isPlaying = signal(false);

  protected readonly trailerUrl = computed(() => {
    const key = this.trailerKey();
    if (!key) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${key}?autoplay=1`,
    );
  });

  protected play(): void {
    this.isPlaying.set(true);
  }

  protected close(): void {
    this.isPlaying.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isPlaying()) {
      this.close();
    }
  }
}
