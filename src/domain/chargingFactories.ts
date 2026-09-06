import type { CalculationResult } from "@/calculations/result";
import type {ACChargingCapability, RawACChargingCapability, ACChargingStation, RawACChargingStation} from "@/domain/charging";
import type {ACChargingCapabilityValidationError, ACChargingStationValidationError} from "@/domain/chargingErrors";

export function createACChargingCapability(
  raw: RawACChargingCapability,
): CalculationResult<
  ACChargingCapability,
  ACChargingCapabilityValidationError
> {
  if (raw.maxPowerKw <= 0) {
    return {
      ok: false,
      error: {
        type: "invalidMaxPower",
        value: raw.maxPowerKw,
      },
    };
  }

  if (raw.phases < 1 || raw.phases > 3) {
    return {
      ok: false,
      error: {
        type: "invalidPhases",
        value: raw.phases,
      },
    };
  }

  if (raw.maxCurrentA !== undefined && raw.maxCurrentA <= 0) { //condizione in più perche maxCurrentA è opzionale, quindi se non è definito non deve generare errore
    return {
      ok: false,
      error: {
        type: "invalidMaxCurrent",
        value: raw.maxCurrentA,
      },
    };
  }

  return {
    ok: true,
    value: {
      maxPowerKw: raw.maxPowerKw,
      phases: raw.phases,
      maxCurrentA: raw.maxCurrentA,
    },
  };
}

export function createACChargingStation(
  raw: RawACChargingStation,
): CalculationResult<ACChargingStation, ACChargingStationValidationError> {
    if (raw.maxPowerKw <= 0) {
        return {
            ok: false,
            error: {
                type: "invalidMaxPower",
                value: raw.maxPowerKw,
            },
        };
    }

    if (raw.phases < 1 || raw.phases > 3) {
        return {
            ok: false,
            error: {
                type: "invalidPhases",
                value: raw.phases,
            },
        };
    }

    return {
        ok: true,
        value: {
            type: "AC",
            maxPowerKw: raw.maxPowerKw,
            phases: raw.phases,
        },
    };
}