import type { CalculationResult } from "@/calculations/result";
import type { ChargingCalculationError } from "@/calculations/charging/error";
import { energyDeltaForSocChange } from "@/calculations/charging/energy";
import { timeForEnergyAtConstantPower } from "@/calculations/charging/time";

export type ConstantPowerChargingTimeInput = {
  batteryCapacityKwh: number;
  fromSocPercent: number;
  toSocPercent: number;
  powerKw: number;
};

/**
 * Calculates the time required to charge a battery from one SoC percentage to another at a constant power.
 * @param input - An object containing the battery capacity in kWh, the initial and final SoC percentages, and the charging power in kW.
 * @returns The time required in hours, or an error if the input is invalid.
 */

export function constantPowerChargingTime({
    batteryCapacityKwh,
    fromSocPercent,
    toSocPercent,
    powerKw,
} : ConstantPowerChargingTimeInput): CalculationResult<number, ChargingCalculationError> {

    // Validated before the range check, so an out-of-range SoC is reported as such.
    const energyDeltaKwh = energyDeltaForSocChange({
        batteryCapacityKwh,
        fromSocPercent: fromSocPercent,
        toSocPercent: toSocPercent
    });
    if (!energyDeltaKwh.ok) {
        return {
            ok: false,
            error: energyDeltaKwh.error
        };
    }
    if (fromSocPercent > toSocPercent) {
        return {
            ok: false,
            error: {
                type: "invalidSocRange",
                message: "The starting SoC percentage must not be greater than the ending SoC percentage.",
                fromSocPercent: fromSocPercent,
                toSocPercent: toSocPercent
            }
        };
    }
    return timeForEnergyAtConstantPower({
        energyKwh:  energyDeltaKwh.value,
        powerKw
    });
}