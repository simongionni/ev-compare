import { describe, expect, test } from "vitest";
import {
  acCapability,
  CATALOGUE_SPECIFICATION_PROVENANCE,
  createCatalogue,
  findVehicle,
  peakDcPowerKw,
  usableCapacityKwh,
  vehicleName,
  type RawCatalogueVehicle,
} from "@/data/catalogue";
import { RAW_CATALOGUE } from "@/data/catalogueData";
import { catalogue } from "@/data/vehicles";
import { simulateChargingSession } from "@/calculations/charging/chargingSession";
import { createDCChargingStation } from "@/domain/chargingFactories";

const peakOnly = (
  overrides: Partial<RawCatalogueVehicle> = {},
): RawCatalogueVehicle => ({
  id: "test-car",
  make: "Test",
  model: "Car",
  bodyType: "compact",
  seats: 5,
  listPriceEur: 30_000,
  charging: { kind: "peakDcOnly", dcMaxPowerKw: 100 },
  ...overrides,
});

const complete = (
  dc: {
    maxPowerKw: number;
    chargingCurve: { socPercent: number; powerKw: number }[];
  },
  ac = { maxPowerKw: 11, phases: 3 },
): RawCatalogueVehicle =>
  peakOnly({
    charging: { kind: "complete", usableBatteryCapacityKwh: 60, ac, dc },
  });

describe("illustrative catalogue", () => {
  test("the raw data passes validation, including the M0.1 factories", () => {
    const result = createCatalogue(RAW_CATALOGUE);
    expect(result.ok).toBe(true);
  });

  test("contains the documented vehicles with stable identifiers", () => {
    expect(catalogue.map((v) => v.id)).toEqual([
      "aurora-vela",
      "nordis-e4",
      "brisa-family",
      "talon-s",
      "meridian-tour",
    ]);
  });

  test("Nordis E4 and Aurora Vela carry complete charging data", () => {
    for (const id of ["nordis-e4", "aurora-vela"]) {
      expect(findVehicle(catalogue, id)?.charging.kind).toBe("complete");
    }
  });

  test("documented wireframe values", () => {
    const rows = catalogue.map((v) => [
      vehicleName(v),
      v.listPriceEur,
      v.seats,
      peakDcPowerKw(v),
    ]);
    expect(rows).toEqual([
      ["Aurora Vela", 32_900, 5, 135],
      ["Nordis E4", 41_500, 5, 175],
      ["Brisa Family", 44_200, 7, 130],
      ["Talon S", 44_900, 5, 250],
      ["Meridian Tour", 46_800, 5, 230],
    ]);
  });

  test("complete charging data reproduces the documented M0.1 reference values", () => {
    const station = createDCChargingStation({ maxPowerKw: 150 });
    if (!station.ok) throw new Error("station");
    const expected = { "nordis-e4": [22, 53.9], "aurora-vela": [27, 40.6] };

    for (const [id, [minutes, energy]] of Object.entries(expected)) {
      const vehicle = findVehicle(catalogue, id);
      if (vehicle?.charging.kind !== "complete") throw new Error(id);
      const result = simulateChargingSession({
        vehicle: vehicle.charging.spec,
        station: station.value,
        session: {
          initialSocPercent: 10,
          termination: { type: "targetSoc", targetSocPercent: 80 },
        },
      });
      if (!result.ok) throw new Error(JSON.stringify(result.error));
      expect(Math.round(result.value.chargingTimeHours * 60)).toBe(minutes);
      expect(result.value.deliveredEnergyKwh).toBeCloseTo(energy, 1);
    }
  });

  test("catalogue specifications are of the costruttore kind", () => {
    expect(CATALOGUE_SPECIFICATION_PROVENANCE).toBe("costruttore");
  });

  test("findVehicle returns undefined for an unknown identifier", () => {
    expect(findVehicle(catalogue, "unknown")).toBeUndefined();
  });

  test("only Nordis E4 has a documented version", () => {
    expect(
      catalogue.filter((v) => v.version !== undefined).map((v) => v.id),
    ).toEqual(["nordis-e4"]);
    expect(findVehicle(catalogue, "nordis-e4")?.version).toEqual({
      name: "Long Range",
      drivetrain: "rear",
    });
  });

  test("capacity and AC capability exist only with complete charging data", () => {
    const rows = catalogue.map((v) => [
      v.id,
      usableCapacityKwh(v),
      acCapability(v),
    ]);
    expect(rows).toEqual([
      ["aurora-vela", 58, { maxPowerKw: 11, phases: 3 }],
      ["nordis-e4", 77, { maxPowerKw: 11, phases: 3 }],
      ["brisa-family", undefined, undefined],
      ["talon-s", undefined, undefined],
      ["meridian-tour", undefined, undefined],
    ]);
  });
});

