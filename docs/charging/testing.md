# Testing

## Organization

Tests live in `tests/` and mirror `src/`:

```text
tests/
├── smoke.test.ts                      Framework sanity check
├── calculations/
│   ├── result.types.ts                Compile-time tests for CalculationResult
│   └── charging/
│       ├── energy.test.ts
│       ├── time.test.ts
│       ├── constantPowerCharging.test.ts
│       ├── acPower.test.ts
│       ├── acChargingTime.test.ts
│       ├── dcCurve.test.ts
│       ├── dcChargingTime.test.ts
│       ├── chargingSession.test.ts
│       └── error.types.ts             Compile-time tests for calculation errors
└── domain/
    ├── chargingFactories.test.ts
    ├── charging.types.ts              Compile-time tests for domain types
    └── chargingErrors.types.ts        Compile-time tests for factory errors
```

There are two kinds of test:

- **`*.test.ts`** are runtime tests run by Vitest. There are 182 tests in 10 files.
- **`*.types.ts`** are compile-time tests. They assign valid and invalid literals to the public
  types and mark the invalid ones with `// @ts-expect-error`. Vitest does not run them; they are
  checked by `npm run typecheck` (tsconfig includes `**/*.ts`). If an invalid assignment starts
  compiling, the unused `@ts-expect-error` fails the type check.

## Conventions

- **Valid domain values are built through the factories**, with a helper that throws if test
  setup is invalid (for example `acCapability`, `dcCapability`, `vehicleWithCurve`). This also
  exercises the factories on realistic data.
- **Invalid domain values are written as object literals** (for example a DC station with
  `maxPowerKw: Infinity`), so that tests can check calculation-level validation, which the
  factories would otherwise prevent.
- **Errors are compared exactly** with `toEqual({ ok: false, error: { ... } })`, including the
  offending value. `NaN` cases rely on `toEqual` treating `NaN` as equal to `NaN`.
- **Edge values are table-driven** with `it.each` over `0`, negative values, `NaN`, `Infinity`
  and `-Infinity`.
- **Numerical results are checked against independent references:**
  - analytic formulas, such as the exact time for a linearly varying power in
    `dcChargingTime.test.ts`;
  - the forward function itself, for the consistency of session results.

## Behavior covered

| Area                | Covered                                                                                                                                                                                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Factories           | Valid inputs; SoC, power, phases and current bounds; non-finite values; curve point count, duplicates, order; DC curve error propagation; inputs not mutated                                                                                               |
| Energy and time     | Formulas; invalid capacity, SoC, power and energy, including non-finite values                                                                                                                                                                             |
| AC power and time   | Phase combinations; vehicle and station limits validated individually; invalid phases                                                                                                                                                                      |
| Curve interpolation | Interior interpolation, endpoint holding, non-finite SoC                                                                                                                                                                                                   |
| DC time             | Flat, linear and multi-segment curves against analytic results; vehicle and station caps; empty and full ranges; invalid limits, including `Infinity` hidden behind a valid limit                                                                          |
| Session             | AC and DC target and duration sessions; consistency between target and duration; full battery; boundaries (0 duration, target equal to or below initial, 100% target); `dcChargingNotSupported`; invalid SoC, duration, capacity, station power and phases |

## Commands

| Command                                                             | Purpose                                                                                                                   |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                                                          | Run all Vitest tests once                                                                                                 |
| `npx vitest`                                                        | Watch mode                                                                                                                |
| `npx vitest run tests/calculations/charging/dcChargingTime.test.ts` | Run one file                                                                                                              |
| `npx vitest run -t "simulateChargingSession"`                       | Run tests whose name matches                                                                                              |
| `npm run typecheck`                                                 | TypeScript check, including `*.types.ts` tests                                                                            |
| `npm run lint`                                                      | ESLint                                                                                                                    |
| `npm run format:check`                                              | Prettier check (currently reports existing drift; see [technical debt](limitations.md#open-questions-and-technical-debt)) |

On Windows PowerShell, use `npm.cmd` if script execution blocks `npm.ps1`.

Vitest uses [`vitest.config.ts`](../../vitest.config.ts), whose only setting is the
`vite-tsconfig-paths` plugin that resolves the `@/` alias.
