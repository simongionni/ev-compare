import { describe, expect, it } from "vitest";
import { acChargingTime } from "@/calculations/charging/acChargingTime";
import {
  createACChargingCapability,
  createACChargingStation,
} from "@/domain/chargingFactories";
import type { ACChargingCapability, ACChargingStation } from "@/domain/charging";

describe("acChargingTime", () => {
  it("calculates charging time using the effective AC power", () => {
    const vehicle = createACChargingCapability({
      maxPowerKw: 11,
      phases: 3,
    });
    const station = createACChargingStation({
      maxPowerKw: 22,
      phases: 3,
    });

    if (!vehicle.ok || !station.ok) {
      throw new Error("Test setup produced invalid charging data");
    }

    const result = acChargingTime({
      batteryCapacityKwh: 60,
      fromSocPercent: 20,
      toSocPercent: 80,
      vehicle: vehicle.value,
      station: station.value,
    });

    expect(result.ok).toBe(true);
    result.ok && expect(result.value).toBeCloseTo(36 / 11, 2);
  });

  it("accounts for a single-phase vehicle on a three-phase station", () => {
    const vehicle = createACChargingCapability({
      maxPowerKw: 7.4,
      phases: 1,
    });
    const station = createACChargingStation({
      maxPowerKw: 11,
      phases: 3,
    });

    if (!vehicle.ok || !station.ok) {
      throw new Error("Test setup produced invalid charging data");
    }

    const result = acChargingTime({
      batteryCapacityKwh: 60,
      fromSocPercent: 20,
      toSocPercent: 80,
      vehicle: vehicle.value,
      station: station.value,
    });

    expect(result.ok).toBe(true);
    result.ok && expect(result.value).toBeCloseTo(36 / (11 / 3), 2);
  });

  it("returns an error for invalid battery capacity", () => {
    const vehicle = createACChargingCapability({
      maxPowerKw: 11,
      phases: 3,
    });
    const station = createACChargingStation({
      maxPowerKw: 22,
      phases: 3,
    });

    if (!vehicle.ok || !station.ok) {
      throw new Error("Test setup produced invalid charging data");
    }

    const result = acChargingTime({
      batteryCapacityKwh: -60,
      fromSocPercent: 20,
      toSocPercent: 80,
      vehicle: vehicle.value,
      station: station.value,
    });

    expect(result).toEqual({
      ok: false,
      error: {
        type: "invalidBatteryCapacity",
        value: -60,
      },
    });
  });

  it("returns an error for an invalid starting SOC", () => {
    const vehicle = createACChargingCapability({
      maxPowerKw: 11,
      phases: 3,
    });
    const station = createACChargingStation({
      maxPowerKw: 22,
      phases: 3,
    });

    if (!vehicle.ok || !station.ok) {
      throw new Error("Test setup produced invalid charging data");
    }

    const result = acChargingTime({
      batteryCapacityKwh: 60,
      fromSocPercent: -10,
      toSocPercent: 80,
      vehicle: vehicle.value,
      station: station.value,
    });

    expect(result).toEqual({
      ok: false,
      error: {
        type: "invalidSoc",
        field: "fromSocPercent",
        value: -10,
      },
    });
  });

  it("returns an error for an invalid ending SOC", () => {
    const vehicle = createACChargingCapability({
      maxPowerKw: 11,
      phases: 3,
    });
    const station = createACChargingStation({
      maxPowerKw: 22,
      phases: 3,
    });

    if (!vehicle.ok || !station.ok) {
      throw new Error("Test setup produced invalid charging data");
    }

    const result = acChargingTime({
      batteryCapacityKwh: 60,
      fromSocPercent: 20,
      toSocPercent: 110,
      vehicle: vehicle.value,
      station: station.value,
    });

    expect(result).toEqual({
      ok: false,
      error: {
        type: "invalidSoc",
        field: "toSocPercent",
        value: 110,
      },
    });
  });

  it("returns an error when the starting SOC is greater than the ending SOC", () => {
    const vehicle = createACChargingCapability({
      maxPowerKw: 11,
      phases: 3,
    });
    const station = createACChargingStation({
      maxPowerKw: 22,
      phases: 3,
    });

    if (!vehicle.ok || !station.ok) {
      throw new Error("Test setup produced invalid charging data");
    }

    const result = acChargingTime({
      batteryCapacityKwh: 60,
      fromSocPercent: 80,
      toSocPercent: 20,
      vehicle: vehicle.value,
      station: station.value,
    });

    expect(result).toEqual({
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

  // Domain values built directly, bypassing the factories, as a caller could.
  const validVehicle: ACChargingCapability = { maxPowerKw: 11, phases: 3 };
  const validStation: ACChargingStation = { type: "AC", maxPowerKw: 22, phases: 3 };
  const validInput = {
    batteryCapacityKwh: 60,
    fromSocPercent: 20,
    toSocPercent: 80,
    vehicle: validVehicle,
    station: validStation,
  };

  it.each([0, -11, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "rejects a station maximum power of %s even when the vehicle limit is valid",
    (maxPowerKw) => {
      expect(
        acChargingTime({ ...validInput, station: { ...validStation, maxPowerKw } }),
      ).toEqual({ ok: false, error: { type: "invalidPower", value: maxPowerKw } });
    },
  );

  it.each([0, -11, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "rejects a vehicle maximum power of %s even when the station limit is valid",
    (maxPowerKw) => {
      expect(
        acChargingTime({ ...validInput, vehicle: { ...validVehicle, maxPowerKw } }),
      ).toEqual({ ok: false, error: { type: "invalidPower", value: maxPowerKw } });
    },
  );

  it.each([0, 1.5, 4, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects %s vehicle or station phases",
    (phases) => {
      const expected = { ok: false, error: { type: "invalidPhases", value: phases } };

      expect(
        acChargingTime({ ...validInput, vehicle: { ...validVehicle, phases } }),
      ).toEqual(expected);
      expect(
        acChargingTime({ ...validInput, station: { ...validStation, phases } }),
      ).toEqual(expected);
    },
  );
});
