import { powerAtSoc } from "@/calculations/charging/dcCurve";
import { effectiveDcPowerAtSoc } from "@/calculations/charging/dcPower";
import type {
  DcCurveError,
  EffectiveDcPowerError,
} from "@/calculations/charging/error";
import type { CalculationResult } from "@/calculations/result";
import type {
  DCChargingCapability,
  DCChargingStation,
} from "@/domain/charging";

/** A power value at a state of charge. */
export type PowerAtSocSample = {
  readonly socPercent: number;
  readonly powerKw: number;
};

/** A state-of-charge interval, initial ≤ final. */
export type SocInterval = {
  readonly fromSocPercent: number;
  readonly toSocPercent: number;
};

/**
 * Everything the power-by-SoC chart draws, already computed. The chart only maps it to pixels
 * (ADR 0001 §3, Charts).
 */
export type DcPowerChartSeries = {
  /** The curve points of the catalogue (validated by the M0.1 factories), as declared. */
  readonly declaredPoints: readonly PowerAtSocSample[];
  /** The vehicle curve over 0–100 %: M0.1 `powerAtSoc` at each sampled SoC. */
  readonly vehicleCurve: readonly PowerAtSocSample[];
  /** The power actually received: M0.1 `effectiveDcPowerAtSoc` at each sampled SoC. */
  readonly effectivePower: readonly PowerAtSocSample[];
  /** The station's maximum power: an input of the scenario, drawn as the station limit. */
  readonly stationMaxPowerKw: number;
  /** The SoC interval of the scenario. */
  readonly interval: SocInterval;
};

export type DcPowerChartSeriesError = DcCurveError | EffectiveDcPowerError;

/**
 * Sampling step of the drawn series, in SoC points. It only sets how finely the engine's
 * functions are evaluated for drawing: the declared points are always sampled too, so the
 * vehicle curve is drawn exactly, and a 0.5-point step keeps the corners where the effective
 * power meets a limit well under a pixel at the chart's scale.
 */
export const CHART_SOC_STEP_PERCENT = 0.5;

/** SoC values at which the series are evaluated: a regular grid over 0–100 % plus the declared points. */
export function chartSocSamples(
  vehicle: DCChargingCapability,
): readonly number[] {
  const steps = Math.round(100 / CHART_SOC_STEP_PERCENT);
  const grid = Array.from(
    { length: steps + 1 },
    (_, index) => index * CHART_SOC_STEP_PERCENT,
  );
  const declared = vehicle.chargingCurve.map((point) => point.socPercent);
  return [...new Set([...grid, ...declared])].sort((a, b) => a - b);
}

/**
 * Prepares the power-by-SoC chart of a vehicle at a DC station. Every power comes from the M0.1
 * engine: this function only chooses where to evaluate it. The first engine error is returned.
 */
export function dcPowerChartSeries({
  vehicle,
  station,
  interval,
}: {
  vehicle: DCChargingCapability;
  station: DCChargingStation;
  interval: SocInterval;
}): CalculationResult<DcPowerChartSeries, DcPowerChartSeriesError> {
  const vehicleCurve: PowerAtSocSample[] = [];
  const effectivePower: PowerAtSocSample[] = [];

  for (const socPercent of chartSocSamples(vehicle)) {
    const curve = powerAtSoc({ curve: vehicle.chargingCurve, socPercent });
    if (!curve.ok) {
      return curve;
    }
    const effective = effectiveDcPowerAtSoc({ socPercent, vehicle, station });
    if (!effective.ok) {
      return effective;
    }
    vehicleCurve.push({ socPercent, powerKw: curve.value });
    effectivePower.push({ socPercent, powerKw: effective.value });
  }

  return {
    ok: true,
    value: {
      declaredPoints: vehicle.chargingCurve.map(({ socPercent, powerKw }) => ({
        socPercent,
        powerKw,
      })),
      vehicleCurve,
      effectivePower,
      stationMaxPowerKw: station.maxPowerKw,
      interval,
    },
  };
}
