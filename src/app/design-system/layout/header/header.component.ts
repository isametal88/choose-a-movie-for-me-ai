import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  template: `
    <header class="app-header" role="banner">
      <a
        class="app-header__logo"
        routerLink="/"
        aria-label="Choose a Movie for Me — torna alla home"
      >
        <svg
          class="app-header__logo-icon"
          width="44"
          height="44"
          viewBox="0 0 44 44"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <!-- Clapperboard body -->
          <rect x="2" y="18" width="40" height="24" rx="3" fill="white" />
          <!-- Film holes left -->
          <rect x="6" y="23" width="4" height="6" rx="1" fill="#162032" />
          <rect x="6" y="32" width="4" height="6" rx="1" fill="#162032" />
          <!-- Film holes right -->
          <rect x="34" y="23" width="4" height="6" rx="1" fill="#162032" />
          <rect x="34" y="32" width="4" height="6" rx="1" fill="#162032" />
          <!-- Clapper arm base -->
          <rect x="2" y="10" width="40" height="10" rx="3" fill="white" />
          <!-- Clapper arm stripes -->
          <clipPath id="clapper-clip">
            <rect x="2" y="10" width="40" height="10" rx="3" />
          </clipPath>
          <g clip-path="url(#clapper-clip)">
            <polygon points="2,10 10,10 2,20" fill="#162032" />
            <polygon points="14,10 22,10 10,20 2,20" fill="#162032" />
            <polygon points="26,10 34,10 22,20 14,20" fill="#162032" />
            <polygon points="38,10 42,10 42,16 30,20" fill="#162032" />
          </g>
          <!-- Hinge -->
          <circle cx="9" cy="10" r="3" fill="#e8622a" />
        </svg>
        <span class="app-header__logo-text" aria-hidden="true">
          CHOOSE A<br />MOVIE<br />FOR ME
        </span>
      </a>

      <button class="app-header__menu-btn" aria-label="Apri menu" type="button">
        <span class="app-header__menu-line" aria-hidden="true"></span>
        <span class="app-header__menu-line" aria-hidden="true"></span>
        <span class="app-header__menu-line" aria-hidden="true"></span>
      </button>
    </header>
  `,
  styles: [
    `
      .app-header {
        position: sticky;
        top: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-3) var(--space-6);
        background: var(--color-bg-surface);
        border-bottom: 1px solid var(--color-border);
        box-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);
      }

      .app-header__logo {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        text-decoration: none;
        color: var(--color-text-primary);
      }

      .app-header__logo:focus-visible {
        outline: var(--focus-ring-width) solid var(--color-focus-ring);
        outline-offset: var(--focus-ring-offset);
        border-radius: var(--radius-sm);
      }

      .app-header__logo-icon {
        flex-shrink: 0;
      }

      .app-header__logo-text {
        font-family: var(--font-family-display);
        font-size: var(--font-size-sm);
        font-weight: 700;
        line-height: 1.2;
        letter-spacing: var(--letter-spacing-wider);
        text-transform: uppercase;
        color: var(--color-text-primary);
      }

      .app-header__menu-btn {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 5px;
        width: 2.75rem;
        height: 2.75rem;
        padding: var(--space-2);
        background: transparent;
        border: none;
        cursor: pointer;
        border-radius: var(--radius-md);
        transition: background var(--transition-fast);
      }

      .app-header__menu-btn:hover {
        background: var(--color-interactive-bg-hover);
      }

      .app-header__menu-btn:focus-visible {
        outline: var(--focus-ring-width) solid var(--color-focus-ring);
        outline-offset: var(--focus-ring-offset);
      }

      .app-header__menu-line {
        display: block;
        width: 100%;
        height: 2px;
        background: var(--color-text-primary);
        border-radius: 1px;
      }
    `,
  ],
})
export class HeaderComponent {}
