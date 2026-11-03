import type { VehicleId } from "@/data/catalogue";

/**
 * Route paths of the first vertical slice. Paths are an implementation choice, not a definitive
 * URL schema (M0.2 §5, ADR 0001 open question 4).
 */
export const DISCOVERY_PATH = "/cerca";

export function vehiclePath(id: VehicleId): string {
  return `/veicoli/${encodeURIComponent(id)}`;
}
