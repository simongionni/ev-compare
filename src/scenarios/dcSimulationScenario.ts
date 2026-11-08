import type { CalculationResult } from "@/calculations/result";
import type { SearchParamsReader } from "@/scenarios/searchScenario";

/**
 * Scenario of the dedicated DC simulation of one vehicle (M0.2 slice, DC simulation): the station
 * power and the state-of-charge range. The vehicle is identified by the route, not by this model.
 *
 * Framework independent. The URL is the authoritative source of the committed scenario
 * (ADR 0001, Decision 1). Parameter names are an implementation choice of the slice, not a
 * definitive URL schema (ADR 0001 open question 4).
 *
 * The SoC rules below are interface and scenario rules (M0.2 slice, State of charge range): they
 * are not M0.1 invariants, and the engine's own validation is unchanged.
 */
export type DcSimulationScenario = {
  readonly stationMaxPowerKw: DcStationPowerKw;
  /** Integer percentage, 0–100, not above the target. */
  readonly initialSocPercent: number;
  /** Integer percentage, 0–100, not below the initial SoC. */
  readonly targetSocPercent: number;
};

/** The station powers the simulator offers, as in the wireframes. */
export const DC_STATION_POWERS_KW = [50, 150, 350] as const;

export type DcStationPowerKw = (typeof DC_STATION_POWERS_KW)[number];

export const MIN_SOC_PERCENT = 0;
export const MAX_SOC_PERCENT = 100;
/** Granularity of the SoC controls and of a valid scenario. */
export const SOC_STEP_PERCENT = 1;

/** The scenario shown when the URL gives none: 150 kW, 10 % → 80 %. */
export const DEFAULT_DC_SIMULATION_SCENARIO: DcSimulationScenario = {
  stationMaxPowerKw: 150,
  initialSocPercent: 10,
  targetSocPercent: 80,
};

export const STATION_POWER_PARAM = "colonnina";
export const INITIAL_SOC_PARAM = "inizio";
export const TARGET_SOC_PARAM = "fine";

export type SocField = "initialSocPercent" | "targetSocPercent";

export type DcSimulationScenarioError =
  | { type: "repeatedParameter"; name: string; count: number }
  | { type: "invalidStationPower"; value: string | number }
  | { type: "invalidSoc"; field: SocField; value: string | number }
  | {
      type: "invertedSocRange";
      initialSocPercent: number;
      targetSocPercent: number;
    };

export function isDcStationPowerKw(value: number): value is DcStationPowerKw {
  return (DC_STATION_POWERS_KW as readonly number[]).includes(value);
}

function isValidSoc(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= MIN_SOC_PERCENT &&
    value <= MAX_SOC_PERCENT
  );
}

/**
 * Validates scenario values: an offered station power, integer SoC values within 0–100 and an
 * initial SoC not above the target (initial = target is a valid, empty session). Errors are
 * reported in field order: station, initial SoC, target SoC, range.
 */
export function createDcSimulationScenario(input: {
  stationMaxPowerKw: number;
  initialSocPercent: number;
  targetSocPercent: number;
}): CalculationResult<DcSimulationScenario, DcSimulationScenarioError> {
  const { stationMaxPowerKw, initialSocPercent, targetSocPercent } = input;

  if (!isDcStationPowerKw(stationMaxPowerKw)) {
    return {
      ok: false,
      error: { type: "invalidStationPower", value: stationMaxPowerKw },
    };
  }
  if (!isValidSoc(initialSocPercent)) {
    return {
      ok: false,
      error: {
        type: "invalidSoc",
        field: "initialSocPercent",
        value: initialSocPercent,
      },
    };
  }
  if (!isValidSoc(targetSocPercent)) {
    return {
      ok: false,
      error: {
        type: "invalidSoc",
        field: "targetSocPercent",
        value: targetSocPercent,
      },
    };
  }
  if (initialSocPercent > targetSocPercent) {
    return {
      ok: false,
      error: { type: "invertedSocRange", initialSocPercent, targetSocPercent },
    };
  }

  return {
    ok: true,
    value: { stationMaxPowerKw, initialSocPercent, targetSocPercent },
  };
}

/** Canonical decimal integer: no sign, no leading zeros, no fraction, no exponent, no spaces. */
const CANONICAL_INTEGER = /^(?:0|[1-9][0-9]*)$/;

type ParameterValue =
  | { kind: "absent" }
  | { kind: "integer"; value: number }
  | { kind: "invalid"; raw: string };

