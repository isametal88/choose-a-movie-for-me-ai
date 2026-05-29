export type Platform = 'web' | 'webos';

export interface Environment {
  production: boolean;
  tmdbToken: string;
  tmdbRegion: string;
  platform: Platform;
}
