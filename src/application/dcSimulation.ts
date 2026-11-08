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

/** The conditions of a DC charging session ending at a target SoC. */
export type DcChargingConditions = {
  readonly stationMaxPowerKw: number;
  readonly initialSocPercent: number;
  readonly targetSocPercent: number;
};

export type DcSimulation =
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

export type DcSimulationError =
  | { type: "invalidStation"; error: DCChargingStationValidationError }
  | { type: "simulation"; error: ChargingSessionError }
  | { type: "chart"; error: DcPowerChartSeriesError };

/**
 * A vehicle's DC charging under the given conditions: the M0.1 session simulation (DC station,
 * target-SoC termination) and the series of its power-by-SoC chart. Derived on every call; never
 * stored. Every value comes from the engine; the conditions are passed to it unchanged, so its
 * own validation applies.
 */
export function simulateDcCharging(
  vehicle: CatalogueVehicle,
  conditions: DcChargingConditions,
): CalculationResult<DcSimulation, DcSimulationError> {
  if (vehicle.charging.kind !== "complete") {
    return { ok: true, value: { kind: "missingChargingData" } };
  }

  const station = createDCChargingStation({
    maxPowerKw: conditions.stationMaxPowerKw,
  });
  if (!station.ok) {
    return {
      ok: false,
      error: { type: "invalidStation", error: station.error },
    };
  }

  const { spec } = vehicle.charging;

  const simulation = simulateChargingSession({
    vehicle: spec,
    station: station.value,
    session: {
      initialSocPercent: conditions.initialSocPercent,
      termination: {
        type: "targetSoc",
        targetSocPercent: conditions.targetSocPercent,
      },
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
