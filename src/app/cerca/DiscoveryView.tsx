"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { searchCatalogue } from "@/application/vehicleSearch";
import type { Catalogue } from "@/data/catalogue";
import { formatVehicleCount } from "@/presentation/format";
import {
  DEFAULT_SEARCH_SCENARIO,
  MAX_SEARCH_QUERY_LENGTH,
  normalizeSearchQuery,
  parseSearchScenario,
  searchScenarioHref,
  type SearchScenario,
} from "@/scenarios/searchScenario";
import { SearchField } from "@/components/SearchField/SearchField";
import { VehicleCard } from "@/components/VehicleCard/VehicleCard";
import styles from "./DiscoveryView.module.css";

/**
 * Committed scenario from the URL. A URL that is not a valid scenario opens the default one
 * (the catalogue in price order); how partially invalid URLs are presented is ADR 0001 open
 * question 4.
 */
function useCommittedSearchScenario(): SearchScenario {
  const parsed = parseSearchScenario(useSearchParams());
  return parsed.ok ? parsed.value : DEFAULT_SEARCH_SCENARIO;
}

export function DiscoveryView({ catalogue }: { catalogue: Catalogue }) {
  const pathname = usePathname();
  const committed = useCommittedSearchScenario();
  const inputRef = useRef<HTMLInputElement>(null);

  // The text being typed is local interaction state; the URL holds the committed query.
  const [input, setInput] = useState(committed.query);
  const [lastCommittedQuery, setLastCommittedQuery] = useState(committed.query);

  // The URL changed: from this component (each keystroke) or from outside (Back, a link).
  // Only an outside change, which no longer matches the text, replaces the text.
  if (committed.query !== lastCommittedQuery) {
    setLastCommittedQuery(committed.query);
    if (normalizeSearchQuery(input) !== committed.query) {
      setInput(committed.query);
    }
  }

  const scenario: SearchScenario = { query: normalizeSearchQuery(input) };
  const results = searchCatalogue(catalogue, scenario);

  function changeQuery(value: string) {
    setInput(value);
    // Replace, never push: typing creates no history entry (ADR 0001, Decision 2).
    window.history.replaceState(
      null,
      "",
      searchScenarioHref(pathname, { query: normalizeSearchQuery(value) }),
    );
  }

  function showAll() {
    changeQuery("");
    inputRef.current?.focus();
  }

  return (
    <main className={styles.page}>
      <h1 className="visually-hidden">Cerca</h1>

      <SearchField
        ref={inputRef}
        label="Cerca marca o modello"
        value={input}
        onValueChange={changeQuery}
        maxLength={MAX_SEARCH_QUERY_LENGTH}
      />

      <section className={styles.results} aria-labelledby="results-title">
        <div className={styles.resultsHeader} aria-live="polite">
          {results.length > 0 ? (
            <>
              <h2 id="results-title" className={styles.title}>
                {formatVehicleCount(results.length)}
              </h2>
              <p className={styles.subtitle}>In ordine di prezzo</p>
            </>
          ) : (
            <>
              <h2 id="results-title" className={styles.title}>
                Nessun veicolo
              </h2>
              <p className={styles.subtitle}>
                Nessun modello corrisponde a “{scenario.query}”.
              </p>
            </>
          )}
        </div>

        {results.length > 0 ? (
          <ul className={styles.grid}>
            {results.map((vehicle) => (
              <li key={vehicle.id} className={styles.item}>
                <VehicleCard
                  vehicle={vehicle}
                  origin={{ kind: "search", search: scenario }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <button type="button" className={styles.showAll} onClick={showAll}>
            Mostra tutti i veicoli
          </button>
        )}
      </section>

      <p className={styles.notice}>Dati e veicoli illustrativi.</p>
    </main>
  );
}
