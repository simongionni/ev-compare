import { describe, expect, it } from "vitest";
import { powerAtSoc } from "@/calculations/charging/dcCurve";
import { createChargingCurvePoint } from "@/domain/chargingFactories";

describe("powerAtSoc", () => {
  const startingPoint = createChargingCurvePoint({
    socPercent: 20,
    powerKw: 150,
  });
  const finalPoint = createChargingCurvePoint({
    socPercent: 80,
    powerKw: 50,
  });

  if (!startingPoint.ok || !finalPoint.ok) {
    throw new Error("Test setup produced invalid charging curve points");
  }

  const curve = [startingPoint.value, finalPoint.value];

  it("interpolates power between factory-created curve points", () => {
    expect(powerAtSoc({ curve, socPercent: 50 })).toEqual({
      ok: true,
      value: 100,
    });
  });

  it("returns an error when SoC is outside the curve", () => {
    expect(powerAtSoc({ curve, socPercent: 90 })).toEqual({
      ok: false,
      error: { type: "invalidSoc", field: "socPercent", value: 90 },
    });
  });
});
