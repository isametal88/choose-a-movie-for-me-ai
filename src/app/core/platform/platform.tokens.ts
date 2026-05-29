import { InjectionToken } from '@angular/core';
import { LunaBridge, ProviderLauncher } from './platform.model';

export const LUNA_BRIDGE = new InjectionToken<LunaBridge>('LunaBridge');
export const PROVIDER_LAUNCHER = new InjectionToken<ProviderLauncher>('ProviderLauncher');
