import { Component, HostListener, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-trailer',
  template: `
    @if (trailerKey()) {
      @if (!isPlaying()) {
        <button class="trailer__play-btn" (click)="play()" aria-label="Play trailer">
          <span class="trailer__play-icon" aria-hidden="true">▶</span>
          Watch trailer
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
      .trailer__play-btn {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        background: none;
        border: 1.5px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: var(--space-2) var(--space-4);
        cursor: pointer;
        font-size: var(--font-size-base);
        color: var(--color-text-primary);
      }

      .trailer__play-btn:hover {
        background: var(--color-surface-2);
      }

      .trailer__play-btn:focus-visible {
        outline: var(--focus-ring-width) solid var(--color-focus-ring);
        outline-offset: var(--focus-ring-offset);
      }

      .trailer__play-icon {
        font-size: var(--font-size-sm);
      }

      .trailer__player {
        margin-top: var(--space-4);
      }

      .trailer__iframe-wrapper {
        position: relative;
        width: 100%;
        padding-bottom: 56.25%;
        height: 0;
        overflow: hidden;
        border-radius: var(--radius-md);
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
        margin-top: var(--space-2);
        background: none;
        border: 1.5px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: var(--space-1) var(--space-3);
        cursor: pointer;
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
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
