import { Injectable } from '@angular/core';

type Direction = 'up' | 'down' | 'left' | 'right';

const KEY_MAP: Record<number, Direction> = {
  38: 'up',
  40: 'down',
  37: 'left',
  39: 'right',
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]';

@Injectable({ providedIn: 'root' })
export class SpatialNavigationService {
  /** Call once when the app starts on webOS. */
  init(): void {
    document.addEventListener('keydown', (e) => this._onKeyDown(e));
  }

  private _onKeyDown(e: KeyboardEvent): void {
    const dir = KEY_MAP[e.keyCode];
    if (!dir) return;
    e.preventDefault();
    this._move(dir);
  }

  private _move(dir: Direction): void {
    const active = document.activeElement as HTMLElement | null;
    const all = this._focusable();
    if (!all.length) return;

    if (!active || !all.includes(active)) {
      all[0].focus();
      return;
    }

    const cr = active.getBoundingClientRect();
    const acx = cr.left + cr.width / 2;
    const acy = cr.top + cr.height / 2;

    let best: HTMLElement | null = null;
    let bestScore = Infinity;

    for (const el of all) {
      if (el === active) continue;
      const r = el.getBoundingClientRect();
      const ecx = r.left + r.width / 2;
      const ecy = r.top + r.height / 2;

      // Element center must be strictly in the pressed direction.
      // Gap = edge-to-edge distance in the primary axis (0 if overlapping).
      // Lateral = center offset in the perpendicular axis.
      // Score = gap + lateral * 2  (prefer aligned neighbours over diagonal ones).
      let gap: number;
      let lateral: number;

      switch (dir) {
        case 'right':
          if (ecx <= acx) continue;
          gap = Math.max(0, r.left - cr.right);
          lateral = Math.abs(ecy - acy);
          break;
        case 'left':
          if (ecx >= acx) continue;
          gap = Math.max(0, cr.left - r.right);
          lateral = Math.abs(ecy - acy);
          break;
        case 'down':
          if (ecy <= acy) continue;
          gap = Math.max(0, r.top - cr.bottom);
          lateral = Math.abs(ecx - acx);
          break;
        case 'up':
          if (ecy >= acy) continue;
          gap = Math.max(0, cr.top - r.bottom);
          lateral = Math.abs(ecx - acx);
          break;
      }

      const score = gap + lateral * 2;
      if (score < bestScore) {
        bestScore = score;
        best = el;
      }
    }

    if (best) {
      best.focus();
      best.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    }
  }

  private _focusable(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => !el.closest('[aria-hidden="true"]') && this._isVisible(el),
    );
  }

  private _isVisible(el: HTMLElement): boolean {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
}
