import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'ds-icon',
  template: '<ng-content />',
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
    `,
  ],
  host: {
    '[attr.aria-hidden]': 'ariaHidden()',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.role]': 'ariaLabel() ? "img" : null',
    '[attr.focusable]': '"false"',
  },
})
export class IconComponent {
  readonly ariaLabel = input('');

  protected readonly ariaHidden = computed(() => (this.ariaLabel() ? null : 'true'));
}
