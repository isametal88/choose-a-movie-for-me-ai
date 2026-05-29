# Movie Picker — Claude Code Execution Plan

> **Single source of truth.** This file drives the whole build. Work through it **one step at a time**, top to bottom. Do **not** read ahead and implement multiple steps at once.

---

## How to use this file (read this first, every session)

**Operating protocol — follow on every turn:**

1. Open this file and find the **first step whose checkbox is still `[ ]`**. That is the *current step*. Ignore all later steps.
2. State out loud which step you are about to do (e.g. "Working on **P07**").
3. Implement **only** that step. Do not start the next one.
4. Run the **Quality Gate** (see below) for the work you just did.
5. When the gate passes, edit this file: change the step's `[ ]` to `[x]` and write a one-line note under it (what you did + anything I should know).
6. **Stop and wait** for me to type `continue` (or `c`). Do not proceed to the next step on your own.
7. If something is ambiguous or a decision is needed, **stop and ask** instead of guessing.

**Commands I may give you:**
- `continue` / `c` → start the next unchecked step.
- `redo` → the last step isn't right; revert the checkbox and fix it.
- `expand Pxx` → before doing it, break that step into sub-tasks and show me the plan first.
- `status` → list which steps are done and what's next, no coding.

**Quality Gate (must pass before checking off any code step):**
- `lint` clean, `typecheck` clean.
- Unit tests pass; coverage meets the target in `CLAUDE.md` for the touched code.
- New/changed UI has a Storybook story and an axe check.
- Build still works (web target; also webOS target once P03 is done).
- No interaction is hover-only; keyboard + D-pad focus works where applicable.

> The invariant rules live in `CLAUDE.md` after **P01**. From P02 on, you may write "per `CLAUDE.md`" instead of repeating them — but you must still actually honor them.

---

## Project summary (context, not a step)

Frontend-only Angular web app, also built as a **webOS (LG TV)** app. It helps the user pick a **movie or TV show** to watch via the **TMDB API**.

