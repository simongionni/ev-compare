import type { CalculationResult } from "@/calculations/result";
import {
  parseSearchScenario,
  serializeSearchScenario,
  type SearchParamsReader,
  type SearchScenario,
  type SearchScenarioError,
} from "@/scenarios/searchScenario";

/**
 * Where a vehicle page was opened from (ADR 0001 open question 6, resolved for the slice on
 * 2026-11-08: the origin is carried in the URL).
 *
 * - `direct`: the page was opened from its own URL, with no previous activity to return to.
 * - `search`: the page was opened from Discovery; `search` is the search scenario to return to.
 *
 * Framework independent. A vehicle URL without origin parameters is the canonical, direct one.
 * Parameter names are an implementation choice of the slice, not a definitive URL schema
 * (ADR 0001 open question 4).
 */
export type OriginContext =
  | { readonly kind: "direct" }
  | { readonly kind: "search"; readonly search: SearchScenario };

export const ORIGIN_PARAM = "da";
export const SEARCH_ORIGIN_VALUE = "cerca";

export const DIRECT_ORIGIN: OriginContext = { kind: "direct" };

export type OriginContextError =
  | { type: "repeatedParameter"; name: string; count: number }
  | { type: "unknownOrigin"; value: string }
  | { type: "invalidSearch"; error: SearchScenarioError };

/**
 * Parses untrusted URL parameters into an origin context. Without the origin parameter the page
 * was opened directly; other parameters are then ignored, so a stray search query never turns a
 * direct visit into a return path.
 */
export function parseOriginContext(
  params: SearchParamsReader,
): CalculationResult<OriginContext, OriginContextError> {
  const values = params.getAll(ORIGIN_PARAM);

  if (values.length === 0) {
    return { ok: true, value: DIRECT_ORIGIN };
  }

  if (values.length > 1) {
    return {
      ok: false,
      error: {
        type: "repeatedParameter",
        name: ORIGIN_PARAM,
        count: values.length,
      },
    };
  }

  const [value] = values;

  if (value !== SEARCH_ORIGIN_VALUE) {
    return { ok: false, error: { type: "unknownOrigin", value } };
  }

  const search = parseSearchScenario(params);
  if (!search.ok) {
    return { ok: false, error: { type: "invalidSearch", error: search.error } };
  }

  return { ok: true, value: { kind: "search", search: search.value } };
}

/** Serialises an origin context. A direct origin adds no parameters. */
export function serializeOriginContext(origin: OriginContext): URLSearchParams {
  if (origin.kind === "direct") {
    return new URLSearchParams();
  }
  const params = new URLSearchParams({ [ORIGIN_PARAM]: SEARCH_ORIGIN_VALUE });
  for (const [name, value] of serializeSearchScenario(origin.search)) {
    params.append(name, value);
  }
  return params;
}

/**
 * Next.js passes a page's query string as a plain record. Rebuilds the parameters, keeping
 * repeated values so that the parsers can reject them.
 */
export function searchParamsFromRecord(
  record: Readonly<Record<string, string | string[] | undefined>>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(record)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item !== undefined) {
        params.append(name, item);
      }
    }
  }
  return params;
}
