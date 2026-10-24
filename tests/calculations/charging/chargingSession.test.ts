import { describe, expect, it } from "vitest";
import {
  simulateChargingSession,
  type ChargingSessionSimulation,
} from "@/calculations/charging/chargingSession";
import { dcChargingTime } from "@/calculations/charging/dcChargingTime";
import {
  createACChargingCapability,
  createACChargingStation,
  createDCChargingCapability,
} from "@/domain/chargingFactories";
import type {
  ACChargingCapability,
  ACChargingStation,
  DCChargingCapability,
  DCChargingStation,
  RawChargingCurve,
  VehicleChargingSpec,
} from "@/domain/charging";
import type { CalculationResult } from "@/calculations/result";
import type { ChargingSessionError } from "@/calculations/charging/error";

function acCapability(
  maxPowerKw: number,
  phases: number,
): ACChargingCapability {
  const result = createACChargingCapability({ maxPowerKw, phases });

  if (!result.ok) {
    throw new Error("Test setup produced an invalid AC capability");
  }

  return result.value;
}

function acStation(maxPowerKw: number, phases: number): ACChargingStation {
  const result = createACChargingStation({ maxPowerKw, phases });

  if (!result.ok) {
    throw new Error("Test setup produced an invalid AC station");
  }

  return result.value;
}

function dcCapability(
  rawCurve: RawChargingCurve,
  maxPowerKw: number,
): DCChargingCapability {
  const result = createDCChargingCapability({
    maxPowerKw,
    chargingCurve: rawCurve,
  });

  if (!result.ok) {
    throw new Error("Test setup produced an invalid DC capability");
  }

  return result.value;
}

function dcStation(maxPowerKw: number): DCChargingStation {
  return { type: "DC", maxPowerKw };
}

function expectSimulation(
  result: CalculationResult<ChargingSessionSimulation, ChargingSessionError>,
): ChargingSessionSimulation {
  if (!result.ok) {
    throw new Error(`Expected a simulation, got error ${result.error.type}`);
  }

  return result.value;
}

function expectHours(result: CalculationResult<number, unknown>): number {
  if (!result.ok) {
    throw new Error("Expected a charging time");
  }

  return result.value;
}

const flatDc = dcCapability(
  [
    { socPercent: 0, powerKw: 100 },
    { socPercent: 100, powerKw: 100 },
  ],
  150,
);

const variableDc = dcCapability(
  [
    { socPercent: 0, powerKw: 200 },
    { socPercent: 20, powerKw: 150 },
    { socPercent: 40, powerKw: 110 },
    { socPercent: 80, powerKw: 50 },
  ],
  200,
);

const vehicle: VehicleChargingSpec = {
  usableBatteryCapacityKwh: 60,
  ac: acCapability(11, 3),
  dc: flatDc,
};

const variableVehicle: VehicleChargingSpec = {
  usableBatteryCapacityKwh: 80,
  ac: acCapability(11, 3),
  dc: variableDc,
};

const acOnlyVehicle: VehicleChargingSpec = {
  usableBatteryCapacityKwh: 60,
  ac: acCapability(11, 3),
};

