import { Injectable, inject } from '@angular/core';
import { ENVIRONMENT } from '../../shared/environment.token';
import { Platform } from './platform.model';

@Injectable({ providedIn: 'root' })
export class PlatformService {
  private readonly env = inject(ENVIRONMENT);

  get platform(): Platform {
    return this.env.platform as Platform;
  }

  get isWebOS(): boolean {
    return this.platform === 'webos';
  }

  get isWeb(): boolean {
    return this.platform === 'web';
  }
}
