import {
  chargingPreview,
  type ChargingPreview,
  type ChargingPreviewError,
} from "@/application/chargingPreview";
import type { CalculationResult } from "@/calculations/result";
import {
  findVehicle,
  type Catalogue,
  type CatalogueVehicle,
} from "@/data/catalogue";
import {
  DIRECT_ORIGIN,
  parseOriginContext,
  type OriginContext,
} from "@/scenarios/originContext";
import type { SearchParamsReader } from "@/scenarios/searchScenario";

/** What the Vehicle Analysis page shows, derived from the URL and the catalogue. */
export type VehicleAnalysis = {
  readonly vehicle: CatalogueVehicle;
  readonly origin: OriginContext;
  readonly charging: CalculationResult<ChargingPreview, ChargingPreviewError>;
};

/**
 * Resolves the Vehicle Analysis of a URL: the vehicle by its stable identifier (`undefined` when
 * the catalogue has none), the origin context and the Ricarica preview.
 *
 * Origin parameters that are not a valid origin open the page as a direct visit ("‹ Cerca"):
 * the page always works, and how partially invalid URLs are presented is ADR 0001 open
 * question 4.
 */
export function resolveVehicleAnalysis(
  catalogue: Catalogue,
  vehicleId: string,
  params: SearchParamsReader,
): VehicleAnalysis | undefined {
  const vehicle = findVehicle(catalogue, vehicleId);
  if (vehicle === undefined) {
    return undefined;
  }

  const origin = parseOriginContext(params);

  return {
    vehicle,
    origin: origin.ok ? origin.value : DIRECT_ORIGIN,
    charging: chargingPreview(vehicle),
  };
}
