import type { CalculationResult } from "@/calculations/result";
import type { TimeCalculationError } from "@/calculations/charging/error";

export type TimeForEnergyAtConstantPowerInput = {
  energyKwh: number;
  powerKw: number;
};

/**
 * Calculates the time required to deliver a certain amount of energy at a constant power in hours.
 * @param input - An object containing the energy in kWh and the power in kW. 
 * @returns The time required in hours, or an error if the input is invalid.
 */

export function timeForEnergyAtConstantPower({
  energyKwh,
  powerKw,
}: TimeForEnergyAtConstantPowerInput) : CalculationResult<number, TimeCalculationError> {
    if (powerKw <= 0) {
        return {
            ok: false,
            error: {
                type: "invalidPower",
            value: powerKw
            }
            
        };
    }
    if (energyKwh < 0) {
        return {
            ok: false,
            error: {
                type: "invalidEnergy",
                value: energyKwh
            }
        };
    }
    return {
        ok: true,
        value: energyKwh / powerKw
    };
}