export type Platform = 'web' | 'webos';

export interface ProviderLaunchPayload {
  /** Deep-link URL to open on web */
  url: string;
  /** webOS app ID for Luna launch (e.g. 'netflix') */
  webosAppId?: string;
  /** Search query to pre-fill when no direct deep-link is available */
  searchQuery?: string;
}

export interface LunaLaunchOptions {
  appId: string;
  params?: Record<string, string>;
}

/** Interface for the webOS Luna service bridge. Real impl excluded from coverage. */
export interface LunaBridge {
  /** Launch a webOS app. Resolves on success, rejects on failure. */
  launchApp(options: LunaLaunchOptions): Promise<void>;
  /** Returns true when running inside the webOS environment. */
  isAvailable(): boolean;
}

/** Unified provider launcher — same call works on web and webOS. */
export interface ProviderLauncher {
  launch(payload: ProviderLaunchPayload): void;
}
