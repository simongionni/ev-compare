import { describe, expect, it } from "vitest";
import { effectiveDcPowerAtSoc } from "@/calculations/charging/dcPower";
import {
  createDCChargingCapability,
  createDCChargingStation,
} from "@/domain/chargingFactories";
import type {
  DCChargingCapability,
  DCChargingStation,
} from "@/domain/charging";

function dcCapability(maxPowerKw = 250): DCChargingCapability {
  const result = createDCChargingCapability({
    maxPowerKw,
    chargingCurve: [
      { socPercent: 10, powerKw: 200 },
      { socPercent: 50, powerKw: 120 },
      { socPercent: 80, powerKw: 60 },
    ],
  });

  if (!result.ok) {
    throw new Error("Test setup produced an invalid DC capability");
  }

  return result.value;
}

function dcStation(maxPowerKw = 350): DCChargingStation {
  const result = createDCChargingStation({ maxPowerKw });

  if (!result.ok) {
    throw new Error("Test setup produced an invalid DC station");
  }

  return result.value;
}

describe("effectiveDcPowerAtSoc", () => {
  it("returns the curve power when both maximums are higher", () => {
    expect(
      effectiveDcPowerAtSoc({
        socPercent: 50,
        vehicle: dcCapability(),
        station: dcStation(),
      }),
    ).toEqual({ ok: true, value: 120 });
  });

  it("caps the curve power at the vehicle maximum", () => {
    expect(
      effectiveDcPowerAtSoc({
        socPercent: 10,
        vehicle: dcCapability(150),
        station: dcStation(),
      }),
    ).toEqual({ ok: true, value: 150 });
  });

  it("caps the curve power at the station maximum", () => {
    expect(
      effectiveDcPowerAtSoc({
        socPercent: 10,
        vehicle: dcCapability(),
        station: dcStation(90),
      }),
    ).toEqual({ ok: true, value: 90 });
  });

  it("uses the lower maximum when both maximums limit the curve", () => {
    expect(
      effectiveDcPowerAtSoc({
        socPercent: 10,
        vehicle: dcCapability(150),
        station: dcStation(90),
      }),
    ).toEqual({ ok: true, value: 90 });
  });

  it("interpolates the curve at an intermediate SoC", () => {
    expect(
      effectiveDcPowerAtSoc({
        socPercent: 30,
        vehicle: dcCapability(),
        station: dcStation(),
      }),
    ).toEqual({ ok: true, value: 160 });
  });

  it.each([
    [0, 200],
    [10, 200],
    [80, 60],
    [100, 60],
  ])("returns the endpoint-held power at %s%% SoC", (socPercent, powerKw) => {
    expect(
      effectiveDcPowerAtSoc({
        socPercent,
        vehicle: dcCapability(),
        station: dcStation(),
      }),
    ).toEqual({ ok: true, value: powerKw });
  });

  it.each([-1, 101, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects an invalid SoC of %s",
    (socPercent) => {
      expect(
        effectiveDcPowerAtSoc({
          socPercent,
          vehicle: dcCapability(),
          station: dcStation(),
        }),
      ).toEqual({
        ok: false,
        error: { type: "invalidSoc", field: "socPercent", value: socPercent },
      });
    },
  );

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects an invalid vehicle maximum power of %s",
    (maxPowerKw) => {
      expect(
        effectiveDcPowerAtSoc({
          socPercent: 50,
          vehicle: { ...dcCapability(), maxPowerKw },
          station: dcStation(),
        }),
      ).toEqual({
        ok: false,
        error: { type: "invalidPower", value: maxPowerKw },
      });
    },
  );

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects an invalid station maximum power of %s",
    (maxPowerKw) => {
      expect(
        effectiveDcPowerAtSoc({
          socPercent: 50,
          vehicle: dcCapability(),
          station: { type: "DC", maxPowerKw },
        }),
      ).toEqual({
        ok: false,
        error: { type: "invalidPower", value: maxPowerKw },
      });
    },
  );

  it("reports the vehicle limit before the station limit and SoC", () => {
    expect(
      effectiveDcPowerAtSoc({
        socPercent: Number.NaN,
        vehicle: { ...dcCapability(), maxPowerKw: -1 },
        station: { type: "DC", maxPowerKw: 0 },
      }),
    ).toEqual({
      ok: false,
      error: { type: "invalidPower", value: -1 },
    });
  });

  it("reports an invalid effective curve power", () => {
    const vehicle = {
      ...dcCapability(),
      chargingCurve: [
        { socPercent: 0, powerKw: 0 },
        { socPercent: 100, powerKw: 0 },
      ],
    } as DCChargingCapability;

    expect(
      effectiveDcPowerAtSoc({
        socPercent: 50,
        vehicle,
        station: dcStation(),
      }),
    ).toEqual({
      ok: false,
      error: { type: "invalidPower", value: 0 },
    });
  });
});
