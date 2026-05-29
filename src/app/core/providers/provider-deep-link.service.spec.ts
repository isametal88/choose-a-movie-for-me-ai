import { TestBed } from '@angular/core/testing';
import { ProviderDeepLinkService } from './provider-deep-link.service';

describe('ProviderDeepLinkService', () => {
  let service: ProviderDeepLinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ProviderDeepLinkService] });
    service = TestBed.inject(ProviderDeepLinkService);
  });

  it('creates', () => expect(service).toBeTruthy());

  // ── Tier 1: search-prefilled known providers with webOS app ID ──────────────

  it('Netflix (8) — search-prefilled URL + webOS app ID', () => {
    const result = service.build(8, 'Inception');
    expect(result.url).toBe('https://www.netflix.com/search?q=Inception');
    expect(result.webosAppId).toBe('netflix');
  });

  it('Amazon Prime (119) — search-prefilled URL + webOS app ID', () => {
    const result = service.build(119, 'Breaking Bad');
    expect(result.url).toBe('https://www.amazon.it/s?k=Breaking%20Bad');
    expect(result.webosAppId).toBe('amazon');
  });

  it('Disney+ (337) — search-prefilled URL + webOS app ID', () => {
    const result = service.build(337, 'The Mandalorian');
    expect(result.url).toBe('https://www.disneyplus.com/search/The%20Mandalorian');
    expect(result.webosAppId).toBe('com.disney.disneyplus-prod');
  });

  it('Apple TV+ (350) — search-prefilled URL + webOS app ID', () => {
    const result = service.build(350, 'Ted Lasso');
    expect(result.url).toBe('https://tv.apple.com/search?term=Ted%20Lasso');
    expect(result.webosAppId).toBe('com.apple.appletv');
  });

  it('YouTube (192) — search-prefilled URL + webOS app ID', () => {
    const result = service.build(192, 'free film');
    expect(result.url).toBe('https://www.youtube.com/results?search_query=free%20film');
    expect(result.webosAppId).toBe('youtube.leanback.v4');
  });

  // ── Tier 1: search-prefilled known providers WITHOUT webOS app ID ───────────

  it('Paramount+ (531) — search-prefilled URL, no webOS app ID', () => {
    const result = service.build(531, 'Star Trek');
    expect(result.url).toBe('https://www.paramountplus.com/search/Star%20Trek/');
    expect(result.webosAppId).toBeUndefined();
  });

  it('Rai Play (227) — search-prefilled URL, no webOS app ID', () => {
    const result = service.build(227, 'Doc');
    expect(result.url).toBe('https://www.raiplay.it/ricerca?q=Doc');
    expect(result.webosAppId).toBeUndefined();
  });

  it('NOW (39) — search-prefilled URL, no webOS app ID', () => {
    const result = service.build(39, 'Mare fuori');
    expect(result.url).toContain('nowtv.it');
    expect(result.webosAppId).toBeUndefined();
  });

  it('MUBI (11) — search-prefilled URL, no webOS app ID', () => {
    const result = service.build(11, 'Parasite');
    expect(result.url).toBe('https://mubi.com/it/search?q=Parasite');
    expect(result.webosAppId).toBeUndefined();
  });

  // ── Tier 2: JustWatch fallback for unknown providers ────────────────────────

  it('unknown provider with justWatchLink — returns JustWatch URL', () => {
    const justWatch = 'https://www.justwatch.com/it/film/some-movie';
    const result = service.build(9999, 'Some Movie', justWatch);
    expect(result.url).toBe(justWatch);
    expect(result.webosAppId).toBeUndefined();
  });

  it('unknown provider without justWatchLink — returns empty URL', () => {
    const result = service.build(9999, 'Some Movie');
    expect(result.url).toBe('');
    expect(result.webosAppId).toBeUndefined();
  });

  // ── URL encoding ─────────────────────────────────────────────────────────────

  it('encodes special characters in title', () => {
    const result = service.build(8, "L'amour & la vie");
    expect(result.url).toBe("https://www.netflix.com/search?q=L'amour%20%26%20la%20vie");
  });
});
