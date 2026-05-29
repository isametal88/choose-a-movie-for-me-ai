import { detectRegion } from './detect-region';

describe('detectRegion()', () => {
  it('extracts region from full BCP 47 tag', () => {
    expect(detectRegion('it-IT')).toBe('IT');
    expect(detectRegion('en-US')).toBe('US');
    expect(detectRegion('en-GB')).toBe('GB');
    expect(detectRegion('fr-FR')).toBe('FR');
    expect(detectRegion('de-DE')).toBe('DE');
  });

  it('extracts last subtag when 3-part tag is given', () => {
    expect(detectRegion('zh-Hant-TW')).toBe('TW');
  });

  it('returns IT when no region subtag present', () => {
    expect(detectRegion('en')).toBe('IT');
    expect(detectRegion('it')).toBe('IT');
  });

  it('returns IT for empty string', () => {
    expect(detectRegion('')).toBe('IT');
  });

  it('upper-cases the region code', () => {
    expect(detectRegion('en-us')).toBe('US');
  });
});
