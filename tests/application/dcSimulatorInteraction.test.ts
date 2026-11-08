import { describe, expect, test } from "vitest";
import {
  isPointerGestureEvent,
  observeUrlDuringDrag,
  pendingForUrl,
  startDrag,
  type PendingScenario,
} from "@/application/dcSimulatorInteraction";
import {
  resolveDcSimulationScenario,
  serializeDcSimulationScenario,
  type DcSimulationScenario,
} from "@/scenarios/dcSimulationScenario";

const VALID = "?colonnina=150&inizio=10&fine=80";
const DRAGGED: DcSimulationScenario = {
  stationMaxPowerKw: 150,
  initialSocPercent: 50,
  targetSocPercent: 80,
};

const params = (search: string) => new URLSearchParams(search).toString();

/** A thumb held at 50→80 on the given URL. */
const dragOn = (search: string): PendingScenario => ({
  scenario: DRAGGED,
  urlParams: params(search),
});

/** The scenario the simulator shows for a URL and a pending scenario. */
function shown(search: string, pending: PendingScenario | null) {
  const current = pendingForUrl(pending, params(search));
  const committed = resolveDcSimulationScenario(new URLSearchParams(search));
  return current?.scenario ?? committed.scenario;
}

const defaults = resolveDcSimulationScenario(new URLSearchParams(VALID));

describe("pending scenario and URL", () => {
  test("while the URL does not change, the pending scenario is shown", () => {
    expect(shown(VALID, dragOn(VALID))).toEqual(DRAGGED);
  });

  test("an external invalid URL drops it, though it resolves to the same scenario", () => {
    const invalid = "?colonnina=150&inizio=10&fine=oops";
    const resolved = resolveDcSimulationScenario(new URLSearchParams(invalid));

    expect(resolved.invalid).toBeDefined();
    expect(resolved.scenario).toEqual(defaults.scenario);
    expect(shown(invalid, dragOn(VALID))).toEqual(defaults.scenario);
  });

  test("an external valid URL with another scenario drops it", () => {
    const other = "?colonnina=50&inizio=20&fine=60";

    expect(shown(other, dragOn(VALID))).toEqual({
      stationMaxPowerKw: 50,
      initialSocPercent: 20,
      targetSocPercent: 60,
    });
  });

  test.each([
    ["a missing parameter", "?colonnina=150&inizio=10"],
    ["no simulation parameters", ""],
    ["reordered parameters", "?inizio=10&fine=80&colonnina=150"],
    ["an extra parameter", `${VALID}&da=cerca`],
  ])("a different URL with the same scenario drops it: %s", (_, other) => {
    expect(resolveDcSimulationScenario(new URLSearchParams(other))).toEqual(
      defaults,
    );
    expect(shown(other, dragOn(VALID))).toEqual(defaults.scenario);
  });

  test("a commit: the pending scenario holds until the URL reflects it, then the URL rules", () => {
    const pending = dragOn(VALID);
    const written = `?${serializeDcSimulationScenario(DRAGGED)}`;

    expect(shown(VALID, pending)).toEqual(DRAGGED);
    expect(pendingForUrl(pending, params(written))).toBeNull();
    expect(shown(written, pending)).toEqual(DRAGGED);
  });

  test("once dropped it stays dropped: Back to its URL shows what that URL says", () => {
    const pending = dragOn(VALID);
    const afterForward = pendingForUrl(pending, params("?colonnina=50"));

    expect(afterForward).toBeNull();
    expect(shown(VALID, afterForward)).toEqual(defaults.scenario);
  });
});

describe("pointer gesture and URL", () => {
  const OTHER = "?colonnina=50&inizio=20&fine=60";

  test("a gesture on an unchanged URL is current", () => {
    expect(observeUrlDuringDrag(startDrag(VALID), VALID)?.obsolete).toBe(false);
  });

  test.each([
    ["invalid", "?colonnina=150&inizio=10&fine=oops"],
    ["same scenario", "?colonnina=150&inizio=10"],
    [
      "same parameters, encoded differently",
      `?colonnina=150&inizio=10&fine=%38%30`,
    ],
    ["another scenario", OTHER],
  ])("a change of URL makes it obsolete: %s", (_, search) => {
    expect(observeUrlDuringDrag(startDrag(VALID), search)?.obsolete).toBe(true);
  });

  test("obsolescence is final, even if the URL returns to where the gesture started", () => {
    const left = observeUrlDuringDrag(startDrag(VALID), OTHER);

    expect(observeUrlDuringDrag(left, VALID)?.obsolete).toBe(true);
  });

  test("a new press starts a current gesture on the new URL", () => {
    expect(observeUrlDuringDrag(startDrag(OTHER), OTHER)?.obsolete).toBe(false);
  });

  test("no press recorded: nothing is obsolete", () => {
    expect(observeUrlDuringDrag(null, VALID)).toBeNull();
  });

  test.each([
    ["pointerdown", true],
    ["pointermove", true],
    ["pointerup", true],
    ["pointercancel", true],
    ["touchmove", true],
    ["touchend", true],
    ["keydown", false],
    ["change", false],
  ])("event %s is part of a pointer gesture: %s", (type, expected) => {
    expect(isPointerGestureEvent(type)).toBe(expected);
  });
});
