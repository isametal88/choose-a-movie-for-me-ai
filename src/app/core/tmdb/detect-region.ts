/** Derives a TMDB-compatible ISO 3166-1 alpha-2 region code from a BCP 47 language tag.
 * Falls back to 'IT' when no region subtag is present. */
export function detectRegion(language = navigator.language): string {
  if (!language) return 'IT';
  const parts = language.split('-');
  return parts.length >= 2 ? parts[parts.length - 1].toUpperCase() : 'IT';
}
