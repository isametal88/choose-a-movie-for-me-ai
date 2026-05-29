import { pickRandom } from './random-picker';

describe('pickRandom', () => {
  it('returns the only element from a single-item array', () => {
    expect(pickRandom([42])).toBe(42);
  });

  it('returns a value from the array', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = pickRandom(arr);
    expect(arr).toContain(result);
  });

  it('returns different elements over many calls (statistical)', () => {
    const arr = [1, 2, 3, 4, 5];
    const seen = new Set<number>();
    for (let i = 0; i < 200; i++) {
      seen.add(pickRandom(arr));
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it('works with string items', () => {
    const arr = ['a', 'b', 'c'];
    expect(arr).toContain(pickRandom(arr));
  });
});
