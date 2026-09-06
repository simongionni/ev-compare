import type { CalculationResult } from "@/calculations/result";
import type { ChargingCalculationError } from "@/calculations/charging/error";

export type EnergyDeltaForSocChangeInput  = {
  batteryCapacityKwh: number;
  fromSocPercent: number;
  toSocPercent: number;
};
/**
 * Calculates the energy delta required for a change in SoC.
 * @param input - An object containing the battery capacity in kWh and the initial and final SoC percentages.
 * @returns The energy delta in kWh, or an error if the input is invalid.
 */

export function energyDeltaForSocChange({
  batteryCapacityKwh,
  fromSocPercent,
  toSocPercent,
}: EnergyDeltaForSocChangeInput): CalculationResult<number,ChargingCalculationError> {
  if (batteryCapacityKwh <= 0) {
    return {
      ok: false,
      error: {
        type: "invalidBatteryCapacity",
        value: batteryCapacityKwh
      }
    };
  }

  if (fromSocPercent < 0 || fromSocPercent > 100) {
    return {
      ok: false,
      error: {
        type: "invalidSoc",
        field: "fromSocPercent",
        value: fromSocPercent
      }
    };
  }

  if (toSocPercent < 0 || toSocPercent > 100) {
    return {
      ok: false,
      error: {
        type: "invalidSoc",
        field: "toSocPercent",
        value: toSocPercent
      }
    };
  }

  return {
    ok: true,
    value: (toSocPercent - fromSocPercent) * 0.01 * batteryCapacityKwh
  };
}