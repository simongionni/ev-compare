import { describe, expect, test } from "vitest";
import {
  compareByListPrice,
  matchesSearchQuery,
  searchCatalogue,
} from "@/application/vehicleSearch";
import { createCatalogue, type RawCatalogueVehicle } from "@/data/catalogue";
import { catalogue } from "@/data/vehicles";

const names = (query: string) =>
  searchCatalogue(catalogue, { query }).map((v) => `${v.make} ${v.model}`);

const fixture = (
  id: string,
  make: string,
  model: string,
  listPriceEur: number,
): RawCatalogueVehicle => ({
  id,
  make,
  model,
  bodyType: "compact",
  seats: 5,
  listPriceEur,
  charging: { kind: "peakDcOnly", dcMaxPowerKw: 100 },
});

const fixtureCatalogue = (() => {
  const result = createCatalogue([
    fixture("nordis-e4", "Nordis", "E4", 41_500),
    fixture("aurora-vela", "Aurora", "Vela", 32_900),
    fixture("nordis-e2", "Nordis", "E2", 29_900),
    fixture("vela-one", "Vela", "One", 32_900),
  ]);
  if (!result.ok) throw new Error("fixture");
  return result.value;
})();

describe("search without a query", () => {
  test("shows the whole catalogue in increasing price order", () => {
    expect(names("")).toEqual([
      "Aurora Vela",
      "Nordis E4",
      "Brisa Family",
      "Talon S",
      "Meridian Tour",
    ]);
  });

  test("a blank query behaves as no query", () => {
    expect(names("   ")).toEqual(names(""));
  });
});

describe("search by make or model", () => {
  test("matches the make", () => {
    expect(names("Nordis")).toEqual(["Nordis E4"]);
  });

  test("matches the model", () => {
    expect(names("Vela")).toEqual(["Aurora Vela"]);
  });

  test("matches the full name", () => {
    expect(names("nordis e4")).toEqual(["Nordis E4"]);
  });

  test("matches part of a make or model", () => {
    expect(names("nor")).toEqual(["Nordis E4"]);
    expect(names("our")).toEqual(["Meridian Tour"]);
  });

  test("is case-insensitive", () => {
    expect(names("NORDIS")).toEqual(["Nordis E4"]);
    expect(names("bRiSa")).toEqual(["Brisa Family"]);
  });

  test("ignores surrounding spaces", () => {
    expect(names("  talon ")).toEqual(["Talon S"]);
  });

  test("a query without matches gives no results", () => {
    expect(names("xyz")).toEqual([]);
    expect(names("e4 nordis")).toEqual([]);
  });

  test("a make shows every vehicle of that make and no other", () => {
    const ids = searchCatalogue(fixtureCatalogue, { query: "Nordis" }).map(
      (v) => v.id,
    );
    expect(ids).toEqual(["nordis-e2", "nordis-e4"]);
  });

  test("filtered results keep increasing price order", () => {
    const ids = searchCatalogue(fixtureCatalogue, { query: "e" }).map(
      (v) => v.id,
    );
    expect(ids).toEqual(["nordis-e2", "aurora-vela", "vela-one", "nordis-e4"]);
  });
});

describe("ordering", () => {
  test("equal prices are ordered by name", () => {
    const [aurora, vela] = [fixtureCatalogue[1], fixtureCatalogue[3]];
    expect(compareByListPrice(aurora, vela)).toBeLessThan(0);
    expect(compareByListPrice(vela, aurora)).toBeGreaterThan(0);
  });

  test("searching does not mutate the catalogue", () => {
    const before = fixtureCatalogue.map((v) => v.id);
    searchCatalogue(fixtureCatalogue, { query: "" });
    expect(fixtureCatalogue.map((v) => v.id)).toEqual(before);
  });
});

describe("matchesSearchQuery", () => {
  test("an empty query matches every vehicle", () => {
    expect(catalogue.every((v) => matchesSearchQuery(v, ""))).toBe(true);
  });
});
