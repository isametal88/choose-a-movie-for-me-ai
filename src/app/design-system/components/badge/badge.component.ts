import { Component, input } from '@angular/core';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'ds-badge',
  template: '<ng-content />',
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-full);
        font-size: var(--font-size-xs);
        font-weight: 600;
        line-height: 1;
        white-space: nowrap;
      }
      :host(.ds-badge--default) {
        background: var(--color-interactive-bg);
        color: var(--color-text-primary);
      }
      :host(.ds-badge--success) {
        background: color-mix(in srgb, var(--color-success) 15%, transparent);
        color: var(--color-success);
      }
      :host(.ds-badge--warning) {
        background: color-mix(in srgb, var(--color-warning) 15%, transparent);
        color: var(--color-warning);
      }
      :host(.ds-badge--danger) {
        background: color-mix(in srgb, var(--color-error) 15%, transparent);
        color: var(--color-error);
      }
      :host(.ds-badge--info) {
        background: color-mix(in srgb, var(--color-accent) 15%, transparent);
        color: var(--color-accent);
      }
    `,
  ],
  host: { '[class]': '"ds-badge ds-badge--" + variant()' },
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('default');
}
