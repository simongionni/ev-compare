import { describe, expect, test } from "vitest";
import {
  createDcSimulationScenario,
  DC_STATION_POWERS_KW,
  DEFAULT_DC_SIMULATION_SCENARIO,
  parseDcSimulationScenario,
  resolveDcSimulationScenario,
  serializeDcSimulationScenario,
  type DcSimulationScenario,
} from "@/scenarios/dcSimulationScenario";

const parse = (query: string) =>
  parseDcSimulationScenario(new URLSearchParams(query));

describe("defaults", () => {
  test("150 kW, 10 % → 80 %", () => {
    expect(DEFAULT_DC_SIMULATION_SCENARIO).toEqual({
      stationMaxPowerKw: 150,
      initialSocPercent: 10,
      targetSocPercent: 80,
    });
  });

  test("the offered stations are 50, 150 and 350 kW", () => {
    expect(DC_STATION_POWERS_KW).toEqual([50, 150, 350]);
  });

  test("a URL without simulation parameters is the default scenario", () => {
    expect(parse("")).toEqual({
      ok: true,
      value: DEFAULT_DC_SIMULATION_SCENARIO,
    });
  });

  test("each missing parameter takes its own default", () => {
    expect(parse("colonnina=350")).toEqual({
      ok: true,
      value: {
        stationMaxPowerKw: 350,
        initialSocPercent: 10,
        targetSocPercent: 80,
      },
    });
    expect(parse("inizio=30")).toEqual({
      ok: true,
      value: {
        stationMaxPowerKw: 150,
        initialSocPercent: 30,
        targetSocPercent: 80,
      },
    });
    expect(parse("fine=95")).toEqual({
      ok: true,
      value: {
        stationMaxPowerKw: 150,
        initialSocPercent: 10,
        targetSocPercent: 95,
      },
    });
  });

  test("the origin context and unknown parameters are ignored", () => {
    expect(parse("da=cerca&q=Nordis&altro=1&colonnina=50")).toEqual({
      ok: true,
      value: { ...DEFAULT_DC_SIMULATION_SCENARIO, stationMaxPowerKw: 50 },
    });
  });
});

describe("serialisation", () => {
  test("every parameter is written, defaults included", () => {
    expect(
      serializeDcSimulationScenario(DEFAULT_DC_SIMULATION_SCENARIO).toString(),
    ).toBe("colonnina=150&inizio=10&fine=80");
  });

  const scenarios: DcSimulationScenario[] = [
    DEFAULT_DC_SIMULATION_SCENARIO,
    { stationMaxPowerKw: 50, initialSocPercent: 0, targetSocPercent: 100 },
    { stationMaxPowerKw: 350, initialSocPercent: 42, targetSocPercent: 42 },
    { stationMaxPowerKw: 150, initialSocPercent: 99, targetSocPercent: 100 },
  ];

  test.each(scenarios)("round-trips %j", (scenario) => {
    expect(
      parseDcSimulationScenario(serializeDcSimulationScenario(scenario)),
    ).toEqual({ ok: true, value: scenario });
  });

  test("round-trips through the text of a URL", () => {
    const scenario = scenarios[1];
    const text = serializeDcSimulationScenario(scenario).toString();
    expect(parse(text)).toEqual({ ok: true, value: scenario });
  });
});

