# Copilot instructions for EV Compare

## Project overview

This repository is a Next.js app for comparing electric-vehicle charging scenarios. The codebase is still intentionally incremental: the app shell is in `src/app`, the EV/domain model lives in `src/domain`, and pure charging/energy calculations live in `src/calculations`.

The project is built around explicit validation and typed result objects instead of throwing exceptions for expected invalid input. The current implementation focuses on charging-domain primitives and calculation helpers; UI work remains minimal and route-centric.

## Commands

Use Node.js 24 LTS for local development. The README also supports Node 22.12+ and 26+.

- Install dependencies: `npm ci`
- Start the dev server: `npm run dev`
- Create a production build: `npm run build`
- Serve the production build: `npm start`
- Run the linter: `npm run lint`
- Run the full test suite: `npm test`
- Run a single test file: `npx vitest run tests/calculations/charging/time.test.ts`
- Run type checking: `npm run typecheck`
- Format files: `npm run format`
- Check formatting: `npm run format:check`

The app runs on http://localhost:3000 after `npm run dev`.

## Architecture

- `src/app/`: App Router entrypoints and layout. This is the UI shell for the Next.js app.
- `src/domain/`: Core domain types and validation factories for charging models (for example, charging capabilities, stations, and session definitions).
- `src/calculations/`: Pure calculation functions that transform domain values into numeric results, usually returning a typed `CalculationResult`.
- `src/calculations/result.ts`: shared success/error union used across calculation modules.
- `tests/`: Behavior tests that mirror the source structure (`tests/domain`, `tests/calculations`).

The important design pattern is separation of concerns:

1. Domain modules describe the problem model and input validation.
2. Calculation modules perform math using pure functions with explicit error handling.
3. App files render the UI and should stay thin.

## Key conventions

- Prefer pure functions and explicit return values over mutating state or ad hoc exception handling.
- Use the `CalculationResult<T, E>` pattern for operations that can fail gracefully:

  ```ts
  type CalculationResult<T, E> =
    | { ok: true; value: T }
    | { ok: false; error: E };
  ```

- Domain factory functions validate raw input and return structured errors such as `{ type: "invalidMaxPower", value: raw.maxPowerKw }`.
- Keep type definitions close to the business model; examples include `ChargingCurvePoint`, `VehicleChargingSpec`, `ChargingStation`, and `TerminationCondition` in `src/domain/charging.ts`.
- Tests use Vitest (`describe`, `it`, `expect`) and mirror the source layout. If you add a new calculation or factory, add the corresponding test next to it.
- Use the repo's existing TypeScript path alias (`@/*`) for imports instead of relative paths when consuming modules from elsewhere in the app.
- This project intentionally uses plain HTML and TypeScript without a CSS framework; keep styling minimal unless a broader UI plan is introduced.
- ESLint is configured with Next.js rules and Prettier handles formatting; don't introduce unrelated config churn.

## Working style for this repo

- Use the repository's current incremental scope: keep domain and calculations well-typed and isolated from UI concerns.
- Favor small, testable modules over large pages or service layers.
- Maintain the existing structure rather than creating new top-level architectural layers without a clear need.

## Relevant repo notes from the README

The README states that this is an educational EV-charging comparison app with a planned future data source from OpenEV Data. It also notes that the project uses:

- Next.js App Router
- strict TypeScript
- plain HTML without a CSS framework
- ESLint + Prettier
- Vitest in its default Node environment

No placeholder domain code is intended to be added as a catch-all; build features incrementally in the existing domain/calculation structure.
