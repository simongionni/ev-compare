# Charging public API

All imports use the `@/` alias for `src/`. There is no barrel file; import from the module that
defines the symbol.

## Result type

[`src/calculations/result.ts`](../../src/calculations/result.ts)

```ts
type CalculationResult<T, E> = { ok: true; value: T } | { ok: false; error: E };
```

Conventions shared by every function below:

- Invalid input never throws; it returns `{ ok: false, error }`.
- The first failing check wins. Errors are not aggregated.
- Every error has a string `type` discriminant and, where relevant, the offending `value`.
- Successful results never contain `NaN` or infinite numbers. Results are raw floating-point
  values (for example `4.199999999999999`); round them for display.

## Session simulation (entry point)

[`@/calculations/charging/chargingSession`](../../src/calculations/charging/chargingSession.ts)

```ts
function simulateChargingSession(input: {
  vehicle: VehicleChargingSpec;
  station: ChargingStation;
  session: ChargingSession;
}): CalculationResult<ChargingSessionSimulation, ChargingSessionError>;

type ChargingSessionSimulation = {
  initialSocPercent: number;
  finalSocPercent: number;
  chargingTimeHours: number;
  deliveredEnergyKwh: number; // energy stored in the battery
  terminationReason: "targetReached" | "durationElapsed" | "batteryFull";
};
```

| Termination                    | `finalSocPercent`                             | `chargingTimeHours`       | `terminationReason` |
| ------------------------------ | --------------------------------------------- | ------------------------- | ------------------- |
| `targetSoc`, target > initial  | target                                        | Forward time              | `targetReached`     |
| `targetSoc`, target ≤ initial  | initial                                       | 0                         | `targetReached`     |
| `duration`, battery not full   | SoC reached (within 10⁻⁶ points, never above) | Duration in hours         | `durationElapsed`   |
| `duration`, battery full first | 100                                           | Time to full (< duration) | `batteryFull`       |

## Calculation functions

| Function                       | Module                                        | Returns                                                            |
| ------------------------------ | --------------------------------------------- | ------------------------------------------------------------------ |
| `energyDeltaForSocChange`      | `calculations/charging/energy`                | `CalculationResult<number /* kWh */, EnergyDeltaCalculationError>` |
| `timeForEnergyAtConstantPower` | `calculations/charging/time`                  | `CalculationResult<number /* h */, TimeCalculationError>`          |
| `constantPowerChargingTime`    | `calculations/charging/constantPowerCharging` | `CalculationResult<number /* h */, ChargingCalculationError>`      |
| `resolveEffectiveAcPower`      | `calculations/charging/acPower`               | `number /* kW */`, assumes valid input                             |
| `acChargingTime`               | `calculations/charging/acChargingTime`        | `CalculationResult<number /* h */, ChargingCalculationError>`      |
| `powerAtSoc`                   | `calculations/charging/dcCurve`               | `CalculationResult<number /* kW */, DcCurveError>`                 |
| `dcChargingTime`               | `calculations/charging/dcChargingTime`        | `CalculationResult<number /* h */, ChargingCalculationError>`      |

Inputs are single objects with named, unit-suffixed fields, for example:

```ts
dcChargingTime({
  batteryCapacityKwh,
  fromSocPercent,
  toSocPercent,
  vehicle,
  station,
});
acChargingTime({
  batteryCapacityKwh,
  fromSocPercent,
  toSocPercent,
  vehicle,
  station,
});
```

`acChargingTime` takes an `ACChargingCapability` and an `ACChargingStation`; `dcChargingTime`
takes a `DCChargingCapability` and a `DCChargingStation`. Both require `fromSocPercent ≤
toSocPercent`.

## Factories

