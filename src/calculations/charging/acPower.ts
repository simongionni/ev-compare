import type {
  ACChargingCapability,
  ACChargingStation,
} from "@/domain/charging";

export type ResolveEffectiveAcPowerInput = {
  vehicle: ACChargingCapability;
  station: ACChargingStation;
};

/**
 * Resolves the effective AC charging power supported by both
 * the vehicle and the charging station.
 *
 * Assumes that the total available power is distributed uniformly
 * across the available phases.
 *
 * @returns Effective charging power in kW.
 */
export function resolveEffectiveAcPower({
  vehicle,
  station,
}: ResolveEffectiveAcPowerInput): number {
  const vehiclePowerPerPhase =
    vehicle.maxPowerKw / vehicle.phases;

  const stationPowerPerPhase =
    station.maxPowerKw / station.phases;

  const usablePhases =
    Math.min(vehicle.phases, station.phases);

  return (
    Math.min(vehiclePowerPerPhase, stationPowerPerPhase)
    * usablePhases
  );
}