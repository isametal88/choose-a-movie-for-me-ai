import { Component, input, model } from '@angular/core';

@Component({
  selector: 'ds-chip',
  template: '<ng-content />',
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        padding: var(--space-1) var(--space-3);
        border-radius: var(--radius-full);
        border: 1.5px solid var(--color-border-strong);
        font-size: var(--font-size-sm);
        font-weight: 500;
        cursor: pointer;
        user-select: none;
        background: var(--color-bg-elevated);
        color: var(--color-text-secondary);
        transition:
          background var(--duration-fast) var(--ease-out),
          color var(--duration-fast) var(--ease-out),
          border-color var(--duration-fast) var(--ease-out);
      }
      :host(:hover) {
        background: var(--color-interactive-bg-hover);
        color: var(--color-text-primary);
        border-color: var(--color-navy-300);
      }
      :host([aria-pressed='true']) {
        background: var(--color-brand-500);
        border-color: var(--color-brand-500);
        color: var(--color-neutral-0);
      }
      :host(:focus-visible) {
        outline: var(--focus-ring-width) solid var(--color-focus-ring);
        outline-offset: var(--focus-ring-offset);
      }
    `,
  ],
  host: {
    role: 'button',
    '[attr.tabindex]': '0',
    '[attr.aria-pressed]': 'selected()',
    '[attr.aria-label]': 'ariaLabel() || null',
    '(click)': '_toggle()',
    '(keydown.enter)': '_toggle()',
    '(keydown.space)': '_onSpace($event)',
  },
})
export class ChipComponent {
  readonly selected = model(false);
  readonly ariaLabel = input('');

  _toggle(): void {
    this.selected.set(!this.selected());
  }

  _onSpace(event: Event): void {
    event.preventDefault();
    this._toggle();
  }
}
