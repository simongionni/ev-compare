# EV Compare

An educational web application for exploring and comparing electric vehicles,
eventually including configurable charging and range calculations. OpenEV Data
is the intended future vehicle-data source.

## Status

Milestone M0.1 is implemented: a UI-independent charging domain model and charging
simulation engine in `src/domain/` and `src/calculations/`. It covers AC and DC charging,
DC charging curves and charging sessions ending at a target state of charge or after a
duration. Vehicle data integration (OpenEV Data) and a user interface for these
calculations are not implemented yet; the web app is still the initial landing page.

Milestone M0.2 has closed its visual identity exploration: Livrea Consolidated is the selected
visual identity ([`docs/ux/visual-identity/`](docs/ux/visual-identity/README.md)). The UI stack
has not been chosen yet.

## Documentation

Technical documentation is in [`docs/`](docs/README.md). Start with the
[charging module overview](docs/charging/README.md).

## Local setup

Use Node.js 24 LTS and npm. Node.js 22.12+ and 26+ are also supported.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`.

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

Next.js App Router with React and strict TypeScript; plain HTML without a CSS
framework. ESLint uses Next.js rules, with formatting handled by Prettier.
Vitest uses its default Node environment; `vitest.config.ts` only adds
`vite-tsconfig-paths` to resolve the `@/` import alias.
The npm lockfile records the installed dependency versions.
ESLint stays on major 9 and TypeScript on major 6 because Next.js's current
lint plugins do not yet support ESLint 10 or TypeScript 7.

`src/app/` contains the minimal page and layout. `src/domain/` and
`src/calculations/` contain the charging module. Empty directories were created for
`src/data/`, `src/components/`, `scripts/` and `docs/decisions/`. Git does not preserve
empty directories; recreate them when adding their first real files.
