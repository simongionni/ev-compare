# Technical debt register

| Field      | Value                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------- |
| Baseline   | `dev` at `c6ee4d9` (M0.2 closure), verified on 2026-11-13                                       |
| Governance | [Post-M0.2 maintenance plan, TD-04](maintenance/post-m0.2.md#td-04--debt-governance)            |
| Plan       | [Post-M0.2 maintenance plan](maintenance/post-m0.2.md) (proposed, awaiting review and approval) |

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
| open                | Recorded, not assigned. A proposed work package may be named, pending approval            |
| scheduled           | Assigned to an approved work package or milestone                                         |
| resolved            | Fixed; the entry keeps the commit that resolved it                                        |
| accepted limitation | Consciously kept, with the product owner's approval, a date and a condition to revisit it |

## Priorities

- **P1** — the quality signal is wrong or missing today: a check gives a false result, or a test
  cannot fail. Resolve before further work relies on the signal.
- **P2** — resolve before the next milestone that touches the area, or when it blocks planned work.
- **P3** — resolve when the trigger condition occurs; harmless until then.

Criteria are defined in [TD-04](maintenance/post-m0.2.md#td-04--debt-governance).

## Summary

| ID      | Title                                                                | Cat.  | Prio. | Status | Proposed WP |
| ------- | -------------------------------------------------------------------- | ----- | ----- | ------ | ----------- |
| DEBT-01 | `CalculationResult` owned by the calculations layer                  | C1    | P2    | open   | TD-01       |
| DEBT-02 | Vitest fails when the drive letter is lower case                     | C2    | P1    | open   | TD-02       |
| DEBT-03 | Line endings: no `.gitattributes`, Windows-only drift                | C2    | P1    | open   | TD-02       |
| DEBT-04 | Prettier content drift                                               | C2    | P2    | open   | TD-02       |
| DEBT-05 | ESLint `no-unused-vars` in compile-time tests                        | C2    | P2    | open   | TD-02       |
| DEBT-06 | Conditional assertions that can pass vacuously                       | C3    | P2    | open   | TD-02       |
| DEBT-07 | Vitest configuration warnings and an invalid peer                    | C2    | P3    | open   | TD-02       |
| DEBT-08 | No aggregate check command and no CI                                 | C2    | P2    | open   | TD-02/TD-03 |
| DEBT-09 | UI component and end-to-end test strategy undecided                  | C4/C3 | P2    | open   | TD-03       |
| DEBT-10 | Browser verification is a manual, Chromium-only script               | C3    | P2    | open   | TD-03       |
| DEBT-11 | Accessible names and announcements not verified with a screen reader | C3    | P3    | open   | —           |
| DEBT-12 | Marginal URL synchronisation limits of the DC simulator              | C1    | P3    | open   | —           |
| DEBT-13 | Inconsistent error vocabulary                                        | C4    | P3    | open   | —           |
| DEBT-14 | Unbranded validated types; validation implemented twice              | C4    | P3    | open   | —           |
| DEBT-15 | `maxCurrentA` validated but unused                                   | C4    | P3    | open   | —           |
| DEBT-16 | AC behaviour of a multi-phase vehicle on fewer phases                | C5/C4 | P3    | open   | —           |
| DEBT-17 | Session error order differs between paths                            | C4    | P3    | open   | —           |
| DEBT-18 | Unreachable error variants in `ChargingSessionError`                 | C1    | P3    | open   | —           |
| DEBT-19 | Mixed time units in the session API                                  | C4    | P3    | open   | —           |
| DEBT-20 | No aggregate validation of vehicle and session                       | C1    | P3    | open   | —           |
| DEBT-21 | No defined public surface of the engine                              | C1    | P3    | open   | —           |
| DEBT-22 | Stale status text in agent and decision documents                    | C1    | P3    | open   | —           |

Only DEBT-01 to DEBT-10 are in the post-M0.2 maintenance phase. The others stay open until their
trigger occurs or a decision assigns them.

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
- **Risk of deferring.** Low but growing: every new domain or scenario module copies the import
  path. No automated check prevents the direction from worsening.
- **Priority.** P2: cheap, type-only, and best fixed before M0.3 adds more modules that import it.
- **Resolution trigger.** Before the next milestone that adds domain, scenario or data modules.
- **Status.** open. Proposed: [TD-01](maintenance/post-m0.2.md#td-01--dependency-direction).

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
- **Priority.** P1: the quality signal is wrong.
- **Resolution trigger.** Immediately; at the latest before the next verified change.
- **Status.** open. Proposed: [TD-02](maintenance/post-m0.2.md#td-02--tooling-and-quality).

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
- **Status.** open. Proposed: TD-02.

### DEBT-04 — Prettier content drift

- **Description.** On a clean LF export of the baseline, `prettier --list-different .` reports 29
  files: 9 M0.1 sources (`src/calculations/result.ts`, `src/calculations/charging/{acChargingTime,
acPower,constantPowerCharging,energy,error,time}.ts`, `src/domain/{charging,chargingFactories}.ts`),
  12 M0.1 tests, `vitest.config.ts`, `.github/copilot-instructions.md` and 6 documents
  (`docs/product-vision.md`, `docs/ux/design-principles.md`, `docs/ux/user-flow-review.md`, the
  READMEs of 3 wireframe folders). No M0.2 source has content drift.
- **Sources.** [Limitations, item 11](charging/limitations.md#open-questions-and-technical-debt);
  [testing, commands](charging/testing.md#commands);
  [milestone M0.2, non-blocking debt](milestones/m0.2-first-vertical-slice.md#non-blocking-technical-debt).
- **Category.** C2.
- **Impact.** `format:check` cannot gate changes; any edit to these files mixes formatting with
  content in review.
- **Risk of deferring.** Medium: TD-01 touches two of these files.
- **Priority.** P2.
- **Resolution trigger.** Before the next change to any of these files.
- **Status.** open. Proposed: TD-02.

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
- **Resolution trigger.** Before lint is made a gating check.
- **Status.** open. Proposed: TD-02.

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
- **Status.** open. Proposed: TD-02.

### DEBT-07 — Vitest configuration warnings and an invalid peer

- **Description.** Every run prints two warnings: `vitest.config.ts` is ESM loaded as CommonJS,
  and `vite-tsconfig-paths` can be replaced by Vite's native `resolve.tsconfigPaths`. In addition,
  `npm ls` reports `typescript@6.0.3` as an invalid peer of `tsconfck` (needs `^5.0.0`), a
  dependency of `vite-tsconfig-paths`.
- **Sources.** [Limitations, item 12](charging/limitations.md#open-questions-and-technical-debt);
  README, bootstrap choices. The invalid peer is not documented.
- **Category.** C2.
- **Impact.** Noise in every test run; a plugin outside its supported TypeScript range.
- **Risk of deferring.** Low today; grows with the next Vite major, where the native config
  loader becomes the default.
- **Priority.** P3. May become P1 if it turns out to cause DEBT-02.
- **Resolution trigger.** Next Vite or Vitest major update, or as part of the DEBT-02 fix.
- **Status.** open. Proposed: TD-02 (optional part).

### DEBT-08 — No aggregate check command and no CI

- **Description.** There is no workflow under `.github/` and no single command that runs the
  repository checks. Each verification is assembled by hand, and the README and AGENTS.md list
  the commands separately.
- **Sources.** Not documented as debt. AGENTS.md, testing and verification.
- **Category.** C2.
- **Impact.** Checks are not repeated automatically on push or pull request; results depend on
  who ran what, where.
- **Risk of deferring.** Medium: grows with every contributor or agent.
- **Priority.** P2.
- **Resolution trigger.** Once DEBT-02 to DEBT-06 make the checks deterministic and green.
- **Status.** open. Proposed: TD-02 (command), TD-03 (CI, requires approval).

### DEBT-09 — UI component and end-to-end test strategy undecided

- **Description.** No tool or approach has been chosen for testing React components and
  end-to-end flows. ADR 0001 §7 forbids adding a test library until the strategy is decided.
- **Sources.** [ADR 0001, §7 and open question 8](decisions/0001-frontend-architecture.md#9-open-questions);
  [milestone M0.2, non-blocking debt](milestones/m0.2-first-vertical-slice.md#non-blocking-technical-debt);
  README, source layout.
- **Category.** C4 (decision) and C3 (consequence).
- **Impact.** Routes, client components and URL synchronisation are covered only by a manual
  script (DEBT-10).
- **Risk of deferring.** Medium to high: M0.3 will add UI that has no automated coverage.
- **Priority.** P2.
- **Resolution trigger.** Before the next milestone that adds UI.
- **Status.** open. Proposed: [TD-03](maintenance/post-m0.2.md#td-03--ui-and-end-to-end-testing-strategy).

### DEBT-10 — Browser verification is a manual, Chromium-only script

- **Description.** `scripts/verify-dc-simulator-url.mjs` (955 lines, 154 checks) drives Chrome or
  Edge through the DevTools protocol against a production build started by hand. It is not in any
  npm script or CI. It must be re-run when Next.js is updated, because the simulator's URL
  behaviour relies on how Next.js handles the URL and history. Most selectors use roles and ARIA
  attributes; one (`[class*="sliderTrack"]`) depends on a CSS Module class name.
- **Sources.** [Milestone M0.2, non-blocking debt](milestones/m0.2-first-vertical-slice.md#non-blocking-technical-debt)
  (items 1, 2); [§6, architecture](milestones/m0.2-first-vertical-slice.md#6-architecture-in-the-slice);
  the script's header.
- **Category.** C3.
- **Impact.** A Next.js update can silently break the simulator's URL behaviour; no Firefox or
  WebKit coverage.
- **Risk of deferring.** Medium: Next.js updates are frequent.
- **Priority.** P2.
- **Resolution trigger.** Every Next.js update (re-run by hand until automated); automation after
  TD-03's decision.
- **Status.** open. Proposed: TD-03.

### DEBT-11 — Accessible names and announcements not verified with a screen reader

- **Description.** The accessible names and live announcements of Discovery, Vehicle Analysis and
  the simulator have been checked in the DOM but not with a screen reader.
- **Sources.** [Milestone M0.2, non-blocking debt](milestones/m0.2-first-vertical-slice.md#non-blocking-technical-debt).
- **Category.** C3 (manual verification gap).
- **Impact.** Possible defects for screen-reader users that automated checks cannot reveal.
- **Risk of deferring.** Grows with each interactive control added.
- **Priority.** P3.
- **Resolution trigger.** Before a public release, or before adding further interactive controls
  such as the comparison.
- **Status.** open. Not in the post-M0.2 phase; a tool cannot settle it.

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
- **Status.** open. Candidate for **accepted limitation**: the final review accepted it as
  non-blocking, but its permanent acceptance needs the product owner's decision (TD-04).

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

- **Description.** The field is validated but plays no part in any calculation.
- **Sources.** [Limitations, item 3 and physical simplifications](charging/limitations.md).
- **Category.** C4: a modelling decision (use it as P = U × I × phases, or remove it).
- **Impact.** Catalogue data must supply a value that has no effect.
- **Risk of deferring.** Low.
- **Priority.** P3.
- **Resolution trigger.** A decision on the AC model, or external data that lacks the field.
- **Status.** open.

### DEBT-16 — AC behaviour of a multi-phase vehicle on fewer phases

- **Description.** A 3-phase 11 kW vehicle on a 1-phase 7.4 kW station is modelled at 3.67 kW,
  its per-phase share, although some on-board chargers draw more on one phase.
- **Sources.** [Limitations, physical simplifications and item 4](charging/limitations.md).
- **Category.** C5 with an open modelling question (C4). Not maintenance.
- **Impact.** Underestimated AC power in that configuration.
- **Risk of deferring.** None for the current slice, which shows DC only.
- **Priority.** P3.
- **Resolution trigger.** An AC simulation in the UI.
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

### DEBT-20 — No aggregate validation of vehicle and session

- **Description.** There is no factory for `VehicleChargingSpec` or `ChargingSession`; an invalid
  DC capability goes unnoticed in an AC session.
- **Sources.** [Limitations, item 9](charging/limitations.md#open-questions-and-technical-debt).
- **Category.** C1.
- **Impact.** None with the validated illustrative catalogue (`src/data/catalogue.ts` validates
  each capability through the factories).
- **Risk of deferring.** Grows with external or user-entered data.
- **Priority.** P3.
- **Resolution trigger.** Integration of an external vehicle data source, or user-entered vehicles.
- **Status.** open.

### DEBT-21 — No defined public surface of the engine

- **Description.** No barrel file; every helper is importable; `ACChargingTimeInput` is the only
  input type not exported; `acChargingTime.ts` imports domain types without `import type`
  (still true at baseline, line 1).
- **Sources.** [Limitations, item 10](charging/limitations.md#open-questions-and-technical-debt).
- **Category.** C1.
- **Impact.** Consumers can depend on internals; the documented API is the only boundary.
- **Risk of deferring.** Low while the engine has one consumer in the same repository.
- **Priority.** P3.
- **Resolution trigger.** The engine is consumed outside `src/`, or a public API revision.
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
  revision.
- **Status.** open. Outside the post-M0.2 phase, which does not modify ADR 0001.

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

### Open decisions that are not debt (C4)

ADR 0001 open questions 2 (store scope), 3 (limiting factor and energy-over-time series), 4 (URL
format), 7 (comparison capacity), 9 (token organisation), 10 (font delivery), 11 (responsive layout
and dark theme) and 12 (directory locations, partly answered by the README); M0.2 slice open
questions 5 (search matching rules) and 8 (illustrative qualifier on provenance tags). They are
decided when the feature that needs them is specified. Open question 8 of the ADR is the only one
in this phase (DEBT-09).

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
4. **Vitest warnings.** Both confirmed; an invalid peer dependency of `vite-tsconfig-paths` is
   not documented (DEBT-07).
5. **Dependency direction.** Confirmed and type-only. The documented case is the factories; the
   same import also comes from `src/scenarios/` and `src/data/`, against the ADR 0001 diagram
   (DEBT-01).
6. **CI.** No CI exists. No document claims otherwise; the absence is recorded as DEBT-08.
7. **Status text.** See DEBT-22.
