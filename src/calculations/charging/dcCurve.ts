import type { ChargingCurve } from "@/domain/charging";
import type { CalculationResult } from "@/calculations/result";
import type { DcCurveError } from "@/calculations/charging/error";

export type PowerAtSocInput = {
  curve: ChargingCurve;
  socPercent: number;
};

export function powerAtSoc({
  curve,
  socPercent,
}: PowerAtSocInput): CalculationResult<number, DcCurveError> {
  if (!Number.isFinite(socPercent)) {
    return {
      ok: false,
      error: {
        type: "invalidSoc",
        field: "socPercent",
        value: socPercent,
      },
    };
  }

  const firstPoint = curve[0];
  const lastPoint = curve[curve.length - 1];

  if (socPercent <= firstPoint.socPercent) {
    return { ok: true, value: firstPoint.powerKw };
  }

  if (socPercent >= lastPoint.socPercent) {
    return { ok: true, value: lastPoint.powerKw };
  }

  const finalPointIndex = curve.findIndex(
    (point) => point.socPercent >= socPercent,
  );
  const startingPoint = curve[finalPointIndex - 1];
  const finalPoint = curve[finalPointIndex];

  return {
    ok: true,
    value:
      startingPoint.powerKw +
      ((finalPoint.powerKw - startingPoint.powerKw) /
        (finalPoint.socPercent - startingPoint.socPercent)) *
        (socPercent - startingPoint.socPercent),
  };
}