describe("invalid parameters", () => {
  test.each([
    ["colonnina=50&colonnina=150", "colonnina", 2],
    ["inizio=10&inizio=20", "inizio", 2],
    ["fine=80&fine=80&fine=90", "fine", 3],
  ])("a repeated parameter is rejected: %s", (query, name, count) => {
    expect(parse(query)).toEqual({
      ok: false,
      error: { type: "repeatedParameter", name, count },
    });
  });

  test.each(["100", "0", "151", "75", "abc", "", "150.0", "-150", " 150"])(
    "a station the simulator does not offer is rejected: %j",
    (value) => {
      const result = parse(`colonnina=${encodeURIComponent(value)}`);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe("invalidStationPower");
      }
    },
  );

  test.each(["10.5", "10.0", "1e1", "abc", "", "+10", "010", " 10", "0x10"])(
    "a SoC that is not a canonical integer is rejected: %j",
    (value) => {
      expect(parse(`inizio=${encodeURIComponent(value)}`)).toEqual({
        ok: false,
        error: { type: "invalidSoc", field: "initialSocPercent", value },
      });
    },
  );

  test.each([
    ["inizio=-1", "initialSocPercent", "-1"],
    ["inizio=101", "initialSocPercent", 101],
    ["fine=101", "targetSocPercent", 101],
    ["fine=1000", "targetSocPercent", 1000],
  ])("a SoC outside 0–100 is rejected: %s", (query, field, value) => {
    expect(parse(query)).toEqual({
      ok: false,
      error: { type: "invalidSoc", field, value },
    });
  });

  test("an initial SoC above the target is rejected, not reordered", () => {
    expect(parse("inizio=90&fine=10")).toEqual({
      ok: false,
      error: {
        type: "invertedSocRange",
        initialSocPercent: 90,
        targetSocPercent: 10,
      },
    });
    // With a missing parameter, its default takes part in the check.
    expect(parse("fine=5")).toEqual({
      ok: false,
      error: {
        type: "invertedSocRange",
        initialSocPercent: 10,
        targetSocPercent: 5,
      },
    });
  });

  test("an initial SoC equal to the target is a valid scenario", () => {
    expect(parse("inizio=60&fine=60")).toEqual({
      ok: true,
      value: {
        stationMaxPowerKw: 150,
        initialSocPercent: 60,
        targetSocPercent: 60,
      },
    });
  });

  test("hostile input never throws", () => {
    for (const query of [
      "colonnina=%E0%A4%A",
      "inizio=Infinity",
      "inizio=NaN",
      `fine=${"9".repeat(400)}`,
      "colonnina=__proto__",
    ]) {
      expect(() => parse(query)).not.toThrow();
      expect(parse(query).ok).toBe(false);
    }
  });
});

describe("validation of values", () => {
  test("accepts the bounds and an empty range", () => {
    expect(
      createDcSimulationScenario({
        stationMaxPowerKw: 50,
        initialSocPercent: 0,
        targetSocPercent: 0,
      }).ok,
    ).toBe(true);
    expect(
      createDcSimulationScenario({
        stationMaxPowerKw: 350,
        initialSocPercent: 100,
        targetSocPercent: 100,
      }).ok,
    ).toBe(true);
  });

  test("reports errors in field order", () => {
    expect(
      createDcSimulationScenario({
        stationMaxPowerKw: 22,
        initialSocPercent: 0.5,
        targetSocPercent: -1,
      }),
    ).toEqual({
      ok: false,
      error: { type: "invalidStationPower", value: 22 },
    });
    expect(
      createDcSimulationScenario({
        stationMaxPowerKw: 150,
        initialSocPercent: 0.5,
        targetSocPercent: -1,
      }),
    ).toEqual({
      ok: false,
      error: { type: "invalidSoc", field: "initialSocPercent", value: 0.5 },
    });
    expect(
      createDcSimulationScenario({
        stationMaxPowerKw: 150,
        initialSocPercent: 50,
        targetSocPercent: Number.NaN,
      }),
    ).toEqual({
      ok: false,
      error: {
        type: "invalidSoc",
        field: "targetSocPercent",
        value: Number.NaN,
      },
    });
    expect(
      createDcSimulationScenario({
        stationMaxPowerKw: 150,
        initialSocPercent: 51,
        targetSocPercent: 50,
      }),
    ).toEqual({
      ok: false,
      error: {
        type: "invertedSocRange",
        initialSocPercent: 51,
        targetSocPercent: 50,
      },
    });
  });
});

describe("the scenario a URL commits to", () => {
  test("a valid URL commits its scenario", () => {
    expect(
      resolveDcSimulationScenario(
        new URLSearchParams("colonnina=50&inizio=20&fine=90"),
      ),
    ).toEqual({
      scenario: {
        stationMaxPowerKw: 50,
        initialSocPercent: 20,
        targetSocPercent: 90,
      },
    });
  });

  test("an invalid URL opens the whole default scenario and says why", () => {
    // The valid station power is not kept from an invalid scenario.
    expect(
      resolveDcSimulationScenario(
        new URLSearchParams("colonnina=350&inizio=90&fine=10"),
      ),
    ).toEqual({
      scenario: DEFAULT_DC_SIMULATION_SCENARIO,
      invalid: {
        type: "invertedSocRange",
        initialSocPercent: 90,
        targetSocPercent: 10,
      },
    });
  });
});
