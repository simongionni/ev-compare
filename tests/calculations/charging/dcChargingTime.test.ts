import { describe, expect, it } from "vitest";
import { dcChargingTime } from "@/calculations/charging/dcChargingTime";
import { createChargingCurve } from "@/domain/chargingFactories";
import type {
  DCChargingCapability,
  DCChargingStation,
  RawChargingCurve,
} from "@/domain/charging";
import type { CalculationResult } from "@/calculations/result";
import type { ChargingCalculationError } from "@/calculations/charging/error";

function vehicleWithCurve(
  rawCurve: RawChargingCurve,
  maxPowerKw: number,
): DCChargingCapability {
  const curveResult = createChargingCurve(rawCurve);

  if (!curveResult.ok) {
    throw new Error("Test setup produced an invalid charging curve");
  }

  return { maxPowerKw, chargingCurve: curveResult.value };
}

function stationWithPower(maxPowerKw: number): DCChargingStation {
  return { type: "DC", maxPowerKw };
}

function expectHours(
  result: CalculationResult<number, ChargingCalculationError>,
  expectedHours: number,
  digits: number,
): void {
  if (!result.ok) {
    throw new Error(`Expected a charging time, got error ${result.error.type}`);
  }

  expect(result.value).toBeCloseTo(expectedHours, digits);
}

/**
 * Exact time in hours to charge across a SoC span where power varies linearly
 * from `fromPowerKw` to `toPowerKw`.
 */
function linearSegmentHours(
  batteryCapacityKwh: number,
  socSpanPercent: number,
  fromPowerKw: number,
  toPowerKw: number,
): number {
  return (
    ((batteryCapacityKwh / 100) *
      socSpanPercent *
      Math.log(fromPowerKw / toPowerKw)) /
    (fromPowerKw - toPowerKw)
  );
}

