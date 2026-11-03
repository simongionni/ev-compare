import type { CalculationResult } from "@/calculations/result";
import type {
  DCChargingCapability,
  RawACChargingCapability,
  RawDCChargingCapability,
  VehicleChargingSpec,
} from "@/domain/charging";
import type {
  ACChargingCapabilityValidationError,
  DCChargingCapabilityValidationError,
} from "@/domain/chargingErrors";
import {
  createACChargingCapability,
  createDCChargingCapability,
} from "@/domain/chargingFactories";
import type { ProvenanceKind } from "@/data/provenance";

/** Stable identifier of a catalogue vehicle, used in URLs: lowercase words joined by hyphens. */
export type VehicleId = string;

export type BodyType =
  "compact" | "midSizeSuv" | "mpv" | "sportsSedan" | "estate";

/**
 * Charging data of a vehicle as written in the catalogue source.
 * - `complete`: everything the M0.1 engine needs; validated through the M0.1 factories.
 * - `peakDcOnly`: only the peak DC power is documented for the vehicle.
 */
export type RawCatalogueCharging =
  | {
      kind: "complete";
      usableBatteryCapacityKwh: number;
      ac: RawACChargingCapability;
      dc: RawDCChargingCapability;
    }
  | {
      kind: "peakDcOnly";
      dcMaxPowerKw: number;
    };

export type RawCatalogueVehicle = {
  id: string;
  make: string;
  model: string;
  bodyType: BodyType;
  seats: number;
  listPriceEur: number;
  charging: RawCatalogueCharging;
};

export type CatalogueCharging =
  | {
      kind: "complete";
      spec: VehicleChargingSpec & { dc: DCChargingCapability };
    }
  | {
      kind: "peakDcOnly";
      dcMaxPowerKw: number;
    };

export type CatalogueVehicle = {
  readonly id: VehicleId;
  readonly make: string;
  readonly model: string;
  readonly bodyType: BodyType;
  readonly seats: number;
  readonly listPriceEur: number;
  readonly charging: CatalogueCharging;
};

export type Catalogue = readonly CatalogueVehicle[];

export type CatalogueValidationError =
  | { type: "emptyCatalogue" }
  | { type: "invalidId"; index: number; value: string }
  | { type: "duplicateId"; index: number; value: string }
  | { type: "invalidName"; vehicleId: string; field: "make" | "model" }
  | { type: "invalidSeats"; vehicleId: string; value: number }
  | { type: "invalidListPrice"; vehicleId: string; value: number }
  | { type: "invalidUsableCapacity"; vehicleId: string; value: number }
  | { type: "invalidDcMaxPower"; vehicleId: string; value: number }
  | {
      type: "invalidAcCapability";
      vehicleId: string;
      error: ACChargingCapabilityValidationError;
    }
  | {
      type: "invalidDcCapability";
      vehicleId: string;
      error: DCChargingCapabilityValidationError;
    };

/**
 * Provenance kind of every catalogue specification (price, capacity, AC/DC power, DC curve).
 * In the slice `costruttore` names the kind of value, not a claim that a real manufacturer
 * declared it: the whole catalogue is illustrative.
 */
export const CATALOGUE_SPECIFICATION_PROVENANCE: ProvenanceKind = "costruttore";

const VEHICLE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SEATS = 9;

const isPositiveFinite = (value: number) => Number.isFinite(value) && value > 0;

function createCharging(
  vehicleId: string,
  raw: RawCatalogueCharging,
): CalculationResult<CatalogueCharging, CatalogueValidationError> {
  if (raw.kind === "peakDcOnly") {
    if (!isPositiveFinite(raw.dcMaxPowerKw)) {
      return {
        ok: false,
        error: {
          type: "invalidDcMaxPower",
          vehicleId,
          value: raw.dcMaxPowerKw,
        },
      };
    }
    return {
      ok: true,
      value: { kind: "peakDcOnly", dcMaxPowerKw: raw.dcMaxPowerKw },
    };
  }

  if (!isPositiveFinite(raw.usableBatteryCapacityKwh)) {
    return {
      ok: false,
      error: {
        type: "invalidUsableCapacity",
        vehicleId,
        value: raw.usableBatteryCapacityKwh,
      },
    };
  }

  const ac = createACChargingCapability(raw.ac);
  if (!ac.ok) {
    return {
      ok: false,
      error: { type: "invalidAcCapability", vehicleId, error: ac.error },
    };
  }

  const dc = createDCChargingCapability(raw.dc);
  if (!dc.ok) {
    return {
      ok: false,
      error: { type: "invalidDcCapability", vehicleId, error: dc.error },
    };
  }

  return {
    ok: true,
    value: {
      kind: "complete",
      spec: {
        usableBatteryCapacityKwh: raw.usableBatteryCapacityKwh,
        ac: ac.value,
        dc: dc.value,
      },
    },
  };
}

/**
 * Validates raw catalogue data. Charging data enters through the M0.1 factories; any invalid
 * value is a catalogue error and never reaches the engine.
 */
export function createCatalogue(
  raw: readonly RawCatalogueVehicle[],
): CalculationResult<Catalogue, CatalogueValidationError> {
  if (raw.length === 0) {
    return { ok: false, error: { type: "emptyCatalogue" } };
  }

  const seenIds = new Set<string>();
  const vehicles: CatalogueVehicle[] = [];

  for (const [index, item] of raw.entries()) {
    if (!VEHICLE_ID_PATTERN.test(item.id)) {
      return {
        ok: false,
        error: { type: "invalidId", index, value: item.id },
      };
    }
    if (seenIds.has(item.id)) {
      return {
        ok: false,
        error: { type: "duplicateId", index, value: item.id },
      };
    }
    seenIds.add(item.id);

    for (const field of ["make", "model"] as const) {
      if (item[field].trim() === "" || item[field] !== item[field].trim()) {
        return {
          ok: false,
          error: { type: "invalidName", vehicleId: item.id, field },
        };
      }
    }

    if (
      !Number.isInteger(item.seats) ||
      item.seats < 1 ||
      item.seats > MAX_SEATS
    ) {
      return {
        ok: false,
        error: { type: "invalidSeats", vehicleId: item.id, value: item.seats },
      };
    }

    if (!isPositiveFinite(item.listPriceEur)) {
      return {
        ok: false,
        error: {
          type: "invalidListPrice",
          vehicleId: item.id,
          value: item.listPriceEur,
        },
      };
    }

    const charging = createCharging(item.id, item.charging);
    if (!charging.ok) {
      return charging;
    }

    vehicles.push({
      id: item.id,
      make: item.make,
      model: item.model,
      bodyType: item.bodyType,
      seats: item.seats,
      listPriceEur: item.listPriceEur,
      charging: charging.value,
    });
  }

  return { ok: true, value: vehicles };
}

/** Display name of a vehicle: make and model. */
export function vehicleName(vehicle: CatalogueVehicle): string {
  return `${vehicle.make} ${vehicle.model}`;
}

/** Peak DC charging power declared for the vehicle (the DC capability maximum when complete). */
export function peakDcPowerKw(vehicle: CatalogueVehicle): number {
  return vehicle.charging.kind === "complete"
    ? vehicle.charging.spec.dc.maxPowerKw
    : vehicle.charging.dcMaxPowerKw;
}

export function findVehicle(
  catalogue: Catalogue,
  id: string,
): CatalogueVehicle | undefined {
  return catalogue.find((vehicle) => vehicle.id === id);
}
