import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { WebLunaBridge } from './core/platform/web-luna.bridge';
import { WebOSLunaBridge } from './core/platform/webos-luna.bridge';
import { LunaBridge } from './core/platform/platform.model';
import { LUNA_BRIDGE } from './core/platform/platform.tokens';
import { routes } from './app.routes';
import { ENVIRONMENT } from './shared/environment.token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes),
    { provide: ENVIRONMENT, useValue: environment },
    {
      provide: LUNA_BRIDGE,
      useFactory: (): LunaBridge =>
        environment.platform === 'webos' ? new WebOSLunaBridge() : new WebLunaBridge(),
    },
  ],
};
