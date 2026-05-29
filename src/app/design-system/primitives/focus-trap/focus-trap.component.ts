import { booleanAttribute, Component, input } from '@angular/core';
import { CdkTrapFocus } from '@angular/cdk/a11y';

@Component({
  selector: 'ds-focus-trap',
  imports: [CdkTrapFocus],
  template: `
    <div [cdkTrapFocus]="enabled()" [cdkTrapFocusAutoCapture]="enabled()">
      <ng-content />
    </div>
  `,
  styles: [':host { display: contents; }'],
})
export class FocusTrapComponent {
  readonly enabled = input(true, { transform: booleanAttribute });
}
