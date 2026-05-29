import { Injectable } from '@angular/core';
import { LunaBridge, LunaLaunchOptions } from './platform.model';

declare global {
  interface Window {
    webOS?: {
      service: {
        request: (
          uri: string,
          options: {
            method: string;
            parameters?: Record<string, unknown>;
            onSuccess?: (response: unknown) => void;
            onFailure?: (error: unknown) => void;
          },
        ) => void;
      };
    };
  }
}

/** Real webOS Luna bridge — calls the platform's app-manager service to launch provider apps. */
@Injectable()
export class WebOSLunaBridge implements LunaBridge {
  isAvailable(): boolean {
    return typeof window.webOS !== 'undefined' && !!window.webOS.service;
  }

  launchApp(options: LunaLaunchOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      window.webOS!.service.request('luna://com.webos.service.applicationmanager', {
        method: 'launch',
        parameters: { id: options.appId, params: options.params ?? {} },
        onSuccess: () => resolve(),
        onFailure: (err) => reject(err),
      });
    });
  }
}
