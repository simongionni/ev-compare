# Charging domain model

Source: [`src/domain/charging.ts`](../../src/domain/charging.ts),
[`chargingFactories.ts`](../../src/domain/chargingFactories.ts),
[`chargingErrors.ts`](../../src/domain/chargingErrors.ts).

## Units and conventions

| Quantity        | Unit               | Name suffix | Notes                                              |
| --------------- | ------------------ | ----------- | -------------------------------------------------- |
| Energy          | kWh                | `Kwh`       | Battery capacity, delivered energy                 |
| Power           | kW                 | `Kw`        | Limits, curve power, effective power               |
| State of charge | percent, 0–100     | `Percent`   | Percent of **usable** battery capacity             |
| Time (results)  | hours              | `Hours`     | Every calculated time                              |
| Time (input)    | minutes            | `Minutes`   | Only the duration termination condition            |
| Current         | A                  | `A`         | `maxCurrentA`; validated, not used in calculations |
| Phases          | count, integer 1–3 | —           | AC only                                            |

Units are encoded in property names rather than in types; all values are plain `number`s.
SoC is a percentage (0–100), never a fraction (0–1).

## Types

### Charging curve

```ts
type ChargingCurvePoint = { socPercent: number; powerKw: number };
type ChargingCurve = [
  ChargingCurvePoint,
  ChargingCurvePoint,
  ...ChargingCurvePoint[],
];
```

