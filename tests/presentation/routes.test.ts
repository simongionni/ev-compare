import { describe, expect, test } from "vitest";
import {
  contextBarLink,
  dcSimulationHref,
  DISCOVERY_PATH,
  vehicleHref,
  vehiclePath,
} from "@/presentation/routes";
import {
  DIRECT_ORIGIN,
  parseOriginContext,
  type OriginContext,
} from "@/scenarios/originContext";
import {
  parseSearchScenario,
  searchScenarioHref,
  type SearchScenario,
} from "@/scenarios/searchScenario";

const fromSearch = (query: string): OriginContext => ({
  kind: "search",
  search: { query },
});

describe("vehicle links", () => {
  test("the direct-access URL is the canonical vehicle path", () => {
    expect(vehicleHref("nordis-e4", DIRECT_ORIGIN)).toBe("/veicoli/nordis-e4");
    expect(vehiclePath("nordis-e4")).toBe("/veicoli/nordis-e4");
  });

  test("a link from Discovery carries the search", () => {
    expect(vehicleHref("nordis-e4", fromSearch("Nordis"))).toBe(
      "/veicoli/nordis-e4?da=cerca&q=Nordis",
    );
    expect(vehicleHref("nordis-e4", fromSearch(""))).toBe(
      "/veicoli/nordis-e4?da=cerca",
    );
  });

  test("the simulator link is for the same vehicle and forwards the origin", () => {
    expect(dcSimulationHref("aurora-vela", DIRECT_ORIGIN)).toBe(
      "/veicoli/aurora-vela/simulazione-dc",
    );
    expect(dcSimulationHref("aurora-vela", fromSearch("Aurora"))).toBe(
      "/veicoli/aurora-vela/simulazione-dc?da=cerca&q=Aurora",
    );
  });
});

describe("contextBarLink", () => {
  test("opened directly: ‹ Cerca, to Discovery", () => {
    expect(contextBarLink(DIRECT_ORIGIN)).toEqual({
      label: "Cerca",
      href: DISCOVERY_PATH,
    });
  });

  test("opened from Discovery: ‹ Risultati, to the same search", () => {
    expect(contextBarLink(fromSearch("Nordis"))).toEqual({
      label: "Risultati",
      href: "/cerca?q=Nordis",
    });
    expect(contextBarLink(fromSearch(""))).toEqual({
      label: "Risultati",
      href: "/cerca",
    });
  });
});

/** Parses the query string of a relative href. */
const paramsOf = (href: string) =>
  new URL(href, "http://localhost").searchParams;

describe("the search scenario survives the round trip", () => {
  test.each<SearchScenario>([
    { query: "" },
    { query: "Nordis" },
    { query: "aurora vela" },
    { query: "€ & ?" },
  ])(
    "Discovery → analysis → simulator → analysis → Discovery: %j",
    (search) => {
      const discoveryHref = searchScenarioHref(DISCOVERY_PATH, search);

      // Discovery → Vehicle Analysis
      const analysisOrigin = parseOriginContext(
        paramsOf(vehicleHref("nordis-e4", { kind: "search", search })),
      );
      if (!analysisOrigin.ok) throw new Error(JSON.stringify(analysisOrigin));

      // Vehicle Analysis → simulator → back to the analysis
      const simulatorOrigin = parseOriginContext(
        paramsOf(dcSimulationHref("nordis-e4", analysisOrigin.value)),
      );
      if (!simulatorOrigin.ok) throw new Error(JSON.stringify(simulatorOrigin));
      const backOrigin = parseOriginContext(
        paramsOf(vehicleHref("nordis-e4", simulatorOrigin.value)),
      );
      if (!backOrigin.ok) throw new Error(JSON.stringify(backOrigin));

      // Vehicle Analysis → ‹ Risultati
      const link = contextBarLink(backOrigin.value);
      expect(link.label).toBe("Risultati");
      expect(link.href).toBe(discoveryHref);
      expect(parseSearchScenario(paramsOf(link.href))).toEqual({
        ok: true,
        value: search,
      });
    },
  );
});
