// ── API polyfills for Chrome 68 (webOS 5.x / LG CX) ──────────────────────────

// globalThis — Chrome 71+
if (typeof globalThis === 'undefined') {
  (window as unknown as Record<string, unknown>)['globalThis'] = window;
}

// queueMicrotask — Chrome 71+  (critical: Angular zoneless uses this for CD)
if (typeof queueMicrotask === 'undefined') {
  (window as unknown as Record<string, unknown>)['queueMicrotask'] = (fn: () => void) =>
    Promise.resolve().then(fn);
}

// Array.prototype.flat — Chrome 69+
if (!Array.prototype.flat) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Array.prototype as any).flat = function (depth = 1): unknown[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flatDeep = (arr: any[], d: number): unknown[] =>
      d > 0
        ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val), [])
        : arr.slice();
    return flatDeep(this, depth);
  };
}

// Array.prototype.flatMap — Chrome 69+
if (!Array.prototype.flatMap) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Array.prototype as any).flatMap = function <T, U>(fn: (v: T, i: number, a: T[]) => U): U[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (Array.prototype as any).flat.call(this.map(fn), 1);
  };
}

// Promise.allSettled — Chrome 76+
if (!Promise.allSettled) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Promise as any).allSettled = (promises: Promise<unknown>[]) =>
    Promise.all(
      promises.map((p) =>
        Promise.resolve(p).then(
          (value) => ({ status: 'fulfilled', value }),
          (reason) => ({ status: 'rejected', reason }),
        ),
      ),
    );
}
