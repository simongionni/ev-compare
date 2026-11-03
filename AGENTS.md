# EV Compare agent instructions

## Project context

EV Compare is an educational web application for discovering and comparing electric vehicles
and for exploring charging behaviour. Product complexity should be available without being
mandatory, and technical claims, estimates, and illustrative data must remain transparent.

Milestone M0.1 is complete: `src/domain/` contains the charging domain model and validation
factories, and `src/calculations/` contains the UI-independent AC/DC simulation engine. Milestone
M0.2 is in progress: its first vertical slice is Discovery -> Vehicle Analysis -> DC simulation.
The repository README and current code describe which increments are actually implemented; do
not infer implementation merely because a feature is approved or shown in a wireframe.

Keep the two streams distinct:

- M0.1 domain and calculations are an existing, stable engine with documented contracts.
- M0.2 is a frontend and application layer that consumes that engine. Frontend needs do not
  implicitly authorize changes to M0.1 behaviour or duplicated charging mathematics.

Start with `README.md` for current repository status and `docs/README.md` for the documentation
map. The codebase is authoritative for current implementation; accepted ADRs and milestone
specifications are authoritative for approved intent and say whether that intent is implemented.

## Documentation and decision hierarchy

Consult the source that owns the concern before changing it:

| Concern                                           | Authoritative sources                                                                                                                                               |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product requirements                              | `docs/product-vision.md`                                                                                                                                            |
| UX and interaction principles                     | `docs/ux/design-principles.md`, relevant user flows and consolidated wireframes under `docs/ux/`                                                                    |
| Visual identity                                   | `docs/ux/visual-identity/livrea-consolidated/README.md` and the implementation artefacts it identifies                                                              |
| Frontend architecture and approved stack          | `docs/decisions/0001-frontend-architecture.md`                                                                                                                      |
| Milestone scope and acceptance criteria           | the relevant specification under `docs/milestones/`, currently `docs/milestones/m0.2-first-vertical-slice.md`                                                       |
| Charging architecture, API, behaviour, and limits | `docs/charging/README.md`, `docs/charging/public-api.md`, `docs/charging/domain-model.md`, `docs/charging/calculation-model.md`, and `docs/charging/limitations.md` |
| Current implementation and installed packages     | source, tests, `package.json`, lockfile, and `README.md`                                                                                                            |

Read `claude.md` and `.github/copilot-instructions.md` as compatible working guidance. They do
not outrank the project sources above, and no agent has authority over another: responsibility is
assigned externally for each task.

Do not silently alter an accepted decision, resolve an open question, or expand a milestone while
implementing another task. Treat provisional visual decisions as implementation starting points
to verify, not as permission to replace consolidated decisions. If authoritative sources conflict
substantively, identify the exact conflict and ask for or report the needed decision. If a status
statement conflicts with the current tree, distinguish stale status text from still-valid rules.

## Architecture and implementation conventions

Follow ADR 0001 rather than duplicating it here. Its operational invariants are:

- Keep TypeScript strict and preserve explicit, precise types.
- Maintain the responsibility boundaries represented by `src/domain/`, `src/calculations/`,
  `src/data/`, `src/scenarios/`, `src/application/`, `src/presentation/`, `src/components/`,
  `src/styles/`, and `src/app/`. Add a new layer only for a concrete need.
- Keep `src/domain/` and `src/calculations/` independent of React, Next.js, Redux, visx, browser
  APIs, I/O, time, and randomness. Dependencies point from the UI toward domain and calculations.
- Pass raw external or catalogue data through the existing M0.1 validation factories. Use
  validated domain values downstream; do not validate catalogue data ad hoc in components.
- Preserve the established errors-as-values conventions. Expected invalid inputs use typed,
  discriminated results such as `CalculationResult<T, E>` rather than exceptions. Preserve
  documented error shapes and check order unless a task explicitly approves a contract change.
- Keep application rules and state transitions in pure TypeScript functions testable without
  React or Redux. Reducers and components may call those rules; they should not hide a second
  implementation of them.
- Give each piece of state one authoritative owner. The URL owns shareable, reproducible
  scenarios; local React state owns temporary interaction; Redux Toolkit through `react-redux`
  is only for genuinely shared state that neither already owns.
