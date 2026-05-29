import { Component, computed, input } from '@angular/core';

export type StackDirection = 'row' | 'column';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
export type StackGap = '0' | '1' | '2' | '3' | '4' | '6' | '8' | '10' | '12' | '16';

const JUSTIFY_MAP: Record<StackJustify, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

const ALIGN_MAP: Record<StackAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

@Component({
  selector: 'ds-stack',
  template: '<ng-content />',
  styles: [
    `
      :host {
        display: flex;
        flex-wrap: var(--_stack-wrap, nowrap);
      }
    `,
  ],
  host: {
    '[style.flex-direction]': 'direction()',
    '[style.align-items]': 'alignItems()',
    '[style.justify-content]': 'justifyContent()',
    '[style.gap]': 'gapValue()',
    '[style.flex-wrap]': 'wrap() ? "wrap" : "nowrap"',
  },
})
export class StackComponent {
  readonly direction = input<StackDirection>('column');
  readonly align = input<StackAlign>('stretch');
  readonly justify = input<StackJustify>('start');
  readonly gap = input<StackGap>('4');
  readonly wrap = input(false);

  protected readonly alignItems = computed(() => ALIGN_MAP[this.align()]);
  protected readonly justifyContent = computed(() => JUSTIFY_MAP[this.justify()]);
  protected readonly gapValue = computed(() => `var(--space-${this.gap()})`);
}
