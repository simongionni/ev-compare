import { describe, expect, test } from "vitest";
import {
  DIRECT_ORIGIN,
  parseOriginContext,
  searchParamsFromRecord,
  serializeOriginContext,
  type OriginContext,
} from "@/scenarios/originContext";

const parse = (search: string) =>
  parseOriginContext(new URLSearchParams(search));

describe("parseOriginContext", () => {
  test("no origin parameter: the page was opened directly", () => {
    expect(parse("")).toEqual({ ok: true, value: DIRECT_ORIGIN });
  });

  test("a search query without the origin parameter is ignored", () => {
    expect(parse("q=Nordis")).toEqual({ ok: true, value: DIRECT_ORIGIN });
  });

  test("opened from Discovery with a query", () => {
    expect(parse("da=cerca&q=Nordis")).toEqual({
      ok: true,
      value: { kind: "search", search: { query: "Nordis" } },
    });
  });

  test("opened from Discovery without a query (the whole catalogue)", () => {
    expect(parse("da=cerca")).toEqual({
      ok: true,
      value: { kind: "search", search: { query: "" } },
    });
  });

  test("the query is normalised as in Discovery", () => {
    expect(parse("da=cerca&q=%20nordis%20")).toEqual({
      ok: true,
      value: { kind: "search", search: { query: "nordis" } },
    });
  });

  test("an unknown origin is a typed error", () => {
    expect(parse("da=confronto")).toEqual({
      ok: false,
      error: { type: "unknownOrigin", value: "confronto" },
    });
  });

  test("a repeated origin is a typed error", () => {
    expect(parse("da=cerca&da=cerca")).toEqual({
      ok: false,
      error: { type: "repeatedParameter", name: "da", count: 2 },
    });
  });

  test("an invalid search scenario is reported, not crashed on", () => {
    expect(parse("da=cerca&q=a&q=b")).toEqual({
      ok: false,
      error: {
        type: "invalidSearch",
        error: { type: "repeatedParameter", name: "q", count: 2 },
      },
    });
    const long = "x".repeat(101);
    expect(parse(`da=cerca&q=${long}`)).toMatchObject({
      ok: false,
      error: { type: "invalidSearch", error: { type: "queryTooLong" } },
    });
  });
});

describe("serializeOriginContext", () => {
  test("a direct origin adds no parameters", () => {
    expect(serializeOriginContext(DIRECT_ORIGIN).toString()).toBe("");
  });

  test("a search origin carries the search scenario", () => {
    expect(
      serializeOriginContext({
        kind: "search",
        search: { query: "Nordis E4" },
      }).toString(),
    ).toBe("da=cerca&q=Nordis+E4");
    expect(
      serializeOriginContext({
        kind: "search",
        search: { query: "" },
      }).toString(),
    ).toBe("da=cerca");
  });

  test.each<OriginContext>([
    DIRECT_ORIGIN,
    { kind: "search", search: { query: "" } },
    { kind: "search", search: { query: "Nordis" } },
    { kind: "search", search: { query: "Aurora & Vela €?" } },
  ])("round-trips %j", (origin) => {
    expect(parseOriginContext(serializeOriginContext(origin))).toEqual({
      ok: true,
      value: origin,
    });
  });
});

describe("searchParamsFromRecord", () => {
  test("keeps single and repeated values, drops undefined ones", () => {
    const params = searchParamsFromRecord({
      da: "cerca",
      q: ["a", "b"],
      empty: undefined,
    });
    expect(params.getAll("da")).toEqual(["cerca"]);
    expect(params.getAll("q")).toEqual(["a", "b"]);
    expect(params.has("empty")).toBe(false);
  });
});