describe("createCatalogue validation", () => {
  test("rejects an empty catalogue", () => {
    expect(createCatalogue([])).toEqual({
      ok: false,
      error: { type: "emptyCatalogue" },
    });
  });

  test.each(["", "Nordis-E4", "nordis e4", "nordis--e4", "-nordis"])(
    "rejects the identifier %j",
    (id) => {
      expect(createCatalogue([peakOnly({ id })])).toEqual({
        ok: false,
        error: { type: "invalidId", index: 0, value: id },
      });
    },
  );

  test("rejects duplicate identifiers", () => {
    expect(createCatalogue([peakOnly(), peakOnly()])).toEqual({
      ok: false,
      error: { type: "duplicateId", index: 1, value: "test-car" },
    });
  });

  test.each([
    ["make", { make: " " }],
    ["model", { model: " Car" }],
  ] as const)("rejects a blank or untrimmed %s", (field, overrides) => {
    expect(createCatalogue([peakOnly(overrides)])).toEqual({
      ok: false,
      error: { type: "invalidName", vehicleId: "test-car", field },
    });
  });

  test.each(["", " Long Range"])("rejects the version name %j", (name) => {
    expect(
      createCatalogue([peakOnly({ version: { name, drivetrain: "rear" } })]),
    ).toEqual({
      ok: false,
      error: { type: "invalidVersionName", vehicleId: "test-car", value: name },
    });
  });

  test("keeps a valid version without sharing the raw object", () => {
    const version = { name: "Long Range", drivetrain: "rear" } as const;
    const result = createCatalogue([peakOnly({ version })]);
    if (!result.ok) throw new Error(JSON.stringify(result.error));
    expect(result.value[0].version).toEqual(version);
    expect(result.value[0].version).not.toBe(version);
  });

  test.each([0, 2.5, 10, Number.NaN])("rejects %d seats", (seats) => {
    expect(createCatalogue([peakOnly({ seats })])).toEqual({
      ok: false,
      error: { type: "invalidSeats", vehicleId: "test-car", value: seats },
    });
  });

  test.each([0, -1, Number.POSITIVE_INFINITY])(
    "rejects the list price %d",
    (listPriceEur) => {
      expect(createCatalogue([peakOnly({ listPriceEur })])).toEqual({
        ok: false,
        error: {
          type: "invalidListPrice",
          vehicleId: "test-car",
          value: listPriceEur,
        },
      });
    },
  );

  test("rejects an invalid peak DC power", () => {
    expect(
      createCatalogue([
        peakOnly({ charging: { kind: "peakDcOnly", dcMaxPowerKw: 0 } }),
      ]),
    ).toEqual({
      ok: false,
      error: { type: "invalidDcMaxPower", vehicleId: "test-car", value: 0 },
    });
  });

  test("rejects an invalid usable capacity", () => {
    const raw = peakOnly({
      charging: {
        kind: "complete",
        usableBatteryCapacityKwh: -5,
        ac: { maxPowerKw: 11, phases: 3 },
        dc: {
          maxPowerKw: 100,
          chargingCurve: [
            { socPercent: 0, powerKw: 50 },
            { socPercent: 100, powerKw: 20 },
          ],
        },
      },
    });
    expect(createCatalogue([raw])).toEqual({
      ok: false,
      error: {
        type: "invalidUsableCapacity",
        vehicleId: "test-car",
        value: -5,
      },
    });
  });

  test("reports an AC factory error as a catalogue error", () => {
    const raw = complete(
      {
        maxPowerKw: 100,
        chargingCurve: [
          { socPercent: 0, powerKw: 50 },
          { socPercent: 100, powerKw: 20 },
        ],
      },
      { maxPowerKw: 11, phases: 4 },
    );
    expect(createCatalogue([raw])).toEqual({
      ok: false,
      error: {
        type: "invalidAcCapability",
        vehicleId: "test-car",
        error: { type: "invalidPhases", value: 4 },
      },
    });
  });

  test("reports a DC curve factory error as a catalogue error", () => {
    const raw = complete({
      maxPowerKw: 100,
      chargingCurve: [
        { socPercent: 50, powerKw: 50 },
        { socPercent: 10, powerKw: 20 },
      ],
    });
    expect(createCatalogue([raw])).toEqual({
      ok: false,
      error: {
        type: "invalidDcCapability",
        vehicleId: "test-car",
        error: {
          type: "invalidSocOrder",
          index: 1,
          previousSocPercent: 50,
          value: 10,
        },
      },
    });
  });

  test("peakDcPowerKw reads the DC capability maximum of complete data", () => {
    const result = createCatalogue([
      complete({
        maxPowerKw: 120,
        chargingCurve: [
          { socPercent: 0, powerKw: 90 },
          { socPercent: 100, powerKw: 20 },
        ],
      }),
    ]);
    if (!result.ok) throw new Error("catalogue");
    expect(peakDcPowerKw(result.value[0])).toBe(120);
  });
});
