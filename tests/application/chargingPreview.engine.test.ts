/**
 * Proves that the Ricarica preview takes its values from the M0.1 public API and computes none
 * itself: the engine functions are replaced with sentinel values, and the preview must show
 * exactly those values. A second implementation of the interpolation, the cap or the session
 * would not produce them.
 */
import { afterEach, describe, expect, test, vi } from "vitest";
import * as chargingSession from "@/calculations/charging/chargingSession";
import * as dcCurve from "@/calculations/charging/dcCurve";
import * as dcPower from "@/calculations/charging/dcPower";
import { chargingPreview } from "@/application/chargingPreview";
import { chartSocSamples } from "@/application/dcPowerChartSeries";
import { findVehicle } from "@/data/catalogue";
import { catalogue } from "@/data/vehicles";

type SessionModule = typeof import("@/calculations/charging/chargingSession");
type CurveModule = typeof import("@/calculations/charging/dcCurve");
type PowerModule = typeof import("@/calculations/charging/dcPower");

vi.mock("@/calculations/charging/chargingSession", async (importOriginal) => {
  const actual = await importOriginal<SessionModule>();
  return {
    ...actual,
    simulateChargingSession: vi.fn(actual.simulateChargingSession),
  };
});
vi.mock("@/calculations/charging/dcCurve", async (importOriginal) => {
  const actual = await importOriginal<CurveModule>();
  return { ...actual, powerAtSoc: vi.fn(actual.powerAtSoc) };
});
vi.mock("@/calculations/charging/dcPower", async (importOriginal) => {
  const actual = await importOriginal<PowerModule>();
  return {
    ...actual,
    effectiveDcPowerAtSoc: vi.fn(actual.effectiveDcPowerAtSoc),
  };
});

const actualSession = await vi.importActual<SessionModule>(
  "@/calculations/charging/chargingSession",
);
const actualCurve = await vi.importActual<CurveModule>(
  "@/calculations/charging/dcCurve",
);
const actualPower = await vi.importActual<PowerModule>(
  "@/calculations/charging/dcPower",
);

const simulateMock = vi.mocked(chargingSession.simulateChargingSession);
const powerAtSocMock = vi.mocked(dcCurve.powerAtSoc);
const effectiveMock = vi.mocked(dcPower.effectiveDcPowerAtSoc);

const SENTINEL_SIMULATION = {
  initialSocPercent: 10,
  finalSocPercent: 80,
  chargingTimeHours: 0.123456,
  deliveredEnergyKwh: 12.3456,
  terminationReason: "targetReached",
} as const;

function nordis() {
  const vehicle = findVehicle(catalogue, "nordis-e4");
  if (vehicle?.charging.kind !== "complete") throw new Error("nordis");
  return { vehicle, spec: vehicle.charging.spec };
}

afterEach(() => {
  simulateMock.mockReset();
  simulateMock.mockImplementation(actualSession.simulateChargingSession);
  powerAtSocMock.mockReset();
  powerAtSocMock.mockImplementation(actualCurve.powerAtSoc);
  effectiveMock.mockReset();
  effectiveMock.mockImplementation(actualPower.effectiveDcPowerAtSoc);
});

describe("the Ricarica preview uses the M0.1 engine", () => {
  test("time, energy and SoC interval are simulateChargingSession's result", () => {
    simulateMock.mockReturnValueOnce({ ok: true, value: SENTINEL_SIMULATION });
    const { vehicle, spec } = nordis();

    const result = chargingPreview(vehicle);

    expect(simulateMock).toHaveBeenCalledTimes(1);
    expect(simulateMock).toHaveBeenCalledWith({
      vehicle: spec,
      station: { type: "DC", maxPowerKw: 150 },
      session: {
        initialSocPercent: 10,
        termination: { type: "targetSoc", targetSocPercent: 80 },
      },
    });
    expect(result).toMatchObject({
      ok: true,
      value: { kind: "available", simulation: SENTINEL_SIMULATION },
    });
  });

  test("the chart's SoC interval is the simulated session's", () => {
    simulateMock.mockReturnValueOnce({
      ok: true,
      value: {
        ...SENTINEL_SIMULATION,
        initialSocPercent: 12,
        finalSocPercent: 77,
      },
    });
    const result = chargingPreview(nordis().vehicle);
    expect(result).toMatchObject({
      ok: true,
      value: { chart: { interval: { fromSocPercent: 12, toSocPercent: 77 } } },
    });
  });

  test("the power received is effectiveDcPowerAtSoc's value at every sample", () => {
    simulateMock.mockReturnValueOnce({ ok: true, value: SENTINEL_SIMULATION });
    effectiveMock.mockReturnValue({ ok: true, value: 42 });
    const { vehicle, spec } = nordis();

    const result = chargingPreview(vehicle);
    if (!result.ok || result.value.kind !== "available") {
      throw new Error(JSON.stringify(result));
    }

    const samples = chartSocSamples(spec.dc);
    expect(result.value.chart.effectivePower).toEqual(
      samples.map((socPercent) => ({ socPercent, powerKw: 42 })),
    );
    expect(effectiveMock.mock.calls.map(([input]) => input)).toEqual(
      samples.map((socPercent) => ({
        socPercent,
        vehicle: spec.dc,
        station: { type: "DC", maxPowerKw: 150 },
      })),
    );
  });

  test("the vehicle curve is powerAtSoc's value at every sample", () => {
    simulateMock.mockReturnValueOnce({ ok: true, value: SENTINEL_SIMULATION });
    powerAtSocMock.mockReturnValue({ ok: true, value: 7 });
    const { vehicle, spec } = nordis();

    const result = chargingPreview(vehicle);
    if (!result.ok || result.value.kind !== "available") {
      throw new Error(JSON.stringify(result));
    }

    expect(result.value.chart.vehicleCurve).toEqual(
      chartSocSamples(spec.dc).map((socPercent) => ({
        socPercent,
        powerKw: 7,
      })),
    );
  });

  test("an engine error of the chart is reported with its type", () => {
    simulateMock.mockReturnValueOnce({ ok: true, value: SENTINEL_SIMULATION });
    effectiveMock.mockReturnValue({
      ok: false,
      error: { type: "invalidPower", value: -1 },
    });
    expect(chargingPreview(nordis().vehicle)).toEqual({
      ok: false,
      error: { type: "chart", error: { type: "invalidPower", value: -1 } },
    });
  });
});
