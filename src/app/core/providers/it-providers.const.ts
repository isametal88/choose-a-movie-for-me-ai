/**
 * Display order for the filter screen — Italy (IT region).
 * Lower index = higher priority.
 * Only providers with an entry here are shown in the filter screen.
 */
export const IT_PROVIDER_ORDER: Record<number, number> = {
  8: 0,
  119: 1,
  337: 2,
  350: 3,
  39: 4,
  531: 5,
  227: 6,
  11: 7,
  283: 8,
  510: 9,
  591: 10,
  695: 11,
  109: 12,
  192: 13,
  1899: 14,
  35: 15,
  538: 16,
  40: 17,
  3: 18,
  68: 19,
};

/** Set of TMDB provider IDs available in Italy (derived from IT_PROVIDER_ORDER). */
export const IT_PROVIDER_IDS: ReadonlySet<number> = new Set<number>(
  (Object.keys(IT_PROVIDER_ORDER) as unknown as number[]).map(Number),
);
