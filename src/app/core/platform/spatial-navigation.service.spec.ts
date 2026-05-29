import { TestBed } from '@angular/core/testing';
import { SpatialNavigationService } from './spatial-navigation.service';

/** Create a focusable button with a mocked bounding rect. */
function makeEl(x: number, y: number, w = 100, h = 40): HTMLButtonElement {
  const el = document.createElement('button');
  el.setAttribute('tabindex', '0');
  jest.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    left: x,
    top: y,
    right: x + w,
    bottom: y + h,
    width: w,
    height: h,
    x,
    y,
    toJSON: () => ({}),
  } as DOMRect);
  jest.spyOn(el, 'focus');
  document.body.appendChild(el);
  return el;
}

function fireKey(code: number): void {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { keyCode: code, bubbles: true, cancelable: true }),
  );
}

function setActive(el: HTMLElement): void {
  Object.defineProperty(document, 'activeElement', { value: el, configurable: true });
}

describe('SpatialNavigationService', () => {
  let svc: SpatialNavigationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    svc = TestBed.inject(SpatialNavigationService);
    svc.init();
  });

  afterEach(() => {
    document.querySelectorAll('button').forEach((el) => el.remove());
    Object.defineProperty(document, 'activeElement', { value: null, configurable: true });
  });

  it('should be created', () => {
    expect(svc).toBeTruthy();
  });

  it('focuses first element when nothing is focused and arrow is pressed', () => {
    const btn = makeEl(100, 100);
    fireKey(39); // right
    expect(btn.focus).toHaveBeenCalled();
  });

  it('does not call preventDefault for non-arrow keys', () => {
    const e = new KeyboardEvent('keydown', { keyCode: 13, bubbles: true, cancelable: true });
    const spy = jest.spyOn(e, 'preventDefault');
    document.dispatchEvent(e);
    expect(spy).not.toHaveBeenCalled();
  });

  describe('right', () => {
    it('moves to the nearest element to the right', () => {
      const left = makeEl(100, 200); // center (150, 220)
      const right = makeEl(300, 200); // center (350, 220)
      setActive(left);
      fireKey(39);
      expect(right.focus).toHaveBeenCalled();
    });

    it('prefers horizontally aligned elements over diagonal ones', () => {
      const aligned = makeEl(300, 200); // center (350, 220) — same row
      const diagonal = makeEl(300, 400); // center (350, 420) — far below
      const current = makeEl(100, 200); // center (150, 220)
      setActive(current);
      fireKey(39);
      expect(aligned.focus).toHaveBeenCalled();
      expect(diagonal.focus).not.toHaveBeenCalled();
    });

    it('ignores elements to the left', () => {
      const leftEl = makeEl(0, 200);
      const current = makeEl(200, 200);
      setActive(current);
      fireKey(39);
      expect(leftEl.focus).not.toHaveBeenCalled();
    });
  });

  describe('left', () => {
    it('moves to the nearest element to the left', () => {
      const left = makeEl(50, 200);
      const current = makeEl(300, 200);
      setActive(current);
      fireKey(37);
      expect(left.focus).toHaveBeenCalled();
    });
  });

  describe('down', () => {
    it('moves to the nearest element below', () => {
      const top = makeEl(200, 100);
      const bottom = makeEl(200, 250);
      setActive(top);
      fireKey(40);
      expect(bottom.focus).toHaveBeenCalled();
    });

    it('prefers vertically aligned elements over diagonal ones', () => {
      const aligned = makeEl(200, 250); // directly below
      const diagonal = makeEl(500, 250); // below but far to the right
      const current = makeEl(200, 100);
      setActive(current);
      fireKey(40);
      expect(aligned.focus).toHaveBeenCalled();
      expect(diagonal.focus).not.toHaveBeenCalled();
    });
  });

  describe('up', () => {
    it('moves to the nearest element above', () => {
      const top = makeEl(200, 50);
      const current = makeEl(200, 300);
      setActive(current);
      fireKey(38);
      expect(top.focus).toHaveBeenCalled();
    });
  });

  it('does nothing when no element exists in the direction', () => {
    const btn = makeEl(500, 200);
    const spy = jest.spyOn(btn, 'focus');
    setActive(btn);
    fireKey(39); // right — nothing to the right
    expect(spy).not.toHaveBeenCalled();
  });

  it('skips aria-hidden elements', () => {
    const wrapper = document.createElement('div');
    wrapper.setAttribute('aria-hidden', 'true');
    const hidden = makeEl(300, 200);
    wrapper.appendChild(hidden);
    document.body.appendChild(wrapper);

    const current = makeEl(100, 200);
    setActive(current);
    fireKey(39);
    expect(hidden.focus).not.toHaveBeenCalled();
  });

  it('skips elements with zero size', () => {
    const zero = makeEl(300, 200, 0, 0);
    const current = makeEl(100, 200);
    setActive(current);
    fireKey(39);
    expect(zero.focus).not.toHaveBeenCalled();
  });
});
