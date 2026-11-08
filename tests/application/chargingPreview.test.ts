import { describe, expect, test } from "vitest";
import {
  chargingPreview,
  REFERENCE_DC_SCENARIO,
} from "@/application/chargingPreview";
import { simulateChargingSession } from "@/calculations/charging/chargingSession";
import { findVehicle, type CatalogueVehicle } from "@/data/catalogue";
import { catalogue } from "@/data/vehicles";
import { createDCChargingStation } from "@/domain/chargingFactories";

function vehicle(id: string): CatalogueVehicle {
  const found = findVehicle(catalogue, id);
  if (found === undefined) throw new Error(id);
  return found;
}

function available(id: string) {
  const result = chargingPreview(vehicle(id));
  if (!result.ok || result.value.kind !== "available") {
    throw new Error(JSON.stringify(result));
  }
  return result.value;
}

test("the reference scenario is DC 10 % → 80 % on a 150 kW station", () => {
  expect(REFERENCE_DC_SCENARIO).toEqual({
    stationMaxPowerKw: 150,
    initialSocPercent: 10,
    targetSocPercent: 80,
  });
});

describe("vehicles with complete charging data", () => {
  // M0.2 slice, reference values computed with M0.1 (time to the minute, energy to 0.1 kWh).
  test.each([
    ["nordis-e4", 22, 53.9],
    ["aurora-vela", 27, 40.6],
  ])("%s matches the reference table", (id, minutes, energyKwh) => {
    const { simulation } = available(id);
    expect(Math.round(simulation.chargingTimeHours * 60)).toBe(minutes);
    expect(Math.round(simulation.deliveredEnergyKwh * 10) / 10).toBe(energyKwh);
    expect(simulation.initialSocPercent).toBe(10);
    expect(simulation.finalSocPercent).toBe(80);
    expect(simulation.terminationReason).toBe("targetReached");
  });

  test.each(["nordis-e4", "aurora-vela"])(
    "%s: the result is exactly simulateChargingSession's, unrounded",
    (id) => {
      const target = vehicle(id);
      if (target.charging.kind !== "complete") throw new Error(id);
      const station = createDCChargingStation({ maxPowerKw: 150 });
      if (!station.ok) throw new Error("station");
      const direct = simulateChargingSession({
        vehicle: target.charging.spec,
        station: station.value,
        session: {
          initialSocPercent: 10,
          termination: { type: "targetSoc", targetSocPercent: 80 },
        },
      });
      expect(direct).toEqual({ ok: true, value: available(id).simulation });
    },
  );

  test("the chart shows the scenario's station and SoC interval", () => {
    const { chart } = available("nordis-e4");
    expect(chart.stationMaxPowerKw).toBe(150);
    expect(chart.interval).toEqual({ fromSocPercent: 10, toSocPercent: 80 });
  });
});

describe("vehicles with incomplete charging data", () => {
  test.each(["brisa-family", "talon-s", "meridian-tour"])(
    "%s: nothing is calculated and nothing is invented",
    (id) => {
      expect(chargingPreview(vehicle(id))).toEqual({
        ok: true,
        value: { kind: "missingChargingData" },
      });
    },
  );
});

describe("engine errors", () => {
  test("an error of the simulation is returned with its type", () => {
    const nordis = vehicle("nordis-e4");
    if (nordis.charging.kind !== "complete") throw new Error("nordis");
    const broken: CatalogueVehicle = {
      ...nordis,
      charging: {
        kind: "complete",
        spec: { ...nordis.charging.spec, usableBatteryCapacityKwh: 0 },
      },
    };
    expect(chargingPreview(broken)).toEqual({
      ok: false,
      error: {
        type: "simulation",
        error: { type: "invalidBatteryCapacity", value: 0 },
      },
    });
  });
});
