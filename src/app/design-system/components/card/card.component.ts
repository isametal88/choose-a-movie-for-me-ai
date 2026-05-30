import { booleanAttribute, Component, input, output } from '@angular/core';

@Component({
  selector: 'ds-card',
  template: '<ng-content />',
  styles: [
    `
      :host {
        display: block;
        background: var(--color-bg-card);
        border-radius: var(--r-md);
        box-shadow: var(--shadow-card);
        overflow: hidden;
        color: var(--color-text-inverse);
        transition: box-shadow var(--duration-fast) var(--ease);
      }
      :host([role='button']) {
        cursor: pointer;
      }
      :host([role='button']:hover) {
        box-shadow: var(--shadow-pop);
      }
      :host([role='button']:focus-visible) {
        outline: var(--focus-ring-width) solid var(--color-focus-ring);
        outline-offset: var(--focus-ring-offset);
      }
    `,
  ],
  host: {
    '[attr.role]': 'clickable() ? "button" : null',
    '[attr.tabindex]': 'clickable() ? 0 : null',
    '[attr.aria-label]': 'ariaLabel() || null',
    '(click)': 'clickable() && cardClick.emit()',
    '(keydown.enter)': 'clickable() && cardClick.emit()',
    '(keydown.space)': '_onSpace($event)',
  },
})
export class CardComponent {
  readonly clickable = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly cardClick = output<void>();

  _onSpace(event: Event): void {
    if (this.clickable()) {
      event.preventDefault();
      this.cardClick.emit();
    }
  }
}
