# CLAUDE.md — Movie Picker · Invariant Rules

This file is the authoritative record of invariants for this project. All contributors (human and AI) must honor every rule here. Steps in `EXECUTION_PLAN.md` may write "per `CLAUDE.md`" to reference these rules instead of repeating them.

---

## Framework & language

- **Angular latest** — standalone components only; no NgModules.
- **Signals** everywhere (component state, derived state). No `BehaviorSubject`-based state outside of legacy interop.
- **New control flow syntax** (`@if`, `@for`, `@switch`) — no `*ngIf` / `*ngFor` directives.
- **TypeScript strict mode** enabled; no `any`, no `// @ts-ignore` without an explicit justification comment.

## Architecture

- **No backend.** All data fetches go directly to the TMDB API from the browser.
- **TMDB region** defaults to `IT`; region must be read from an environment/config token so it can be overridden at build or runtime.
- **TMDB token** is declared in the Angular environment config (`environment.ts`). Exposure in the browser bundle is accepted for now.
- **NgRx SignalStore** for all feature-level state. Derive computed state with `computed()` / store selectors rather than duplicating state.
- **Folder structure:**
  ```
  src/
    core/           # singleton services, app-level providers
    shared/         # shared utilities, pipes, directives
    design-system/  # DS tokens + every DS component
    features/       # one sub-folder per route-level feature
  ```
- **TypeScript path aliases** must be configured for each top-level folder (`@core/*`, `@shared/*`, `@ds/*`, `@features/*`).

## Design system

- Built on **Angular CDK** — use CDK primitives (focus trap, overlay, a11y, drag, etc.) before rolling custom logic.
- Every DS component lives under `design-system/`.
- Every DS component **must** have:
  1. A unit test file (100 % coverage, see below).
  2. A Storybook story.
  3. An axe accessibility check inside the story (via `@storybook/addon-a11y` or inline axe-core run).
- Design tokens are CSS custom properties; a `tv` variant (larger targets, prominent focus ring) must exist from the beginning.

## Testing

- **Unit tests: Jest.** Coverage thresholds enforced at CI:
  - Lines: **100 %**
  - Statements: **100 %**
  - Functions: **100 %**
  - Branches: **best-effort** (no hard threshold, but every branch must have a test unless documented)
- **Exclusions:** only platform/bridge files that cannot run in a Jest environment (e.g., real Luna calls) may be excluded. Each exclusion must be:
  - Listed in `jest.config` with `collectCoverageFrom` exclusion.
  - Documented in this file (see § Platform bridges below) with the reason.
- **E2E & a11y:** Playwright + axe-core. Every route must have at least one Playwright test; every screen must have an axe pass.
- Tests live next to the source file (`foo.component.spec.ts`), except Playwright tests which live in `e2e/`.

## Accessibility & interaction

- **Never hover-only interactions.** Every action reachable by hover must also be reachable by keyboard focus and by D-pad focus on TV.
- **Keyboard navigation** must work everywhere without a mouse.
- **D-pad / TV spatial navigation** is an additive layer designed in from the start, not bolted on later. DS components must not hardcode an input type.
- Focus rings must be clearly visible (use the `tv` token variant where appropriate).

## Platform bridges & mockability

Every piece of code that touches a platform-specific API must live behind a mockable interface:

| Area | Interface | Real impl | Mock / stub |
|------|-----------|-----------|-------------|
| webOS detection | `PlatformService` | `WebOsPlatformService` | `WebPlatformService` |
| Luna service calls | `LunaBridge` | `WebOsLunaBridge` | `NoopLunaBridge` |
| Provider launching | `ProviderLauncher` | delegates to bridge | `WebProviderLauncher` |
| Deep-link building | `ProviderDeepLinkService` | — | testable pure service |

- Real bridge implementations that invoke native Luna APIs are **excluded from Jest coverage** (they require a real device/emulator). This is the only permitted coverage exclusion.
- Stubs/mocks **must** reach 100 % coverage.

## Code quality

- **ESLint + Prettier** — lint must pass with zero warnings as well as zero errors.
- **Git hooks** (Husky or similar): lint + unit tests must pass before every commit.
- No `console.log` left in committed code; use a proper logger service or remove before commit.
- No `TODO` / `FIXME` comments committed without a linked issue reference.

## Build targets

- **Web:** standard Angular build.
- **webOS:** second build target producing an `appinfo.json` and packaged app. The platform variable (web vs webOS) must be injected at build time via Angular's environment mechanism, not detected at runtime via user-agent.

## Documentation

- Every public service and interface has a one-line JSDoc summary.
- Every coverage exclusion is documented here (see § Platform bridges) and in `jest.config`.

---

## Coverage exclusions register

| File glob | Reason |
|-----------|--------|
| `src/app/core/platform/webos-luna.bridge.ts` | Invokes real Luna WebOS APIs; requires device emulator; untestable in Jest |
| `src/main.webos.ts` | webOS-specific Angular bootstrap entry point; requires native webOS runtime |
| `src/polyfills.webos.ts` | Chrome 68 polyfills that patch native prototypes; require webOS runtime context |
| `src/app/app.routes.ts` | Lazy-loading lambdas; declarative config with no testable logic |
| `src/app/app.config.ts` | DI factory bootstrapping (platform bridge selection); tested indirectly via LUNA_BRIDGE token |
