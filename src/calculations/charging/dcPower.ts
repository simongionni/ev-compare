import type {
  DCChargingCapability,
  DCChargingStation,
} from "@/domain/charging";
import type { CalculationResult } from "@/calculations/result";
import type { EffectiveDcPowerError } from "@/calculations/charging/error";
import { powerAtSoc } from "@/calculations/charging/dcCurve";

export type EffectiveDcPowerAtSocInput = {
  socPercent: number;
  vehicle: DCChargingCapability;
  station: DCChargingStation;
};

/**
 * Returns the DC power available to the battery at a given SoC, after applying the vehicle and
 * station maximum-power limits to the vehicle charging curve.
 */
export function effectiveDcPowerAtSoc({
  socPercent,
  vehicle,
  station,
}: EffectiveDcPowerAtSocInput): CalculationResult<
  number,
  EffectiveDcPowerError
> {
  // Validate each limit independently: Math.min would otherwise hide an invalid limit behind a
  // valid one. Vehicle precedes station, matching dcChargingTime's established check order.
  for (const limitKw of [vehicle.maxPowerKw, station.maxPowerKw]) {
    if (!Number.isFinite(limitKw) || limitKw <= 0) {
      return {
        ok: false,
        error: { type: "invalidPower", value: limitKw },
      };
    }
  }

  if (!Number.isFinite(socPercent) || socPercent < 0 || socPercent > 100) {
    return {
      ok: false,
      error: { type: "invalidSoc", field: "socPercent", value: socPercent },
    };
  }

  const curvePowerKw = powerAtSoc({
    curve: vehicle.chargingCurve,
    socPercent,
  });

  if (!curvePowerKw.ok) {
    return curvePowerKw;
  }

  const effectivePowerKw = Math.min(
    curvePowerKw.value,
    vehicle.maxPowerKw,
    station.maxPowerKw,
  );

  if (!Number.isFinite(effectivePowerKw) || effectivePowerKw <= 0) {
    return {
      ok: false,
      error: { type: "invalidPower", value: effectivePowerKw },
    };
  }

  return { ok: true, value: effectivePowerKw };
}
