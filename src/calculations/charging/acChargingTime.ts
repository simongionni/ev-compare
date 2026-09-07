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
    return constantPowerChargingTime({
        batteryCapacityKwh,
        fromSocPercent,
        toSocPercent,
        powerKw: resolveEffectiveAcPower({ vehicle, station })
    });
}