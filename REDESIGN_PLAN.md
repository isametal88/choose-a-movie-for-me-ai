# Redesign Plan — Style Guide + Provider Cleanup

> Segui questo file step by step, top-down. Segna `[x]` quando uno step è completato.
> Fermati dopo ogni step e attendi conferma prima di procedere al successivo.

---

## Obiettivo

1. **Adeguare il design system** al nuovo style guide (navy/orange/cyan, Open Sans, 8pt spacing).
2. **Pulire la lista provider** streaming: curata a max 20 più popolari in Italia.

---

## Contesto style guide

### Palette (da `colors_and_type.css`)
| Token          | Hex       | Uso                                 |
|----------------|-----------|-------------------------------------|
| `--navy-900`   | `#232F3E` | sfondo più profondo                 |
| `--navy-800`   | `#293647` | nav bar / header                    |
| `--navy-700`   | `#344458` | —                                   |
| `--navy-600`   | `#3C526D` | superfici/bande sul navy stage      |
| `--navy-500`   | `#4A6075` | superfici elevate                   |
| `--orange-600` | `#D94E1F` | hover CTA                           |
| `--orange-500` | `#F05A24` | PRIMARY action (uno per view)       |
| `--orange-400` | `#F47A4D` | —                                   |
| `--cyan-600`   | `#1E92C6` | —                                   |
| `--cyan-500`   | `#2AAAE0` | footer + stato active/selected      |
| `--cyan-300`   | `#8FD4F0` | link footer                         |
| `--white`      | `#FFFFFF` | info card surface                   |
| `--gray-050`   | `#F0F0F0` | header chrome bg                    |
| `--gray-100`   | `#F4F4F5` | —                                   |
| `--gray-300`   | `#C7CDD4` | —                                   |
| `--ink-600`    | `#5A6675` | testo secondario                    |
| `--ink-900`    | `#232F3E` | testo primario su light bg          |

### Tipografia
Font unico: **Open Sans** (import da Google Fonts)
| Ruolo        | Weight | Size  | Line-height |
|--------------|--------|-------|-------------|
| Display      | 800    | 44px  | 1.1         |
| H1 section   | 700    | 34px  | —           |
| H3 card      | 700    | 20px  | —           |
| Lead         | 600    | 20px  | —           |
| Body         | 400    | 17px  | 1.55        |
| UI label     | 600    | 16px  | —           |
| Caption      | 400    | 13px  | —           |

### Spacing (8pt base)
`--sp-1:4px  --sp-2:8px  --sp-3:12px  --sp-4:16px  --sp-5:24px  --sp-6:32px  --sp-7:48px  --sp-8:64px`

### Radii
`--r-xs:4px(rows) --r-sm:8px(chips) --r-md:16px(cards) --r-lg:28px(stage) --r-pill:999px(buttons)`

