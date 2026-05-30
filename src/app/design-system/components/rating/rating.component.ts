import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'ds-rating',
  template: `
    <span class="ds-rating" role="img" [attr.aria-label]="ariaLabel()">
      @for (star of stars(); track $index) {
        <span
          class="ds-rating__star"
          [class.ds-rating__star--filled]="star === 'full'"
          [class.ds-rating__star--half]="star === 'half'"
          aria-hidden="true"
        >
          @if (star === 'full') {
            ★
          } @else if (star === 'half') {
            ⯨
          } @else {
            ☆
          }
        </span>
      }
      <span class="ds-rating__value">{{ displayValue() }}</span>
    </span>
  `,
  styles: [
    `
      .ds-rating {
        display: inline-flex;
        align-items: center;
        gap: var(--space-1);
      }
      .ds-rating__star {
        font-size: var(--font-size-base);
        color: var(--color-text-secondary);
        line-height: 1;
      }
      .ds-rating__star--filled {
        color: var(--gold-500);
      }
      .ds-rating__star--half {
        color: var(--gold-500);
      }
      .ds-rating__value {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        margin-left: var(--space-1);
      }
    `,
  ],
})
export class RatingComponent {
  readonly value = input(0);
  readonly max = input(10);
  readonly starCount = input(5);

  protected readonly normalized = computed(() => Math.min(Math.max(this.value(), 0), this.max()));

  protected readonly displayValue = computed(() => `${this.normalized().toFixed(1)}/${this.max()}`);

  protected readonly ariaLabel = computed(
    () => `Rating: ${this.normalized().toFixed(1)} out of ${this.max()}`,
  );

  protected readonly stars = computed((): ('full' | 'half' | 'empty')[] => {
    const ratio = (this.normalized() / this.max()) * this.starCount();
    return Array.from({ length: this.starCount() }, (_, i) => {
      if (ratio >= i + 1) return 'full';
      if (ratio >= i + 0.5) return 'half';
      return 'empty';
    });
  });
}
