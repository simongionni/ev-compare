import type { CalculationResult } from "@/calculations/result";

/**
 * Search scenario of Discovery: the direct search by make or model.
 *
 * Framework independent. The URL is the authoritative source of the committed scenario
 * (ADR 0001, Decision 1). The parameter name below is an implementation choice for the first
 * vertical slice, not a definitive URL schema (ADR 0001 open question 4).
 */
export type SearchScenario = {
  /** Normalised query: trimmed; empty means no query. */
  readonly query: string;
};

export const SEARCH_QUERY_PARAM = "q";
export const MAX_SEARCH_QUERY_LENGTH = 100;

export const DEFAULT_SEARCH_SCENARIO: SearchScenario = { query: "" };

export type SearchScenarioError =
  | { type: "repeatedParameter"; name: string; count: number }
  | { type: "queryTooLong"; length: number; maxLength: number };

/** Minimal read-only view of URL search parameters (URLSearchParams satisfies it). */
export type SearchParamsReader = {
  getAll(name: string): string[];
};

/** Normalises user input into the query a scenario holds. */
export function normalizeSearchQuery(raw: string): string {
  return raw.trim();
}

/**
 * Parses untrusted URL parameters into a validated search scenario. Unknown parameters are
 * ignored so that the representation can evolve.
 */
export function parseSearchScenario(
  params: SearchParamsReader,
): CalculationResult<SearchScenario, SearchScenarioError> {
  const values = params.getAll(SEARCH_QUERY_PARAM);

  if (values.length > 1) {
    return {
      ok: false,
      error: {
        type: "repeatedParameter",
        name: SEARCH_QUERY_PARAM,
        count: values.length,
      },
    };
  }

  const query = normalizeSearchQuery(values[0] ?? "");

  if (query.length > MAX_SEARCH_QUERY_LENGTH) {
    return {
      ok: false,
      error: {
        type: "queryTooLong",
        length: query.length,
        maxLength: MAX_SEARCH_QUERY_LENGTH,
      },
    };
  }

  return { ok: true, value: { query } };
}

/**
 * Serialises a scenario into URL parameters. The default scenario serialises to no parameters,
 * so the plain Discovery URL is the catalogue in price order.
 */
export function serializeSearchScenario(
  scenario: SearchScenario,
): URLSearchParams {
  const params = new URLSearchParams();
  const query = normalizeSearchQuery(scenario.query);
  if (query !== "") {
    params.set(SEARCH_QUERY_PARAM, query);
  }
  return params;
}

/** Relative URL (path and query string) of a search scenario on the given path. */
export function searchScenarioHref(
  pathname: string,
  scenario: SearchScenario,
): string {
  const search = serializeSearchScenario(scenario).toString();
  return search === "" ? pathname : `${pathname}?${search}`;
}
