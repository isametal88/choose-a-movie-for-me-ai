import { Component, computed, input } from '@angular/core';

export type SpinnerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ds-spinner',
  template: `
    <span [attr.aria-label]="label()" role="status" class="ds-spinner" [class]="sizeClass()">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="12" cy="12" r="10" class="ds-spinner__track" />
        <circle cx="12" cy="12" r="10" class="ds-spinner__indicator" />
      </svg>
    </span>
  `,
  styleUrl: './spinner.component.scss',
})
export class SpinnerComponent {
  readonly label = input('Loading…');
  readonly size = input<SpinnerSize>('md');

  protected readonly sizeClass = computed(() => `ds-spinner--${this.size()}`);
}
