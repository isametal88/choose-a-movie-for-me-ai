import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { InputDispatcherService } from '../input/input-dispatcher.service';
import { NormalizedInputEvent } from '../input/input-event.model';
import { SpatialNavigationService } from './spatial-navigation.service';

function makeRect(top: number, left: number, width = 100, height = 40): DOMRect {
  return {
    top,
    left,
    right: left + width,
    bottom: top + height,
    width,
    height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

function createFocusableButton(rect: DOMRect): HTMLButtonElement {
  const btn = document.createElement('button');
  jest.spyOn(btn, 'getBoundingClientRect').mockReturnValue(rect);
  jest.spyOn(btn, 'getClientRects').mockReturnValue({ length: 1 } as unknown as DOMRectList);
  return btn;
}

describe('SpatialNavigationService', () => {
  let service: SpatialNavigationService;
  let events$: Subject<NormalizedInputEvent>;

  beforeEach(() => {
    events$ = new Subject<NormalizedInputEvent>();

    TestBed.configureTestingModule({
      providers: [
        SpatialNavigationService,
        { provide: InputDispatcherService, useValue: { events$: events$.asObservable() } },
      ],
    });
    service = TestBed.inject(SpatialNavigationService);
  });

  afterEach(() => {
    service.ngOnDestroy();
    jest.restoreAllMocks();
  });

  it('creates', () => expect(service).toBeTruthy());
  it('disabled by default', () => expect(service.enabled()).toBe(false));

  it('enabled() becomes true after enable()', () => {
    service.enable();
    expect(service.enabled()).toBe(true);
  });

  it('disabled after disable()', () => {
    service.enable();
    service.disable();
    expect(service.enabled()).toBe(false);
  });

  it('double enable() is idempotent', () => {
    service.enable();
    service.enable();
    expect(service.enabled()).toBe(true);
  });

  it('disable() when already disabled is safe', () => {
    expect(() => service.disable()).not.toThrow();
  });

  it('ngOnDestroy() disables service', () => {
    service.enable();
    service.ngOnDestroy();
    expect(service.enabled()).toBe(false);
  });

  describe('when enabled', () => {
    beforeEach(() => service.enable());

    it('moves focus to first focusable when no element is active', () => {
      const btn = createFocusableButton(makeRect(100, 0));
      document.body.appendChild(btn);
      const focusSpy = jest.spyOn(btn, 'focus');
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      const preventSpy = jest.spyOn(event, 'preventDefault');
      events$.next({ action: 'navigate-down', originalEvent: event });
      expect(focusSpy).toHaveBeenCalled();
      expect(preventSpy).toHaveBeenCalled();
      document.body.removeChild(btn);
    });

    it('moves focus when current element is not in focusable list', () => {
      const btn = createFocusableButton(makeRect(100, 0));
      document.body.appendChild(btn);
      const focusSpy = jest.spyOn(btn, 'focus');
      const nonFocusable = document.createElement('div');
      document.body.appendChild(nonFocusable);
      nonFocusable.focus();
      events$.next({ action: 'navigate-right', originalEvent: new KeyboardEvent('keydown') });
      expect(focusSpy).toHaveBeenCalled();
      document.body.removeChild(btn);
      document.body.removeChild(nonFocusable);
    });

    it('navigate-down moves focus to element below', () => {
      const current = createFocusableButton(makeRect(0, 0));
      const below = createFocusableButton(makeRect(200, 0));
      document.body.appendChild(current);
      document.body.appendChild(below);
      current.focus();

      const focusSpy = jest.spyOn(below, 'focus');
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      const preventSpy = jest.spyOn(event, 'preventDefault');
      events$.next({ action: 'navigate-down', originalEvent: event });
      expect(focusSpy).toHaveBeenCalled();
      expect(preventSpy).toHaveBeenCalled();
      document.body.removeChild(current);
      document.body.removeChild(below);
    });

    it('navigate-up moves focus to element above', () => {
      const above = createFocusableButton(makeRect(0, 0));
      const current = createFocusableButton(makeRect(200, 0));
      document.body.appendChild(above);
      document.body.appendChild(current);
      current.focus();

      const focusSpy = jest.spyOn(above, 'focus');
      events$.next({ action: 'navigate-up', originalEvent: new KeyboardEvent('keydown') });
      expect(focusSpy).toHaveBeenCalled();
      document.body.removeChild(above);
      document.body.removeChild(current);
    });

    it('navigate-left moves focus to element to the left', () => {
      const left = createFocusableButton(makeRect(0, 0, 80, 40));
      const current = createFocusableButton(makeRect(0, 200, 100, 40));
      document.body.appendChild(left);
      document.body.appendChild(current);
      current.focus();

      const focusSpy = jest.spyOn(left, 'focus');
      events$.next({ action: 'navigate-left', originalEvent: new KeyboardEvent('keydown') });
      expect(focusSpy).toHaveBeenCalled();
      document.body.removeChild(left);
      document.body.removeChild(current);
    });

    it('navigate-right moves focus to element to the right', () => {
      const current = createFocusableButton(makeRect(0, 0, 80, 40));
      const right = createFocusableButton(makeRect(0, 200, 100, 40));
      document.body.appendChild(current);
      document.body.appendChild(right);
      current.focus();

      const focusSpy = jest.spyOn(right, 'focus');
      events$.next({ action: 'navigate-right', originalEvent: new KeyboardEvent('keydown') });
      expect(focusSpy).toHaveBeenCalled();
      document.body.removeChild(current);
      document.body.removeChild(right);
    });

    it('picks nearest element when multiple candidates exist (a closer)', () => {
      const current = createFocusableButton(makeRect(0, 0, 100, 40));
      const near = createFocusableButton(makeRect(200, 0, 100, 40));
      const far = createFocusableButton(makeRect(500, 0, 100, 40));
      // near added first so reduce starts with (near, far): distance(near)=200 <= distance(far)=500 → returns near
      document.body.appendChild(current);
      document.body.appendChild(near);
      document.body.appendChild(far);
      current.focus();

      const nearSpy = jest.spyOn(near, 'focus');
      const farSpy = jest.spyOn(far, 'focus');
      events$.next({ action: 'navigate-down', originalEvent: new KeyboardEvent('keydown') });
      expect(nearSpy).toHaveBeenCalled();
      expect(farSpy).not.toHaveBeenCalled();
      document.body.removeChild(current);
      document.body.removeChild(near);
      document.body.removeChild(far);
    });

    it('picks nearest element when second candidate is closer (b branch in reduce)', () => {
      const current = createFocusableButton(makeRect(0, 0, 100, 40));
      const near = createFocusableButton(makeRect(200, 0, 100, 40));
      const far = createFocusableButton(makeRect(500, 0, 100, 40));
      // far added first so reduce starts with (far, near): distance(far)=500 > distance(near)=200 → returns near via :b
      document.body.appendChild(current);
      document.body.appendChild(far);
      document.body.appendChild(near);
      current.focus();

      const nearSpy = jest.spyOn(near, 'focus');
      const farSpy = jest.spyOn(far, 'focus');
      events$.next({ action: 'navigate-down', originalEvent: new KeyboardEvent('keydown') });
      expect(nearSpy).toHaveBeenCalled();
      expect(farSpy).not.toHaveBeenCalled();
      document.body.removeChild(current);
      document.body.removeChild(far);
      document.body.removeChild(near);
    });

    it('does nothing when no candidates in direction', () => {
      const current = createFocusableButton(makeRect(200, 0));
      document.body.appendChild(current);
      current.focus();

      const focusSpy = jest.spyOn(current, 'focus');
      focusSpy.mockClear();
      events$.next({ action: 'navigate-up', originalEvent: new KeyboardEvent('keydown') });
      expect(focusSpy).not.toHaveBeenCalled();
      document.body.removeChild(current);
    });

    it('navigate with no focusable elements does nothing', () => {
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      expect(() => events$.next({ action: 'navigate-down', originalEvent: event })).not.toThrow();
    });

    it('confirm action clicks focused button', () => {
      const btn = createFocusableButton(makeRect(0, 0));
      const clickSpy = jest.fn();
      btn.addEventListener('click', clickSpy);
      document.body.appendChild(btn);
      btn.focus();
      events$.next({ action: 'confirm', originalEvent: new KeyboardEvent('keydown') });
      expect(clickSpy).toHaveBeenCalled();
      document.body.removeChild(btn);
    });

    it('confirm action clicks focused anchor', () => {
      const a = document.createElement('a');
      a.href = '#';
      jest.spyOn(a, 'getBoundingClientRect').mockReturnValue(makeRect(0, 0));
      const clickSpy = jest.fn();
      a.addEventListener('click', clickSpy);
      document.body.appendChild(a);
      a.focus();
      events$.next({ action: 'confirm', originalEvent: new KeyboardEvent('keydown') });
      expect(clickSpy).toHaveBeenCalled();
      document.body.removeChild(a);
    });

    it('confirm action clicks role=button element', () => {
      const div = document.createElement('div');
      div.setAttribute('role', 'button');
      div.setAttribute('tabindex', '0');
      const clickSpy = jest.fn();
      div.addEventListener('click', clickSpy);
      document.body.appendChild(div);
      div.focus();
      events$.next({ action: 'confirm', originalEvent: new KeyboardEvent('keydown') });
      expect(clickSpy).toHaveBeenCalled();
      document.body.removeChild(div);
    });

    it('confirm with non-interactive active element does nothing', () => {
      const div = document.createElement('div');
      div.setAttribute('tabindex', '0');
      document.body.appendChild(div);
      div.focus();
      const event = new KeyboardEvent('keydown');
      const preventSpy = jest.spyOn(event, 'preventDefault');
      events$.next({ action: 'confirm', originalEvent: event });
      expect(preventSpy).not.toHaveBeenCalled();
      document.body.removeChild(div);
    });

    it('confirm with null activeElement does nothing', () => {
      const original = Object.getOwnPropertyDescriptor(Document.prototype, 'activeElement')!;
      Object.defineProperty(document, 'activeElement', { get: () => null, configurable: true });
      expect(() =>
        events$.next({ action: 'confirm', originalEvent: new KeyboardEvent('keydown') }),
      ).not.toThrow();
      Object.defineProperty(document, 'activeElement', original);
    });

    it('events are ignored after disable()', () => {
      service.disable();
      const btn = createFocusableButton(makeRect(100, 0));
      document.body.appendChild(btn);
      const focusSpy = jest.spyOn(btn, 'focus');
      events$.next({ action: 'navigate-down', originalEvent: new KeyboardEvent('keydown') });
      expect(focusSpy).not.toHaveBeenCalled();
      document.body.removeChild(btn);
    });
  });

  it('elements inside aria-hidden are excluded from navigation', () => {
    service.enable();
    const wrapper = document.createElement('div');
    wrapper.setAttribute('aria-hidden', 'true');
    const hiddenBtn = createFocusableButton(makeRect(100, 0));
    wrapper.appendChild(hiddenBtn);
    document.body.appendChild(wrapper);
    const focusSpy = jest.spyOn(hiddenBtn, 'focus');
    events$.next({ action: 'navigate-down', originalEvent: new KeyboardEvent('keydown') });
    expect(focusSpy).not.toHaveBeenCalled();
    document.body.removeChild(wrapper);
  });

  it('zero-rect elements with no client rects are excluded', () => {
    service.enable();
    const invisible = document.createElement('button');
    jest.spyOn(invisible, 'getBoundingClientRect').mockReturnValue(makeRect(0, 0, 0, 0));
    jest
      .spyOn(invisible, 'getClientRects')
      .mockReturnValue({ length: 0 } as unknown as DOMRectList);
    const visible = createFocusableButton(makeRect(200, 0));
    document.body.appendChild(invisible);
    document.body.appendChild(visible);
    const invisibleSpy = jest.spyOn(invisible, 'focus');
    const visibleSpy = jest.spyOn(visible, 'focus');
    events$.next({ action: 'navigate-down', originalEvent: new KeyboardEvent('keydown') });
    expect(invisibleSpy).not.toHaveBeenCalled();
    expect(visibleSpy).toHaveBeenCalled();
    document.body.removeChild(invisible);
    document.body.removeChild(visible);
  });
});
