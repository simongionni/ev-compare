# EV Compare

An educational web application for exploring and comparing electric vehicles,
eventually including configurable charging and range calculations. OpenEV Data
is the intended future vehicle-data source.

Only the project scaffold exists. Domain architecture, EV types, data integration,
and calculation logic are intentionally not implemented yet.

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
| `npm test`             | Run the single Vitest smoke test                  |
| `npm run typecheck`    | Generate Next.js route types and check TypeScript |
| `npm run format`       | Format files with Prettier                        |
| `npm run format:check` | Check formatting                                  |

## Bootstrap choices

Next.js App Router with React and strict TypeScript; plain HTML without a CSS
framework. ESLint uses Next.js rules, with formatting handled by Prettier.
Vitest uses its default Node environment without a custom configuration.
The npm lockfile records the installed dependency versions.
ESLint stays on major 9 and TypeScript on major 6 because Next.js's current
lint plugins do not yet support ESLint 10 or TypeScript 7.

`src/app/` contains the minimal page and layout. Empty directories were created
for `src/domain/`, `src/calculations/`, `src/data/`, `src/components/`, `scripts/`,
and `docs/decisions/`. Git does not preserve empty directories; recreate them
when adding their first real files. No placeholder domain code is provided.
