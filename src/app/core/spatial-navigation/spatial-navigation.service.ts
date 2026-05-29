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
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    const vw = window.innerWidth || document.documentElement.clientWidth;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return r.right > 0 && r.bottom > 0 && r.left < vw && r.top < vh;
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

    const cr = current.getBoundingClientRect();
    const candidates = focusable.filter((el) => {
      if (el === current) return false;
      const r = el.getBoundingClientRect();
      switch (direction) {
        case 'up':
          return r.bottom <= cr.top + 1;
        case 'down':
          return r.top >= cr.bottom - 1;
        case 'left':
          return r.right <= cr.left + 1;
        case 'right':
          return r.left >= cr.right - 1;
      }
    });

    if (!candidates.length) return;

    const best = candidates.reduce((a, b) => {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      return this._score(ra, cr, direction) <= this._score(rb, cr, direction) ? a : b;
    });

    best.focus();
    best.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    originalEvent.preventDefault();
  }

  // primaryGap: edge-to-edge distance in the movement direction.
  // perpGap: how far the perpendicular ranges are from overlapping (0 = same row/column).
  // Elements in the same row/column win over diagonal ones regardless of raw distance.
  private _score(r: DOMRect, from: DOMRect, direction: 'up' | 'down' | 'left' | 'right'): number {
    let primaryGap: number;
    let perpGap: number;

    switch (direction) {
      case 'right':
        primaryGap = Math.max(0, r.left - from.right);
        perpGap = Math.max(0, Math.max(from.top, r.top) - Math.min(from.bottom, r.bottom));
        break;
      case 'left':
        primaryGap = Math.max(0, from.left - r.right);
        perpGap = Math.max(0, Math.max(from.top, r.top) - Math.min(from.bottom, r.bottom));
        break;
      case 'down':
        primaryGap = Math.max(0, r.top - from.bottom);
        perpGap = Math.max(0, Math.max(from.left, r.left) - Math.min(from.right, r.right));
        break;
      case 'up':
        primaryGap = Math.max(0, from.top - r.bottom);
        perpGap = Math.max(0, Math.max(from.left, r.left) - Math.min(from.right, r.right));
        break;
    }

    return primaryGap + perpGap * 5;
  }

  private _confirmFocused(originalEvent: Event): void {
    const active = document.activeElement as HTMLElement | null;
    if (!active) return;
    const tag = active.tagName.toLowerCase();
    const role = active.getAttribute('role');
    if (tag === 'button' || tag === 'a' || role === 'button') {
      active.click();
      originalEvent.preventDefault();
    }
  }
}
