import { Component, computed, input, model, signal } from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'ds-select',
  template: `
    <label [attr.for]="inputId()" class="ds-select__label">{{ label() }}</label>
    <div class="ds-select__wrapper">
      <select
        [id]="inputId()"
        [attr.aria-describedby]="hint() ? hintId() : null"
        [attr.aria-invalid]="!!error() || null"
        [value]="value()"
        (change)="onChange($event)"
        class="ds-select__control"
      >
        @if (placeholder()) {
          <option value="" [disabled]="true">{{ placeholder() }}</option>
        }
        @for (opt of options(); track opt.value) {
          <option [value]="opt.value" [disabled]="opt.disabled ?? false">{{ opt.label }}</option>
        }
      </select>
    </div>
    @if (hint()) {
      <span [id]="hintId()" class="ds-select__hint">{{ hint() }}</span>
    }
    @if (error()) {
      <span class="ds-select__error" role="alert">{{ error() }}</span>
    }
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
      }
      .ds-select__label {
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--color-text-primary);
      }
      .ds-select__wrapper {
        position: relative;
      }
      .ds-select__control {
        width: 100%;
        padding: var(--space-2) var(--space-3);
        border: 1.5px solid var(--color-border);
        border-radius: var(--radius-md);
        background: var(--color-surface-1);
        color: var(--color-text-primary);
        font-size: var(--font-size-base);
        appearance: none;
        cursor: pointer;
      }
      .ds-select__control:focus-visible {
        outline: var(--focus-ring-width) solid var(--color-focus-ring);
        outline-offset: var(--focus-ring-offset);
      }
      .ds-select__hint {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
      }
      .ds-select__error {
        font-size: var(--font-size-sm);
        color: var(--color-error);
      }
    `,
  ],
})
export class SelectComponent {
  private static _idCounter = 0;

  readonly label = input.required<string>();
  readonly options = input<SelectOption[]>([]);
  readonly placeholder = input('');
  readonly hint = input('');
  readonly error = input('');

  readonly value = model('');

  protected readonly _id = signal(`ds-select-${++SelectComponent._idCounter}`);
  protected readonly inputId = computed(() => this._id());
  protected readonly hintId = computed(() => `${this._id()}-hint`);

  onChange(event: Event): void {
    this.value.set((event.target as HTMLSelectElement).value);
  }
}
