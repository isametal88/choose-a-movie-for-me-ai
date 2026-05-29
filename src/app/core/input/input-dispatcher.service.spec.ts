import { TestBed } from '@angular/core/testing';
import { InputDispatcherService } from './input-dispatcher.service';
import { NormalizedInputEvent } from './input-event.model';

describe('InputDispatcherService', () => {
  let service: InputDispatcherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InputDispatcherService);
  });

  afterEach(() => {
    service.ngOnDestroy();
  });

  it('creates', () => expect(service).toBeTruthy());

  it('events$ is observable', () => {
    expect(service.events$).toBeDefined();
  });

  describe('keyboard → action mapping', () => {
    const cases: [string, string][] = [
      ['ArrowUp', 'navigate-up'],
      ['ArrowDown', 'navigate-down'],
      ['ArrowLeft', 'navigate-left'],
      ['ArrowRight', 'navigate-right'],
      ['Enter', 'confirm'],
      [' ', 'confirm'],
      ['Escape', 'back'],
      ['Backspace', 'back'],
    ];

    cases.forEach(([key, action]) => {
      it(`maps ${key} → ${action}`, (done) => {
        service.events$.subscribe((evt) => {
          expect(evt.action).toBe(action);
          done();
        });
        window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      });
    });
  });

  it('unmapped keys produce no event', () => {
    const received: NormalizedInputEvent[] = [];
    service.events$.subscribe((e) => received.push(e));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(received.length).toBe(0);
  });

  it('dispatch() emits the given action', (done) => {
    const fakeEvent = new Event('click');
    service.events$.subscribe((evt) => {
      expect(evt.action).toBe('search');
      expect(evt.originalEvent).toBe(fakeEvent);
      done();
    });
    service.dispatch('search', fakeEvent);
  });

  it('removes event listener on destroy', () => {
    const spy = jest.spyOn(window, 'removeEventListener');
    service.ngOnDestroy();
    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
