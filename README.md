# EV Compare

An educational web application for exploring and comparing electric vehicles,
eventually including configurable charging and range calculations. OpenEV Data
is the intended future vehicle-data source.

## Status

**M0.1 — complete.** A UI-independent charging domain model and charging simulation engine in
`src/domain/` and `src/calculations/`. It covers AC and DC charging, DC charging curves and
charging sessions ending at a target state of charge or after a duration.

**M0.2 — complete** (2026-11-13), accepted with non-blocking caveats recorded in the
[milestone](docs/milestones/m0.2-first-vertical-slice.md#10-acceptance).

- Done (documentation only): UX flows, desktop wireframes for Discovery, Vehicle Analysis and
  Comparison, and the visual identity, with Livrea Consolidated selected.
- Decided: the frontend stack and state-management rules
  ([ADR 0001](docs/decisions/0001-frontend-architecture.md)).
- Done: the [first vertical slice](docs/milestones/m0.2-first-vertical-slice.md),
  Discovery → Vehicle Analysis → DC simulation.
  - **Increment 1 — implemented:** design tokens and Schibsted Grotesk, the illustrative
    catalogue, the search scenario in the URL, and Discovery (`/cerca`): direct search by make
    or model, results in price order, empty state.
  - **Increment 2 — implemented:** Vehicle Analysis (`/veicoli/<id>`): context bar ("‹ Risultati"
    back to the same search when opened from Discovery, "‹ Cerca" when opened directly), identity
    and main data, and the Ricarica preview: the reference DC scenario (10 % → 80 %, 150 kW)
    calculated by M0.1 with a visx power-by-SoC chart. Vehicles without charging data show what
    the catalogue documents and no calculation.
  - **Increment 3 — implemented:** the dedicated DC simulation
    (`/veicoli/<id>/simulazione-dc`): station power (50, 150, 350 kW) and SoC range, time and
    stored energy from M0.1, an inspectable power-by-SoC chart (pointer and keyboard), the
    scenario in a shareable URL rewritten in place (no history entry per change), and the return
    link "‹ <vehicle name>" to the analysis, keeping its origin. Vehicles without charging data
    show the missing data and no simulation.
  - The final review verified the milestone's acceptance criteria as a whole and raised no
    actionable finding.

Of the stack packages beyond Next.js, React and TypeScript, the visx packages the chart uses
(`@visx/scale`, `@visx/shape`, `@visx/group`, `@visx/axis`) and Base UI (`@base-ui/react`, for the
simulator's slider and radio group) are installed; the others are added by the implementation work
that first needs them. Vehicle data integration (OpenEV Data) is not
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

Open http://localhost:3000 (it opens Discovery at `/cerca`). A vehicle's analysis is at
`/veicoli/<id>`, for example http://localhost:3000/veicoli/nordis-e4. On Windows, use `npm.cmd` if
PowerShell blocks `npm.ps1`.

Install the Playwright browser binaries once before running end-to-end tests locally:

```sh
npx playwright install chromium firefox
```

On Linux, include the browsers' system dependencies with
`npx playwright install --with-deps chromium firefox`.

## Commands

| Command                   | Purpose                                            |
| ------------------------- | -------------------------------------------------- |
| `npm run dev`             | Start the development server                       |
| `npm run build`           | Create a production build                          |
| `npm start`               | Serve the production build                         |
| `npm run lint`            | Run ESLint                                         |
| `npm test`                | Run the Vitest test suite                          |
| `npm run test:e2e`        | Build, then run Playwright in Chromium and Firefox |
| `npm run test:e2e:headed` | Build, then run both browsers headed for debugging |
| `npm run typecheck`       | Generate Next.js route types and check TypeScript  |
| `npm run format`          | Format files with Prettier                         |
| `npm run format:check`    | Check formatting                                   |
| `npm run check`           | Run the complete local quality gate                |

`npm run check` stops at the first failure and runs formatting, zero-warning lint, type checking,
the Vitest suite and the production build, in that order.

Playwright always starts a fresh production server on port 3100 through its configuration;
it does not reuse a development server. The local E2E commands build first so `.next` belongs to
the current checkout. CI builds once explicitly and then uses `npm run test:e2e:ci`, which starts
the same Playwright-managed production server without rebuilding. HTML reports are written to
`playwright-report/`; traces, screenshots and other failure output are written to `test-results/`.

The first migration increment covers traceability rows E2E-001, E2E-002, E2E-024 and E2E-040 in
both Chromium and Firefox. The remaining rows and current limitations are tracked in the
[end-to-end traceability matrix](docs/testing/e2e-traceability.md). During migration the legacy
verification remains available: after `npm run build`, start the production app with
`npm start -- -p 3123` and run `node scripts/verify-dc-simulator-url.mjs` in another terminal
against its default `http://localhost:3123` target.

## Continuous integration

The [CI workflow](.github/workflows/ci.yml) runs on every pull request and on pushes to `dev` and
`master`, using Node.js 24 and `npm ci`:

- **Linux quality gate** runs `npm run check` on `ubuntu-latest`.
- **Windows tests** runs the formatting check and the required Vitest suite from the canonical
  upper-case drive path on `windows-latest`.
- **Playwright E2E** installs Chromium and Firefox with their Linux dependencies, builds once,
  starts that production build through Playwright, and runs the same behavioural suite in both
  browsers. It uploads the HTML report and failure artefacts; during migration it is automatic
  and failure-visible but is not a required status check.

The Linux and Windows jobs are required status checks for merges into the protected `master`
branch. Direct pushes to `dev` remain allowed and trigger CI after the push. The Windows job also
runs Vitest from the same workspace with a genuine lower-case drive letter and prints Node's
`process.cwd()`. This temporary, non-blocking diagnostic tracks
[DEBT-02](docs/technical-debt.md#debt-02--vitest-fails-when-the-drive-letter-is-lower-case); its
expected upstream failure does not weaken either required check.

The first operational run, [CI run 44182405822](https://github.com/simongionni/ev-compare/actions/runs/44182405822),
passed both jobs on 2026-11-17. It recorded `D:\a\ev-compare\ev-compare` for the required Windows
run (473 tests passed) and `d:\a\ev-compare\ev-compare` for the diagnostic (all 26 test files
failed during collection with the known defect while the Windows job remained successful).

## Line endings

Git stores text files with LF line endings. `.gitattributes` enforces the same checkout form on
Windows and Linux; image and font binaries are excluded from text normalization.

An existing Windows checkout created before this policy may still contain CRLF files. Refresh it
once after pulling the policy commit. Do not overwrite uncommitted work: if `git status --short`
has output, save it first and restore it only after the refresh succeeds.

```powershell
git status --short
git stash push --include-untracked -m "before LF working-tree refresh" # only when the tree is dirty
$crlfFiles = git -c core.quotepath=false ls-files --eol |
  Where-Object { $_ -match 'w/crlf' } |
  ForEach-Object { ($_ -split "`t", 2)[1] }
foreach ($relativePath in $crlfFiles) {
  $path = Join-Path (Get-Location) $relativePath
  $bytes = [IO.File]::ReadAllBytes($path)
  $lf = [Collections.Generic.List[byte]]::new($bytes.Length)
  for ($i = 0; $i -lt $bytes.Length; $i++) {
    if ($bytes[$i] -eq 13 -and $i + 1 -lt $bytes.Length -and $bytes[$i + 1] -eq 10) { continue }
    $lf.Add($bytes[$i])
  }
  [IO.File]::WriteAllBytes($path, $lf.ToArray())
}
git add --renormalize .
git status --short
git stash apply 'stash@{0}' # only when a stash was created
# After verifying the restored changes:
git stash drop 'stash@{0}'
```

If applying the stash reports conflicts, resolve them before dropping it; Git retains the stash,
so the saved work is not discarded.

## Blame hygiene

`.git-blame-ignore-revs` lists mechanical Prettier-only commits. Use it for one command with
`git blame --ignore-revs-file .git-blame-ignore-revs <path>`, or enable it for this clone:

```sh
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

## Bootstrap choices

Next.js App Router with React and strict TypeScript; CSS Modules with CSS custom properties,
no CSS framework. The approved frontend stack is recorded in
[ADR 0001](docs/decisions/0001-frontend-architecture.md); Base UI (`@base-ui/react`) is installed,
visx only with the packages the chart uses, and Redux Toolkit with `react-redux` is not installed
yet. ESLint uses Next.js rules, with formatting handled by Prettier.
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
| `src/scenarios/`    | URL scenario models and their parsing and serialisation (search, origin, DC simulation)     |
| `src/application/`  | Application logic as pure functions (search, Ricarica preview, DC simulation, chart series) |
| `src/presentation/` | Display formatting, error messages and route paths                                          |
| `src/styles/`       | Livrea Consolidated design tokens (`tokens.css`) and global base styles                     |
| `src/components/`   | EV Compare components, each with its CSS Module                                             |
| `src/app/`          | Routes: `/cerca`, `/veicoli/[vehicleId]`, its DC simulator (`/simulazione-dc`), the font    |

Tests mirror the source layout under `tests/`. These locations answer, for the first increment,
the directories left open by ADR 0001 (open question 12). `scripts/verify-dc-simulator-url.mjs` is
a browser verification of the DC simulator run by hand against a production build. ADR 0001 open
question 8 is resolved: Playwright Test with Chromium and Firefox is approved for browser
end-to-end tests, but it is not installed or operational and the legacy script remains until
reviewed migration parity.
