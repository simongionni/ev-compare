import type {ACChargingCapability, ACChargingStation, RawACChargingCapability, RawACChargingStation} from "@/domain/charging";
import type {CalculationResult} from "@/calculations/result";
import type {ChargingCalculationError} from "@/calculations/charging/error";
import type {ChargingFactoryError} from "@/domain/chargingErrors";
import {timeForEnergyAtConstantPower} from "@/calculations/charging/time";
import {energyDeltaForSocChange} from "@/calculations/charging/energy";
import { createACChargingCapability, createACChargingStation } from "@/domain/chargingFactories";


export type ResolveEffectiveChargingPowerInput = {
    rawVehicleChargingSpec: RawACChargingCapability;
    rawChargingStation: RawACChargingStation;
};

export function resolveEffectiveChargingPower(
    {
        rawVehicleChargingSpec, 
        rawChargingStation
    }: ResolveEffectiveChargingPowerInput) : CalculationResult<number, ChargingCalculationError | ChargingFactoryError> {
        const vehicleChargingSpecResult : CalculationResult<ACChargingCapability, ChargingFactoryError> = createACChargingCapability(rawVehicleChargingSpec);
        const chargingStationResult : CalculationResult<ACChargingStation, ChargingFactoryError> = createACChargingStation(rawChargingStation);
        if (!vehicleChargingSpecResult.ok) {
            return {
                ok: false,
                error: vehicleChargingSpecResult.error
            };
        }
        if (!chargingStationResult.ok) {
            return {
                ok: false,
                error: chargingStationResult.error
            };
        }
        const vehicleChargingSpec : ACChargingCapability = vehicleChargingSpecResult.value;
        const chargingStation : ACChargingStation = chargingStationResult.value;
        const effectivePowerKw = Math.min(vehicleChargingSpec.maxPowerKw/vehicleChargingSpec.phases, chargingStation.maxPowerKw/chargingStation.phases) * Math.min(vehicleChargingSpec.phases, chargingStation.phases);
        return {
            ok: true,
            value: effectivePowerKw
        };
}