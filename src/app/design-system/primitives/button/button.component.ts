import { booleanAttribute, Component, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ds-button',
  template: `
    <button
      [class]="classes()"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-busy]="busy() ? true : null"
      [attr.aria-disabled]="disabled() ? true : null"
    >
      <ng-content />
    </button>
  `,
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly busy = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');

  protected readonly classes = computed(
    () => `ds-button ds-button--${this.variant()} ds-button--${this.size()}`,
  );
}