[`@/domain/chargingFactories`](../../src/domain/chargingFactories.ts):
`createChargingCurvePoint`, `createChargingCurve`, `createACChargingCapability`,
`createACChargingStation`, `createDCChargingCapability`, `createDCChargingStation`. Rules and
errors are listed in the [domain model](domain-model.md#factories).

## Error catalogue

Calculation and session errors are defined in
[`src/calculations/charging/error.ts`](../../src/calculations/charging/error.ts).
`ChargingSessionError` is the union of all of them.

| `type`                   | Fields                                      | Raised when                                                                                                                                                           |
| ------------------------ | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `invalidBatteryCapacity` | `value`                                     | Capacity not finite or ≤ 0                                                                                                                                            |
| `invalidSoc`             | `field`, `value`                            | SoC not finite or outside [0, 100]. `field` is `fromSocPercent` or `toSocPercent` (in a session: initial and target SoC respectively); `socPercent` from `powerAtSoc` |
| `invalidSocRange`        | `message`, `fromSocPercent`, `toSocPercent` | Start SoC above end SoC in a forward function                                                                                                                         |
| `invalidPower`           | `value`                                     | A power limit, curve power or effective power not finite or ≤ 0                                                                                                       |
| `invalidEnergy`          | `value`                                     | Energy not finite or < 0 (`timeForEnergyAtConstantPower`)                                                                                                             |
| `invalidPhases`          | `value`                                     | AC vehicle or station phases not an integer in [1, 3]                                                                                                                 |
| `dcChargingNotSupported` | —                                           | DC station and `vehicle.dc` absent                                                                                                                                    |
| `invalidDuration`        | `value`                                     | Duration not finite or < 0                                                                                                                                            |

`simulateChargingSession` never calls a forward function with a decreasing range or with an
energy derived from invalid SoC values, so `invalidSocRange`, `invalidEnergy` and the
`socPercent` variant of `invalidSoc` are not produced by it in practice. They remain in the union
because it is composed from the lower-level error types.

### Check order in a session

1. Station/vehicle compatibility (`dcChargingNotSupported`), before any other input is checked.
2. Target SoC: capacity, initial SoC, target SoC; then the forward function's own checks.
   Duration: duration; then the forward function's own checks.
3. Forward functions: `acChargingTime` checks power limits and phases **before** capacity and
   SoC; `dcChargingTime` checks capacity and SoC, then the SoC order, then the power limits.

This only matters when several inputs are invalid at once.

## Examples

The values in the comments are the actual outputs of the current implementation.

### Build domain values and simulate an AC session

```ts
import {
  createACChargingCapability,
  createACChargingStation,
  createDCChargingCapability,
} from "@/domain/chargingFactories";
import { simulateChargingSession } from "@/calculations/charging/chargingSession";
import type { VehicleChargingSpec } from "@/domain/charging";

const ac = createACChargingCapability({ maxPowerKw: 11, phases: 3 });
const dc = createDCChargingCapability({
  maxPowerKw: 175,
  chargingCurve: [
    { socPercent: 0, powerKw: 175 },
    { socPercent: 50, powerKw: 120 },
    { socPercent: 80, powerKw: 60 },
    { socPercent: 100, powerKw: 15 },
  ],
});
const wallbox = createACChargingStation({ maxPowerKw: 22, phases: 3 });

if (!ac.ok || !dc.ok || !wallbox.ok) {
  // Report the factory error(s) to the user; do not simulate.
  throw new Error("Invalid charging data");
}

const vehicle: VehicleChargingSpec = {
  usableBatteryCapacityKwh: 77,
  ac: ac.value,
  dc: dc.value,
};

const result = simulateChargingSession({
  vehicle,
  station: wallbox.value,
  session: {
    initialSocPercent: 20,
    termination: { type: "targetSoc", targetSocPercent: 80 },
  },
});
// { ok: true, value: { finalSocPercent: 80, chargingTimeHours: ≈4.2,
//   deliveredEnergyKwh: ≈46.2, terminationReason: "targetReached", ... } }
```

### DC sessions: target SoC, duration and full battery

```ts
import { createDCChargingStation } from "@/domain/chargingFactories";

const hpc = createDCChargingStation({ maxPowerKw: 150 });
if (!hpc.ok) throw new Error("Invalid station");

simulateChargingSession({
  vehicle,
  station: hpc.value,
  session: {
    initialSocPercent: 10,
    termination: { type: "targetSoc", targetSocPercent: 80 },
  },
});
// chargingTimeHours ≈ 0.488 (≈29.3 min), deliveredEnergyKwh ≈ 53.9

simulateChargingSession({
  vehicle,
  station: hpc.value,
  session: {
    initialSocPercent: 10,
    termination: { type: "duration", durationMinutes: 20 },
  },
});
// finalSocPercent ≈ 65.12, chargingTimeHours = 1/3, terminationReason: "durationElapsed"

simulateChargingSession({
  vehicle,
  station: hpc.value,
  session: {
    initialSocPercent: 90,
    termination: { type: "duration", durationMinutes: 120 },
  },
});
// finalSocPercent = 100, chargingTimeHours ≈ 0.314, terminationReason: "batteryFull"
```

### Handling errors

```ts
import type { ChargingSessionError } from "@/calculations/charging/error";

function describeError(error: ChargingSessionError): string {
  switch (error.type) {
    case "dcChargingNotSupported":
      return "This vehicle cannot charge at DC stations.";
    case "invalidSoc":
      return `State of charge must be between 0 and 100 % (got ${error.value}).`;
    case "invalidDuration":
      return "Duration must be a non-negative number of minutes.";
    default:
      return `Invalid charging input: ${error.type}`;
  }
}

const outcome = simulateChargingSession({
  vehicle: { usableBatteryCapacityKwh: 77, ac: ac.value }, // no DC capability
  station: hpc.value,
  session: {
    initialSocPercent: 10,
    termination: { type: "duration", durationMinutes: 20 },
  },
});

if (!outcome.ok) {
  describeError(outcome.error); // "This vehicle cannot charge at DC stations."
}
```
