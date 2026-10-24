import {ACChargingCapability, ACChargingStation} from "@/domain/charging";
import {resolveEffectiveAcPower} from "@/calculations/charging/acPower";
import {constantPowerChargingTime} from "@/calculations/charging/constantPowerCharging";
import type {CalculationResult} from "@/calculations/result";
import type {ChargingCalculationError} from "@/calculations/charging/error";

type ACChargingTimeInput = {
    batteryCapacityKwh: number;
    fromSocPercent: number;
    toSocPercent: number;
    vehicle: ACChargingCapability;
    station: ACChargingStation;
};

export function acChargingTime({
    batteryCapacityKwh,
    fromSocPercent,
    toSocPercent,
    vehicle,
    station
}: ACChargingTimeInput): CalculationResult<number, ChargingCalculationError> {
    // Vehicle and station limits are validated individually before resolveEffectiveAcPower
    // combines them: Math.min would hide an invalid limit, such as Infinity, behind the other one.
    for (const maxPowerKw of [vehicle.maxPowerKw, station.maxPowerKw]) {
        if (maxPowerKw <= 0 || !Number.isFinite(maxPowerKw)) {
            return { ok: false, error: { type: "invalidPower", value: maxPowerKw } };
        }
    }

    for (const phases of [vehicle.phases, station.phases]) {
        if (phases < 1 || phases > 3 || !Number.isInteger(phases)) {
            return { ok: false, error: { type: "invalidPhases", value: phases } };
        }
    }

    return constantPowerChargingTime({
        batteryCapacityKwh,
        fromSocPercent,
        toSocPercent,
        powerKw: resolveEffectiveAcPower({ vehicle, station })
    });
}
