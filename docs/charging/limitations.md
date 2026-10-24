# Assumptions and limitations

## Physical simplifications

- **No charging losses.** Curve power and AC power are treated as power stored in the battery.
  `deliveredEnergyKwh` is stored energy; energy drawn from the grid would be higher.
- **No thermal, ageing or preconditioning effects.** The DC curve is a fixed function of SoC.
- **AC power is constant** from the initial to the final SoC; there is no taper near 100%.
- **AC phase model.** Each side's power is assumed to be split evenly across its phases, and only
  the phases both sides share are used. As a result, a 3-phase 11 kW vehicle on a 1-phase 7.4 kW
  station is modelled at 3.67 kW, even though some on-board chargers draw more on a single phase.
  See the open questions below.
- **No voltage or current model.** `maxCurrentA` is validated but not used, and DC station limits
  are power-only (no voltage class or current limit).
- **SoC refers to usable capacity.** Gross capacity and buffers are outside the model.
- **The DC curve is held flat outside its SoC range,** at the power of the nearest endpoint.
- **A vertical step in a curve** cannot be represented, because duplicate SoC values are rejected.

## Numerical accuracy

- **DC integration** uses the midpoint rule with steps of at most 0.1 SoC points (up to 1,000
  curve evaluations for a 0–100% interval).
  - It is exact on flat stretches and very accurate on realistic sloped curves (about 0.001 s on
    a linear 200 → 50 kW curve over 0–80%).
  - It always underestimates on sloped segments, and the step size is fixed rather than
    adaptive. Extreme slopes are therefore inaccurate: a curve falling from 300 to 5 kW within
    one SoC point gives a time about 11% too short over that point.
  - A step that straddles a curve breakpoint is evaluated at a single midpoint power.
- **Duration sessions** find the final SoC by bisection to within 10⁻⁶ SoC points (about 1 mWh
  on a 100 kWh battery). The reported SoC is the lower bound, so the forward time to it never
  exceeds the duration. `chargingTimeHours` is reported as exactly the duration.
- **Floating point.** Results are unrounded (`4.199999999999999` rather than `4.2`). Extremely
  small but valid powers (around 10⁻³⁰⁸ kW) could overflow a time to `Infinity`; this is not
  guarded against.
- **Cost.** A DC duration session runs up to about 28 forward integrations of up to 1,000 steps
  each. Each step looks up the curve with a linear scan. This is negligible for interactive use
  but would matter for large batch comparisons.

## Supported and unsupported scenarios

Supported:

- AC charging with 1–3 phases on both sides and different phase counts.
- DC charging along a curve capped by vehicle and station maximum power, including curves that
  exceed the vehicle maximum or do not cover 0–100%.
- Target-SoC sessions, including a target at or below the initial SoC (zero session) and a 100%
  target.
- Duration sessions, including zero duration, a full battery at the start, and a battery that
  fills before the duration ends.

Unsupported:

- A duration of `Infinity` meaning "until full": it is rejected. Use a 100% target instead.
- Discharging, or any session that lowers the SoC.
- A combined termination such as "target SoC or duration, whichever comes first".
- Vehicles without AC charging (`ac` is mandatory).
- Costs, losses, multiple stops, shared station power, and charging-time schedules.

## Constraints for future extensions

- **New station types** need a new member in the `ChargingStation` union and a new case in
  `resolveChargingTime`. Under `strict` TypeScript, a function with a declared return type and a
  missing case does not compile, so the compiler flags the omission. The session switches have no
  runtime `default`; an unknown `type` coming from untyped JavaScript would return `undefined`.
- **Any new forward charging model** must give a time that increases strictly with the end SoC
  (positive power everywhere). The duration bisection depends on this.
- **Modelling losses** would make the meaning of `deliveredEnergyKwh` ambiguous. Introduce
  separate stored-energy and grid-energy fields rather than changing its meaning.
- **New external data** (for example from a vehicle data source) should enter through the
  factories. Calculation-level validation is a safety net, not the primary boundary.
- **Validation placement.** Add checks at public entry points (factories, forward functions, the
  session). Do not add them to every internal helper.

## Open questions and technical debt

These were found while documenting the implementation. None has been changed in the code.

1. **Inconsistent error vocabulary.** The same limit is called `invalidMaxPower` by the
   factories and `invalidPower` by the calculations. `invalidSoc` has three shapes: without
   `field` (curve point), with `fromSocPercent | toSocPercent`, and with `socPercent`.
   `invalidSocRange` is the only error with a `message`.
2. **Unbranded validated types.** Raw and validated types are structurally the same, so the
   power and phase rules are implemented twice (factories and `acChargingTime`/`dcChargingTime`).
   Branded types would make the factories the only boundary, but would change public types.
3. **`maxCurrentA` is validated but unused.** Should it limit AC power (P = U × I × phases), or
   be removed?
4. **AC single-phase behavior.** Should a multi-phase vehicle on fewer station phases be limited
   to its per-phase share (current model) or to a vehicle-specific single-phase limit?
5. **Session error order.** `dcChargingNotSupported` is reported before invalid SoC values, and
   AC and DC forward functions check their inputs in different orders.
6. **Unreachable error variants** in `ChargingSessionError` (see the
   [error catalogue](public-api.md#error-catalogue)).
7. **Mixed time units.** Session input is in minutes, every output is in hours.
8. **Dependency direction.** `domain/chargingFactories.ts` imports `CalculationResult` from
   `calculations/result.ts`, so the domain depends on the calculations package for a generic
   type that both layers use.
9. **No aggregate validation.** There is no factory for `VehicleChargingSpec` or
   `ChargingSession`. Their fields are validated only when a calculation uses them, so an
   invalid DC capability on a vehicle goes unnoticed in an AC session.
10. **No defined public surface.** There is no barrel file. Every helper is importable,
    `ACChargingTimeInput` is the only input type that is not exported, and `acChargingTime.ts`
    imports domain types without `import type`.
11. **Formatting and lint drift.**
    - `npm run format:check` reports most charging source and test files as not formatted to
      the Prettier config.
    - `npm run lint` passes without errors but reports many warnings: unused variables in the
      `*.types.ts` compile-time tests, and the `result.ok && expect(...)` assertion pattern.
12. **Vitest configuration warnings.**
    - `vitest.config.ts` is ESM loaded as CommonJS.
    - `vite-tsconfig-paths` could be replaced by Vite's native `resolve.tsconfigPaths`.
