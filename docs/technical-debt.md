# Technical debt register

| Field      | Value                                                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| Baseline   | `dev` at `c6ee4d9` (M0.2 closure), verified on 2026-11-13; corrections verified on 2026-11-14                           |
| Governance | [Post-M0.2 maintenance plan, TD-04](maintenance/post-m0.2.md#td-04--debt-governance)                                    |
| Plan       | [Post-M0.2 maintenance plan](maintenance/post-m0.2.md): approved with amendments on 2026-11-14, **not implemented yet** |

This register collects, in one place, the technical debt of the repository. It does not replace
the documents where debt was first recorded: those entries stay as they are, and each register
entry points back to them. Where several reports share one cause they are merged into one entry
that keeps every original reference.

The register only tracks items that call for maintenance or a decision. Intentional limitations
of the physical models, open architectural decisions that are not debt, and future features are
listed separately in [Outside the register](#outside-the-register), so that they are not mistaken
for maintenance work.

## Categories

| Code | Category                    | Meaning                                                                               |
| ---- | --------------------------- | ------------------------------------------------------------------------------------- |
| C1   | Technical debt              | Code or documentation that works but departs from the intended structure or contract  |
| C2   | Tooling                     | Configuration and checks that give unreliable, noisy or environment-dependent results |
| C3   | Test coverage gap           | Behaviour without a test that can fail, or verified only by hand                      |
| C4   | Open architectural decision | A choice that is undecided and blocks or shapes a fix                                 |
| C5   | Intentional model limit     | A deliberate simplification of the charging models                                    |
| C6   | Future feature              | Behaviour not implemented yet                                                         |

C5 and C6 are listed for completeness and are not converted into maintenance work.

## Status values

| Status              | Meaning                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------- |
| open                | Recorded, not assigned                                                                    |
| scheduled           | Assigned to an approved work package or milestone; **not implemented**                    |
| resolved            | Fixed; the entry keeps the commit that resolved it                                        |
| accepted limitation | Consciously kept, with the product owner's approval, a date and a condition to revisit it |

## Priorities

- **P1** — the quality signal is wrong or missing today: a check gives a false result, or a test
  cannot fail. Resolve before further work relies on the signal.
- **P2** — resolve before the next work that touches the area, when it blocks planned work, or
  when it is cheapest to resolve now alongside related approved work.
- **P3** — resolve when the trigger condition occurs; harmless until then.

Criteria are defined in [TD-04](maintenance/post-m0.2.md#td-04--debt-governance).

## Summary

Statuses as of 2026-11-14. "Scheduled" means assigned by the approved plan; none of these entries
is resolved yet.

| ID      | Title                                                                | Cat.  | Prio. | Status    | WP or activity      |
| ------- | -------------------------------------------------------------------- | ----- | ----- | --------- | ------------------- |
| DEBT-01 | `CalculationResult` owned by the calculations layer                  | C1    | P2    | scheduled | TD-01               |
| DEBT-02 | Vitest fails when the drive letter is lower case                     | C2    | P1    | scheduled | TD-02               |
| DEBT-03 | Line endings: no `.gitattributes`, Windows-only drift                | C2    | P1    | scheduled | TD-02               |
| DEBT-04 | Prettier content drift                                               | C2    | P2    | scheduled | TD-02               |
| DEBT-05 | ESLint `no-unused-vars` in compile-time tests                        | C2    | P2    | scheduled | TD-02               |
| DEBT-06 | Conditional assertions that can pass vacuously                       | C3    | P2    | scheduled | TD-02               |
| DEBT-07 | Vitest configuration warnings and an invalid optional peer           | C2    | P3    | scheduled | TD-02               |
| DEBT-08 | No aggregate check command and no CI                                 | C2    | P2    | scheduled | TD-02               |
| DEBT-09 | UI component and end-to-end test strategy undecided                  | C4/C3 | P2    | scheduled | TD-03 (decision)    |
| DEBT-10 | Browser verification is a manual script outside the test suite       | C3    | P2    | scheduled | TD-03               |
| DEBT-11 | Accessible names and announcements not verified with a screen reader | C3    | P2    | scheduled | Accessibility smoke |
| DEBT-12 | Marginal URL synchronisation limits of the DC simulator              | C1    | P3    | open      | —                   |
| DEBT-13 | Inconsistent error vocabulary                                        | C4    | P3    | open      | —                   |
| DEBT-14 | Unbranded validated types; validation implemented twice              | C4    | P3    | open      | —                   |
| DEBT-15 | `maxCurrentA` validated but unused                                   | C5/C4 | P3    | open      | —                   |
| DEBT-16 | AC behaviour of a multi-phase vehicle on fewer phases                | C5/C4 | P3    | open      | —                   |
| DEBT-17 | Session error order differs between paths                            | C4    | P3    | open      | —                   |
| DEBT-18 | Unreachable error variants in `ChargingSessionError`                 | C1    | P3    | open      | —                   |
| DEBT-19 | Mixed time units in the session API                                  | C4    | P3    | open      | —                   |
| DEBT-20 | No M0.1 factory for vehicle and session aggregates                   | C1/C4 | P3    | open      | —                   |
| DEBT-21 | No defined public surface of the engine                              | C4/C1 | P3    | open      | —                   |
| DEBT-22 | Stale status text in agent and decision documents                    | C1    | P3    | open      | —                   |

DEBT-01 to DEBT-11 are in the post-M0.2 phase (DEBT-11 only for its basic smoke test). The others
stay open until their trigger occurs or a decision assigns them.

## Entries

### DEBT-01 — `CalculationResult` owned by the calculations layer

- **Description.** `src/domain/chargingFactories.ts:1` imports `CalculationResult` from
  `src/calculations/result.ts`, so the domain depends on the calculations layer for a generic
  type both layers use. The same type is imported from `@/calculations/result` by
  `src/scenarios/` (3 files) and `src/data/catalogue.ts`, which ADR 0001 §3 draws as depending on
  the domain only. All these imports are `import type`: there is no runtime dependency.
- **Sources.** [Limitations, open question 8](charging/limitations.md#open-questions-and-technical-debt);
  [charging overview, layering](charging/README.md); ADR 0001 §3 dependency diagram. The
  scenario and data imports are not documented elsewhere (found at baseline).
- **Category.** C1.
- **Impact.** Conceptual only today: the layering in the documentation and the ADR does not match
  the code, and a future runtime export from `calculations/result.ts` would create a real
  domain → calculations dependency without anyone noticing.
- **Risk of deferring.** Low. Each new module that needs the type copies the current import path,
  and no automated check prevents the direction from worsening.
- **Priority.** P2, as **opportunistic architectural cleanup**: the fix is type-only and touches
  three files, two of which TD-02 reformats anyway. Doing it right after that formatting gives a
  small, clean diff at the lowest cost. The priority does not rest on any assumption about the
  scope of M0.3.
- **Resolution trigger.** Within the post-M0.2 phase, once TD-02 has made the affected files
  formatting-clean.
- **Status.** scheduled (D1–D3 approved). Work package:
  [TD-01](maintenance/post-m0.2.md#td-01--dependency-direction).

### DEBT-02 — Vitest fails when the drive letter is lower case

- **Description.** On Windows, `npm test` started from `c:\Users\…\ev-compare` (lower-case drive
  letter, as the VS Code integrated terminal and its agents open it) fails all 26 test files with
  `TypeError: Cannot read properties of undefined (reading 'config')` at the first `describe`,
  running 0 tests. Started from `C:\Users\…\ev-compare`, the same tree passes 473/473. The
  probable cause is the test runner loading two module instances under paths that differ only in
  case; this is not confirmed.
- **Sources.** Not documented. Reproduced at baseline with Vitest 5.1.0, Vite 8.3.5, Node 24.18.0.
- **Category.** C2.
- **Impact.** A green suite reports as entirely red depending on how the terminal was opened.
  Reviews and agents can report false failures, or learn to ignore failures.
- **Risk of deferring.** High: it affects every verification on the main development machine.
- **Priority.** P1: the quality signal is wrong. It stays P1 until the tests pass reliably on
  Windows from both upper- and lower-case drive-letter paths. A documented workaround (such as
  "start from `C:\`") does not resolve it and does not close TD-02.
- **Resolution trigger.** Immediately; at the latest before the next verified change.
- **Status.** scheduled. Work package: [TD-02](maintenance/post-m0.2.md#td-02--tooling-and-quality).

### DEBT-03 — Line endings: no `.gitattributes`, Windows-only drift

- **Description.** The repository has no `.gitattributes`; the local clone uses
  `core.autocrlf=true`. The index is LF for every text file, but the working tree is mixed (59
  files CRLF, 143 LF). Prettier's default `endOfLine: "lf"` flags 30 files whose only difference
  is CRLF. On a clean LF checkout they pass.
- **Sources.** [Milestone M0.2, non-blocking debt](milestones/m0.2-first-vertical-slice.md#non-blocking-technical-debt)
  and [limitations, item 11](charging/limitations.md#open-questions-and-technical-debt) report the
  Prettier drift without separating this cause.
- **Category.** C2.
- **Impact.** `npm run format:check` gives different results on Windows and on an LF checkout;
  `npm run format` on Windows would rewrite files with no content change.
- **Risk of deferring.** High: it hides real drift and produces artificial diffs.
- **Priority.** P1.
- **Resolution trigger.** Before any formatting change (DEBT-04).
- **Status.** scheduled. Work package: TD-02.

### DEBT-04 — Prettier content drift

- **Description.** On a clean LF export of the baseline, `prettier --list-different .` reports 29
  files: 9 M0.1 sources (`src/calculations/result.ts`, `src/calculations/charging/{acChargingTime,
acPower,constantPowerCharging,energy,error,time}.ts`, `src/domain/{charging,chargingFactories}.ts`),
  12 M0.1 tests, `vitest.config.ts`, `.github/copilot-instructions.md` and 6 documents
  (`docs/product-vision.md`, `docs/ux/design-principles.md`, `docs/ux/user-flow-review.md`, the
  READMEs of 3 wireframe folders). No M0.2 source has content drift. These counts describe the
  baseline; the list is re-inventoried immediately before TD-02 formats anything.
- **Sources.** [Limitations, item 11](charging/limitations.md#open-questions-and-technical-debt);
  [testing, commands](charging/testing.md#commands);
  [milestone M0.2, non-blocking debt](milestones/m0.2-first-vertical-slice.md#non-blocking-technical-debt).
- **Category.** C2.
- **Impact.** `format:check` cannot gate changes; any edit to these files mixes formatting with
  content in review.
- **Risk of deferring.** Medium: TD-01 touches two of these files.
- **Priority.** P2.
- **Resolution trigger.** Before the next change to any of these files.
- **Status.** scheduled (D1, D4 approved). Work package: TD-02.

### DEBT-05 — ESLint `no-unused-vars` in compile-time tests

- **Description.** `npm run lint` passes with 114 warnings, 0 errors. 103 are
  `@typescript-eslint/no-unused-vars` in the four `*.types.ts` compile-time tests
  (`tests/domain/charging.types.ts` 66, `tests/calculations/charging/error.types.ts` 15,
  `tests/domain/chargingErrors.types.ts` 13, `tests/calculations/result.types.ts` 9). The
  variables exist only to carry type assertions; the warnings are expected by design.
- **Sources.** [Limitations, item 11](charging/limitations.md#open-questions-and-technical-debt);
  [milestone M0.2, non-blocking debt](milestones/m0.2-first-vertical-slice.md#non-blocking-technical-debt).
- **Category.** C2.
- **Impact.** The noise hides new warnings; lint cannot run with `--max-warnings 0`.
- **Risk of deferring.** Medium: real warnings in new code go unnoticed.
- **Priority.** P2.
- **Resolution trigger.** Before lint is made a gating check (D6).
- **Status.** scheduled. Work package: TD-02.

### DEBT-06 — Conditional assertions that can pass vacuously

- **Description.** 11 lint warnings (`@typescript-eslint/no-unused-expressions`) come from
  assertions written as expressions, such as `result.ok && expect(result.value)…` and
  `!result.ok && result.error ? expect(…) : null`
  (`tests/calculations/charging/acChargingTime.test.ts` 2, `constantPowerCharging.test.ts` 2,
  `tests/domain/chargingFactories.test.ts` 7). If the precondition is false, no assertion runs and
  the test passes. `tests/domain/chargingFactories.test.ts:322`,
  `expect(result.ok && result.value).not.toBe(raw)`, has the same flaw and is not flagged by lint.
- **Sources.** [Limitations, item 11](charging/limitations.md#open-questions-and-technical-debt)
  (reported as lint noise; the vacuous-pass risk is not documented).
- **Category.** C3.
- **Impact.** Up to 12 M0.1 tests can pass on a regression they are meant to catch.
- **Risk of deferring.** Medium: other tests cover the same functions, but these specific cases
  are unguarded.
- **Priority.** P2. Treated as a semantic change, separate from DEBT-05.
- **Resolution trigger.** Before lint is made a gating check, or before the functions change.
- **Status.** scheduled (D1 approved). Work package: TD-02.

### DEBT-07 — Vitest configuration warnings and an invalid optional peer

- **Description.** Every test run prints two warnings: `vitest.config.ts` is ESM loaded as
  CommonJS, and `vite-tsconfig-paths` can be replaced by Vite's native `resolve.tsconfigPaths`.
  In addition, `npm ls --all` exits with an error (`ELSPROBLEMS`, exit code 1) and reports
  `typescript@6.0.3` as invalid: `tsconfck`, a dependency of `vite-tsconfig-paths`, declares
  `typescript` as an **optional** peer with range `^5.0.0`. Plain `npm ls` (top level only)
  exits 0 and does not show it.
- **Sources.** [Limitations, item 12](charging/limitations.md#open-questions-and-technical-debt);
  README, bootstrap choices. The invalid peer is not documented.
- **Category.** C2.
- **Impact.** Noise in every test run; a plugin dependency outside its declared TypeScript range;
  any script that relies on the exit code of `npm ls --all` fails.
- **Risk of deferring.** Low today; grows with the next Vite major, where the native config
  loader becomes the default.
- **Priority.** P3. May become P1 if it turns out to cause DEBT-02.
- **Resolution trigger.** Next Vite or Vitest major update, or as part of the DEBT-02 fix.
- **Status.** scheduled (D5 conditionally approved). Work package: TD-02.

### DEBT-08 — No aggregate check command and no CI

- **Description.** There is no workflow under `.github/` and no single command that runs the
  repository checks. Each verification is assembled by hand, and the README and AGENTS.md list
  the commands separately.
- **Sources.** Not documented as debt. AGENTS.md, testing and verification.
- **Category.** C2.
- **Impact.** Checks are not repeated automatically on pull requests; results depend on who ran
  what, where.
- **Risk of deferring.** Medium: grows with every contributor or agent.
- **Priority.** P2.
- **Resolution trigger.** Once DEBT-02 to DEBT-06 make the checks deterministic and green.
- **Status.** scheduled (D6, D8 approved). Work package: TD-02 (command and basic CI). The
  end-to-end job is added to CI later by TD-03.

### DEBT-09 — UI component and end-to-end test strategy undecided

- **Description.** No tool or approach has been chosen for testing React components and
  end-to-end flows. ADR 0001 §7 forbids adding a test library until the strategy is decided.
- **Sources.** [ADR 0001, §7 and open question 8](decisions/0001-frontend-architecture.md#9-open-questions);
  [milestone M0.2, non-blocking debt](milestones/m0.2-first-vertical-slice.md#non-blocking-technical-debt);
  README, source layout.
- **Category.** C4 (decision) and C3 (consequence).
- **Impact.** Routes, client components and URL synchronisation are covered only by a manual
  script (DEBT-10).
- **Risk of deferring.** Medium to high: any further UI would have no automated coverage.
- **Priority.** P2.
- **Resolution trigger.** Before any further UI is implemented. M0.3 may be specified in parallel,
  but its UI implementation does not start before the testing-strategy ADR decision is approved.
- **Status.** scheduled. D10 approved in principle (Playwright Test, Chromium first, no
  component-test framework); ADR 0001 is not revised yet. That revision is TD-03's separately
  reviewed decision step: [TD-03](maintenance/post-m0.2.md#td-03--ui-and-end-to-end-testing-strategy).

### DEBT-10 — Browser verification is a manual script outside the test suite

- **Description.** `scripts/verify-dc-simulator-url.mjs` (955 lines, 154 checks) drives Chrome or
  Edge through the DevTools protocol against a production build started by hand. It is not in any
  npm script or CI. It must be re-run when Next.js is updated, because the simulator's URL
  behaviour relies on how Next.js handles the URL and history. Its selectors are not mostly
  semantic: it reads results through five CSS Module class-name matches (`[class*="socValue"]`,
  `[class*="_resultConditions"] dd`, `[class$="_time"] dd`, `[class$="_energy"] dd`,
  `[class*="sliderTrack"]`), elements by type or `href` (`input[type="range"]`,
  `a[href^="/veicoli/nordis-e4?"]`, `[href*="simulazione-dc"]`), roles and ARIA attributes
  (`[role="radio"]`, `[aria-checked="true"]`, `nav[aria-label="Contesto"] a`) and whole-page text.
  It detects hydration through React's internal `__reactProps` keys, and it manipulates the page
  directly (`history.pushState`/`replaceState`, `history.back`/`forward`, a patched
  `navigation.addEventListener`, `window.navigation` removed by an init script).
- **Sources.** [Milestone M0.2, non-blocking debt](milestones/m0.2-first-vertical-slice.md#non-blocking-technical-debt)
  (item 1, and item 2 on Chromium only, see below); [§6, architecture](milestones/m0.2-first-vertical-slice.md#6-architecture-in-the-slice);
  the script itself.
- **Category.** C3.
- **Impact.** A Next.js update can silently break the simulator's URL behaviour. Class-name and
  React-internal selectors break on styling or framework changes that do not change behaviour.
- **Risk of deferring.** Medium: Next.js updates are frequent.
- **Priority.** P2.
- **Resolution trigger.** Every Next.js update (re-run by hand until automated); automation in
  TD-03 after its ADR decision.
- **Status.** scheduled (D9, D10 approved with restrictions). Work package: TD-03.
- **Scope note.** This entry is about **automation**. That the checks run in Chromium only (M0.2
  caveat, item 2) is a question of **cross-browser coverage**: Chromium is the initial automated
  baseline, and whether to cover Firefox or WebKit is a future, explicit product decision
  ([Outside the register](#open-decisions-that-are-not-debt-c4)), not a commitment of TD-03.

### DEBT-11 — Accessible names and announcements not verified with a screen reader

- **Description.** The accessible names and live announcements of Discovery, Vehicle Analysis and
  the simulator have been checked in the DOM but not with a screen reader, and keyboard use has
  been verified only through the scripted checks.
- **Sources.** [Milestone M0.2, non-blocking debt](milestones/m0.2-first-vertical-slice.md#non-blocking-technical-debt).
- **Category.** C3 (manual verification gap).
- **Impact.** Possible defects for keyboard and screen-reader users that automated checks cannot
  reveal.
- **Risk of deferring.** Grows with each interactive control added.
- **Priority.** P2 for a basic smoke test, because it must precede further interactive UI;
  comprehensive validation stays at the pre-release trigger.
- **Resolution trigger.** Basic smoke test: before additional interactive UI is implemented.
  Comprehensive accessibility validation: before a public release.
- **Status.** scheduled for the basic smoke test
  ([plan, accessibility smoke test](maintenance/post-m0.2.md#accessibility-smoke-test)); the
  comprehensive validation remains open.

### DEBT-12 — Marginal URL synchronisation limits of the DC simulator

- **Description.** A change undone within the same task (A → B → A with no render between) is
  not seen; without the Navigation API, a rewrite that bypasses the router's patch is followed
  only at the next event.
- **Sources.** [Milestone M0.2 §6, known limits](milestones/m0.2-first-vertical-slice.md#6-architecture-in-the-slice);
  [non-blocking debt](milestones/m0.2-first-vertical-slice.md#non-blocking-technical-debt).
- **Category.** C1.
- **Impact.** Marginal; no ordinary user path triggers it.
- **Risk of deferring.** Low.
- **Priority.** P3.
- **Resolution trigger.** A reported user-visible defect, or a change to the synchronisation
  mechanism.
- **Status.** open. Accepting it as a limitation was proposed (D11) and **rejected** by the
  product owner on 2026-11-14; it stays open with the triggers above.

### DEBT-13 — Inconsistent error vocabulary

- **Description.** The same limit is `invalidMaxPower` in the factories and `invalidPower` in the
  calculations; `invalidSoc` has three shapes; only `invalidSocRange` has a `message`.
- **Sources.** [Limitations, item 1](charging/limitations.md#open-questions-and-technical-debt).
- **Category.** C4: a fix changes documented error shapes, a public contract.
- **Impact.** `src/presentation/chargingErrors.ts` must map several shapes for one concept.
- **Risk of deferring.** Low while the engine has one consumer.
- **Priority.** P3.
- **Resolution trigger.** A revision of the engine's public API, or a second consumer of its errors.
- **Status.** open.

### DEBT-14 — Unbranded validated types; validation implemented twice

- **Description.** Raw and validated types are structurally identical, so the power and phase
  rules are implemented both in the factories and in `acChargingTime`/`dcChargingTime`.
- **Sources.** [Limitations, item 2](charging/limitations.md#open-questions-and-technical-debt).
- **Category.** C4: branded types would change public types.
- **Impact.** Two places to keep consistent when a rule changes.
- **Risk of deferring.** Low until external data arrives.
- **Priority.** P3.
- **Resolution trigger.** Integration of an external vehicle data source (OpenEV Data).
- **Status.** open.

### DEBT-15 — `maxCurrentA` validated but unused

- **Description.** `maxCurrentA` is an **optional** field of the AC capability
  (`src/domain/charging.ts`). When present, the factory checks that it is finite and positive;
  no calculation uses it. The illustrative catalogue does not supply it.
- **Sources.** [Limitations, item 3 and physical simplifications](charging/limitations.md)
  ("No voltage or current model"); [domain model](charging/domain-model.md).
- **Category.** C5 with an open modelling question (C4). The absence of a current model is a
  documented, intentional simplification; whether the field should limit AC power
  (P = U × I × phases) or be removed is the open question. Not maintenance.
- **Impact.** None in the current catalogue. Data that supplies the field could suggest that it
  limits AC power when it does not.
- **Risk of deferring.** Low.
- **Priority.** P3.
- **Resolution trigger.** A decision on the AC model, or an external data source that supplies
  the field.
- **Status.** open (decision), not a maintenance item.

### DEBT-16 — AC behaviour of a multi-phase vehicle on fewer phases

- **Description.** A 3-phase 11 kW vehicle on a 1-phase 7.4 kW station is modelled at 3.67 kW,
  its per-phase share, although some on-board chargers draw more on one phase.
- **Sources.** [Limitations, physical simplifications and item 4](charging/limitations.md).
- **Category.** C5 with an open modelling question (C4). The per-phase model is the documented,
  intentional behaviour; the question is whether to add a vehicle-specific single-phase limit.
  Not maintenance.
- **Impact.** Underestimated AC power in that configuration.
- **Risk of deferring.** None today: the application performs no AC calculation. Vehicle Analysis
  shows the AC capability only as catalogue data ("Potenza AC massima").
- **Priority.** P3.
- **Resolution trigger.** An AC calculation in the UI.
- **Status.** open (decision), not a maintenance item.

### DEBT-17 — Session error order differs between paths

- **Description.** `dcChargingNotSupported` is reported before invalid SoC values, and the AC and
  DC forward functions check their inputs in different orders.
- **Sources.** [Limitations, item 5](charging/limitations.md#open-questions-and-technical-debt).
- **Category.** C4: the order is a documented contract.
- **Impact.** Which error a user sees for multiple invalid inputs depends on the path.
- **Risk of deferring.** Low.
- **Priority.** P3.
- **Resolution trigger.** Same as DEBT-13; best decided together.
- **Status.** open.

### DEBT-18 — Unreachable error variants in `ChargingSessionError`

- **Description.** The error union contains variants that no code path returns.
- **Sources.** [Limitations, item 6](charging/limitations.md#open-questions-and-technical-debt);
  [public API, error catalogue](charging/public-api.md#error-catalogue).
- **Category.** C1.
- **Impact.** Consumers handle cases that cannot happen.
- **Risk of deferring.** Low.
- **Priority.** P3.
- **Resolution trigger.** Same as DEBT-13.
- **Status.** open.

### DEBT-19 — Mixed time units in the session API

- **Description.** Session input is in minutes; every output is in hours.
- **Sources.** [Limitations, item 7](charging/limitations.md#open-questions-and-technical-debt).
- **Category.** C4: a fix changes public types.
- **Impact.** Conversion at every call site; risk of unit errors in new UI.
- **Risk of deferring.** Low; grows when duration sessions reach the UI.
- **Priority.** P3.
- **Resolution trigger.** A UI that uses duration sessions, or the API revision of DEBT-13.
- **Status.** open.

### DEBT-20 — No M0.1 factory for vehicle and session aggregates

- **Description.** M0.1 has no factory for `VehicleChargingSpec` or `ChargingSession`. Values
  built without one are validated only when a calculation uses them, so an invalid DC capability
  goes unnoticed in an AC session.
- **Mitigation in the application.** The catalogue performs its own aggregate validation in
  `createCharging` (`src/data/catalogue.ts`): it checks the usable capacity itself, because no
  M0.1 factory covers it, and passes the AC and DC capabilities through the M0.1 factories. The
  DC simulation's SoC range and station come from the validated scenario codec, and the engine
  validates them again at its entry points.
- **Sources.** [Limitations, item 9](charging/limitations.md#open-questions-and-technical-debt).
- **Category.** C1, whose resolution is a C4 decision: an aggregate factory would extend the M0.1
  public API.
- **Impact.** None with the illustrative catalogue. The capacity rule lives in the data layer
  rather than in the domain.
- **Risk of deferring.** Grows with external or user-entered data, which would need the same
  aggregate checks again.
- **Priority.** P3.
- **Resolution trigger.** Integration of an external vehicle data source, or user-entered vehicles.
- **Status.** open.

### DEBT-21 — No defined public surface of the engine

- **Description.** There is no barrel file, so every helper is importable, and the documented
  [public API](charging/public-api.md) is the only statement of what is public.
  `ACChargingTimeInput` is the only input type that is not exported, and `acChargingTime.ts:1`
  imports domain types without `import type`. At baseline the application imports only
  documented functions (`simulateChargingSession`, `powerAtSoc`, `effectiveDcPowerAtSoc`) and
  public types.
- **Sources.** [Limitations, item 10](charging/limitations.md#open-questions-and-technical-debt).
- **Category.** C4 for defining the public surface (a barrel or export policy is an API
  decision); C1 for the two local inconsistencies (unexported input type, missing `import type`).
- **Impact.** None today. Future consumers could depend on internals without noticing.
- **Risk of deferring.** Low while the only consumer is the application in this repository and it
  uses documented functions.
- **Priority.** P3.
- **Resolution trigger.** A public API revision, a consumer outside this repository, or the first
  application import of an undocumented helper.
- **Status.** open.

### DEBT-22 — Stale status text in agent and decision documents

- **Description.** `AGENTS.md:11` says M0.2 is in progress. ADR 0001 §1 says the slice "is now
  being implemented" and its §2 table is dated 2026-11-08. The tree in
  [testing](charging/testing.md#organization) omits `tests/calculations/charging/dcPower.test.ts`
  (the count of 205 tests is still correct for the engine).
- **Sources.** The files named above, compared with the README and the milestone at baseline.
- **Category.** C1 (documentation).
- **Impact.** Agents may read the milestone as still open; the rules themselves are still valid.
- **Risk of deferring.** Low.
- **Priority.** P3.
- **Resolution trigger.** The next change to each document; the ADR only through an approved
  revision (the TD-03 revision is the next one).
- **Status.** open.

## Outside the register

These items are recorded in their own documents and are not maintenance work. They are listed here
so that the register is complete and none of them is turned into a task by default.

### Intentional model limits (C5) — accepted limitation

Accepted as part of M0.1 and documented in [limitations](charging/limitations.md): no charging
losses; no thermal, ageing or preconditioning effects; constant AC power; no voltage or current
model; SoC on usable capacity; flat curve outside its range; no vertical curve steps; midpoint DC
integration with a fixed step; bisection tolerance of duration sessions; unrounded floating-point
results and the unguarded overflow at about 10⁻³⁰⁸ kW; linear curve lookup cost. They are revisited
only if a feature needs more accuracy (see "Constraints for future extensions" in the same page).
DEBT-15 and DEBT-16 are in the register only because each carries an open modelling question.

### Open decisions that are not debt (C4)

ADR 0001 open questions 2 (store scope), 3 (limiting factor and energy-over-time series), 4 (URL
format), 7 (comparison capacity), 9 (token organisation), 10 (font delivery), 11 (responsive layout
and dark theme) and 12 (directory locations, partly answered by the README); M0.2 slice open
questions 5 (search matching rules) and 8 (illustrative qualifier on provenance tags). They are
decided when the feature that needs them is specified. Open question 8 of the ADR is the only one
in this phase (DEBT-09).

**Cross-browser coverage.** Browser checks run in Chromium only
([M0.2 non-blocking debt](milestones/m0.2-first-vertical-slice.md#non-blocking-technical-debt),
item 2). Chromium is the initial automated baseline of TD-03. Covering Firefox or WebKit is a
future product decision, to be taken explicitly; nothing in this phase commits to it.

### Future features (C6)

Unsupported scenarios listed in [limitations](charging/limitations.md#supported-and-unsupported-scenarios)
(discharging, combined termination, vehicles without AC, costs, losses, multiple stops, shared
station power, schedules); OpenEV Data integration; comparison; AC simulation in the UI; mobile
and dark theme.

## Discrepancies between documented debt and the code

Found while verifying the documented items at baseline:

1. **Test suite.** The M0.2 acceptance reports 473/473 tests passing. That holds only when the
   suite starts from an upper-case drive path; from `c:\…` every file fails (DEBT-02). Not
   documented anywhere.
2. **Prettier drift.** Documented as "most charging source and test files". On this Windows
   working tree 59 files are reported; 30 of them differ only by line endings (DEBT-03). On an LF
   checkout 29 files have content drift, including 7 documents and `vitest.config.ts`; several
   charging sources (`chargingSession.ts`, `dcChargingTime.ts`, `dcCurve.ts`, `dcPower.ts`,
   `chargingErrors.ts`) have none.
3. **ESLint.** 114 warnings confirmed, all in M0.1 tests. One of the two documented causes is a
   coverage gap, not only noise (DEBT-06), and one more vacuous assertion is not flagged by lint.
4. **Vitest warnings.** Both confirmed. Not documented: `npm ls --all` fails on an invalid
   optional peer of a `vite-tsconfig-paths` dependency (DEBT-07).
5. **Dependency direction.** Confirmed and type-only. The documented case is the factories; the
   same import also comes from `src/scenarios/` and `src/data/`, against the ADR 0001 diagram
   (DEBT-01).
6. **CI.** No CI exists. No document claims otherwise; the absence is recorded as DEBT-08.
7. **Status text.** See DEBT-22.
8. **Aggregate validation.** Limitations item 9 is accurate for M0.1, but the catalogue already
   validates the vehicle aggregate itself (DEBT-20).
