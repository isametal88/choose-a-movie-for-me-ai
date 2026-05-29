import { Component, computed, input, model, signal } from '@angular/core';

export type TextFieldType = 'text' | 'search' | 'email' | 'url' | 'password';

@Component({
  selector: 'ds-text-field',
  template: `
    <div class="ds-text-field">
      <label [attr.for]="inputId()" class="ds-text-field__label">{{ label() }}</label>
      <div class="ds-text-field__input-wrapper">
        <input
          [id]="inputId()"
          [type]="type()"
          [placeholder]="placeholder()"
          [attr.aria-describedby]="hint() ? hintId() : null"
          [attr.aria-invalid]="!!error() || null"
          [attr.autocomplete]="autocomplete() || null"
          [value]="value()"
          (input)="onInput($event)"
          class="ds-text-field__control"
        />
        @if (type() === 'search' && value()) {
          <button
            type="button"
            class="ds-text-field__clear"
            aria-label="Clear search"
            (click)="value.set('')"
          >
            ✕
          </button>
        }
      </div>
      @if (hint()) {
        <span [id]="hintId()" class="ds-text-field__hint">{{ hint() }}</span>
      }
      @if (error()) {
        <span class="ds-text-field__error" role="alert">{{ error() }}</span>
      }
    </div>
  `,
  styles: [
    `
      .ds-text-field {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
      }
      .ds-text-field__label {
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--color-text-primary);
      }
      .ds-text-field__input-wrapper {
        position: relative;
      }
      .ds-text-field__control {
        width: 100%;
        padding: var(--space-2) var(--space-3);
        border: 1.5px solid var(--color-border);
        border-radius: var(--radius-md);
        background: var(--color-surface-1);
        color: var(--color-text-primary);
        font-size: var(--font-size-base);
        box-sizing: border-box;
      }
      .ds-text-field__control:focus-visible {
        outline: var(--focus-ring-width) solid var(--color-focus-ring);
        outline-offset: var(--focus-ring-offset);
      }
      .ds-text-field__clear {
        position: absolute;
        right: var(--space-2);
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-text-secondary);
        padding: var(--space-1);
        line-height: 1;
      }
      .ds-text-field__clear:focus-visible {
        outline: var(--focus-ring-width) solid var(--color-focus-ring);
        outline-offset: var(--focus-ring-offset);
        border-radius: var(--radius-sm);
      }
      .ds-text-field__hint {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
      }
      .ds-text-field__error {
        font-size: var(--font-size-sm);
        color: var(--color-error);
      }
    `,
  ],
})
export class TextFieldComponent {
  private static _idCounter = 0;

  readonly label = input.required<string>();
  readonly type = input<TextFieldType>('text');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly autocomplete = input('');

  readonly value = model('');

  protected readonly _id = signal(`ds-text-field-${++TextFieldComponent._idCounter}`);
  protected readonly inputId = computed(() => this._id());
  protected readonly hintId = computed(() => `${this._id()}-hint`);

  onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }
}
