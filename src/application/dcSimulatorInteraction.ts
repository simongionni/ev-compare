import type { DcSimulationScenario } from "@/scenarios/dcSimulationScenario";

/**
 * How the simulator's temporary interaction state stays subordinate to the URL (ADR 0001,
 * Decision 2). Temporary state belongs to the URL state it started from, compared by the URL's own
 * parameters and never by the scenario they resolve to: different URLs can resolve to the same
 * scenario (a missing parameter, an invalid URL falling back to the defaults).
 */

/** A scenario shown ahead of the URL (a thumb being dragged, a commit not yet reflected). */
export type PendingScenario = {
  readonly scenario: DcSimulationScenario;
  /** The URL's parameters when it was shown: `URLSearchParams.toString()`. */
  readonly urlParams: string;
};

/**
 * The pending scenario, if it still belongs to the URL's current parameters. Anything else is
 * dropped: the caller forgets it, so returning to its URL later does not bring it back.
 */
export function pendingForUrl(
  pending: PendingScenario | null,
  urlParams: string,
): PendingScenario | null {
  return pending?.urlParams === urlParams ? pending : null;
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
 * The gesture after looking at the URL. `location.search` is read at the time of the event: unlike
 * the router's state, it is already up to date when a release follows a URL change immediately.
 * Obsolescence is final: a gesture stays obsolete if the URL later returns to where it started.
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
