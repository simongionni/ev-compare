import {
  simulateDcCharging,
  type DcSimulation,
  type DcSimulationError,
} from "@/application/dcSimulation";
import type { CalculationResult } from "@/calculations/result";
import type { CatalogueVehicle } from "@/data/catalogue";

/**
 * Reference scenario of the Ricarica preview (M0.2 slice, Vehicle Analysis): DC charging from
 * 10 % to 80 % on a 150 kW station. The preview has no controls; it is not configurable.
 */
export const REFERENCE_DC_SCENARIO = {
  stationMaxPowerKw: 150,
  initialSocPercent: 10,
  targetSocPercent: 80,
} as const;

export type ChargingPreview = DcSimulation;

export type ChargingPreviewError = DcSimulationError;

/**
 * The Ricarica preview of a vehicle: the reference scenario simulated by M0.1 and the series of
 * its power-by-SoC chart. Derived from the vehicle on every call; never stored.
 */
export function chargingPreview(
  vehicle: CatalogueVehicle,
): CalculationResult<ChargingPreview, ChargingPreviewError> {
  return simulateDcCharging(vehicle, REFERENCE_DC_SCENARIO);
}