describe("dcChargingTime", () => {
  const flatVehicle = vehicleWithCurve(
    [
      { socPercent: 0, powerKw: 100 },
      { socPercent: 100, powerKw: 100 },
    ],
    150,
  );

  describe("constant-power curves", () => {
    it("matches energy divided by power for a flat curve", () => {
      const result = dcChargingTime({
        batteryCapacityKwh: 60,
        fromSocPercent: 20,
        toSocPercent: 80,
        vehicle: flatVehicle,
        station: stationWithPower(350),
      });

      expectHours(result, 36 / 100, 10);
    });
  });

  describe("variable-power curves", () => {
    it("integrates a linearly decreasing curve", () => {
      const vehicle = vehicleWithCurve(
        [
          { socPercent: 0, powerKw: 150 },
          { socPercent: 100, powerKw: 50 },
        ],
        150,
      );

      const result = dcChargingTime({
        batteryCapacityKwh: 100,
        fromSocPercent: 0,
        toSocPercent: 100,
        vehicle,
        station: stationWithPower(350),
      });

      expectHours(result, linearSegmentHours(100, 100, 150, 50), 5);
    });

    it("integrates a multi-segment curve over a partial interval", () => {
      const vehicle = vehicleWithCurve(
        [
          { socPercent: 0, powerKw: 200 },
          { socPercent: 20, powerKw: 150 },
          { socPercent: 40, powerKw: 110 },
          { socPercent: 80, powerKw: 50 },
        ],
        200,
      );

      const result = dcChargingTime({
        batteryCapacityKwh: 80,
        fromSocPercent: 10,
        toSocPercent: 60,
        vehicle,
        station: stationWithPower(350),
      });

      const expectedHours =
        linearSegmentHours(80, 10, 175, 150) +
        linearSegmentHours(80, 20, 150, 110) +
        linearSegmentHours(80, 20, 110, 80);

      expectHours(result, expectedHours, 5);
    });
  });

  describe("charging-power limits", () => {
    it("caps the curve at the vehicle maximum power", () => {
      const vehicle = vehicleWithCurve(
        [
          { socPercent: 0, powerKw: 200 },
          { socPercent: 100, powerKw: 200 },
        ],
        120,
      );

      const result = dcChargingTime({
        batteryCapacityKwh: 60,
        fromSocPercent: 20,
        toSocPercent: 80,
        vehicle,
        station: stationWithPower(350),
      });

      expectHours(result, 36 / 120, 10);
    });

    it("caps the curve at the station maximum power", () => {
      const result = dcChargingTime({
        batteryCapacityKwh: 60,
        fromSocPercent: 20,
        toSocPercent: 80,
        vehicle: flatVehicle,
        station: stationWithPower(50),
      });

      expectHours(result, 36 / 50, 10);
    });

    it("applies the cap only where the curve exceeds it", () => {
      const vehicle = vehicleWithCurve(
        [
          { socPercent: 0, powerKw: 200 },
          { socPercent: 50, powerKw: 200 },
          { socPercent: 100, powerKw: 50 },
        ],
        250,
      );

      const result = dcChargingTime({
        batteryCapacityKwh: 100,
        fromSocPercent: 0,
        toSocPercent: 100,
        vehicle,
        station: stationWithPower(100),
      });

      // The curve drops below 100 kW at 250/3 % SoC.
      const crossingSocPercent = 250 / 3;
      const expectedHours =
        crossingSocPercent / 100 +
        linearSegmentHours(100, 100 - crossingSocPercent, 100, 50);

      expectHours(result, expectedHours, 4);
    });
  });

  describe("boundary conditions", () => {
    it("returns zero hours when the starting and ending SoC are equal", () => {
      expect(
        dcChargingTime({
          batteryCapacityKwh: 60,
          fromSocPercent: 50,
          toSocPercent: 50,
          vehicle: flatVehicle,
          station: stationWithPower(350),
        }),
      ).toEqual({ ok: true, value: 0 });
    });

    it("holds the endpoint power outside the curve SoC range", () => {
      const vehicle = vehicleWithCurve(
        [
          { socPercent: 20, powerKw: 120 },
          { socPercent: 80, powerKw: 60 },
        ],
        150,
      );
      const station = stationWithPower(350);

      const belowCurve = dcChargingTime({
        batteryCapacityKwh: 60,
        fromSocPercent: 0,
        toSocPercent: 20,
        vehicle,
        station,
      });
      const aboveCurve = dcChargingTime({
        batteryCapacityKwh: 60,
        fromSocPercent: 80,
        toSocPercent: 100,
        vehicle,
        station,
      });

      expectHours(belowCurve, 12 / 120, 10);
      expectHours(aboveCurve, 12 / 60, 10);
    });

    it("charges across the full 0-100% range", () => {
      const result = dcChargingTime({
        batteryCapacityKwh: 75,
        fromSocPercent: 0,
        toSocPercent: 100,
        vehicle: flatVehicle,
        station: stationWithPower(350),
      });

      expectHours(result, 75 / 100, 10);
    });
  });

  describe("invalid inputs", () => {
    const validInput = {
      batteryCapacityKwh: 60,
      fromSocPercent: 20,
      toSocPercent: 80,
      vehicle: flatVehicle,
      station: stationWithPower(350),
    };

    it("returns an error for invalid battery capacity", () => {
      expect(dcChargingTime({ ...validInput, batteryCapacityKwh: 0 })).toEqual({
        ok: false,
        error: { type: "invalidBatteryCapacity", value: 0 },
      });
    });

    it("returns an error for an invalid starting SoC", () => {
      expect(dcChargingTime({ ...validInput, fromSocPercent: -10 })).toEqual({
        ok: false,
        error: { type: "invalidSoc", field: "fromSocPercent", value: -10 },
      });
    });

    it("returns an error for an invalid ending SoC", () => {
      expect(dcChargingTime({ ...validInput, toSocPercent: 110 })).toEqual({
        ok: false,
        error: { type: "invalidSoc", field: "toSocPercent", value: 110 },
      });
    });

    it("returns an error for a non-finite SoC", () => {
      expect(
        dcChargingTime({ ...validInput, toSocPercent: Number.NaN }),
      ).toEqual({
        ok: false,
        error: { type: "invalidSoc", field: "toSocPercent", value: Number.NaN },
      });
    });

    it("returns an error when the starting SoC is greater than the ending SoC", () => {
      expect(
        dcChargingTime({ ...validInput, fromSocPercent: 80, toSocPercent: 20 }),
      ).toEqual({
        ok: false,
        error: {
          type: "invalidSocRange",
          message:
            "The starting SoC percentage must not be greater than the ending SoC percentage.",
          fromSocPercent: 80,
          toSocPercent: 20,
        },
      });
    });

    it("reports an out-of-range starting SoC rather than a decreasing range", () => {
      expect(
        dcChargingTime({ ...validInput, fromSocPercent: 120, toSocPercent: 80 }),
      ).toEqual({
        ok: false,
        error: { type: "invalidSoc", field: "fromSocPercent", value: 120 },
      });
    });

    it("returns an error for a non-positive vehicle maximum power", () => {
      expect(
        dcChargingTime({
          ...validInput,
          vehicle: { ...flatVehicle, maxPowerKw: 0 },
        }),
      ).toEqual({ ok: false, error: { type: "invalidPower", value: 0 } });
    });

    it("returns an error for a non-positive station maximum power", () => {
      expect(
        dcChargingTime({ ...validInput, station: stationWithPower(-50) }),
      ).toEqual({ ok: false, error: { type: "invalidPower", value: -50 } });
    });

    it("returns an error for a non-numeric maximum power", () => {
      expect(
        dcChargingTime({
          ...validInput,
          station: stationWithPower(Number.NaN),
        }),
      ).toEqual({
        ok: false,
        error: { type: "invalidPower", value: Number.NaN },
      });
    });

    it.each([Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NaN])(
      "rejects a station maximum power of %s even when the vehicle limit is valid",
      (maxPowerKw) => {
        expect(
          dcChargingTime({ ...validInput, station: stationWithPower(maxPowerKw) }),
        ).toEqual({ ok: false, error: { type: "invalidPower", value: maxPowerKw } });
      },
    );

    it.each([Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NaN])(
      "rejects a vehicle maximum power of %s even when the station limit is valid",
      (maxPowerKw) => {
        expect(
          dcChargingTime({
            ...validInput,
            vehicle: { ...flatVehicle, maxPowerKw },
          }),
        ).toEqual({ ok: false, error: { type: "invalidPower", value: maxPowerKw } });
      },
    );

    it("rejects an invalid power limit even when the SoC span is empty", () => {
      expect(
        dcChargingTime({
          ...validInput,
          fromSocPercent: 50,
          toSocPercent: 50,
          station: stationWithPower(Number.POSITIVE_INFINITY),
        }),
      ).toEqual({
        ok: false,
        error: { type: "invalidPower", value: Number.POSITIVE_INFINITY },
      });
    });
  });
});
