import { describe, expect, test } from "vitest";
import {
  contextBarLink,
  dcSimulationHref,
  DISCOVERY_PATH,
  simulationReturnLink,
  vehicleHref,
  vehiclePath,
} from "@/presentation/routes";
import {
  DIRECT_ORIGIN,
  parseOriginContext,
  type OriginContext,
} from "@/scenarios/originContext";
import {
  DEFAULT_DC_SIMULATION_SCENARIO,
  parseDcSimulationScenario,
  resolveDcSimulationScenario,
  type DcSimulationScenario,
} from "@/scenarios/dcSimulationScenario";
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

describe("DC simulation URLs", () => {
  const scenario: DcSimulationScenario = {
    stationMaxPowerKw: 50,
    initialSocPercent: 20,
    targetSocPercent: 90,
  };

  test("direct access: no parameters, so the default scenario and no origin", () => {
    const href = dcSimulationHref("nordis-e4", DIRECT_ORIGIN);
    expect(href).toBe("/veicoli/nordis-e4/simulazione-dc");
    expect(resolveDcSimulationScenario(paramsOf(href))).toEqual({
      scenario: DEFAULT_DC_SIMULATION_SCENARIO,
    });
    expect(parseOriginContext(paramsOf(href))).toEqual({
      ok: true,
      value: DIRECT_ORIGIN,
    });
  });

  test("a scenario URL keeps the origin and restores the scenario", () => {
    const href = dcSimulationHref("nordis-e4", fromSearch("Nordis"), scenario);
    expect(href).toBe(
      "/veicoli/nordis-e4/simulazione-dc?da=cerca&q=Nordis&colonnina=50&inizio=20&fine=90",
    );
    expect(parseDcSimulationScenario(paramsOf(href))).toEqual({
      ok: true,
      value: scenario,
    });
    expect(parseOriginContext(paramsOf(href))).toEqual({
      ok: true,
      value: fromSearch("Nordis"),
    });
  });

  test("a shared scenario URL opened directly needs nothing else", () => {
    const href = dcSimulationHref("aurora-vela", DIRECT_ORIGIN, scenario);
    expect(href).toBe(
      "/veicoli/aurora-vela/simulazione-dc?colonnina=50&inizio=20&fine=90",
    );
    expect(resolveDcSimulationScenario(paramsOf(href))).toEqual({ scenario });
  });
});

describe("simulationReturnLink (‹ vehicle name)", () => {
  test("opened directly: the canonical analysis of the same vehicle", () => {
    expect(
      simulationReturnLink("nordis-e4", "Nordis E4", DIRECT_ORIGIN),
    ).toEqual({ label: "Nordis E4", href: "/veicoli/nordis-e4" });
  });

  test("opened from Discovery: the analysis keeps its way back to the search", () => {
    const link = simulationReturnLink(
      "nordis-e4",
      "Nordis E4",
      fromSearch("Nordis"),
    );
    expect(link).toEqual({
      label: "Nordis E4",
      href: "/veicoli/nordis-e4?da=cerca&q=Nordis",
    });
    const analysisOrigin = parseOriginContext(paramsOf(link.href));
    if (!analysisOrigin.ok) throw new Error(JSON.stringify(analysisOrigin));
    expect(contextBarLink(analysisOrigin.value)).toEqual({
      label: "Risultati",
      href: "/cerca?q=Nordis",
    });
  });

  test("the scenario does not leak into the analysis URL", () => {
    // The simulator's own origin is parsed from a URL that also holds the scenario.
    const simulatorHref = dcSimulationHref(
      "nordis-e4",
      fromSearch("Nordis"),
      DEFAULT_DC_SIMULATION_SCENARIO,
    );
    const origin = parseOriginContext(paramsOf(simulatorHref));
    if (!origin.ok) throw new Error(JSON.stringify(origin));
    expect(
      simulationReturnLink("nordis-e4", "Nordis E4", origin.value).href,
    ).toBe("/veicoli/nordis-e4?da=cerca&q=Nordis");
  });
});
