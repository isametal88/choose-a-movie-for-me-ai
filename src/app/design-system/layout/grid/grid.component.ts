import { Component, computed, input } from '@angular/core';

export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'auto';
export type GridGap = '0' | '1' | '2' | '3' | '4' | '6' | '8';

@Component({
  selector: 'ds-grid',
  template: '<ng-content />',
  styles: [
    `
      :host {
        display: grid;
      }
    `,
  ],
  host: {
    '[style.grid-template-columns]': 'gridColumns()',
    '[style.gap]': 'gapValue()',
  },
})
export class GridComponent {
  readonly columns = input<GridColumns>(1);
  readonly gap = input<GridGap>('4');
  readonly minItemWidth = input('');

  protected readonly gridColumns = computed(() => {
    const cols = this.columns();
    const minWidth = this.minItemWidth();
    if (minWidth) {
      return `repeat(auto-fill, minmax(${minWidth}, 1fr))`;
    }
    if (cols === 'auto') {
      return 'repeat(auto-fill, minmax(200px, 1fr))';
    }
    return `repeat(${cols}, minmax(0, 1fr))`;
  });

  protected readonly gapValue = computed(() => `var(--space-${this.gap()})`);
}
