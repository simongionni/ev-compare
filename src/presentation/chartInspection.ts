import type { DcPowerChartSeries } from "@/application/dcPowerChartSeries";
import { formatPowerKw, formatSocPercent } from "@/presentation/format";

/**
 * Inspection of the power-by-SoC chart (M0.2 acceptance 6.5, 11.1, 11.3): which SoC is inspected
 * and what the chart shows there. Pure, so it is testable without a UI test library (ADR 0001
 * open question 8). Powers are read from the series the engine produced; nothing is computed.
 */

/** Inspected SoC values are whole percentages, like the scenario's SoC controls. */
export const INSPECTION_STEP_PERCENT = 1;
export const INSPECTION_LARGE_STEP_PERCENT = 10;

export type InspectedPoint = {
  readonly socPercent: number;
  readonly vehicleCurveKw: number;
  readonly receivedKw: number;
};

const clampSoc = (value: number) => Math.min(100, Math.max(0, value));

/** The whole-percent SoC nearest to a position along the SoC axis, given as a fraction 0–1. */
export function inspectedSocAt(fraction: number): number {
  return clampSoc(
    Math.round((fraction * 100) / INSPECTION_STEP_PERCENT) *
      INSPECTION_STEP_PERCENT,
  );
}

/**
 * The SoC a key moves the inspection to, as for a slider: arrows by 1 % (10 % with Shift),
 * Page Up/Down by 10 %, Home and End to the ends. `undefined` for any other key.
 */
export function inspectionKeyTarget(
  key: string,
  currentSocPercent: number,
  shiftKey: boolean,
): number | undefined {
  const step = shiftKey
    ? INSPECTION_LARGE_STEP_PERCENT
    : INSPECTION_STEP_PERCENT;
  switch (key) {
    case "ArrowRight":
    case "ArrowUp":
      return clampSoc(currentSocPercent + step);
    case "ArrowLeft":
    case "ArrowDown":
      return clampSoc(currentSocPercent - step);
    case "PageUp":
      return clampSoc(currentSocPercent + INSPECTION_LARGE_STEP_PERCENT);
    case "PageDown":
      return clampSoc(currentSocPercent - INSPECTION_LARGE_STEP_PERCENT);
    case "Home":
      return 0;
    case "End":
      return 100;
    default:
      return undefined;
  }
}

/** The vehicle curve and the power received at a SoC, as drawn; `undefined` if not sampled. */
export function inspectedPoint(
  series: DcPowerChartSeries,
  socPercent: number,
): InspectedPoint | undefined {
  const curve = series.vehicleCurve.find((s) => s.socPercent === socPercent);
  const received = series.effectivePower.find(
    (s) => s.socPercent === socPercent,
  );
  return curve === undefined || received === undefined
    ? undefined
    : {
        socPercent,
        vehicleCurveKw: curve.powerKw,
        receivedKw: received.powerKw,
      };
}

/** Text equivalent of an inspected point: "55%: potenza ricevuta 150 kW, curva del veicolo 175 kW". */
export function describeInspectedPoint(point: InspectedPoint): string {
  return `${formatSocPercent(point.socPercent)}: potenza ricevuta ${formatPowerKw(point.receivedKw)}, curva del veicolo ${formatPowerKw(point.vehicleCurveKw)}`;
}
