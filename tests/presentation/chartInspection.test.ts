import { describe, expect, test } from "vitest";
import { simulateDcCharging } from "@/application/dcSimulation";
import { powerAtSoc } from "@/calculations/charging/dcCurve";
import { effectiveDcPowerAtSoc } from "@/calculations/charging/dcPower";
import { findVehicle } from "@/data/catalogue";
import { catalogue } from "@/data/vehicles";
import { createDCChargingStation } from "@/domain/chargingFactories";
import {
  describeInspectedPoint,
  inspectedPoint,
  inspectedSocAt,
  inspectionKeyTarget,
} from "@/presentation/chartInspection";

function nordisChart() {
  const vehicle = findVehicle(catalogue, "nordis-e4");
  if (vehicle === undefined) throw new Error("vehicle");
  const result = simulateDcCharging(vehicle, {
    stationMaxPowerKw: 150,
    initialSocPercent: 10,
    targetSocPercent: 80,
  });
  if (!result.ok || result.value.kind !== "available") throw new Error("sim");
  return { vehicle, chart: result.value.chart };
}

describe("keyboard", () => {
  test.each([
    ["ArrowRight", 40, false, 41],
    ["ArrowUp", 40, false, 41],
    ["ArrowLeft", 40, false, 39],
    ["ArrowDown", 40, false, 39],
    ["ArrowRight", 40, true, 50],
    ["ArrowLeft", 40, true, 30],
    ["PageUp", 40, false, 50],
    ["PageDown", 40, false, 30],
    ["Home", 40, false, 0],
    ["End", 40, false, 100],
    ["ArrowRight", 100, false, 100],
    ["ArrowLeft", 0, false, 0],
    ["PageUp", 95, false, 100],
    ["PageDown", 5, false, 0],
  ])("%s from %i %% (shift %s) → %i %%", (key, current, shift, expected) => {
    expect(inspectionKeyTarget(key, current, shift)).toBe(expected);
  });

  test("other keys do not move the inspection", () => {
    expect(inspectionKeyTarget("Tab", 40, false)).toBeUndefined();
    expect(inspectionKeyTarget("a", 40, false)).toBeUndefined();
  });
});

describe("pointer", () => {
  test.each([
    [0, 0],
    [0.424, 42],
    [0.426, 43],
    [1, 100],
    [-0.2, 0],
    [1.3, 100],
  ])("position %d of the SoC axis → %i %%", (fraction, soc) => {
    expect(inspectedSocAt(fraction)).toBe(soc);
  });
});

describe("inspected values", () => {
  test("every whole SoC can be inspected", () => {
    const { chart } = nordisChart();
    for (let soc = 0; soc <= 100; soc++) {
      expect(inspectedPoint(chart, soc)).toBeDefined();
    }
  });

  test("values are the engine's: curve power and effective power", () => {
    const { vehicle, chart } = nordisChart();
    if (vehicle.charging.kind !== "complete") throw new Error("data");
    const station = createDCChargingStation({ maxPowerKw: 150 });
    if (!station.ok) throw new Error("station");
    for (const soc of [0, 33, 55, 72, 100]) {
      const curve = powerAtSoc({
        curve: vehicle.charging.spec.dc.chargingCurve,
        socPercent: soc,
      });
      const effective = effectiveDcPowerAtSoc({
        socPercent: soc,
        vehicle: vehicle.charging.spec.dc,
        station: station.value,
      });
      expect(inspectedPoint(chart, soc)).toEqual({
        socPercent: soc,
        vehicleCurveKw: curve.ok ? curve.value : Number.NaN,
        receivedKw: effective.ok ? effective.value : Number.NaN,
      });
    }
  });

  test("a SoC that was not sampled is not invented", () => {
    const { chart } = nordisChart();
    expect(inspectedPoint(chart, 42.25)).toBeUndefined();
  });

  test("the text equivalent names the SoC and both powers with units", () => {
    expect(
      describeInspectedPoint({
        socPercent: 55,
        vehicleCurveKw: 175,
        receivedKw: 150,
      }),
    ).toBe("55%: potenza ricevuta 150 kW, curva del veicolo 175 kW");
  });
});
