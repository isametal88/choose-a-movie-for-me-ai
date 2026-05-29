import { Component, input } from '@angular/core';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Component({
  selector: 'ds-container',
  template: '<ng-content />',
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        margin-inline: auto;
        padding-inline: var(--space-4);
      }
      :host(.ds-container--sm) {
        max-width: 640px;
      }
      :host(.ds-container--md) {
        max-width: 768px;
      }
      :host(.ds-container--lg) {
        max-width: 1024px;
      }
      :host(.ds-container--xl) {
        max-width: 1280px;
      }
      :host(.ds-container--full) {
        max-width: 100%;
      }

      /* TV variant: extra horizontal padding so content never bleeds to screen edge */
      :host-context([data-theme='tv']) {
        padding-inline: var(--space-16, var(--space-8));
      }
    `,
  ],
  host: { '[class]': '"ds-container ds-container--" + size()' },
})
export class ContainerComponent {
  readonly size = input<ContainerSize>('xl');
}
