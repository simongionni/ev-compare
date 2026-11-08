import { describe, expect, test } from "vitest";
import {
  CHART_SOC_STEP_PERCENT,
  chartSocSamples,
  dcPowerChartSeries,
} from "@/application/dcPowerChartSeries";
import { powerAtSoc } from "@/calculations/charging/dcCurve";
import { effectiveDcPowerAtSoc } from "@/calculations/charging/dcPower";
import type {
  DCChargingCapability,
  DCChargingStation,
} from "@/domain/charging";
import {
  createDCChargingCapability,
  createDCChargingStation,
} from "@/domain/chargingFactories";
import { findVehicle } from "@/data/catalogue";
import { catalogue } from "@/data/vehicles";

function dcOf(id: string): DCChargingCapability {
  const vehicle = findVehicle(catalogue, id);
  if (vehicle?.charging.kind !== "complete") throw new Error(id);
  return vehicle.charging.spec.dc;
}

function station(maxPowerKw: number): DCChargingStation {
  const result = createDCChargingStation({ maxPowerKw });
  if (!result.ok) throw new Error("station");
  return result.value;
}

const interval = { fromSocPercent: 10, toSocPercent: 80 };

function seriesOf(id: string, stationKw = 150) {
  const result = dcPowerChartSeries({
    vehicle: dcOf(id),
    station: station(stationKw),
    interval,
  });
  if (!result.ok) throw new Error(JSON.stringify(result.error));
  return result.value;
}

const at = (
  samples: readonly { socPercent: number; powerKw: number }[],
  soc: number,
) => samples.find((sample) => sample.socPercent === soc)?.powerKw;

describe("chartSocSamples", () => {
  test("covers 0–100 % on a regular grid and includes every declared point", () => {
    const samples = chartSocSamples(dcOf("nordis-e4"));
    expect(samples[0]).toBe(0);
    expect(samples.at(-1)).toBe(100);
    expect(samples).toHaveLength(100 / CHART_SOC_STEP_PERCENT + 1);
    for (const point of dcOf("nordis-e4").chargingCurve) {
      expect(samples).toContain(point.socPercent);
    }
  });

  test("adds declared points that fall between grid steps, in order", () => {
    const dc = createDCChargingCapability({
      maxPowerKw: 100,
      chargingCurve: [
        { socPercent: 0, powerKw: 50 },
        { socPercent: 33.3, powerKw: 90 },
        { socPercent: 100, powerKw: 20 },
      ],
    });
    if (!dc.ok) throw new Error("dc");
    const samples = chartSocSamples(dc.value);
    expect(samples).toContain(33.3);
    expect([...samples].sort((a, b) => a - b)).toEqual(samples);
    expect(new Set(samples).size).toBe(samples.length);
  });
});

describe("dcPowerChartSeries", () => {
  test("declared points are the validated catalogue curve, unchanged", () => {
    expect(seriesOf("nordis-e4").declaredPoints).toEqual(
      dcOf("nordis-e4").chargingCurve,
    );
  });

  test("station limit and interval are the scenario's", () => {
    const series = seriesOf("aurora-vela");
    expect(series.stationMaxPowerKw).toBe(150);
    expect(series.interval).toEqual(interval);
  });

  test.each(["nordis-e4", "aurora-vela"])(
    "%s: every sample is the value of the M0.1 functions",
    (id) => {
      const vehicle = dcOf(id);
      const st = station(150);
      const series = seriesOf(id);
      expect(series.vehicleCurve.map((s) => s.socPercent)).toEqual(
        chartSocSamples(vehicle),
      );
      for (const sample of series.vehicleCurve) {
        expect(
          powerAtSoc({
            curve: vehicle.chargingCurve,
            socPercent: sample.socPercent,
          }),
        ).toEqual({ ok: true, value: sample.powerKw });
      }
      for (const sample of series.effectivePower) {
        expect(
          effectiveDcPowerAtSoc({
            socPercent: sample.socPercent,
            vehicle,
            station: st,
          }),
        ).toEqual({ ok: true, value: sample.powerKw });
      }
    },
  );

  test("Nordis E4 at 150 kW: the curve above the station limit is not received", () => {
    const series = seriesOf("nordis-e4");
    expect(at(series.vehicleCurve, 55)).toBe(175);
    expect(at(series.effectivePower, 55)).toBe(150);
    expect(at(series.vehicleCurve, 90)).toBe(70);
    expect(at(series.effectivePower, 90)).toBe(70);
    expect(Math.max(...series.effectivePower.map((s) => s.powerKw))).toBe(150);
  });

  test("Aurora Vela at 150 kW: limited by its own curve only", () => {
    const series = seriesOf("aurora-vela");
    expect(series.effectivePower).toEqual(series.vehicleCurve);
  });

  test("a 50 kW station caps the power received", () => {
    const series = seriesOf("nordis-e4", 50);
    expect(Math.max(...series.effectivePower.map((s) => s.powerKw))).toBe(50);
    expect(at(series.effectivePower, 100)).toBe(35);
  });

  test("an engine error is returned, not thrown", () => {
    const invalidStation = { type: "DC", maxPowerKw: 0 } as const;
    expect(
      dcPowerChartSeries({
        vehicle: dcOf("nordis-e4"),
        station: invalidStation,
        interval,
      }),
    ).toEqual({ ok: false, error: { type: "invalidPower", value: 0 } });
  });
});
