import type { ChargingCurvePoint } from "@/domain/charging";
import type { CalculationResult } from "@/calculations/result";
import type { DcCurveError } from "@/calculations/charging/error";

export type PowerAtSocInput = {
  curve: ChargingCurvePoint[];
  socPercent: number;
};

export function powerAtSoc({
  curve,
  socPercent,
}: PowerAtSocInput): CalculationResult<number, DcCurveError> {
  const startingSoc = curve[0].socPercent;
  const finalSoc = curve[1].socPercent;

  const startingPower = curve[0].powerKw;
  const finalPower = curve[1].powerKw;

  if (
    socPercent < startingSoc ||
    socPercent > finalSoc ||
    !Number.isFinite(socPercent)
  ) {
    return {
      ok: false,
      error: {
        type: "invalidSoc",
        field: "socPercent",
        value: socPercent,
      },
    };
  }

  return {
    ok: true,
    value:
      startingPower +
      ((finalPower - startingPower) / (finalSoc - startingSoc)) *
        (socPercent - startingSoc),
  };
}