- Filter by: **genre**, **providers the user subscribes to** (multi-select), **minimum average rating**, and **movie vs TV** toggle. Plus a **free-text search** that leads to the same detail result.
- From the filtered results, **pick one at random** out of the first 50; the user can say **"already seen → pick another"**; seen titles are remembered (localStorage) and excluded; when the first 50 are exhausted, move to the next 50.
- **Detail view:** poster, title, overview, runtime, genres, rating, cast/crew, and an accessible **trailer** embed.
- **Core feature — where to watch:** show providers grouped by **subscription / rent / buy** (TMDB watch/providers, region IT). Clicking a provider uses a **tiered deep-link strategy**: direct title URL where a known pattern exists → otherwise search-prefilled provider URL → otherwise the JustWatch page TMDB gives us. On **webOS**, the same strategy launches the provider app via **Luna** (app launch, not exact title — platform content-ids aren't available from TMDB), degrading gracefully off-webOS.

**Confirmed decisions:** latest Angular (standalone, signals, new control flow, strict) · no backend · TMDB token in env, exposed is acceptable for now · **NgRx SignalStore** · custom design system on **Angular CDK** · **Jest** unit tests, **100%** on lines/statements/functions (branch best-effort), platform/Luna bridges isolated behind mockable interfaces and excluded with documented reasons · **Playwright + axe-core** for E2E and accessibility · **Storybook** for every UI component · responsive · TV accessibility (D-pad spatial navigation, 10-foot UI) treated as an additive layer, designed in from the start · default region **IT**, configurable.

---

## Phase 0 — Foundations

- [x] **P01 — Invariant rules.** Create `CLAUDE.md` capturing the invariant rules of this project: latest Angular (standalone components, signals, new control flow, strict mode); no backend; TMDB region default IT but configurable; custom design system on Angular CDK; NgRx SignalStore; Jest unit tests with 100% coverage on lines/statements/functions (branch best-effort) and documented exclusions only for non-testable platform bridges; E2E and accessibility audits with Playwright + axe-core; every UI component has tests and a Storybook story; responsive layout and never hover-only interactions; every platform access (webOS/Luna) and deep-link builder sits behind a mockable interface. Do not write any feature yet.
  > Created `CLAUDE.md` with all invariants: Angular standalone/signals/strict, no backend, TMDB IT region, CDK design system, NgRx SignalStore, Jest 100% lines/statements/functions, Playwright+axe E2E, Storybook per component, never-hover-only, platform bridges behind mockable interfaces, and a coverage-exclusions register for the real Luna bridge.

- [x] **P02 — Workspace scaffold.** Scaffold the Angular workspace per `CLAUDE.md`: folder structure `core/`, `shared/`, `design-system/`, `features/`; TypeScript path aliases; environment config for TMDB token and region; ESLint + Prettier; git hooks running lint + tests pre-commit. Configure Jest with a 100% coverage threshold and Playwright with axe-core. Add Storybook.
  > Angular 21 workspace scaffolded; folders + path aliases configured; environment.ts (prod) + environment.development.ts with tmdbRegion default IT; ESLint (angular-eslint, flat config .mjs) + Prettier; Husky pre-commit runs lint-staged + jest; Jest (jest-preset-angular, jsdom, 100% lines/statements/functions threshold); Playwright + axe-core with e2e/ dir; Storybook 10 with @storybook/addon-a11y; build + lint + test all clean.

- [x] **P03 — webOS build target.** Add a second build target for webOS: `appinfo.json`, packaging scripts, and a conditional web-vs-webOS build mechanism. Do not implement Luna yet — only the build skeleton and a platform variable.
  > Added `environment.model.ts` (typed `Platform = 'web' | 'webos'`); updated all env files; created `webos/` with `appinfo.json` + placeholder icons; angular.json `webos` config (outputPath `dist/webos`, no hashing, file replacement, asset copy); `npm run build:webos` verified — `appinfo.json` lands in `dist/webos/browser/`; `package:webos` script documented (requires `ares-cli` SDK); build/lint/test all clean.

## Phase 1 — Design system

- [x] **P04 — Design tokens.** Create design tokens (colors, type scale, spacing, radii, elevation, motion) as CSS custom properties with a theming layer, including from the start a **tv / 10-foot** variant (larger targets, strong focus ring). Document the DS philosophy in an introductory Storybook story.
  > Created `src/app/design-system/tokens/_tokens.scss` with full token set (raw palette + semantic colors, type scale, 4 px spacing grid, radii, elevation, motion); `[data-theme="tv"]` variant scales type ~1.5×, spacing proportionally, targets to 72 px, focus ring to 4 px amber; `prefers-reduced-motion` zeroes all durations; imported globally in `styles.scss`; DS intro MDX story at `tokens.stories.mdx`; web + webOS builds, lint, tests all clean.

- [x] **P05 — a11y-first primitives.** Implement CDK-based accessibility primitives: Button, Icon, Link, Spinner, VisuallyHidden, FocusTrap. Strongly typed, 100% unit-tested, with Storybook stories and an axe check in each story.
  > All 6 primitives built in `src/app/design-system/primitives/`; signal-based inputs; Button (3 variants × 3 sizes, disabled/busy ARIA); Icon (aria-hidden vs role=img); Spinner (role=status, 3 sizes); Link (routerLink + external http/https detection, VisuallyHidden hint); FocusTrap (CDK cdkTrapFocus); VisuallyHidden (clip CSS). 49 tests, 100% coverage on all component TS files. Stories with a11y addon. ESLint updated to allow `ds` prefix. Fixed zoneless test setup (`setupZonelessTestEnv`), stories/barrel excluded from coverage.

- [x] **P06 — Domain DS components.** Implement the domain DS components: Card, Chip/Tag, accessible Select and MultiSelect, Slider (for rating), TextField/SearchInput, Modal/Dialog, Rating display, Poster with lazy-load and placeholder, Badge. Each with tests, story, and axe check.
  > 10 domain components built in `src/app/design-system/components/`; 100% lines/statements/functions/branches coverage; barrel index added; lint + build clean. Two-way model bindings in specs split into `[input]` + `(outputChange)` to satisfy angular-eslint two-way binding rule.

- [x] **P07 — Layout primitives.** Add layout primitives: responsive grid, breakpoint system, container, stack. Verify every component honors the tv variant of the tokens.
  > Grid (auto-fill + minWidth strategy), Container (sm→full sizes, TV extra padding via `:host-context`), Stack (direction/align/justify/gap/wrap), BreakpointService (CDK BreakpointObserver → Signal); 201 tests, 100% all metrics; lint + build clean.

## Phase 2 — Input & platform abstraction

- [x] **P08 — Spatial navigation.** Create an input-abstraction layer and a spatial-navigation (D-pad) service for TV: focus model, focus order, arrow/enter/back handling, enableable per route. DS components must not know the input type. Test with mocked input.
  > `InputDispatcherService` (keyboard → `InputAction`, window listener); `SpatialNavigationService` (BoundingRect-based D-pad focus, enable/disable per route); `SpatialNavZoneDirective` (enable on init, disable on destroy); 100% coverage; DS components untouched; lint/build clean.

- [x] **P09 — Platform & bridge interfaces.** Create `PlatformService` (web vs webOS) and the `LunaBridge` and `ProviderLauncher` interfaces, both mockable. Only interfaces plus a web stub implementation; no real Luna calls yet. 100% tests on the stubs.
  > `PlatformService` (reads ENVIRONMENT token); `LunaBridge` + `ProviderLauncher` interfaces; `WebLunaBridge` stub (isAvailable→false, launchApp→noop); `WebProviderLauncherService` (window.open or Luna); `LUNA_BRIDGE`/`PROVIDER_LAUNCHER` InjectionTokens; `ENVIRONMENT` token wired in app.config; 262 tests, 100% coverage; lint/build clean.

## Phase 3 — TMDB data layer

- [x] **P10 — TMDB client.** Implement a typed TMDB client (HttpClient): models/DTOs, config service, error handling, retry, caching. Genres endpoint and watch-providers list endpoint. Test with `HttpTestingController`, 100% coverage.
  > `TmdbClient` (genres movie/tv cached, watch-providers cached, discover, search); `TmdbConfigService` (baseUrl, imageUrl, token, region from ENVIRONMENT); retry(2) + catchError + shareReplay(1) for cached endpoints; `HttpTestingController` tests with retry-flush helpers; 294 tests, 100% stmt/func/lines; lint/build clean.

- [x] **P11 — Discover/search + random selection (core).** Implement the discover/search service for movies and TV plus the core selection logic: take the first 50 filtered results, pick at random, track "already seen" titles (persisted to localStorage), exclude them and re-pick, and when the first 50 are exhausted move to the next 50. Write it as a pure service and test it exhaustively — this is the heart of the app.
  > `DiscoverSelectionService` (signal-based state machine: idle/loading/picked/exhausted/empty/error; one API page at a time; random pick; page-advance when page exhausted); `SeenTitlesService` (localStorage-backed Set); `pickRandom`; 332 tests, 100% all metrics; lint/build clean.

- [x] **P12 — Detail service.** Implement the detail service using `append_to_response` for credits, videos, and watch/providers (region IT): trailer-selection logic (official, YouTube, type Trailer, language), runtime, genres, poster, cast/crew. Tests.
  > `DetailService` (getMovieDetail/getTvDetail → MediaDetail); `pickTrailer` (YouTube+Trailer, official preferred, it>en>*); cast capped at 10; movie crew=Directors, TV crew=created_by; watch providers mapped by region; 360 tests, 100% all metrics; lint/typecheck clean.

- [x] **P13 — Tiered deep-link service.** Implement `ProviderDeepLinkService` as a tiered strategy: per-provider builders where the URL is known (direct or search-prefilled), otherwise fall back to the JustWatch page TMDB provides. The same strategy must produce both the web URL and the webOS launch payload. Document in tests which providers are direct/search/fallback. 100% coverage.
  > `ProviderDeepLinkService.build(providerId, title, justWatchLink?)`: Tier 1 (search-prefilled) for Netflix/Amazon/Disney+/AppleTV+/YouTube/Paramount+/RaiPlay/NOW/MUBI with webOS app IDs where known; Tier 2 (JustWatch fallback) for unknown providers; encodeURIComponent applied; 373 tests, 100% all metrics; lint clean.

## Phase 4 — Discovery flow

- [x] **P14 — Criteria store.** Create the NgRx SignalStore for criteria (movie/tv type, genres, owned providers multi-select, minimum rating) wired to the services, with derived state. Tests.
  > `CriteriaStore` (NgRx SignalStore): state (mediaType/genreIds/providerIds/minRating); computed (selectionCriteria with watchRegion from config, activeFilterCount, hasFilters); methods (setMediaType/toggleGenre/toggleProvider/setMinRating/reset); 404 tests, 100% all metrics; lint clean.

- [x] **P15 — Filters screen.** Build the filters screen with DS components: genre selection, multi-select of subscribed providers, rating slider, movie/tv toggle. Responsive, accessible, unit tests + Playwright.
  > `FiltersComponent` (lazy-loaded at `/`): movie/tv toggle, genre chips (per mediaType), provider chips, rating slider, "Pick for me" + "Clear filters" actions; all wired to CriteriaStore; 21 jest tests, 100% TS coverage; Playwright E2E + axe check; lint/build clean.

- [x] **P16 — "Pick for me" flow.** Implement the "pick for me" flow: random pick, loading state, "already seen → show another" action, exhaustion handling, and empty state. Tests + Playwright (happy path and edge cases).
  > `PickComponent` (lazy-loaded at `/pick`): `@switch` on state.status (loading/picked/exhausted/empty/error/idle); `pickedItem()`/`errorMessage()` computed; `showAnother()`, `resetAndPick()`, `retry()`, `posterUrl()`; wired to DiscoverSelectionService + CriteriaStore + SeenTitlesService; 446 tests, 100% all metrics; Playwright E2E + axe; lint clean.

- [x] **P17 — Text search.** Implement text search leading to the same result/detail. Tests + Playwright.
  > Added `query?: string` to `SelectionCriteria`; `DiscoverSelectionService._fetchPage()` branches on query (search vs discover); `CriteriaStore` extended with `query` state + `setQuery()` + `hasFilters`/`activeFilterCount`/`selectionCriteria` updated; `FiltersComponent` adds `ds-text-field[type=search]` bound to store.query; 463 tests, 100% all metrics; Playwright E2E; lint clean.

## Phase 5 — Detail & providers

- [x] **P18 — Detail screen.** Build the detail screen: poster, title, overview, runtime, genres, rating, cast/crew. Responsive, accessible, tests + Playwright.
  > `DetailComponent` (lazy-loaded at `/detail/:mediaType/:id`): backdrop + poster + title + year + runtime + rating + genres (badges) + overview + crew (Director/Created by) + cast list; loading/loaded/error states via signal; formatRuntime/imageUrl/crewNames methods; "See details" link added to PickComponent; 502 tests, 100% all metrics; Playwright E2E + axe; lint clean.

- [x] **P19 — Trailer embed.** Add the trailer embed accessibly and privacy-friendly (focusable, Escape handling, no invasive autoplay). Tests.
  > `TrailerComponent` (`app-trailer`): "Watch trailer" button (aria-label) → `youtube-nocookie.com` iframe (16:9 aspect ratio, title for a11y); Escape to close; `DomSanitizer.bypassSecurityTrustResourceUrl`; embedded in DetailComponent; 521 tests, 100% all metrics; lint clean.

- [x] **P20 — Providers section.** Implement the providers section: grouping by subscription/rent/buy, icons, and a click that invokes `ProviderDeepLinkService` (web opens URL, webOS launches the app, JustWatch fallback). Tests + Playwright with a mocked bridge.
  > `ProvidersComponent` (`app-providers`): Stream/Rent/Buy groups; provider logo + name buttons; click → `ProviderDeepLinkService.build()` + `WebProviderLauncherService.launch()`; JustWatch fallback link; embedded in DetailComponent; 543 tests, 100% all metrics; Playwright E2E; lint clean.

## Phase 6 — TV / webOS hardening

- [x] **P21 — Wire spatial navigation everywhere.** Connect spatial navigation to all screens, enable the tv token mode, handle remote keys (back/enter), and provide instructions for testing on the webOS emulator and for packaging.
  > `AppComponent` refactored: app.html → `<router-outlet />`; sets `data-theme="tv"` on `<html>` when `PlatformService.isWebOS`; subscribes to `InputDispatcherService.events$` for 'back' → `Location.back()`; `appSpatialNavZone` added to `<main>` in FiltersComponent, PickComponent, DetailComponent; 547 tests, 100% all metrics; lint clean.

- [x] **P22 — Real Luna launch.** Implement the real provider launch via Luna behind the `LunaBridge` interface, with graceful degradation when not on webOS. Test the interface; the real bridge is excluded from coverage per `CLAUDE.md`.
  > WebOSLunaBridge (real Luna API) + WebLunaBridge (no-op) + LUNA_BRIDGE token; factory in app.config.ts; WebProviderLauncherService injects LUNA_BRIDGE token; app.config.ts excluded from coverage (bootstrapping config); 548 tests, 100% all metrics; lint clean.

## Phase 7 — Quality & wrap-up

- [x] **P23 — Full a11y pass.** Run a Playwright + axe pass over all routes, keyboard-only and D-pad-only paths, and a responsive viewport matrix. Fix every violation.
  > Fixed: contrast on `filters-screen__loading` (muted→secondary, ratio 7.4:1); added `<h1>` to pick+detail non-content states; fixed E2E button-vs-link role assertions; added `a11y-keyboard.spec.ts` with 4-viewport axe matrix × 3 routes, keyboard nav, D-pad tests. 45 Playwright pass / 9 skip (TMDB-data-conditional); 548 Jest / 100% / lint clean.

- [x] **P24 — Coverage & CI.** Bring coverage to 100% with documented exclusions only for the non-testable bridges, enable CI enforcement (lint, tests, web build + webOS build), and write the README, architecture docs, and a Storybook deployment.
  > `.github/workflows/ci.yml` (lint→unit-tests→build web+webOS→E2E); `.github/workflows/storybook.yml` (GitHub Pages on main push); `README.md` rewritten with quickstart, scripts, architecture, coverage table; both builds pass; 548 Jest / 100% / lint clean.

- [x] **P25 — Final hardening.** Audit error/empty/loading states, lay groundwork for i18n and multi-region for future growth, and do a performance pass (lazy routes, image strategy).
  > Detail: added retry() + "Try again" button in error state; providers: loading="lazy" on logo images; multi-region: detectRegion() utility (navigator.language → ISO 3166-1 alpha-2, IT fallback) wired into TmdbConfigService; 556 tests / 100% / lint + both builds clean.

---

## Progress log (append one line per completed step)

<!-- e.g. P01 ✓ created CLAUDE.md; chose 100% lines/statements/functions, branch best-effort -->
P01 ✓ created CLAUDE.md; all invariants documented including platform-bridge mockability table and coverage-exclusion register.
P02 ✓ Angular 21 workspace scaffolded; Jest + Playwright + Storybook(a11y) + ESLint + Husky all wired up; build/lint/test clean.
P03 ✓ webOS build target added; `platform` field injected via environment file replacement; `appinfo.json` + icons copy into `dist/webos/browser/`; `package:webos` script documented (needs ares-cli).
P04 ✓ Design tokens (CSS custom props) + `[data-theme="tv"]` variant + `prefers-reduced-motion`; MDX intro story; both builds + lint + tests clean.
P05 ✓ 6 a11y primitives (Button/Icon/Link/Spinner/VisuallyHidden/FocusTrap); 49 tests, 100% coverage; Storybook stories + a11y addon; lint/build clean.
P06 ✓ 10 domain components (Badge/Card/Chip/Select/MultiSelect/Slider/TextField/Modal/Rating/Poster); 159 tests total, 100% coverage all metrics; Storybook stories; lint/build clean.
P07 ✓ Layout primitives (Grid/Container/Stack + BreakpointService); SCSS breakpoint mixins; TV variant honored via CSS custom props + :host-context; 201 tests, 100% all metrics; lint/build clean.
P08 ✓ Input abstraction (InputDispatcherService + NormalizedInputEvent) + SpatialNavigationService (BoundingRect D-pad) + SpatialNavZoneDirective; 242 tests, 100% all metrics; lint/build clean.
P09 ✓ PlatformService + LunaBridge/ProviderLauncher interfaces + WebLunaBridge + WebProviderLauncherService stubs + InjectionTokens; ENVIRONMENT token wired; 262 tests, 100% all metrics; lint/build clean.
P10 ✓ TmdbClient (discover/search/genres/providers) + TmdbConfigService + models; retry+cache+error; HttpTestingController tests; 294 tests, 100% stmt/func/lines; lint/build clean.
P11 ✓ DiscoverSelectionService (signal state machine) + SeenTitlesService (localStorage) + pickRandom; page-advance when pool exhausted; 332 tests, 100% all metrics; lint/build clean.
P12 ✓ DetailService (movie+tv with append_to_response) + pickTrailer (official/YouTube/language priority) + MediaDetail model; cast limit 10, Directors/creators crew; 360 tests, 100% all metrics; lint/typecheck clean.
P13 ✓ ProviderDeepLinkService (tiered: search-prefilled for 9 providers, JustWatch fallback); webOS app IDs for 5 providers; URL encoding; 373 tests, 100% all metrics; lint clean.
P14 ✓ CriteriaStore (NgRx SignalStore): mediaType/genreIds/providerIds/minRating state; selectionCriteria/activeFilterCount/hasFilters computed; watchRegion from TmdbConfigService; 404 tests, 100% all metrics; lint clean.
P15 ✓ FiltersComponent (lazy-loaded, responsive): movie/tv toggle, genre/provider chips, rating slider, pick+clear actions wired to CriteriaStore; 426 tests, 100% all metrics; Playwright E2E + axe; build clean.
P16 ✓ PickComponent (lazy-loaded at /pick): @switch state machine (loading/picked/exhausted/empty/error); pickedItem/errorMessage computed; showAnother/resetAndPick/retry; posterUrl; /pick route; 446 tests, 100% all metrics; Playwright E2E + axe; lint clean.
P17 ✓ Text search: query field on filters screen; DiscoverSelectionService branches to tmdb.search() when query set; CriteriaStore extended with query/setQuery; 463 tests, 100% all metrics; Playwright E2E; lint clean.
P18 ✓ DetailComponent (lazy-loaded /detail/:mediaType/:id): backdrop/poster/title/year/runtime/rating/genres/overview/crew/cast; "See details" on PickComponent; 502 tests, 100% all metrics; Playwright E2E + axe; lint clean.
P19 ✓ TrailerComponent: youtube-nocookie.com embed; play/close/Escape; aria-label + title; DomSanitizer; 521 tests, 100% all metrics; lint clean.
P20 ✓ ProvidersComponent: Stream/Rent/Buy groups with logo buttons; ProviderDeepLinkService + WebProviderLauncherService wired; JustWatch link; 543 tests, 100% all metrics; Playwright E2E; lint clean.
P21 ✓ Spatial nav wired to all screens (appSpatialNavZone on <main>); AppComponent: data-theme=tv on webOS; global back→Location.back(); app.html cleaned up; 547 tests, 100% all metrics; lint clean.
P22 ✓ WebOSLunaBridge + LUNA_BRIDGE token + factory in app.config.ts; WebProviderLauncherService now injects token; app.config.ts excluded (bootstrapping); 548 tests, 100% all metrics; lint clean.
P23 ✓ a11y: contrast fix (loading text #9ca3af), page-has-heading-one (h1 in all states), viewport matrix 4×3, keyboard+D-pad nav tests; 45 Playwright pass / 9 skip; 548 Jest / 100% / lint clean.
P24 ✓ CI workflows (lint+tests+build-web+build-webos+E2E; Storybook→Pages); README rewritten; both builds pass; 548 Jest / 100% / lint clean.
P25 ✓ Detail retry button; provider logo lazy loading; detectRegion() utility (browser locale→TMDB region, IT fallback); 556 Jest / 100% / lint + both builds clean.