import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { BREAKPOINTS, BreakpointService } from './breakpoints.service';

describe('BreakpointService', () => {
  let service: BreakpointService;
  let observerSpy: jest.Mocked<BreakpointObserver>;
  let subject$: Subject<BreakpointState>;

  beforeEach(() => {
    subject$ = new Subject<BreakpointState>();
    observerSpy = {
      observe: jest.fn().mockReturnValue(subject$.asObservable()),
      isMatched: jest.fn().mockReturnValue(false),
    } as unknown as jest.Mocked<BreakpointObserver>;

    TestBed.configureTestingModule({
      providers: [BreakpointService, { provide: BreakpointObserver, useValue: observerSpy }],
    });
    service = TestBed.inject(BreakpointService);
  });

  it('creates', () => expect(service).toBeTruthy());

  it('matches() returns a signal with initial false value', () => {
    const sig = TestBed.runInInjectionContext(() => service.matches('md'));
    expect(sig()).toBe(false);
  });

  it('matches() calls observer with correct query', () => {
    TestBed.runInInjectionContext(() => service.matches('lg'));
    expect(observerSpy.observe).toHaveBeenCalledWith(BREAKPOINTS['lg']);
  });

  it('matches() signal updates when breakpoint changes', () => {
    const sig = TestBed.runInInjectionContext(() => service.matches('sm'));
    TestBed.runInInjectionContext(() => {
      subject$.next({ matches: true, breakpoints: {} });
    });
    expect(sig()).toBe(true);
  });

  it('isMatched() delegates to BreakpointObserver', () => {
    observerSpy.isMatched.mockReturnValue(true);
    expect(service.isMatched('xl')).toBe(true);
    expect(observerSpy.isMatched).toHaveBeenCalledWith(BREAKPOINTS['xl']);
  });

  it('BREAKPOINTS map contains all expected keys', () => {
    expect(Object.keys(BREAKPOINTS)).toEqual(['xs', 'sm', 'md', 'lg', 'xl', '2xl']);
  });
});