A DC charging curve is the power the vehicle accepts as a function of SoC, given as points
joined by straight lines. The tuple type requires at least two points at compile time; the
factory additionally guarantees strictly increasing SoC values. The curve does not have to span
0–100%: outside its SoC range the nearest endpoint power applies (see
[interpolation](calculation-model.md#dc-charging-curve-interpolation)).

### Vehicle

```ts
type ACChargingCapability = {
  maxPowerKw: number;
  phases: number;
  maxCurrentA?: number;
};
type DCChargingCapability = {
  maxPowerKw: number;
  chargingCurve: ChargingCurve;
};

type VehicleChargingSpec = {
  usableBatteryCapacityKwh: number;
  ac: ACChargingCapability;
  dc?: DCChargingCapability;
};
```

- `usableBatteryCapacityKwh` is the energy between 0% and 100% SoC.
- `ac` is mandatory: every vehicle is assumed to support AC charging.
- `dc` is optional. Its absence is a valid vehicle that cannot use DC stations.
- `DCChargingCapability.maxPowerKw` caps the curve: points above it are allowed and cut to the
  maximum during calculation.

### Station

```ts
type ACChargingStation = { type: "AC"; maxPowerKw: number; phases: number };
type DCChargingStation = { type: "DC"; maxPowerKw: number };
type ChargingStation = ACChargingStation | DCChargingStation;
```

`type` is the discriminant that selects AC or DC charging in a session.

### Session

```ts
type TerminationCondition =
  | { type: "targetSoc"; targetSocPercent: number }
  | { type: "duration"; durationMinutes: number };

type ChargingSession = {
  initialSocPercent: number;
  termination: TerminationCondition;
};
```

## Raw vs validated types

Raw types describe values as they arrive from outside the domain (user input, data files):

| Raw type                  | Validated type         | Difference                             |
| ------------------------- | ---------------------- | -------------------------------------- |
| `RawChargingCurvePoint`   | `ChargingCurvePoint`   | Same shape (alias)                     |
| `RawChargingCurve`        | `ChargingCurve`        | Array vs tuple of at least two points  |
| `RawACChargingCapability` | `ACChargingCapability` | Same shape                             |
| `RawDCChargingCapability` | `DCChargingCapability` | Raw curve vs validated `ChargingCurve` |
| `RawACChargingStation`    | `ACChargingStation`    | Validated adds `type: "AC"`            |
| `RawDCChargingStation`    | `DCChargingStation`    | Validated adds `type: "DC"`            |

`VehicleChargingSpec`, `ChargingSession` and `TerminationCondition` have no raw counterpart and
no factory.

The validated types are **not branded**. Apart from the curve tuple, a validated type is
structurally identical to (or a superset of) its raw type, so the compiler cannot tell whether a
value went through a factory. The distinction is a convention, which is why public calculation
functions re-validate the numbers they depend on.

## Factories

All factories take a raw value and return
`CalculationResult<ValidatedType, ValidationError>`. They:

- check fields in a fixed order and return the **first** failure (errors are not aggregated);
- return the offending value in the error;
- build new objects and never mutate or keep their input. A validated curve is a new array of
  new point objects.

### `createChargingCurvePoint(raw)`

| Check (in order)                    | Error                             |
| ----------------------------------- | --------------------------------- |
| `socPercent` finite and in [0, 100] | `{ type: "invalidSoc", value }`   |
| `powerKw` finite and > 0            | `{ type: "invalidPower", value }` |

### `createChargingCurve(raw)`

| Check (in order)                           | Error                                                           |
| ------------------------------------------ | --------------------------------------------------------------- |
| At least two points                        | `{ type: "notEnoughPoints", value: length }`                    |
| For each point, in order: point validation | The point error unchanged (no index)                            |
| SoC not already seen                       | `{ type: "duplicateSoc", index, value }`                        |
| SoC not lower than the previous point's    | `{ type: "invalidSocOrder", index, previousSocPercent, value }` |

The result has strictly increasing SoC values. Because duplicate SoC values are rejected, a
vertical step in power cannot be represented exactly; use two points a small SoC distance apart.

### `createACChargingCapability(raw)` and `createACChargingStation(raw)`

| Check (in order)                                            | Error                                  |
| ----------------------------------------------------------- | -------------------------------------- |
| `maxPowerKw` finite and > 0                                 | `{ type: "invalidMaxPower", value }`   |
| `phases` integer in [1, 3]                                  | `{ type: "invalidPhases", value }`     |
| `maxCurrentA`, if present, finite and > 0 (capability only) | `{ type: "invalidMaxCurrent", value }` |

The station factory adds `type: "AC"`.

### `createDCChargingCapability(raw)` and `createDCChargingStation(raw)`

| Check (in order)                       | Error                                         |
| -------------------------------------- | --------------------------------------------- |
| `maxPowerKw` finite and > 0            | `{ type: "invalidMaxPower", value }`          |
| Charging curve valid (capability only) | Any `ChargingCurveValidationError`, unchanged |

The capability factory delegates the curve to `createChargingCurve` and passes its errors through
without wrapping, in the same way `createChargingCurve` passes through point errors. The name
`invalidMaxPower` (the capability limit) is distinct from `invalidPower` (a curve point). The
station factory adds `type: "DC"`.

### Error types

Defined in [`chargingErrors.ts`](../../src/domain/chargingErrors.ts):
`ChargingCurvePointValidationError`, `ChargingCurveValidationError`,
`ACChargingCapabilityValidationError`, `ACChargingStationValidationError`,
`DCChargingCapabilityValidationError`, `DCChargingStationValidationError`, and the union
`ChargingFactoryError`.

## Factory-level vs calculation-level validation

Factories establish invariants for data entering the domain. Public calculation functions
validate the inputs that would otherwise produce `NaN`, `Infinity` or plausible but wrong
results, because the domain types are not branded and the calculations also take plain numbers
(battery capacity, SoC) that have no factory.

| Invariant                                          | Checked by factory        | Checked by calculation                                                                                     |
| -------------------------------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Battery capacity finite and > 0                    | — (no vehicle factory)    | `energyDeltaForSocChange`                                                                                  |
| SoC finite and in [0, 100]                         | Curve points only         | `energyDeltaForSocChange` (session and forward functions)                                                  |
| Start SoC ≤ end SoC                                | —                         | `constantPowerChargingTime`, `dcChargingTime`                                                              |
| AC power limits finite and > 0                     | AC capability and station | `acChargingTime` (each limit individually)                                                                 |
| AC phases integer in [1, 3]                        | AC capability and station | `acChargingTime`                                                                                           |
| DC power limits finite and > 0                     | DC capability and station | `dcChargingTime` (each limit individually)                                                                 |
| Curve has ≥ 2 points, increasing SoC, valid points | `createChargingCurve`     | Not re-checked; a non-finite or non-positive curve power is still caught by `timeForEnergyAtConstantPower` |
| `maxCurrentA` finite and > 0                       | AC capability             | Not used                                                                                                   |
| Duration finite and ≥ 0                            | —                         | `simulateChargingSession`                                                                                  |
| DC station requires a DC-capable vehicle           | —                         | `simulateChargingSession`                                                                                  |

The error vocabularies differ between the layers: factories report `invalidMaxPower`, while
calculations report `invalidPower` for the same limit. Callers that both build domain values and
run calculations must handle both (see
[open questions](limitations.md#open-questions-and-technical-debt)).