function readSingle(
  params: SearchParamsReader,
  name: string,
): CalculationResult<ParameterValue, DcSimulationScenarioError> {
  const values = params.getAll(name);
  if (values.length > 1) {
    return {
      ok: false,
      error: { type: "repeatedParameter", name, count: values.length },
    };
  }
  if (values.length === 0) {
    return { ok: true, value: { kind: "absent" } };
  }
  const [raw] = values;
  return {
    ok: true,
    value: CANONICAL_INTEGER.test(raw)
      ? { kind: "integer", value: Number(raw) }
      : { kind: "invalid", raw },
  };
}

/**
 * Parses untrusted URL parameters into a validated scenario.
 *
 * - A missing parameter takes its default value (150 kW, 10 %, 80 %), so a URL without
 *   simulation parameters is the default scenario.
 * - A parameter given more than once, a value that is not a canonical integer, a station power
 *   the simulator does not offer, a SoC outside 0–100 or an initial SoC above the target is an
 *   error: the URL does not describe a valid scenario. Nothing is clamped or rounded.
 * - Other parameters (the origin context, future parameters) are ignored.
 *
 * Never throws.
 */
export function parseDcSimulationScenario(
  params: SearchParamsReader,
): CalculationResult<DcSimulationScenario, DcSimulationScenarioError> {
  const station = readSingle(params, STATION_POWER_PARAM);
  if (!station.ok) return station;
  const initial = readSingle(params, INITIAL_SOC_PARAM);
  if (!initial.ok) return initial;
  const target = readSingle(params, TARGET_SOC_PARAM);
  if (!target.ok) return target;

  if (station.value.kind === "invalid") {
    return {
      ok: false,
      error: { type: "invalidStationPower", value: station.value.raw },
    };
  }
  if (initial.value.kind === "invalid") {
    return {
      ok: false,
      error: {
        type: "invalidSoc",
        field: "initialSocPercent",
        value: initial.value.raw,
      },
    };
  }
  if (target.value.kind === "invalid") {
    return {
      ok: false,
      error: {
        type: "invalidSoc",
        field: "targetSocPercent",
        value: target.value.raw,
      },
    };
  }

  const valueOr = (parameter: ParameterValue, fallback: number) =>
    parameter.kind === "integer" ? parameter.value : fallback;

  return createDcSimulationScenario({
    stationMaxPowerKw: valueOr(
      station.value,
      DEFAULT_DC_SIMULATION_SCENARIO.stationMaxPowerKw,
    ),
    initialSocPercent: valueOr(
      initial.value,
      DEFAULT_DC_SIMULATION_SCENARIO.initialSocPercent,
    ),
    targetSocPercent: valueOr(
      target.value,
      DEFAULT_DC_SIMULATION_SCENARIO.targetSocPercent,
    ),
  });
}

/**
 * Serialises a scenario into URL parameters. Every parameter is written, defaults included, so a
 * shared URL keeps describing the same scenario even if the defaults change.
 */
export function serializeDcSimulationScenario(
  scenario: DcSimulationScenario,
): URLSearchParams {
  return new URLSearchParams({
    [STATION_POWER_PARAM]: String(scenario.stationMaxPowerKw),
    [INITIAL_SOC_PARAM]: String(scenario.initialSocPercent),
    [TARGET_SOC_PARAM]: String(scenario.targetSocPercent),
  });
}

export function dcSimulationScenariosEqual(
  a: DcSimulationScenario,
  b: DcSimulationScenario,
): boolean {
  return (
    a.stationMaxPowerKw === b.stationMaxPowerKw &&
    a.initialSocPercent === b.initialSocPercent &&
    a.targetSocPercent === b.targetSocPercent
  );
}

/** The committed scenario of a simulation URL, and why the URL was set aside, if it was. */
export type ResolvedDcSimulationScenario = {
  readonly scenario: DcSimulationScenario;
  /** Present when the URL's simulation parameters do not describe a valid scenario. */
  readonly invalid?: DcSimulationScenarioError;
};

/**
 * The scenario a simulation URL commits to. A URL whose parameters are not a valid scenario
 * opens the default scenario as a whole (no field of an invalid scenario is kept), and reports
 * why, so the page can say so. One deterministic policy for every invalid input; how partially
 * invalid URLs should be presented in general is ADR 0001 open question 4.
 */
export function resolveDcSimulationScenario(
  params: SearchParamsReader,
): ResolvedDcSimulationScenario {
  const parsed = parseDcSimulationScenario(params);
  return parsed.ok
    ? { scenario: parsed.value }
    : { scenario: DEFAULT_DC_SIMULATION_SCENARIO, invalid: parsed.error };
}
