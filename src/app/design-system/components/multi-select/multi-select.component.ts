import { Component, computed, input, model, signal } from '@angular/core';

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'ds-multi-select',
  template: `
    <fieldset class="ds-multi-select">
      <legend class="ds-multi-select__legend">{{ label() }}</legend>
      @if (hint()) {
        <span [id]="hintId()" class="ds-multi-select__hint">{{ hint() }}</span>
      }
      <div class="ds-multi-select__options">
        @for (opt of options(); track opt.value) {
          <label class="ds-multi-select__item">
            <input
              type="checkbox"
              [value]="opt.value"
              [checked]="isChecked(opt.value)"
              [disabled]="opt.disabled ?? false"
              [attr.aria-describedby]="hint() ? hintId() : null"
              (change)="onChange(opt.value, $event)"
              class="ds-multi-select__checkbox"
            />
            {{ opt.label }}
          </label>
        }
      </div>
      @if (error()) {
        <span class="ds-multi-select__error" role="alert">{{ error() }}</span>
      }
    </fieldset>
  `,
  styles: [
    `
      .ds-multi-select {
        border: none;
        padding: 0;
        margin: 0;
      }
      .ds-multi-select__legend {
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--color-text-primary);
        margin-bottom: var(--space-2);
      }
      .ds-multi-select__options {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
      }
      .ds-multi-select__item {
        display: flex;
        align-items: center;
        gap: var(--space-1);
        font-size: var(--font-size-sm);
        color: var(--color-text-primary);
        cursor: pointer;
      }
      .ds-multi-select__checkbox {
        accent-color: var(--color-accent);
      }
      .ds-multi-select__checkbox:focus-visible {
        outline: var(--focus-ring-width) solid var(--color-focus-ring);
        outline-offset: var(--focus-ring-offset);
      }
      .ds-multi-select__hint {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        display: block;
        margin-bottom: var(--space-1);
      }
      .ds-multi-select__error {
        font-size: var(--font-size-sm);
        color: var(--color-error);
        display: block;
        margin-top: var(--space-1);
      }
    `,
  ],
})
export class MultiSelectComponent {
  private static _idCounter = 0;

  readonly label = input.required<string>();
  readonly options = input<MultiSelectOption[]>([]);
  readonly hint = input('');
  readonly error = input('');

  readonly value = model<string[]>([]);

  protected readonly _id = signal(`ds-multi-select-${++MultiSelectComponent._idCounter}`);
  protected readonly hintId = computed(() => `${this._id()}-hint`);

  protected isChecked(optValue: string): boolean {
    return this.value().includes(optValue);
  }

  onChange(optValue: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.value();
    if (checked) {
      this.value.set([...current, optValue]);
    } else {
      this.value.set(current.filter((v) => v !== optValue));
    }
  }
}