### Regole di design
- Sfondo della pagina: `--gray-050` (light chrome per header), **navy stage** per il corpo
- Un solo elemento arancione per view (il CTA primario)
- Cyan solo per footer e stato active/selected
- Flat & borderless: separazione tramite contrasto fill, no border decorativi
- Lucide icons (singolo peso), zero emoji
- Font: Open Sans 800 per titoli film; 700/600/400 per UI/body
- Pulsante primario: pill arancione; secondario: ghost (outline)
- Info card: superficie **bianca** (#fff) su navy stage, shadow-card
- Title band: `--navy-600` su navy stage (separazione per fill, non bordi)
- Footer: banda piena `--cyan-500`

---

## Step A — Token CSS (foundation)

- [x] **A1 — Rimpiazza `_tokens.scss`**
  Sostituisci TUTTI i token con quelli del style guide:
  - Palette: navy, orange, cyan, neutral/ink/gray
  - Semantica: bg-base=navy-900, bg-surface=navy-800, bg-chrome=gray-050, text-primary=white, text-on-light=ink-900, brand=orange-500, accent=cyan-500
  - Tipografia: Open Sans, nuova scala (Display 44/800 → Caption 13/400)
  - Spacing: scala 8pt (sp-1…sp-8) + alias compatibilità
  - Radii: xs/sm/md/lg/pill (elimina il vecchio schema radius-sm/md/lg/xl)
  - Shadows: shadow-card, shadow-pop (subtili, cool-toned)
  - Motion: mantieni la struttura esistente, aggiusta valori se necessario
  - TV variant: scala proporzionale come già esiste, aggiorna focus ring con cyan
  
- [x] **A2 — Font Open Sans**
  Aggiungi `<link>` Google Fonts in `src/index.html` e `src/index.webos.html`.
  Aggiorna `--font-family-base: 'Open Sans', sans-serif` nei token.
  Rimuovi Oswald/Inter dal font stack.

---

## Step B — Global layout & shell

- [x] **B1 — `styles.scss` + App shell**
  - `body` background: `--color-bg-chrome` (gray-050) per l'header, `--color-bg-base` (navy-900) per il corpo
  - Aggiorna `AppComponent` / layout globale: header su gray-050, main content su navy-900
  - Verifica che `data-theme="tv"` funzioni ancora (spatial nav, focus ring cyan)

---

## Step C — Componenti DS

- [x] **C1 — Button**
- [x] **C2 — Chip/Tag/Badge**
- [x] **C3 — Card (info/spec)**
- [x] **C4 — Slider (rating)**
- [x] **C5 — TextField / SearchInput**
- [x] **C6 — Modal / Dialog**
- [x] **C7 — Rating display**
- [x] **C8 — Poster**
- [x] **C9 — Spinner / VisuallyHidden / FocusTrap / Link / Icon**

---

## Step D — Schermate feature

- [x] **D1 — FiltersScreen**
- [x] **D2 — PickScreen**
- [x] **D3 — DetailScreen**
- [x] **D4 — ProvidersSection + Trailer**
- [x] **D5 — Footer**

---

## Step E — Provider list cleanup

- [x] **E1 — Definisci top-20 provider IT**
  Crea `src/app/core/providers/it-providers.const.ts` con la lista curata dei 20 provider più popolari in Italia (TMDB IDs + display order + nome). Questa lista serve come allowlist per il filtro utente nella schermata Filtri.

  Provider target (ordinati per popolarità IT):
  1. Netflix (8)
  2. Amazon Prime Video (119)
  3. Disney+ (337)
  4. Apple TV+ (350)
  5. NOW / Sky (39)
  6. Paramount+ (531)
  7. RaiPlay (227)
  8. MUBI (11)
  9. Crunchyroll (283)
  10. Discovery+ (510)
  11. Mediaset Infinity (591)
  12. DAZN (695)
  13. TimVision (109)
  14. YouTube Premium (192)
  15. Max (HBO Max) (1899)
  16. Rakuten TV (35)
  17. Plex (538)
  18. Chili (40)
  19. Google Play Movies (3)
  20. Microsoft Movies & TV (68)

  *Nota: gli ID 591 (Mediaset), 109 (TimVision), 40 (Chili) vanno verificati contro la risposta TMDB reale — se non appaiono nel response IT, vengono esclusi silenziosamente dal filtro.*

- [x] **E2 — Applica il filtro nel FiltersComponent**
  In `filters.component.ts`, dopo aver caricato i provider da TMDB, filtra per `provider_id in IT_PROVIDER_IDS` e ordina per `display_order` definito nella const.
  Aggiorna anche `provider-deep-link.service.ts` con le entry mancanti (Crunchyroll, Discovery+, Max, DAZN, TimVision, Rakuten, Mediaset Infinity).

- [x] **E3 — Test aggiornati**
  Aggiorna gli spec di `provider-deep-link.service` e `filters.component` per coprire i nuovi provider e il filtro.

---

## Quality gate (per ogni step)
- `ng build` (web) compila senza errori
- `ng lint` 0 errori/warning
- `npx jest --passWithNoTests` — tutti i test passano, coverage ≥ 100% lines/statements/functions
- Nessun `console.log` committato
- Accessibilità: contrasti OK con nuovi colori (verificare WCAG AA: bianco su navy-600 ≥ 4.5:1)

---

## Progress log
<!-- aggiorna una riga per step completato -->
A1 ✓ Palette navy/orange/cyan + tutti i semantic token aggiornati; backward-compat aliases completi; build+lint+595 test clean.
A2 ✓ Open Sans 400/600/700/800 in index.html e index.webos.html; rimossi Inter/Oswald.
B1 ✓ Header light chrome (gray-050), body navy-900, footer cyan-500 aggiunto in app.html.
C1-C9 ✓ Tutti i componenti DS aggiornati: Button pill orange/ghost, Chip navy-600/cyan, Card white, Slider orange, TextField flat, Modal, Rating gold, Poster 11:16 square, Badge.
D1-D5 ✓ Tutte le schermate feature: title band navy-600, section title orange eyebrow, cast white card, trailer grayscale+play circle, providers flat navy-600.
E1-E3 ✓ IT_PROVIDER_IDS (20 provider), filtro nel FiltersComponent, deep-link aggiornato, 16 nuovi test; 619 test totali / build+lint clean.
FINAL ✓ Controllo criteri CLAUDE.md: lint 0 warning, 619 test / 100% lines+stmts+funcs, web build + webOS build puliti, typecheck clean, no console.log, no @ts-ignore, no NgModules, no *ngIf/*ngFor. Coverage exclusions register aggiornato in CLAUDE.md.
