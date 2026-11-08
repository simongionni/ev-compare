import {
  resolveDcSimulationScenario,
  type DcSimulationScenario,
  type ResolvedDcSimulationScenario,
} from "@/scenarios/dcSimulationScenario";
import {
  DIRECT_ORIGIN,
  parseOriginContext,
  type OriginContext,
} from "@/scenarios/originContext";

/**
 * How the simulator's state stays subordinate to the URL (ADR 0001, Decision 2). Everything the
 * simulator knows about the URL comes from one raw query string (`location.search`). Temporary
 * state belongs to the query string it started from, compared as text and never by the scenario
 * or the parameters it resolves to: different query strings can resolve to the same scenario (a
 * missing parameter, an invalid URL falling back to the defaults, an equivalent encoding).
 */

/** What a simulator URL says: the committed scenario and where the page was opened from. */
export type SimulatorUrlState = {
  readonly committed: ResolvedDcSimulationScenario;
  readonly origin: OriginContext;
};

/**
 * Reads a raw query string. Origin parameters that are not a valid origin open the page as a
 * direct visit, as in Vehicle Analysis: the return link then leads to the canonical vehicle URL.
 */
export function readSimulatorUrl(search: string): SimulatorUrlState {
  const params = new URLSearchParams(search);
  const origin = parseOriginContext(params);
  return {
    committed: resolveDcSimulationScenario(params),
    origin: origin.ok ? origin.value : DIRECT_ORIGIN,
  };
}

/** A scenario shown ahead of the URL (a thumb being dragged, a commit not yet reflected). */
export type PendingScenario = {
  readonly scenario: DcSimulationScenario;
  /** The URL's raw query string when it was shown. */
  readonly search: string;
};

/**
 * The pending scenario, if it still belongs to the URL's current query string. Anything else is
 * dropped: the caller forgets it, so returning to its URL later does not bring it back.
 */
export function pendingForUrl(
  pending: PendingScenario | null,
  search: string,
): PendingScenario | null {
  return pending?.search === search ? pending : null;
}

/** A pointer gesture on the SoC slider: from the press until the pointer is released. */
export type DragGesture = {
  /** `location.search` at the press. */
  readonly search: string;
  /** The URL changed since the press: the gesture must no longer touch the scenario. */
  readonly obsolete: boolean;
};

export function startDrag(search: string): DragGesture {
  return { search, obsolete: false };
}

/**
 * The gesture after looking at the URL. `location.search` is read at the time of the event: it may
 * be ahead of the last render when a release follows a URL change immediately. Obsolescence is
 * final: a gesture stays obsolete if the URL later returns to where it started.
 */
export function observeUrlDuringDrag(
  drag: DragGesture | null,
  currentSearch: string,
): DragGesture | null {
  return drag === null || drag.obsolete || drag.search === currentSearch
    ? drag
    : { ...drag, obsolete: true };
}

/**
 * Whether a slider event is part of a pointer gesture, as opposed to a keyboard step. The event
 * type is the reliable signal: on release the slider reports the reason of its last change, which
 * is "keyboard" if a key was pressed during the gesture.
 */
export function isPointerGestureEvent(eventType: string): boolean {
  return eventType.startsWith("pointer") || eventType.startsWith("touch");
}
