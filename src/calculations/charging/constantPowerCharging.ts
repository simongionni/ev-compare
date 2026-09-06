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

export function constantPowerChargingTime({
    batteryCapacityKwh,
    fromSocPercent,
    toSocPercent,
    powerKw,
} : ConstantPowerChargingTimeInput): CalculationResult<number, ChargingCalculationError> {
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

    if (fromSocPercent >= toSocPercent) {
        return {
            ok: false,
            error: {
                type: "invalidSocRange",
                message: "The starting SoC percentage must be less than the ending SoC percentage.",
                fromSocPercent: fromSocPercent,
                toSocPercent: toSocPercent
            }
        };
    }
    if (powerKw <= 0) {
        return {
            ok: false,
            error: {
                type: "invalidPower",
                value: powerKw
            }
        };
    }
    const energyDeltaKwh = energyDeltaForSocChange({
        batteryCapacityKwh,
        fromSocPercent: fromSocPercent,
        toSocPercent: toSocPercent
    });
    return timeForEnergyAtConstantPower({
        energyKwh: energyDeltaKwh.ok ? energyDeltaKwh.value : 0,
        powerKw
    });
}