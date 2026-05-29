import { Injectable } from '@angular/core';
import { ProviderLaunchPayload } from '../platform/platform.model';

interface ProviderConfig {
  /** Search-prefilled or direct URL builder for this provider */
  buildUrl: (title: string) => string;
  /** webOS app ID for Luna launch; undefined if no dedicated webOS app is known */
  webosAppId?: string;
}

const enc = encodeURIComponent;

/**
 * Known provider strategies.
 * Tier 1 (search-prefilled): build a search URL for the provider's own app/site.
 * Tier 2 (JustWatch fallback): provider not listed here — fall back to the JustWatch link.
 *
 * Provider IDs from TMDB watch/providers:
 *   8   Netflix           search-prefilled  webOS: netflix
 *   119 Amazon Prime      search-prefilled  webOS: amazon
 *   337 Disney+           search-prefilled  webOS: com.disney.disneyplus-prod
 *   350 Apple TV+         search-prefilled  webOS: com.apple.appletv
 *   192 YouTube           search-prefilled  webOS: youtube.leanback.v4
 *   531 Paramount+        search-prefilled  (no known webOS app ID)
 *   227 Rai Play          search-prefilled  (no known webOS app ID)
 *    39 NOW               search-prefilled  (no known webOS app ID)
 *    11 MUBI              search-prefilled  (no known webOS app ID)
 */
const PROVIDER_CONFIGS: Record<number, ProviderConfig> = {
  8: { buildUrl: (t) => `https://www.netflix.com/search?q=${enc(t)}`, webosAppId: 'netflix' },
  119: { buildUrl: (t) => `https://www.amazon.it/s?k=${enc(t)}`, webosAppId: 'amazon' },
  337: {
    buildUrl: (t) => `https://www.disneyplus.com/search/${enc(t)}`,
    webosAppId: 'com.disney.disneyplus-prod',
  },
  350: {
    buildUrl: (t) => `https://tv.apple.com/search?term=${enc(t)}`,
    webosAppId: 'com.apple.appletv',
  },
  192: {
    buildUrl: (t) => `https://www.youtube.com/results?search_query=${enc(t)}`,
    webosAppId: 'youtube.leanback.v4',
  },
  531: { buildUrl: (t) => `https://www.paramountplus.com/search/${enc(t)}/` },
  227: { buildUrl: (t) => `https://www.raiplay.it/ricerca?q=${enc(t)}` },
  39: { buildUrl: (t) => `https://www.nowtv.it/cerca#${enc(t)}` },
  11: { buildUrl: (t) => `https://mubi.com/it/search?q=${enc(t)}` },
};

@Injectable({ providedIn: 'root' })
export class ProviderDeepLinkService {
  /**
   * Build a launch payload for the given provider.
   *
   * Strategy:
   *  1. If the provider is in PROVIDER_CONFIGS → search-prefilled URL + optional webOS app ID.
   *  2. Otherwise → fall back to the JustWatch link TMDB provides (justWatchLink).
   */
  build(providerId: number, title: string, justWatchLink?: string): ProviderLaunchPayload {
    const config = PROVIDER_CONFIGS[providerId];
    if (config) {
      return { url: config.buildUrl(title), webosAppId: config.webosAppId };
    }
    return { url: justWatchLink ?? '' };
  }
}