describe("simulateChargingSession", () => {
  describe("AC charging", () => {
    it("charges to a target SoC at the effective AC power", () => {
      const simulation = expectSimulation(
        simulateChargingSession({
          vehicle,
          station: acStation(22, 3),
          session: {
            initialSocPercent: 20,
            termination: { type: "targetSoc", targetSocPercent: 80 },
          },
        }),
      );

      expect(simulation.finalSocPercent).toBe(80);
      expect(simulation.chargingTimeHours).toBeCloseTo(36 / 11, 10);
      expect(simulation.deliveredEnergyKwh).toBeCloseTo(36, 10);
      expect(simulation.terminationReason).toBe("targetReached");
    });

    it("is limited by the phases shared by vehicle and station", () => {
      const simulation = expectSimulation(
        simulateChargingSession({
          vehicle: { ...vehicle, ac: acCapability(7.4, 1) },
          station: acStation(11, 3),
          session: {
            initialSocPercent: 20,
            termination: { type: "targetSoc", targetSocPercent: 80 },
          },
        }),
      );

      expect(simulation.chargingTimeHours).toBeCloseTo(36 / (11 / 3), 10);
    });

    it("charges for a duration at the effective AC power", () => {
      const simulation = expectSimulation(
        simulateChargingSession({
          vehicle,
          station: acStation(22, 3),
          session: {
            initialSocPercent: 20,
            termination: { type: "duration", durationMinutes: 60 },
          },
        }),
      );

      expect(simulation.finalSocPercent).toBeCloseTo(20 + (11 / 60) * 100, 5);
      expect(simulation.chargingTimeHours).toBe(1);
      expect(simulation.deliveredEnergyKwh).toBeCloseTo(11, 5);
      expect(simulation.terminationReason).toBe("durationElapsed");
    });

    it("is limited by the station power for a duration", () => {
      const simulation = expectSimulation(
        simulateChargingSession({
          vehicle,
          station: acStation(7.4, 3),
          session: {
            initialSocPercent: 20,
            termination: { type: "duration", durationMinutes: 120 },
          },
        }),
      );

      expect(simulation.deliveredEnergyKwh).toBeCloseTo(14.8, 5);
    });
  });

  describe("DC charging", () => {
    it("charges to a target SoC following dcChargingTime", () => {
      const station = dcStation(350);
      const simulation = expectSimulation(
        simulateChargingSession({
          vehicle: variableVehicle,
          station,
          session: {
            initialSocPercent: 10,
            termination: { type: "targetSoc", targetSocPercent: 60 },
          },
        }),
      );

      const expectedHours = expectHours(
        dcChargingTime({
          batteryCapacityKwh: 80,
          fromSocPercent: 10,
          toSocPercent: 60,
          vehicle: variableDc,
          station,
        }),
      );

      expect(simulation.chargingTimeHours).toBe(expectedHours);
      expect(simulation.deliveredEnergyKwh).toBeCloseTo(40, 10);
      expect(simulation.finalSocPercent).toBe(60);
    });

    it("is limited by the station maximum power", () => {
      const simulation = expectSimulation(
        simulateChargingSession({
          vehicle,
          station: dcStation(50),
          session: {
            initialSocPercent: 20,
            termination: { type: "targetSoc", targetSocPercent: 80 },
          },
        }),
      );

      expect(simulation.chargingTimeHours).toBeCloseTo(36 / 50, 10);
    });

    it("is limited by the vehicle maximum power", () => {
      const simulation = expectSimulation(
        simulateChargingSession({
          vehicle: { ...vehicle, dc: { ...flatDc, maxPowerKw: 40 } },
          station: dcStation(350),
          session: {
            initialSocPercent: 20,
            termination: { type: "duration", durationMinutes: 30 },
          },
        }),
      );

      expect(simulation.deliveredEnergyKwh).toBeCloseTo(20, 5);
      expect(simulation.finalSocPercent).toBeCloseTo(20 + (20 / 60) * 100, 5);
    });

    it("charges for a duration on a flat curve", () => {
      const simulation = expectSimulation(
        simulateChargingSession({
          vehicle,
          station: dcStation(350),
          session: {
            initialSocPercent: 20,
            termination: { type: "duration", durationMinutes: 15 },
          },
        }),
      );

      expect(simulation.deliveredEnergyKwh).toBeCloseTo(25, 5);
      expect(simulation.chargingTimeHours).toBe(0.25);
      expect(simulation.terminationReason).toBe("durationElapsed");
    });
  });

  describe("consistency between target-SoC and duration sessions", () => {
    const station = dcStation(350);

    it("reaches the target SoC when charging for the forward charging time", () => {
      const forwardHours = expectHours(
        dcChargingTime({
          batteryCapacityKwh: 80,
          fromSocPercent: 20,
          toSocPercent: 80,
          vehicle: variableDc,
          station,
        }),
      );

      const simulation = expectSimulation(
        simulateChargingSession({
          vehicle: variableVehicle,
          station,
          session: {
            initialSocPercent: 20,
            termination: {
              type: "duration",
              durationMinutes: forwardHours * 60,
            },
          },
        }),
      );

      expect(simulation.finalSocPercent).toBeCloseTo(80, 5);
    });

    it("returns a final SoC whose forward charging time equals the duration", () => {
      const simulation = expectSimulation(
        simulateChargingSession({
          vehicle: variableVehicle,
          station,
          session: {
            initialSocPercent: 10,
            termination: { type: "duration", durationMinutes: 20 },
          },
        }),
      );

      const forwardHours = expectHours(
        dcChargingTime({
          batteryCapacityKwh: 80,
          fromSocPercent: 10,
          toSocPercent: simulation.finalSocPercent,
          vehicle: variableDc,
          station,
        }),
      );

      expect(forwardHours).toBeCloseTo(20 / 60, 6);
      expect(forwardHours).toBeLessThanOrEqual(20 / 60);
    });
  });

  describe("full battery", () => {
    it("stops at 100% before the requested duration elapses", () => {
      const simulation = expectSimulation(
        simulateChargingSession({
          vehicle,
          station: acStation(22, 3),
          session: {
            initialSocPercent: 20,
            termination: { type: "duration", durationMinutes: 600 },
          },
        }),
      );

      expect(simulation).toEqual({
        initialSocPercent: 20,
        finalSocPercent: 100,
        chargingTimeHours: expect.closeTo(48 / 11, 10),
        deliveredEnergyKwh: expect.closeTo(48, 10),
        terminationReason: "batteryFull",
      });
      expect(simulation.chargingTimeHours).toBeLessThan(10);
    });

    it("stops at 100% on DC with a variable curve", () => {
      const simulation = expectSimulation(
        simulateChargingSession({
          vehicle: variableVehicle,
          station: dcStation(350),
          session: {
            initialSocPercent: 50,
            termination: { type: "duration", durationMinutes: 240 },
          },
        }),
      );

      expect(simulation.finalSocPercent).toBe(100);
      expect(simulation.terminationReason).toBe("batteryFull");
      expect(simulation.chargingTimeHours).toBe(
        expectHours(
          dcChargingTime({
            batteryCapacityKwh: 80,
            fromSocPercent: 50,
            toSocPercent: 100,
            vehicle: variableDc,
            station: dcStation(350),
          }),
        ),
      );
    });

    it("does not charge a full battery for a duration", () => {
      expect(
        simulateChargingSession({
          vehicle,
          station: dcStation(350),
          session: {
            initialSocPercent: 100,
            termination: { type: "duration", durationMinutes: 30 },
          },
        }),
      ).toEqual({
        ok: true,
        value: {
          initialSocPercent: 100,
          finalSocPercent: 100,
          chargingTimeHours: 0,
          deliveredEnergyKwh: 0,
          terminationReason: "batteryFull",
        },
      });
    });

    it("charges to a 100% target", () => {
      const simulation = expectSimulation(
        simulateChargingSession({
          vehicle,
          station: dcStation(350),
          session: {
            initialSocPercent: 0,
            termination: { type: "targetSoc", targetSocPercent: 100 },
          },
        }),
      );

      expect(simulation.finalSocPercent).toBe(100);
      expect(simulation.chargingTimeHours).toBeCloseTo(60 / 100, 10);
      expect(simulation.terminationReason).toBe("targetReached");
    });
  });

  describe("boundary conditions", () => {
    const zeroSimulation = {
      ok: true,
      value: {
        initialSocPercent: 50,
        finalSocPercent: 50,
        chargingTimeHours: 0,
        deliveredEnergyKwh: 0,
        terminationReason: "targetReached",
      },
    };

    it("does not charge for a zero duration", () => {
      expect(
        simulateChargingSession({
          vehicle,
          station: acStation(22, 3),
          session: {
            initialSocPercent: 50,
            termination: { type: "duration", durationMinutes: 0 },
          },
        }),
      ).toEqual({
        ok: true,
        value: {
          initialSocPercent: 50,
          finalSocPercent: 50,
          chargingTimeHours: 0,
          deliveredEnergyKwh: 0,
          terminationReason: "durationElapsed",
        },
      });
    });

    it("does not charge when the target equals the initial SoC", () => {
      expect(
        simulateChargingSession({
          vehicle,
          station: dcStation(350),
          session: {
            initialSocPercent: 50,
            termination: { type: "targetSoc", targetSocPercent: 50 },
          },
        }),
      ).toEqual(zeroSimulation);
    });

    it("does not charge when the target is below the initial SoC", () => {
      expect(
        simulateChargingSession({
          vehicle,
          station: acStation(22, 3),
          session: {
            initialSocPercent: 50,
            termination: { type: "targetSoc", targetSocPercent: 30 },
          },
        }),
      ).toEqual(zeroSimulation);
    });
  });

  describe("invalid configurations", () => {
    it("rejects DC charging for a vehicle without DC capability", () => {
      expect(
        simulateChargingSession({
          vehicle: acOnlyVehicle,
          station: dcStation(150),
          session: {
            initialSocPercent: 20,
            termination: { type: "targetSoc", targetSocPercent: 80 },
          },
        }),
      ).toEqual({ ok: false, error: { type: "dcChargingNotSupported" } });
    });

    it("allows AC charging for a vehicle without DC capability", () => {
      expect(
        simulateChargingSession({
          vehicle: acOnlyVehicle,
          station: acStation(11, 3),
          session: {
            initialSocPercent: 20,
            termination: { type: "targetSoc", targetSocPercent: 80 },
          },
        }).ok,
      ).toBe(true);
    });

    it.each([-10, Number.NaN, Number.POSITIVE_INFINITY])(
      "rejects a duration of %s minutes",
      (durationMinutes) => {
        expect(
          simulateChargingSession({
            vehicle,
            station: acStation(22, 3),
            session: {
              initialSocPercent: 20,
              termination: { type: "duration", durationMinutes },
            },
          }),
        ).toEqual({
          ok: false,
          error: { type: "invalidDuration", value: durationMinutes },
        });
      },
    );

    it("rejects a target SoC above 100%", () => {
      expect(
        simulateChargingSession({
          vehicle,
          station: dcStation(350),
          session: {
            initialSocPercent: 20,
            termination: { type: "targetSoc", targetSocPercent: 110 },
          },
        }),
      ).toEqual({
        ok: false,
        error: { type: "invalidSoc", field: "toSocPercent", value: 110 },
      });
    });

    it("rejects an invalid target SoC even when below the initial SoC", () => {
      expect(
        simulateChargingSession({
          vehicle,
          station: dcStation(350),
          session: {
            initialSocPercent: 20,
            termination: { type: "targetSoc", targetSocPercent: -5 },
          },
        }),
      ).toEqual({
        ok: false,
        error: { type: "invalidSoc", field: "toSocPercent", value: -5 },
      });
    });

    it.each([
      { type: "targetSoc", targetSocPercent: 80 },
      { type: "duration", durationMinutes: 0 },
    ] as const)("rejects an invalid initial SoC ($type)", (termination) => {
      expect(
        simulateChargingSession({
          vehicle,
          station: acStation(22, 3),
          session: { initialSocPercent: -10, termination },
        }),
      ).toEqual({
        ok: false,
        error: { type: "invalidSoc", field: "fromSocPercent", value: -10 },
      });
    });

    it.each([
      { type: "targetSoc", targetSocPercent: 80 },
      { type: "duration", durationMinutes: 30 },
    ] as const)(
      "rejects an invalid battery capacity ($type)",
      (termination) => {
        expect(
          simulateChargingSession({
            vehicle: { ...vehicle, usableBatteryCapacityKwh: 0 },
            station: dcStation(350),
            session: { initialSocPercent: 20, termination },
          }),
        ).toEqual({
          ok: false,
          error: { type: "invalidBatteryCapacity", value: 0 },
        });
      },
    );

    it("propagates an invalid DC station power", () => {
      expect(
        simulateChargingSession({
          vehicle,
          station: dcStation(0),
          session: {
            initialSocPercent: 20,
            termination: { type: "duration", durationMinutes: 30 },
          },
        }),
      ).toEqual({ ok: false, error: { type: "invalidPower", value: 0 } });
    });

    it.each([
      { type: "targetSoc", targetSocPercent: 80 },
      { type: "targetSoc", targetSocPercent: 20 },
      { type: "targetSoc", targetSocPercent: 10 },
      { type: "duration", durationMinutes: 30 },
    ] as const)(
      "rejects an infinite DC station power ($type)",
      (termination) => {
        expect(
          simulateChargingSession({
            vehicle,
            station: dcStation(Number.POSITIVE_INFINITY),
            session: { initialSocPercent: 20, termination },
          }),
        ).toEqual({
          ok: false,
          error: { type: "invalidPower", value: Number.POSITIVE_INFINITY },
        });
      },
    );

    it.each([
      { type: "targetSoc", targetSocPercent: 80 },
      { type: "targetSoc", targetSocPercent: 10 },
      { type: "duration", durationMinutes: 30 },
    ] as const)(
      "rejects an infinite AC station power ($type)",
      (termination) => {
        expect(
          simulateChargingSession({
            vehicle,
            station: { type: "AC", maxPowerKw: Number.POSITIVE_INFINITY, phases: 3 },
            session: { initialSocPercent: 20, termination },
          }),
        ).toEqual({
          ok: false,
          error: { type: "invalidPower", value: Number.POSITIVE_INFINITY },
        });
      },
    );

    it("rejects invalid vehicle AC phases", () => {
      expect(
        simulateChargingSession({
          vehicle: { ...vehicle, ac: { maxPowerKw: 11, phases: Number.NaN } },
          station: acStation(22, 3),
          session: {
            initialSocPercent: 20,
            termination: { type: "duration", durationMinutes: 30 },
          },
        }),
      ).toEqual({
        ok: false,
        error: { type: "invalidPhases", value: Number.NaN },
      });
    });

    it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 100.5])(
      "rejects an initial SoC of %s",
      (initialSocPercent) => {
        expect(
          simulateChargingSession({
            vehicle,
            station: acStation(22, 3),
            session: {
              initialSocPercent,
              termination: { type: "duration", durationMinutes: 30 },
            },
          }),
        ).toEqual({
          ok: false,
          error: {
            type: "invalidSoc",
            field: "fromSocPercent",
            value: initialSocPercent,
          },
        });
      },
    );

    it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
      "rejects a target SoC of %s",
      (targetSocPercent) => {
        expect(
          simulateChargingSession({
            vehicle,
            station: dcStation(350),
            session: {
              initialSocPercent: 20,
              termination: { type: "targetSoc", targetSocPercent },
            },
          }),
        ).toEqual({
          ok: false,
          error: {
            type: "invalidSoc",
            field: "toSocPercent",
            value: targetSocPercent,
          },
        });
      },
    );

    it("rejects an infinite battery capacity", () => {
      expect(
        simulateChargingSession({
          vehicle: {
            ...vehicle,
            usableBatteryCapacityKwh: Number.POSITIVE_INFINITY,
          },
          station: acStation(22, 3),
          session: {
            initialSocPercent: 20,
            termination: { type: "duration", durationMinutes: 30 },
          },
        }),
      ).toEqual({
        ok: false,
        error: {
          type: "invalidBatteryCapacity",
          value: Number.POSITIVE_INFINITY,
        },
      });
    });
  });
});
