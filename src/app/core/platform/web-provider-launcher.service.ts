import { Injectable, inject } from '@angular/core';
import { LunaBridge, ProviderLaunchPayload, ProviderLauncher } from './platform.model';
import { LUNA_BRIDGE } from './platform.tokens';

/** Unified provider launcher — opens the provider URL on web or launches the app on webOS. */
@Injectable({ providedIn: 'root' })
export class WebProviderLauncherService implements ProviderLauncher {
  private readonly luna: LunaBridge = inject(LUNA_BRIDGE);

  launch(payload: ProviderLaunchPayload): void {
    if (this.luna.isAvailable()) {
      if (payload.webosAppId) {
        void this.luna.launchApp({ appId: payload.webosAppId });
      }
      return;
    }
    window.open(payload.url, '_blank', 'noopener,noreferrer');
  }
}
