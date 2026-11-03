# EV Compare

An educational web application for exploring and comparing electric vehicles,
eventually including configurable charging and range calculations. OpenEV Data
is the intended future vehicle-data source.

## Status

**M0.1 — complete.** A UI-independent charging domain model and charging simulation engine in
`src/domain/` and `src/calculations/`. It covers AC and DC charging, DC charging curves and
charging sessions ending at a target state of charge or after a duration.

**M0.2 — in progress.**

- Done (documentation only): UX flows, desktop wireframes for Discovery, Vehicle Analysis and
  Comparison, and the visual identity, with Livrea Consolidated selected.
- Decided: the frontend stack and state-management rules
  ([ADR 0001](docs/decisions/0001-frontend-architecture.md)).
- In progress: the [first vertical slice](docs/milestones/m0.2-first-vertical-slice.md),
  Discovery → Vehicle Analysis → DC simulation.
  - **Increment 1 — implemented:** design tokens and Schibsted Grotesk, the illustrative
    catalogue, the search scenario in the URL, and Discovery (`/cerca`): direct search by make
    or model, results in price order, empty state.
  - **Not implemented yet:** Vehicle Analysis (`/veicoli/<id>` is a provisional page marked as
    not implemented), the DC simulation and its chart.

The stack packages beyond Next.js, React and TypeScript are not installed yet; each is added by
the implementation work that first needs it. Vehicle data integration (OpenEV Data) is not
implemented: the catalogue is fictional and illustrative.

Milestone M0.2 has closed its visual identity exploration: Livrea Consolidated is the selected
visual identity ([`docs/ux/visual-identity/`](docs/ux/visual-identity/README.md)).

## Documentation

Technical documentation is in [`docs/`](docs/README.md). Start with the
[charging module overview](docs/charging/README.md) for the engine and with
[ADR 0001](docs/decisions/0001-frontend-architecture.md) for frontend work.

## Local setup

Use Node.js 24 LTS and npm. Node.js 22.12+ and 26+ are also supported.

```sh
npm ci
npm run dev
```

Open http://localhost:3000 (it opens Discovery at `/cerca`). On Windows, use `npm.cmd` if
PowerShell blocks `npm.ps1`.

## Commands

| Command                | Purpose                                           |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Start the development server                      |
| `npm run build`        | Create a production build                         |
| `npm start`            | Serve the production build                        |
| `npm run lint`         | Run ESLint                                        |
| `npm test`             | Run the Vitest test suite                         |
| `npm run typecheck`    | Generate Next.js route types and check TypeScript |
| `npm run format`       | Format files with Prettier                        |
| `npm run format:check` | Check formatting                                  |

## Bootstrap choices

Next.js App Router with React and strict TypeScript; CSS Modules with CSS custom properties,
no CSS framework. The approved frontend stack is recorded in
[ADR 0001](docs/decisions/0001-frontend-architecture.md); Base UI, visx and Redux Toolkit with
`react-redux` are not installed yet. ESLint uses Next.js rules, with formatting handled by
Prettier.
Vitest uses its default Node environment; `vitest.config.ts` only adds
`vite-tsconfig-paths` to resolve the `@/` import alias.
The npm lockfile records the installed dependency versions.
ESLint stays on major 9 and TypeScript on major 6 because Next.js's current
lint plugins do not yet support ESLint 10 or TypeScript 7.

## Source layout

| Path                | Contents                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------- |
| `src/domain/`       | M0.1 charging domain model and factories                                                    |
| `src/calculations/` | M0.1 charging engine                                                                        |
| `src/data/`         | Illustrative vehicle catalogue: raw data, validation through the M0.1 factories, provenance |
| `src/scenarios/`    | URL scenario models and their parsing and serialisation (search)                            |
| `src/application/`  | Application logic as pure functions (search matching and ordering)                          |
| `src/presentation/` | Display formatting and route paths                                                          |
| `src/styles/`       | Livrea Consolidated design tokens (`tokens.css`) and global base styles                     |
| `src/components/`   | EV Compare components, each with its CSS Module                                             |
| `src/app/`          | Routes: `/cerca` (Discovery), `/veicoli/[vehicleId]` (provisional), the self-hosted font    |

Tests mirror the source layout under `tests/`. These locations answer, for the first increment,
the directories left open by ADR 0001 (open question 12).
