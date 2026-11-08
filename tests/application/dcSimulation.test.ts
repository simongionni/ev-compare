import { describe, expect, test } from "vitest";
import { chargingPreview } from "@/application/chargingPreview";
import { simulateDcCharging } from "@/application/dcSimulation";
import { simulateChargingSession } from "@/calculations/charging/chargingSession";
import { findVehicle, type CatalogueVehicle } from "@/data/catalogue";
import { catalogue } from "@/data/vehicles";
import { createDCChargingStation } from "@/domain/chargingFactories";
import {
  DEFAULT_DC_SIMULATION_SCENARIO,
  type DcSimulationScenario,
} from "@/scenarios/dcSimulationScenario";

function vehicle(id: string): CatalogueVehicle {
  const found = findVehicle(catalogue, id);
  if (found === undefined) throw new Error(id);
  return found;
}

function available(id: string, scenario: DcSimulationScenario) {
  const result = simulateDcCharging(vehicle(id), scenario);
  if (!result.ok || result.value.kind !== "available") {
    throw new Error(JSON.stringify(result));
  }
  return result.value;
}

const scenario = (
  stationMaxPowerKw: DcSimulationScenario["stationMaxPowerKw"],
  initialSocPercent = 10,
  targetSocPercent = 80,
): DcSimulationScenario => ({
  stationMaxPowerKw,
  initialSocPercent,
  targetSocPercent,
});

describe("reference scenarios (M0.2 slice, Data)", () => {
  // Test oracles: time rounded to the minute, energy to 0.1 kWh.
  test.each([
    ["nordis-e4", 50, 65, 53.9],
    ["nordis-e4", 150, 22, 53.9],
    ["nordis-e4", 350, 20, 53.9],
    ["aurora-vela", 50, 49, 40.6],
    ["aurora-vela", 150, 27, 40.6],
    ["aurora-vela", 350, 27, 40.6],
  ] as const)(
    "%s 10 → 80 %% at %i kW: %i min, %d kWh",
    (id, kw, minutes, energyKwh) => {
      const { simulation, chart } = available(id, scenario(kw));
      expect(Math.round(simulation.chargingTimeHours * 60)).toBe(minutes);
      expect(Math.round(simulation.deliveredEnergyKwh * 10) / 10).toBe(
        energyKwh,
      );
      expect(simulation.terminationReason).toBe("targetReached");
      expect(chart.stationMaxPowerKw).toBe(kw);
      expect(chart.interval).toEqual({ fromSocPercent: 10, toSocPercent: 80 });
    },
  );

  test("the result is exactly simulateChargingSession's, unrounded", () => {
    const target = vehicle("nordis-e4");
    if (target.charging.kind !== "complete") throw new Error("data");
    const station = createDCChargingStation({ maxPowerKw: 350 });
    if (!station.ok) throw new Error("station");
    const direct = simulateChargingSession({
      vehicle: target.charging.spec,
      station: station.value,
      session: {
        initialSocPercent: 25,
        termination: { type: "targetSoc", targetSocPercent: 70 },
      },
    });
    expect(direct).toEqual({
      ok: true,
      value: available("nordis-e4", scenario(350, 25, 70)).simulation,
    });
  });

  test("the chart follows the station and the SoC interval", () => {
    const { chart } = available("aurora-vela", scenario(50, 35, 65));
    expect(chart.stationMaxPowerKw).toBe(50);
    expect(chart.interval).toEqual({ fromSocPercent: 35, toSocPercent: 65 });
    expect(
      Math.max(...chart.effectivePower.map((sample) => sample.powerKw)),
    ).toBe(50);
  });

  test("the Ricarica preview is the simulation of the default scenario", () => {
    expect(chargingPreview(vehicle("nordis-e4"))).toEqual(
      simulateDcCharging(vehicle("nordis-e4"), DEFAULT_DC_SIMULATION_SCENARIO),
    );
  });
});

describe("empty SoC interval", () => {
  test.each([0, 37, 100])(
    "initial = final = %i %%: zero time and energy, not an error",
    (soc) => {
      const { simulation, chart } = available(
        "nordis-e4",
        scenario(150, soc, soc),
      );
      expect(simulation.chargingTimeHours).toBe(0);
      expect(simulation.deliveredEnergyKwh).toBe(0);
      expect(simulation.initialSocPercent).toBe(soc);
      expect(simulation.finalSocPercent).toBe(soc);
      // The chart still receives the chosen SoC.
      expect(chart.interval).toEqual({
        fromSocPercent: soc,
        toSocPercent: soc,
      });
    },
  );
});

describe("incomplete charging data", () => {
  test.each(["brisa-family", "talon-s", "meridian-tour"])(
    "%s: nothing is calculated and nothing is invented",
    (id) => {
      expect(
        simulateDcCharging(vehicle(id), DEFAULT_DC_SIMULATION_SCENARIO),
      ).toEqual({ ok: true, value: { kind: "missingChargingData" } });
    },
  );
});

describe("typed errors", () => {
  test("an invalid station power is the factory's error", () => {
    expect(
      simulateDcCharging(vehicle("nordis-e4"), {
        stationMaxPowerKw: 0,
        initialSocPercent: 10,
        targetSocPercent: 80,
      }),
    ).toEqual({
      ok: false,
      error: {
        type: "invalidStation",
        error: { type: "invalidMaxPower", value: 0 },
      },
    });
  });

  test("an invalid SoC is the engine's error, unchanged", () => {
    const result = simulateDcCharging(vehicle("nordis-e4"), {
      stationMaxPowerKw: 150,
      initialSocPercent: 10,
      targetSocPercent: 120,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe("simulation");
      if (result.error.type === "simulation") {
        expect(result.error.error.type).toBe("invalidSoc");
      }
    }
  });
});
