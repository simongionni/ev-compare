import type { CalculationResult } from "@/calculations/result";
import type { ChargingCalculationError } from "@/calculations/charging/errors";

export type EnergyDeltaForSocChangeInput  = {
  batteryCapacityKwh: number;
  fromSocPercent: number;
  toSocPercent: number;
};

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