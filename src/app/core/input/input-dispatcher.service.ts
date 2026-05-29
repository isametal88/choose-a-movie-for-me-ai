import { Injectable, NgZone, OnDestroy, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { InputAction, NormalizedInputEvent } from './input-event.model';

const KEY_ACTION_MAP: Record<string, InputAction> = {
  ArrowUp: 'navigate-up',
  ArrowDown: 'navigate-down',
  ArrowLeft: 'navigate-left',
  ArrowRight: 'navigate-right',
  Enter: 'confirm',
  ' ': 'confirm',
  Escape: 'back',
  Backspace: 'back',
};

@Injectable({ providedIn: 'root' })
export class InputDispatcherService implements OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly _events$ = new Subject<NormalizedInputEvent>();

  readonly events$ = this._events$.asObservable();

  private readonly _keyHandler = (event: KeyboardEvent): void => {
    const action = KEY_ACTION_MAP[event.key];
    if (action) {
      this.zone.run(() => {
        this._events$.next({ action, originalEvent: event });
      });
    }
  };

  constructor() {
    this.zone.runOutsideAngular(() => {
      window.addEventListener('keydown', this._keyHandler);
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('keydown', this._keyHandler);
    this._events$.complete();
  }

  dispatch(action: InputAction, originalEvent: Event): void {
    this._events$.next({ action, originalEvent });
  }
}
