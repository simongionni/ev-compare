import { describe, expect, test } from "vitest";
import { resolveVehicleAnalysis } from "@/application/vehicleAnalysis";
import { catalogue } from "@/data/vehicles";
import { DIRECT_ORIGIN } from "@/scenarios/originContext";

const resolve = (id: string, search = "") =>
  resolveVehicleAnalysis(catalogue, id, new URLSearchParams(search));

describe("resolveVehicleAnalysis", () => {
  test("finds the vehicle by its stable identifier", () => {
    const analysis = resolve("nordis-e4");
    expect(analysis?.vehicle.id).toBe("nordis-e4");
    expect(analysis?.vehicle.make).toBe("Nordis");
  });

  test.each(["unknown", "", "Nordis-E4", "nordis-e4/simulazione-dc"])(
    "an unknown identifier %j has no analysis",
    (id) => {
      expect(resolve(id)).toBeUndefined();
    },
  );

  test("direct access works without any previous state", () => {
    expect(resolve("nordis-e4")?.origin).toEqual(DIRECT_ORIGIN);
  });

  test("opened from Discovery: the search to return to", () => {
    expect(resolve("nordis-e4", "da=cerca&q=Nordis")?.origin).toEqual({
      kind: "search",
      search: { query: "Nordis" },
    });
  });

  test("invalid origin parameters open the page as a direct visit", () => {
    for (const search of [
      "da=altro",
      "da=cerca&da=cerca",
      "da=cerca&q=a&q=b",
    ]) {
      expect(resolve("aurora-vela", search)?.origin).toEqual(DIRECT_ORIGIN);
    }
  });

  test("a vehicle with complete data has a calculated preview", () => {
    expect(resolve("aurora-vela")?.charging).toMatchObject({
      ok: true,
      value: { kind: "available" },
    });
  });

  test("a vehicle with incomplete data still has an analysis, without a calculation", () => {
    const analysis = resolve("talon-s", "da=cerca&q=talon");
    expect(analysis?.vehicle.id).toBe("talon-s");
    expect(analysis?.charging).toEqual({
      ok: true,
      value: { kind: "missingChargingData" },
    });
  });
});
