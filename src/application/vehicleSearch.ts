import {
  vehicleName,
  type Catalogue,
  type CatalogueVehicle,
} from "@/data/catalogue";
import {
  normalizeSearchQuery,
  type SearchScenario,
} from "@/scenarios/searchScenario";

const LOCALE = "it-IT";

const fold = (text: string) => text.toLocaleLowerCase(LOCALE);

/**
 * Whether a vehicle matches a direct search query: a case-insensitive substring of the make, of
 * the model or of the full name ("Nordis E4"). An empty query matches every vehicle.
 *
 * Accents and separators ("E4" vs "E 4") are not normalised: M0.2 open question 5.
 */
export function matchesSearchQuery(
  vehicle: CatalogueVehicle,
  query: string,
): boolean {
  const needle = fold(normalizeSearchQuery(query));
  if (needle === "") {
    return true;
  }
  return fold(vehicleName(vehicle)).includes(needle);
}

/** Increasing list price; equal prices by name, then by identifier, so the order is stable. */
export function compareByListPrice(
  a: CatalogueVehicle,
  b: CatalogueVehicle,
): number {
  return (
    a.listPriceEur - b.listPriceEur ||
    vehicleName(a).localeCompare(vehicleName(b), LOCALE) ||
    (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  );
}

/** Results of a search scenario: the matching vehicles in increasing price order. */
export function searchCatalogue(
  catalogue: Catalogue,
  scenario: SearchScenario,
): CatalogueVehicle[] {
  return catalogue
    .filter((vehicle) => matchesSearchQuery(vehicle, scenario.query))
    .sort(compareByListPrice);
}
