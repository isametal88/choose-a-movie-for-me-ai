import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

export const BREAKPOINTS = {
  xs: '(min-width: 480px)',
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1920px)',
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

@Injectable({ providedIn: 'root' })
export class BreakpointService {
  private readonly observer = inject(BreakpointObserver);

  matches(bp: Breakpoint): Signal<boolean> {
    return toSignal(this.observer.observe(BREAKPOINTS[bp]).pipe(map((state) => state.matches)), {
      initialValue: this.observer.isMatched(BREAKPOINTS[bp]),
    });
  }

  isMatched(bp: Breakpoint): boolean {
    return this.observer.isMatched(BREAKPOINTS[bp]);
  }
}
