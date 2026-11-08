import type { VehicleId } from "@/data/catalogue";
import {
  serializeOriginContext,
  type OriginContext,
} from "@/scenarios/originContext";
import { searchScenarioHref } from "@/scenarios/searchScenario";

/**
 * Route paths of the first vertical slice. Paths are an implementation choice, not a definitive
 * URL schema (M0.2 §5, ADR 0001 open question 4).
 */
export const DISCOVERY_PATH = "/cerca";

/** Canonical path of a vehicle's analysis: the direct-access URL. */
export function vehiclePath(id: VehicleId): string {
  return `/veicoli/${encodeURIComponent(id)}`;
}

/** Path of a vehicle's dedicated DC simulation. */
export function dcSimulationPath(id: VehicleId): string {
  return `${vehiclePath(id)}/simulazione-dc`;
}

function withOrigin(path: string, origin: OriginContext): string {
  const search = serializeOriginContext(origin).toString();
  return search === "" ? path : `${path}?${search}`;
}

/** A vehicle's analysis, carrying where it was opened from. */
export function vehicleHref(id: VehicleId, origin: OriginContext): string {
  return withOrigin(vehiclePath(id), origin);
}

/** A vehicle's DC simulation, forwarding the analysis' origin so the return path survives it. */
export function dcSimulationHref(id: VehicleId, origin: OriginContext): string {
  return withOrigin(dcSimulationPath(id), origin);
}

export type ContextBarLink = {
  /** Visible copy without the chevron, as in the wireframes. */
  readonly label: "Risultati" | "Cerca";
  readonly href: string;
};

/**
 * The context bar's return link (Vehicle Analysis wireframes): back to the results of the search
 * the page was opened from, or to Discovery when the page was opened directly.
 */
export function contextBarLink(origin: OriginContext): ContextBarLink {
  return origin.kind === "search"
    ? {
        label: "Risultati",
        href: searchScenarioHref(DISCOVERY_PATH, origin.search),
      }
    : { label: "Cerca", href: DISCOVERY_PATH };
}
