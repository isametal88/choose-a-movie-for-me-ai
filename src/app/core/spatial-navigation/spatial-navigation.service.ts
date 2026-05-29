import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { InputDispatcherService } from '../input/input-dispatcher.service';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[role="button"]:not([aria-disabled="true"])',
].join(',');

@Injectable({ providedIn: 'root' })
export class SpatialNavigationService implements OnDestroy {
  private readonly dispatcher = inject(InputDispatcherService);
  private _subscription: Subscription | null = null;

  readonly enabled = signal(false);

  enable(): void {
    if (this.enabled()) return;
    this.enabled.set(true);
    this._subscription = this.dispatcher.events$
      .pipe(filter(() => this.enabled()))
      .subscribe((evt) => this._handle(evt.action, evt.originalEvent));
  }

  disable(): void {
    this.enabled.set(false);
    this._subscription?.unsubscribe();
    this._subscription = null;
  }

  ngOnDestroy(): void {
    this.disable();
  }

  private _handle(action: string, originalEvent: Event): void {
    switch (action) {
      case 'navigate-up':
        this._moveFocus('up', originalEvent);
        break;
      case 'navigate-down':
        this._moveFocus('down', originalEvent);
        break;
      case 'navigate-left':
        this._moveFocus('left', originalEvent);
        break;
      case 'navigate-right':
        this._moveFocus('right', originalEvent);
        break;
      case 'confirm':
        this._confirmFocused(originalEvent);
        break;
    }
  }

  private _getFocusableElements(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (el) => !el.closest('[aria-hidden="true"]') && this._isVisible(el),
    );
  }

  private _isVisible(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0 || el.getClientRects().length > 0;
  }

  private _moveFocus(direction: 'up' | 'down' | 'left' | 'right', originalEvent: Event): void {
    const focusable = this._getFocusableElements();
    const current = document.activeElement as HTMLElement | null;
    if (!focusable.length) return;

    if (!current || !focusable.includes(current)) {
      focusable[0].focus();
      originalEvent.preventDefault();
      return;
    }

    const currentRect = current.getBoundingClientRect();
    const candidates = focusable.filter((el) => {
      if (el === current) return false;
      const r = el.getBoundingClientRect();
      switch (direction) {
        case 'up':
          return r.bottom <= currentRect.top + 1;
        case 'down':
          return r.top >= currentRect.bottom - 1;
        case 'left':
          return r.right <= currentRect.left + 1;
        case 'right':
          return r.left >= currentRect.right - 1;
      }
    });

    if (!candidates.length) return;

    const best = candidates.reduce((a, b) => {
      return this._distance(a.getBoundingClientRect(), currentRect) <=
        this._distance(b.getBoundingClientRect(), currentRect)
        ? a
        : b;
    });

    best.focus();
    originalEvent.preventDefault();
  }

  private _distance(r: DOMRect, from: DOMRect): number {
    const cx = from.left + from.width / 2;
    const cy = from.top + from.height / 2;
    const tx = r.left + r.width / 2;
    const ty = r.top + r.height / 2;
    return Math.hypot(tx - cx, ty - cy);
  }

  private _confirmFocused(originalEvent: Event): void {
    const active = document.activeElement as HTMLElement | null;
    if (!active) return;
    const tag = active.tagName.toLowerCase();
    if (tag === 'button' || tag === 'a' || active.getAttribute('role') === 'button') {
      active.click();
      originalEvent.preventDefault();
    }
  }
}
