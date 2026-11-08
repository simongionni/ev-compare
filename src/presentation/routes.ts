import type { VehicleId } from "@/data/catalogue";
import {
  serializeOriginContext,
  type OriginContext,
} from "@/scenarios/originContext";
import { searchScenarioHref } from "@/scenarios/searchScenario";
import {
  serializeDcSimulationScenario,
  type DcSimulationScenario,
} from "@/scenarios/dcSimulationScenario";

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

function withParams(path: string, params: URLSearchParams): string {
  const search = params.toString();
  return search === "" ? path : `${path}?${search}`;
}

function withOrigin(path: string, origin: OriginContext): string {
  return withParams(path, serializeOriginContext(origin));
}

/** A vehicle's analysis, carrying where it was opened from. */
export function vehicleHref(id: VehicleId, origin: OriginContext): string {
  return withOrigin(vehiclePath(id), origin);
}

/**
 * A vehicle's DC simulation, forwarding the analysis' origin so the return path survives it.
 * Without a scenario the simulation opens on its defaults; with one, the URL restores it.
 */
export function dcSimulationHref(
  id: VehicleId,
  origin: OriginContext,
  scenario?: DcSimulationScenario,
): string {
  const params = serializeOriginContext(origin);
  if (scenario !== undefined) {
    for (const [name, value] of serializeDcSimulationScenario(scenario)) {
      params.append(name, value);
    }
  }
  return withParams(dcSimulationPath(id), params);
}

/**
 * The simulation's return link (M0.2 open question 7, resolved for increment 3: "‹ <vehicle
 * name>"): the analysis of the same vehicle, with the origin it was opened from, so that its own
 * context bar still leads back to the search.
 */
export function simulationReturnLink(
  id: VehicleId,
  name: string,
  origin: OriginContext,
): { readonly label: string; readonly href: string } {
  return { label: name, href: vehicleHref(id, origin) };
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
