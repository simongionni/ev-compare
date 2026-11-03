import { describe, expect, test } from "vitest";
import {
  DEFAULT_SEARCH_SCENARIO,
  MAX_SEARCH_QUERY_LENGTH,
  parseSearchScenario,
  searchScenarioHref,
  serializeSearchScenario,
  type SearchScenario,
} from "@/scenarios/searchScenario";

const parse = (search: string) =>
  parseSearchScenario(new URLSearchParams(search));

describe("parseSearchScenario", () => {
  test("no parameters is the default scenario", () => {
    expect(parse("")).toEqual({ ok: true, value: DEFAULT_SEARCH_SCENARIO });
  });

  test("reads and trims the query", () => {
    expect(parse("q=%20Nordis%20E4%20")).toEqual({
      ok: true,
      value: { query: "Nordis E4" },
    });
  });

  test("an empty or blank query is the default scenario", () => {
    expect(parse("q=")).toEqual({ ok: true, value: DEFAULT_SEARCH_SCENARIO });
    expect(parse("q=+++")).toEqual({
      ok: true,
      value: DEFAULT_SEARCH_SCENARIO,
    });
  });

  test("keeps the case of the query", () => {
    expect(parse("q=NoRdIs")).toEqual({ ok: true, value: { query: "NoRdIs" } });
  });

  test("ignores unknown parameters", () => {
    expect(parse("x=1&q=vela&utm_source=mail")).toEqual({
      ok: true,
      value: { query: "vela" },
    });
  });

  test("decodes special characters", () => {
    expect(parse("q=%E2%82%AC%26%3D%3F")).toEqual({
      ok: true,
      value: { query: "€&=?" },
    });
  });

  test("rejects a repeated query parameter", () => {
    expect(parse("q=nordis&q=aurora")).toEqual({
      ok: false,
      error: { type: "repeatedParameter", name: "q", count: 2 },
    });
  });

  test("accepts a query at the maximum length", () => {
    const query = "a".repeat(MAX_SEARCH_QUERY_LENGTH);
    expect(parse(`q=${query}`)).toEqual({ ok: true, value: { query } });
  });

  test("rejects a query beyond the maximum length", () => {
    const query = "a".repeat(MAX_SEARCH_QUERY_LENGTH + 1);
    expect(parse(`q=${query}`)).toEqual({
      ok: false,
      error: {
        type: "queryTooLong",
        length: MAX_SEARCH_QUERY_LENGTH + 1,
        maxLength: MAX_SEARCH_QUERY_LENGTH,
      },
    });
  });

  test("malformed percent-encoding does not throw", () => {
    expect(() => parse("q=%E0%A4%A")).not.toThrow();
    expect(parse("q=%E0%A4%A").ok).toBe(true);
  });
});

describe("serializeSearchScenario", () => {
  test("the default scenario has no parameters", () => {
    expect(serializeSearchScenario(DEFAULT_SEARCH_SCENARIO).toString()).toBe(
      "",
    );
  });

  test("writes the trimmed query", () => {
    expect(serializeSearchScenario({ query: " nordis e4 " }).toString()).toBe(
      "q=nordis+e4",
    );
  });

  test.each<SearchScenario>([
    { query: "" },
    { query: "nordis" },
    { query: "Nordis E4" },
    { query: "€ & = ? # / “virgolette”" },
    { query: "à è ì ò ù" },
    { query: "a".repeat(MAX_SEARCH_QUERY_LENGTH) },
  ])("round-trips %j", (scenario) => {
    const search = serializeSearchScenario(scenario).toString();
    expect(parse(search)).toEqual({ ok: true, value: scenario });
  });
});

describe("searchScenarioHref", () => {
  test("default scenario is the bare path", () => {
    expect(searchScenarioHref("/cerca", DEFAULT_SEARCH_SCENARIO)).toBe(
      "/cerca",
    );
  });

  test("appends the query string", () => {
    expect(searchScenarioHref("/cerca", { query: "vela" })).toBe(
      "/cerca?q=vela",
    );
  });
});
