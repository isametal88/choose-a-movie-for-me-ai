# Choose a Movie for Me

An Angular web app (also packaged as a **webOS / LG TV** app) that picks a movie or TV show for you to watch.

Filter by genre, streaming provider, minimum rating, or search by title. Get a random pick, mark it as seen to get another, and open a detail screen with trailer, cast, and provider links.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Angular 21 — standalone, signals, new control flow |
| State | NgRx SignalStore |
| API | TMDB (direct from browser) |
| Design system | Custom, built on Angular CDK |
| Unit tests | Jest + jest-preset-angular, 100 % lines/statements/functions |
| E2E & a11y | Playwright + axe-core |
| Components explorer | Storybook 8 |
| Linting | ESLint + Prettier (Husky pre-commit) |
| Target platforms | Web + webOS (LG TV) |

---

## Quick start

```bash
npm install
npm start          # dev server → http://localhost:4200
```

> **TMDB token** is in `src/environments/environment.development.ts` (dev only; exposure accepted per design).

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Dev server (`http://localhost:4200`) |
| `npm run build` | Production web build → `dist/` |
| `npm run build:webos` | webOS build → `dist/webos/` |
| `npm run package:webos` | webOS `.ipk` package (requires `ares-cli`) |
| `npm test` | Jest unit tests |
| `npm run test:cov` | Jest with 100 % coverage enforcement |
| `npm run lint` | ESLint |
| `npm run format` | Prettier (write) |
| `npm run e2e` | Playwright E2E + a11y tests |
| `npm run storybook` | Storybook dev server |
| `npm run build-storybook` | Storybook static build |

---

## Project structure

```
src/
  app/
    core/           # Singleton services, app-level providers
      detail/       # DetailService — movie/TV detail + watch providers
      input/        # InputDispatcherService — keyboard / D-pad unified events
      platform/     # Platform detection, LunaBridge interface + implementations
      providers/    # ProviderDeepLinkService — tiered deep-link strategy
      selection/    # DiscoverSelectionService — random pick state machine
      spatial-navigation/  # SpatialNavZoneDirective — D-pad zone management
      tmdb/         # TmdbClient + TmdbConfigService
    shared/         # Shared utilities, tokens
    design-system/  # DS tokens + every DS component
      tokens/       # CSS custom properties (web + TV data-theme="tv" variant)
      primitives/   # Button, Icon, Link, Spinner, VisuallyHidden, FocusTrap
      components/   # Badge, Card, Chip, Modal, MultiSelect, Poster, Rating, Select, Slider, TextField
      layout/       # Container, Grid, Stack, BreakpointService
    features/
      criteria/     # CriteriaStore (NgRx SignalStore) — filter state
      filters/      # Filters screen (/)
      pick/         # Pick screen (/pick)
      detail/       # Detail screen (/detail/:mediaType/:id)
  environments/     # web + webOS environment files
e2e/                # Playwright E2E + a11y tests
```

---

## Architecture highlights

### No backend

All TMDB calls go directly from the browser. The token is in the Angular environment file and is intentionally exposed in the development bundle.

### Signal-first state

- Component state: Angular `signal()` + `computed()`
- Feature state: NgRx SignalStore (`CriteriaStore`)
- Observables converted at the boundary with `toSignal()`

### Platform bridges

Every platform-specific API is behind a mockable interface to enable full unit-test coverage:

| Interface | Web impl | webOS impl | Excluded from coverage |
|---|---|---|---|
| `LunaBridge` | `WebLunaBridge` (no-op) | `WebOSLunaBridge` (real Luna) | `WebOSLunaBridge` |
| `ProviderLauncher` | `WebProviderLauncherService` | same, delegates to bridge | — |

The bridge is selected at bootstrap via `app.config.ts` factory based on `environment.platform`.

### Provider deep-link strategy

`ProviderDeepLinkService` resolves the best URL for each provider in priority order:

1. Direct title search URL (Netflix, Prime, Disney+, Apple TV+, Paramount+, Hulu, Max, Peacock, Crunchyroll)
2. JustWatch page (from TMDB `watch/providers.link`)

On webOS, `WebProviderLauncherService` calls Luna's app-manager to launch the provider app instead of opening a URL.

### TV / 10-foot UI

- `data-theme="tv"` set on `<html>` by `AppComponent` when `PlatformService.isWebOS` is true
- All spacing, font sizes, focus ring, and target sizes scale up via CSS custom properties
- `SpatialNavZoneDirective` (using Angular CDK) manages D-pad zone focus

### Accessibility

- Every interactive control is keyboard-reachable (Tab + Enter/Space)
- D-pad navigation (arrow keys) works everywhere
- All routes pass axe-core WCAG AA checks at 4 viewports (375 px to 1920 px)
- Focus ring visible in keyboard-navigation mode (`:focus-visible`)
- `aria-live` regions on loading and result states

---

## Coverage

Jest enforces **100 % lines / statements / functions** on every commit.

Documented exclusions (see `jest.config.ts` and `CLAUDE.md`):

| File | Reason |
|---|---|
| `src/app/core/platform/webos-luna.bridge.ts` | Invokes real Luna WebOS APIs; requires device emulator |
| `src/app/app.routes.ts` | Lazy-loading lambdas are declarative config |
| `src/app/app.config.ts` | DI factory bootstrapping; tested indirectly via LUNA_BRIDGE token |
| `src/environments/**` | Build-time config, no logic |

---

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push/PR to `main`:

1. **Lint & format** — ESLint + Prettier check
2. **Unit tests** — Jest with 100 % coverage thresholds
3. **Build web** — production Angular build
4. **Build webOS** — webOS Angular build
5. **E2E + a11y** — Playwright + axe (after lint + unit tests pass)

Storybook is deployed to GitHub Pages on every push to `main` (`.github/workflows/storybook.yml`).
