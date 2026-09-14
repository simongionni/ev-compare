import { describe, expect, it } from "vitest";
import { powerAtSoc } from "@/calculations/charging/dcCurve";
import { createChargingCurvePoint } from "@/domain/chargingFactories";

describe("powerAtSoc", () => {
  const rawCurve = [
    { socPercent: 0, powerKw: 200 },
    { socPercent: 20, powerKw: 150 },
    { socPercent: 40, powerKw: 110 },
    { socPercent: 80, powerKw: 50 },
  ];
  const curve = rawCurve.map((point) => {
    const result = createChargingCurvePoint(point);

    if (!result.ok) {
      throw new Error("Test setup produced an invalid charging curve point");
    }

    return result.value;
  });

  it("finds the containing interval and interpolates within it", () => {
    expect(powerAtSoc({ curve, socPercent: 30 })).toEqual({
      ok: true,
      value: 130,
    });
  });

  it("returns the first point power below the curve extremes", () => {
    expect(powerAtSoc({ curve, socPercent: -10 })).toEqual({
      ok: true,
      value: 200,
    });
  });

  it("returns the last point power above the curve extremes", () => {
    expect(powerAtSoc({ curve, socPercent: 90 })).toEqual({
      ok: true,
      value: 50,
    });
  });

  it("returns an error for a non-finite SoC", () => {
    expect(powerAtSoc({ curve, socPercent: Number.NaN })).toEqual({
      ok: false,
      error: {
        type: "invalidSoc",
        field: "socPercent",
        value: Number.NaN,
      },
    });
  });
});
