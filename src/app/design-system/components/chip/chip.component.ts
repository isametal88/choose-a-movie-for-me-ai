import { Component, input, model } from '@angular/core';

@Component({
  selector: 'ds-chip',
  template: '<ng-content />',
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        padding: var(--sp-2) var(--sp-3);
        border-radius: var(--r-sm);
        font-size: var(--font-size-ui);
        font-weight: var(--font-weight-semibold);
        cursor: pointer;
        user-select: none;
        background: var(--color-interactive-bg);
        color: var(--color-text-primary);
        transition:
          background var(--duration-fast) var(--ease-out),
          color var(--duration-fast) var(--ease-out);
      }
      :host(:hover) {
        background: var(--color-interactive-bg-hover);
      }
      :host([aria-pressed='true']) {
        background: var(--color-interactive-bg-selected);
        color: var(--white);
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
