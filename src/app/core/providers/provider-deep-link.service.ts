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
 * Known provider strategies — Italy (IT region).
 * Tier 1 (search-prefilled): direct search URL for the provider's site/app.
 * Tier 2 (JustWatch fallback): provider not in this map → use justWatchLink.
 *
 * Provider IDs align with TMDB watch/providers (region IT).
 */
const PROVIDER_CONFIGS: Record<number, ProviderConfig> = {
  // ── Tier 1 — direct search URL ──────────────────────────────────────────
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
  39: { buildUrl: (t) => `https://www.nowtv.it/cerca#${enc(t)}` },
  531: { buildUrl: (t) => `https://www.paramountplus.com/search/${enc(t)}/` },
  227: { buildUrl: (t) => `https://www.raiplay.it/ricerca?q=${enc(t)}` },
  11: { buildUrl: (t) => `https://mubi.com/it/search?q=${enc(t)}` },
  283: { buildUrl: (t) => `https://www.crunchyroll.com/search?q=${enc(t)}` },
  510: { buildUrl: (t) => `https://www.discoveryplus.com/it/search?q=${enc(t)}` },
  591: { buildUrl: (t) => `https://www.mediasetinfinity.it/ricerca?q=${enc(t)}` },
  695: { buildUrl: (t) => `https://www.dazn.com/it-IT/search?q=${enc(t)}` },
  109: { buildUrl: (t) => `https://www.timvision.it/search?q=${enc(t)}` },
  192: {
    buildUrl: (t) => `https://www.youtube.com/results?search_query=${enc(t)}`,
    webosAppId: 'youtube.leanback.v4',
  },
  1899: { buildUrl: (t) => `https://www.max.com/search?q=${enc(t)}` },
  35: { buildUrl: (t) => `https://www.rakuten.tv/it/search?q=${enc(t)}` },
  538: { buildUrl: (t) => `https://watch.plex.tv/search?q=${enc(t)}` },
  // IDs 40 (Chili), 3 (Google Play), 68 (Microsoft) fall back to JustWatch
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
