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

  // ── Tier 1: new IT providers ────────────────────────────────────────────────

  it('Crunchyroll (283) — search-prefilled URL, no webOS app ID', () => {
    const result = service.build(283, 'Attack on Titan');
    expect(result.url).toBe('https://www.crunchyroll.com/search?q=Attack%20on%20Titan');
    expect(result.webosAppId).toBeUndefined();
  });

  it('Discovery+ (510) — search-prefilled URL, no webOS app ID', () => {
    const result = service.build(510, 'Casa a prima vista');
    expect(result.url).toContain('discoveryplus.com');
    expect(result.webosAppId).toBeUndefined();
  });

  it('Mediaset Infinity (591) — search-prefilled URL, no webOS app ID', () => {
    const result = service.build(591, 'Le Iene');
    expect(result.url).toContain('mediasetinfinity.it');
    expect(result.webosAppId).toBeUndefined();
  });

  it('DAZN (695) — search-prefilled URL, no webOS app ID', () => {
    const result = service.build(695, 'Formula 1');
    expect(result.url).toContain('dazn.com');
    expect(result.webosAppId).toBeUndefined();
  });

  it('TimVision (109) — search-prefilled URL, no webOS app ID', () => {
    const result = service.build(109, 'MasterChef');
    expect(result.url).toContain('timvision.it');
    expect(result.webosAppId).toBeUndefined();
  });

  it('Max/HBO (1899) — search-prefilled URL, no webOS app ID', () => {
    const result = service.build(1899, 'The Last of Us');
    expect(result.url).toBe('https://www.max.com/search?q=The%20Last%20of%20Us');
    expect(result.webosAppId).toBeUndefined();
  });

  it('Rakuten TV (35) — search-prefilled URL, no webOS app ID', () => {
    const result = service.build(35, 'Top Gun');
    expect(result.url).toContain('rakuten.tv');
    expect(result.webosAppId).toBeUndefined();
  });

  it('Plex (538) — search-prefilled URL, no webOS app ID', () => {
    const result = service.build(538, 'Free film');
    expect(result.url).toContain('plex.tv');
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