- Derive calculation results, chart series, display identity, and other outputs from their inputs.
  Do not store derived results as independent state or caches without an approved need.
- Do not reimplement M0.1 mathematics in frontend code or change engine behaviour to accommodate
  interface constraints. UI-only constraints belong to scenario/application/presentation layers.
- Use central CSS custom properties in `src/styles/` and CSS Modules. Components must consume
  Livrea Consolidated tokens rather than introduce arbitrary or duplicated colours, typography,
  spacing, radii, or semantic roles.
- Preserve Livrea Consolidated's colour semantics, Schibsted Grotesk typography, provenance
  treatment, and distinction between consolidated, provisional, and future decisions.
- Use the approved ADR 0001 stack. Do not add or replace dependencies outside it without a new
  approved decision. Install approved packages only when the current implementation first needs
  them.
- Prefer the existing `@/*` alias for cross-area imports and preserve nearby naming, module, and
  error-handling conventions.

Before relying on a documented directory or dependency, inspect the current tree and
`package.json`: some architectural locations were deliberately left to the first implementation,
and some approved packages are intentionally not installed yet.

## Testing and verification

Add focused Vitest coverage for new domain, calculation, scenario, data-validation, or
application logic. Preserve existing tests and public contracts, and verify the regressions
relevant to the change. Tests mirror the source layout under `tests/`.

Available repository checks are:

- `npm test` — Vitest suite.
- `npm run typecheck` — Next.js route generation and strict TypeScript checking.
- `npm run lint` — ESLint.
- `npm run build` — production Next.js build.
- `npm run format:check` — Prettier verification.

Choose checks in proportion to the change. Pure documentation edits normally need path, link,
formatting, and diff inspection rather than every application check. Logic changes require their
focused tests and normally the full test and type checks; frontend integration should also use
lint and build when pertinent. Milestone acceptance criteria may require the complete command
set. Never claim a command ran unless it did, and report skipped, failed, or warning-producing
checks explicitly with the reason.

## Task scope and change discipline

For every task:

1. Read this file and the specifications, decisions, implementation, and tests relevant to the
   requested area before editing.
2. Stay within the assigned outcome and file scope; preserve unrelated user changes in a dirty
   worktree.
3. Implement only demonstrated requirements. Avoid speculative features, future milestone work,
   premature packages, and placeholder abstractions.
4. Do not settle open product, UX, API, or architectural questions implicitly. Surface material
   undecided choices before they become contracts.
5. Preserve existing interfaces, error behaviour, URLs, and user-visible behaviour unless the
   task explicitly authorizes a change.
6. Prefer the smallest cohesive change. Do not rewrite working components or churn configuration
   for stylistic preference.
7. Do not modify unrelated files. If an essential fix would exceed scope, report it separately.
8. Update authoritative documentation only when the task includes a change that makes it
   inaccurate, and keep implementation status distinct from approved intent.

## Code review

A code-review assignment is read-only unless the user separately asks for implementation. Do not
edit files, apply fixes, install packages, or turn observations into unrequested changes.

Verify claims against the actual diff, current code, tests, and relevant approved decisions.
Prioritize findings that affect acceptance:

- identify concrete bugs and regressions, architectural or contract violations, security or
  accessibility risks, and material maintainability problems;
- distinguish those from optional improvements and stylistic preferences;
- give each finding a severity, precise evidence or location, user/developer impact, and the
  conditions that trigger it;
- avoid speculative recommendations unsupported by the current scope or code;
- explicitly call out divergence from accepted ADRs, milestone criteria, engine contracts, UX
  principles, or Livrea Consolidated.

Conclude so the reader can decide whether to accept the work or request targeted corrections. If
no actionable findings remain, say so and mention meaningful verification gaps or residual risks.

## Completion reporting

At the end of an assignment, report concisely:

- what was done;
- files changed, if any;
- relevant implementation decisions and why they were within approved constraints;
- checks actually run and their results;
- remaining problems, known limitations, or checks not run;
- decisions or input still required from the user.

Do not conceal pre-existing working-tree changes, attribute them to the task, or state that the
tree is clean when it is not.
