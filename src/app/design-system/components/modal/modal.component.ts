import { A11yModule } from '@angular/cdk/a11y';
import { booleanAttribute, Component, ElementRef, input, output, viewChild } from '@angular/core';

@Component({
  selector: 'ds-modal',
  imports: [A11yModule],
  template: `
    @if (open()) {
      <div class="ds-modal__backdrop" (click)="onBackdropClick($event)" aria-hidden="true"></div>
      <div
        #dialogEl
        class="ds-modal__dialog"
        role="dialog"
        [attr.aria-modal]="true"
        [attr.aria-labelledby]="titleId"
        [attr.aria-describedby]="descId"
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="true"
        (keydown.escape)="closed.emit()"
      >
        <div class="ds-modal__header">
          <h2 [id]="titleId" class="ds-modal__title">{{ title() }}</h2>
          <button
            type="button"
            class="ds-modal__close"
            aria-label="Close dialog"
            (click)="closed.emit()"
          >
            ✕
          </button>
        </div>
        <div [id]="descId" class="ds-modal__body">
          <ng-content />
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      }
      :host:has(.ds-modal__backdrop) {
        pointer-events: auto;
      }
      .ds-modal__backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(2px);
      }
      .ds-modal__dialog {
        position: relative;
        background: var(--color-surface-1);
        border-radius: var(--radius-xl);
        padding: var(--space-6);
        max-width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: var(--shadow-xl);
        z-index: 1;
        width: 480px;
      }
      .ds-modal__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--space-4);
      }
      .ds-modal__title {
        font-size: var(--font-size-xl);
        font-weight: 700;
        color: var(--color-text-primary);
        margin: 0;
      }
      .ds-modal__close {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-text-secondary);
        font-size: var(--font-size-lg);
        padding: var(--space-1);
        border-radius: var(--radius-sm);
        line-height: 1;
        min-width: var(--space-8);
        min-height: var(--space-8);
      }
      .ds-modal__close:focus-visible {
        outline: var(--focus-ring-width) solid var(--color-focus-ring);
        outline-offset: var(--focus-ring-offset);
      }
      .ds-modal__body {
        color: var(--color-text-primary);
      }
    `,
  ],
})
export class ModalComponent {
  readonly open = input(false, { transform: booleanAttribute });
  readonly title = input('');
  readonly closed = output<void>();

  protected readonly titleId = 'ds-modal-title';
  protected readonly descId = 'ds-modal-desc';

  private readonly dialogEl = viewChild<ElementRef<HTMLElement>>('dialogEl');

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closed.emit();
    }
  }
}
