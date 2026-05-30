import { IT_PROVIDER_IDS, IT_PROVIDER_ORDER } from './it-providers.const';

describe('IT_PROVIDER_IDS', () => {
  it('contains exactly 20 providers', () => {
    expect(IT_PROVIDER_IDS.size).toBe(20);
  });

  it('includes the major Italian streaming services', () => {
    expect(IT_PROVIDER_IDS.has(8)).toBe(true); // Netflix
    expect(IT_PROVIDER_IDS.has(119)).toBe(true); // Amazon Prime Video
    expect(IT_PROVIDER_IDS.has(337)).toBe(true); // Disney+
    expect(IT_PROVIDER_IDS.has(350)).toBe(true); // Apple TV+
    expect(IT_PROVIDER_IDS.has(227)).toBe(true); // RaiPlay
    expect(IT_PROVIDER_IDS.has(39)).toBe(true); // NOW
    expect(IT_PROVIDER_IDS.has(531)).toBe(true); // Paramount+
    expect(IT_PROVIDER_IDS.has(11)).toBe(true); // MUBI
    expect(IT_PROVIDER_IDS.has(283)).toBe(true); // Crunchyroll
    expect(IT_PROVIDER_IDS.has(1899)).toBe(true); // Max
  });

  it('does not include obscure/non-Italian providers', () => {
    expect(IT_PROVIDER_IDS.has(9999)).toBe(false);
    expect(IT_PROVIDER_IDS.has(0)).toBe(false);
  });
});

describe('IT_PROVIDER_ORDER', () => {
  it('has an order entry for every provider in IT_PROVIDER_IDS', () => {
    IT_PROVIDER_IDS.forEach((id) => {
      expect(IT_PROVIDER_ORDER[id]).toBeDefined();
    });
  });

  it('Netflix has the highest priority (order 0)', () => {
    expect(IT_PROVIDER_ORDER[8]).toBe(0);
  });

  it('Amazon is second (order 1)', () => {
    expect(IT_PROVIDER_ORDER[119]).toBe(1);
  });

  it('all order values are unique', () => {
    const values = Object.values(IT_PROVIDER_ORDER);
    expect(new Set(values).size).toBe(values.length);
  });
});
