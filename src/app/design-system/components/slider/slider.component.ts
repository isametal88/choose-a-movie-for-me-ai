import { Component, computed, input, model, signal } from '@angular/core';

@Component({
  selector: 'ds-slider',
  template: `
    <div class="ds-slider">
      <div class="ds-slider__header">
        <label [attr.for]="inputId()" class="ds-slider__label">{{ label() }}</label>
        <span class="ds-slider__value" aria-live="polite">{{ value() }}{{ unit() }}</span>
      </div>
      <input
        type="range"
        [id]="inputId()"
        [min]="min()"
        [max]="max()"
        [step]="step()"
        [value]="value()"
        [attr.aria-valuetext]="value() + unit()"
        (input)="onInput($event)"
        class="ds-slider__control"
      />
      <div class="ds-slider__range-labels">
        <span>{{ min() }}{{ unit() }}</span>
        <span>{{ max() }}{{ unit() }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .ds-slider {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
      }
      .ds-slider__header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      .ds-slider__label {
        font-size: var(--font-size-ui);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-primary);
      }
      .ds-slider__value {
        font-size: var(--font-size-ui);
        color: var(--color-brand-500);
        font-weight: var(--font-weight-bold);
      }
      .ds-slider__control {
        width: 100%;
        accent-color: var(--color-brand-500);
        cursor: pointer;
      }
      .ds-slider__control:focus-visible {
        outline: var(--focus-ring-width) solid var(--color-focus-ring);
        outline-offset: var(--focus-ring-offset);
      }
      .ds-slider__range-labels {
        display: flex;
        justify-content: space-between;
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
      }
    `,
  ],
})
export class SliderComponent {
  private static _idCounter = 0;

  readonly label = input.required<string>();
  readonly min = input(0);
  readonly max = input(10);
  readonly step = input(0.5);
  readonly unit = input('');

  readonly value = model(0);

  protected readonly _id = signal(`ds-slider-${++SliderComponent._idCounter}`);
  protected readonly inputId = computed(() => this._id());

  onInput(event: Event): void {
    this.value.set(Number((event.target as HTMLInputElement).value));
  }
}
