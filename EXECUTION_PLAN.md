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

- [ ] **P02 — Workspace scaffold.** Scaffold the Angular workspace per `CLAUDE.md`: folder structure `core/`, `shared/`, `design-system/`, `features/`; TypeScript path aliases; environment config for TMDB token and region; ESLint + Prettier; git hooks running lint + tests pre-commit. Configure Jest with a 100% coverage threshold and Playwright with axe-core. Add Storybook.

- [ ] **P03 — webOS build target.** Add a second build target for webOS: `appinfo.json`, packaging scripts, and a conditional web-vs-webOS build mechanism. Do not implement Luna yet — only the build skeleton and a platform variable.

## Phase 1 — Design system

- [ ] **P04 — Design tokens.** Create design tokens (colors, type scale, spacing, radii, elevation, motion) as CSS custom properties with a theming layer, including from the start a **tv / 10-foot** variant (larger targets, strong focus ring). Document the DS philosophy in an introductory Storybook story.

- [ ] **P05 — a11y-first primitives.** Implement CDK-based accessibility primitives: Button, Icon, Link, Spinner, VisuallyHidden, FocusTrap. Strongly typed, 100% unit-tested, with Storybook stories and an axe check in each story.

- [ ] **P06 — Domain DS components.** Implement the domain DS components: Card, Chip/Tag, accessible Select and MultiSelect, Slider (for rating), TextField/SearchInput, Modal/Dialog, Rating display, Poster with lazy-load and placeholder, Badge. Each with tests, story, and axe check.

- [ ] **P07 — Layout primitives.** Add layout primitives: responsive grid, breakpoint system, container, stack. Verify every component honors the tv variant of the tokens.

## Phase 2 — Input & platform abstraction

- [ ] **P08 — Spatial navigation.** Create an input-abstraction layer and a spatial-navigation (D-pad) service for TV: focus model, focus order, arrow/enter/back handling, enableable per route. DS components must not know the input type. Test with mocked input.

- [ ] **P09 — Platform & bridge interfaces.** Create `PlatformService` (web vs webOS) and the `LunaBridge` and `ProviderLauncher` interfaces, both mockable. Only interfaces plus a web stub implementation; no real Luna calls yet. 100% tests on the stubs.

## Phase 3 — TMDB data layer

- [ ] **P10 — TMDB client.** Implement a typed TMDB client (HttpClient): models/DTOs, config service, error handling, retry, caching. Genres endpoint and watch-providers list endpoint. Test with `HttpTestingController`, 100% coverage.

- [ ] **P11 — Discover/search + random selection (core).** Implement the discover/search service for movies and TV plus the core selection logic: take the first 50 filtered results, pick at random, track "already seen" titles (persisted to localStorage), exclude them and re-pick, and when the first 50 are exhausted move to the next 50. Write it as a pure service and test it exhaustively — this is the heart of the app.

- [ ] **P12 — Detail service.** Implement the detail service using `append_to_response` for credits, videos, and watch/providers (region IT): trailer-selection logic (official, YouTube, type Trailer, language), runtime, genres, poster, cast/crew. Tests.

- [ ] **P13 — Tiered deep-link service.** Implement `ProviderDeepLinkService` as a tiered strategy: per-provider builders where the URL is known (direct or search-prefilled), otherwise fall back to the JustWatch page TMDB provides. The same strategy must produce both the web URL and the webOS launch payload. Document in tests which providers are direct/search/fallback. 100% coverage.

## Phase 4 — Discovery flow

- [ ] **P14 — Criteria store.** Create the NgRx SignalStore for criteria (movie/tv type, genres, owned providers multi-select, minimum rating) wired to the services, with derived state. Tests.

- [ ] **P15 — Filters screen.** Build the filters screen with DS components: genre selection, multi-select of subscribed providers, rating slider, movie/tv toggle. Responsive, accessible, unit tests + Playwright.

- [ ] **P16 — "Pick for me" flow.** Implement the "pick for me" flow: random pick, loading state, "already seen → show another" action, exhaustion handling, and empty state. Tests + Playwright (happy path and edge cases).

- [ ] **P17 — Text search.** Implement text search leading to the same result/detail. Tests + Playwright.

## Phase 5 — Detail & providers

- [ ] **P18 — Detail screen.** Build the detail screen: poster, title, overview, runtime, genres, rating, cast/crew. Responsive, accessible, tests + Playwright.

- [ ] **P19 — Trailer embed.** Add the trailer embed accessibly and privacy-friendly (focusable, Escape handling, no invasive autoplay). Tests.

- [ ] **P20 — Providers section.** Implement the providers section: grouping by subscription/rent/buy, icons, and a click that invokes `ProviderDeepLinkService` (web opens URL, webOS launches the app, JustWatch fallback). Tests + Playwright with a mocked bridge.

## Phase 6 — TV / webOS hardening

- [ ] **P21 — Wire spatial navigation everywhere.** Connect spatial navigation to all screens, enable the tv token mode, handle remote keys (back/enter), and provide instructions for testing on the webOS emulator and for packaging.

- [ ] **P22 — Real Luna launch.** Implement the real provider launch via Luna behind the `LunaBridge` interface, with graceful degradation when not on webOS. Test the interface; the real bridge is excluded from coverage per `CLAUDE.md`.

## Phase 7 — Quality & wrap-up

- [ ] **P23 — Full a11y pass.** Run a Playwright + axe pass over all routes, keyboard-only and D-pad-only paths, and a responsive viewport matrix. Fix every violation.

- [ ] **P24 — Coverage & CI.** Bring coverage to 100% with documented exclusions only for the non-testable bridges, enable CI enforcement (lint, tests, web build + webOS build), and write the README, architecture docs, and a Storybook deployment.

- [ ] **P25 — Final hardening.** Audit error/empty/loading states, lay groundwork for i18n and multi-region for future growth, and do a performance pass (lazy routes, image strategy).

---

## Progress log (append one line per completed step)

<!-- e.g. P01 ✓ created CLAUDE.md; chose 100% lines/statements/functions, branch best-effort -->
P01 ✓ created CLAUDE.md; all invariants documented including platform-bridge mockability table and coverage-exclusion register.