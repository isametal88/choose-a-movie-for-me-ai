import { Injectable } from '@angular/core';
import { LunaBridge, LunaLaunchOptions } from './platform.model';

/** Web stub for LunaBridge — no-ops since Luna is only available on webOS. */
@Injectable({ providedIn: 'root' })
export class WebLunaBridge implements LunaBridge {
  isAvailable(): boolean {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  launchApp(_options: LunaLaunchOptions): Promise<void> {
    return Promise.resolve();
  }
}
