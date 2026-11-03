import { createCatalogue, type Catalogue } from "@/data/catalogue";
import { RAW_CATALOGUE } from "@/data/catalogueData";

/**
 * The validated illustrative catalogue. Invalid catalogue data is a programming error in static
 * data: it fails loudly at load time (development server, build, tests) instead of reaching the UI
 * or the engine.
 */
function loadCatalogue(): Catalogue {
  const result = createCatalogue(RAW_CATALOGUE);
  if (!result.ok) {
    throw new Error(
      `Invalid illustrative catalogue: ${JSON.stringify(result.error)}`,
    );
  }
  return result.value;
}

export const catalogue: Catalogue = loadCatalogue();
