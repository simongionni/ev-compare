import type {
  DCChargingCapability,
  DCChargingStation,
} from "@/domain/charging";
import type { CalculationResult } from "@/calculations/result";
import type { ChargingCalculationError } from "@/calculations/charging/error";
import { energyDeltaForSocChange } from "@/calculations/charging/energy";
import { powerAtSoc } from "@/calculations/charging/dcCurve";
import { timeForEnergyAtConstantPower } from "@/calculations/charging/time";

/**
 * Maximum width of a single integration step, in SoC percentage points.
 */
const MAX_SOC_STEP_PERCENT = 0.1;

export type DCChargingTimeInput = {
  batteryCapacityKwh: number;
  fromSocPercent: number;
  toSocPercent: number;
  vehicle: DCChargingCapability;
  station: DCChargingStation;
};

/**
 * Calculates the time required to DC charge a battery from one SoC percentage to another,
 * following the vehicle's charging curve capped by the vehicle and station maximum power.
 *
 * Numerical strategy: the SoC interval is split into equal steps no wider than
 * MAX_SOC_STEP_PERCENT, and each step is charged at the (capped) curve power at its midpoint
 * (midpoint rule on dt = dE / P(SoC)).
 *
 * Assumptions and limitations:
 * - Power is the linear interpolation of the curve (see powerAtSoc); outside the curve's SoC
 *   range the nearest endpoint power is held constant.
 * - Charging losses, temperature and battery ageing are not modelled; the curve power is assumed
 *   to be the power stored in the battery.
 * - Constant-power stretches are integrated exactly. On sloped stretches the midpoint rule
 *   slightly underestimates the time; with 0.1 percentage-point steps the error is far below
 *   one second for realistic curves.
 *
 * @param input - An object containing the battery capacity in kWh, the initial and final SoC percentages,
 * the vehicle DC capability and the DC charging station.
 * @returns The time required in hours, or an error if the input is invalid.
 */
export function dcChargingTime({
  batteryCapacityKwh,
  fromSocPercent,
  toSocPercent,
  vehicle,
  station,
}: DCChargingTimeInput): CalculationResult<number, ChargingCalculationError> {
  // Validated before the range check, so an out-of-range SoC is reported as such.
  const energyDeltaKwh = energyDeltaForSocChange({
    batteryCapacityKwh,
    fromSocPercent,
    toSocPercent,
  });

  if (!energyDeltaKwh.ok) {
    return energyDeltaKwh;
  }

  if (fromSocPercent > toSocPercent) {
    return {
      ok: false,
      error: {
        type: "invalidSocRange",
        message:
          "The starting SoC percentage must not be greater than the ending SoC percentage.",
        fromSocPercent,
        toSocPercent,
      },
    };
  }

  // Each limit is validated on its own: Math.min would hide an invalid limit, such as Infinity,
  // behind the other one.
  for (const limitKw of [vehicle.maxPowerKw, station.maxPowerKw]) {
    if (!Number.isFinite(limitKw) || limitKw <= 0) {
      return {
        ok: false,
        error: {
          type: "invalidPower",
          value: limitKw,
        },
      };
    }
  }

  const maxPowerKw = Math.min(vehicle.maxPowerKw, station.maxPowerKw);

  const socSpanPercent = toSocPercent - fromSocPercent;
  const stepCount = Math.ceil(socSpanPercent / MAX_SOC_STEP_PERCENT);
  const stepSocPercent = socSpanPercent / stepCount;
  const stepEnergyKwh = energyDeltaKwh.value / stepCount;

  let totalHours = 0;

  for (let step = 0; step < stepCount; step++) {
    const curvePowerKw = powerAtSoc({
      curve: vehicle.chargingCurve,
      socPercent: fromSocPercent + (step + 0.5) * stepSocPercent,
    });

    if (!curvePowerKw.ok) {
      return curvePowerKw;
    }

    const stepHours = timeForEnergyAtConstantPower({
      energyKwh: stepEnergyKwh,
      powerKw: Math.min(curvePowerKw.value, maxPowerKw),
    });

    if (!stepHours.ok) {
      return stepHours;
    }

    totalHours += stepHours.value;
  }

  return { ok: true, value: totalHours };
}
