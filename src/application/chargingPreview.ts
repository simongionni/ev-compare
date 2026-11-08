import {
  dcPowerChartSeries,
  type DcPowerChartSeries,
  type DcPowerChartSeriesError,
} from "@/application/dcPowerChartSeries";
import {
  simulateChargingSession,
  type ChargingSessionSimulation,
} from "@/calculations/charging/chargingSession";
import type { ChargingSessionError } from "@/calculations/charging/error";
import type { CalculationResult } from "@/calculations/result";
import type { CatalogueVehicle } from "@/data/catalogue";
import type { DCChargingStationValidationError } from "@/domain/chargingErrors";
import { createDCChargingStation } from "@/domain/chargingFactories";

/**
 * Reference scenario of the Ricarica preview (M0.2 slice, Vehicle Analysis): DC charging from
 * 10 % to 80 % on a 150 kW station. The preview has no controls; it is not configurable.
 */
export const REFERENCE_DC_SCENARIO = {
  stationMaxPowerKw: 150,
  initialSocPercent: 10,
  targetSocPercent: 80,
} as const;

export type ChargingPreview =
  | {
      readonly kind: "available";
      /** M0.1 `simulateChargingSession` result, unrounded. */
      readonly simulation: ChargingSessionSimulation;
      readonly chart: DcPowerChartSeries;
    }
  | {
      /**
       * The catalogue does not document the data the engine needs (usable capacity, AC
       * capability, DC curve). Not an error: nothing is calculated and nothing is invented.
       */
      readonly kind: "missingChargingData";
    };

export type ChargingPreviewError =
  | { type: "invalidStation"; error: DCChargingStationValidationError }
  | { type: "simulation"; error: ChargingSessionError }
  | { type: "chart"; error: DcPowerChartSeriesError };

/**
 * The Ricarica preview of a vehicle: the reference scenario simulated by M0.1 and the series of
 * its power-by-SoC chart. Derived from the vehicle on every call; never stored.
 */
export function chargingPreview(
  vehicle: CatalogueVehicle,
): CalculationResult<ChargingPreview, ChargingPreviewError> {
  if (vehicle.charging.kind !== "complete") {
    return { ok: true, value: { kind: "missingChargingData" } };
  }

  const station = createDCChargingStation({
    maxPowerKw: REFERENCE_DC_SCENARIO.stationMaxPowerKw,
  });
  if (!station.ok) {
    return {
      ok: false,
      error: { type: "invalidStation", error: station.error },
    };
  }

  const { spec } = vehicle.charging;
  const { initialSocPercent, targetSocPercent } = REFERENCE_DC_SCENARIO;

  const simulation = simulateChargingSession({
    vehicle: spec,
    station: station.value,
    session: {
      initialSocPercent,
      termination: { type: "targetSoc", targetSocPercent },
    },
  });
  if (!simulation.ok) {
    return {
      ok: false,
      error: { type: "simulation", error: simulation.error },
    };
  }

  const chart = dcPowerChartSeries({
    vehicle: spec.dc,
    station: station.value,
    interval: {
      fromSocPercent: simulation.value.initialSocPercent,
      toSocPercent: simulation.value.finalSocPercent,
    },
  });
  if (!chart.ok) {
    return { ok: false, error: { type: "chart", error: chart.error } };
  }

  return {
    ok: true,
    value: {
      kind: "available",
      simulation: simulation.value,
      chart: chart.value,
    },
  };
}
