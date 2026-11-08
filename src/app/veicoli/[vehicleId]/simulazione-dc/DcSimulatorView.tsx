"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Slider } from "@base-ui/react/slider";
import { simulateDcCharging } from "@/application/dcSimulation";
import {
  isPointerGestureEvent,
  observeUrlDuringDrag,
  pendingForUrl,
  readSimulatorUrl,
  startDrag,
  type DragGesture,
  type PendingScenario,
} from "@/application/dcSimulatorInteraction";
import {
  usableCapacityKwh,
  vehicleName,
  type CatalogueVehicle,
} from "@/data/catalogue";
import {
  createDcSimulationScenario,
  DC_STATION_POWERS_KW,
  isDcStationPowerKw,
  MAX_SOC_PERCENT,
  MIN_SOC_PERCENT,
  SOC_STEP_PERCENT,
  type DcSimulationScenario,
  type ResolvedDcSimulationScenario,
} from "@/scenarios/dcSimulationScenario";
import { dcSimulationErrorMessage } from "@/presentation/chargingErrors";
import {
  formatDurationHours,
  formatEnergyKwh,
  formatPowerKw,
  formatSocPercent,
  formatVersion,
} from "@/presentation/format";
import { dcSimulationHref, simulationReturnLink } from "@/presentation/routes";
import { ContextBar } from "@/components/ContextBar/ContextBar";
import { DataProvenanceTag } from "@/components/DataProvenanceTag/DataProvenanceTag";
import { DcPowerChart } from "@/components/DcPowerChart/DcPowerChart";
import { SignalNotice } from "@/components/SignalNotice/SignalNotice";
import styles from "./DcSimulatorView.module.css";

/** The browser reports URL changes the router may not see, where it can (Navigation API). */
function subscribeToUrl(onChange: () => void) {
  window.navigation?.addEventListener("currententrychange", onChange);
  return () => {
    window.navigation?.removeEventListener("currententrychange", onChange);
  };
}

/**
 * The URL's raw query string, as `location.search` has it. `useSearchParams` normalises it, so it
 * cannot tell apart two encodings of the same parameters; it still re-renders this hook on every
 * router URL change, encoding included, which is what keeps it current without the Navigation API.
 *
 * While the browser is already on another page and the router has not rendered it yet, the old
 * page keeps the query string the router gives it, not the next page's.
 */
function useUrlSearch(): string {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const routerSearch = () => {
    const search = searchParams.toString();
    return search === "" ? "" : `?${search}`;
  };

  return useSyncExternalStore(
    subscribeToUrl,
    () =>
      window.location.pathname === pathname
        ? window.location.search
        : routerSearch(),
    routerSearch,
  );
}

/**
 * The dedicated DC simulation of one vehicle (M0.2 slice, DC simulation): station power and SoC
 * range, M0.1 results and the inspectable power-by-SoC chart. Composition from the Ricarica
 * section of the Vehicle Analysis wireframe, Comparison — Technical Exploration and Livrea
 * Consolidated 04-charging.svg, adapted to a single, neutral vehicle.
 */
export function DcSimulatorView({ vehicle }: { vehicle: CatalogueVehicle }) {
  const name = vehicleName(vehicle);
  const capacity = usableCapacityKwh(vehicle);

  // Committed scenario and origin context: owned by the URL (ADR 0001, Decision 1).
  const urlSearch = useUrlSearch();
  const { committed, origin } = readSimulatorUrl(urlSearch);

  return (
    <>
      <ContextBar back={simulationReturnLink(vehicle.id, name, origin)} />
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Ricarica rapida di {name}</h1>
          {vehicle.version !== undefined ? (
            <p className={styles.version}>
              <span className="visually-hidden">Versione: </span>
              {formatVersion(vehicle.version, capacity)}
            </p>
          ) : null}
        </header>

        {vehicle.charging.kind === "complete" ? (
          <Simulator
            vehicle={vehicle}
            vehicleName={name}
            urlSearch={urlSearch}
            committed={committed}
          />
        ) : (
          <SignalNotice
            kind="information"
            title="Dati di ricarica non disponibili"
          >
            <p>
              Il catalogo non riporta la curva di ricarica DC e la capacità
              utilizzabile di questo veicolo: la ricarica non può essere
              simulata.
            </p>
          </SignalNotice>
        )}

        <p className={styles.notice}>Dati e veicoli illustrativi.</p>
      </main>
    </>
  );
}

function Simulator({
  vehicle,
  vehicleName,
  urlSearch,
  committed,
}: {
  vehicle: CatalogueVehicle;
  vehicleName: string;
  urlSearch: string;
  committed: ResolvedDcSimulationScenario;
}) {
  // Temporary interaction state (a thumb being dragged, or a commit the URL does not reflect
  // yet). It belongs to the URL it started from: once the URL changes, for instance on commit or
  // with Back/Forward, the URL wins again and the temporary state is gone for good.
  const [pending, setPending] = useState<PendingScenario | null>(null);
  const currentPending = pendingForUrl(pending, urlSearch);
  if (currentPending !== pending) setPending(currentPending);
  const scenario = currentPending?.scenario ?? committed.scenario;

  // A change of URL makes the rest of a pointer gesture obsolete, while the slider keeps reporting
  // it until the pointer is released.
  const drag = useRef<DragGesture | null>(null);
  useEffect(() => {
    drag.current = observeUrlDuringDrag(drag.current, window.location.search);
  }, [urlSearch]);

  // Results and chart are derived from the scenario on every render, never stored.
  const result = simulateDcCharging(vehicle, scenario);

  function show(next: DcSimulationScenario) {
    setPending({ scenario: next, search: urlSearch });
  }

  function isObsoleteDrag(event: Event) {
    drag.current = observeUrlDuringDrag(drag.current, window.location.search);
    return isPointerGestureEvent(event.type) && drag.current?.obsolete === true;
  }

  /**
   * Commits a scenario: the URL is rewritten in place, with no new history entry. The origin is
   * whatever the URL says at this moment, which may be ahead of the last render.
   */
  function commit(next: DcSimulationScenario) {
    show(next);
    const { origin } = readSimulatorUrl(window.location.search);
    window.history.replaceState(
      null,
      "",
      dcSimulationHref(vehicle.id, origin, next),
    );
  }

  /** The scenario with a new SoC range, or undefined if the range is not a valid scenario. */
  function withRange(value: number | readonly number[]) {
    if (!Array.isArray(value) || value.length !== 2) return undefined;
    const [initialSocPercent, targetSocPercent] = value as readonly number[];
    const next = createDcSimulationScenario({
      stationMaxPowerKw: scenario.stationMaxPowerKw,
      initialSocPercent,
      targetSocPercent,
    });
    return next.ok ? next.value : undefined;
  }

  return (
    <>
      {committed.invalid !== undefined ? (
        <SignalNotice
          kind="information"
          title="Parametri della simulazione non validi"
        >
          <p>
            Il collegamento non descrive uno scenario valido: è mostrato lo
            scenario predefinito.
          </p>
        </SignalNotice>
      ) : null}

      <section className={styles.conditions} aria-labelledby="conditions-title">
        <h2 id="conditions-title" className={styles.kicker}>
          Condizioni
        </h2>
        <div className={styles.conditionRow}>
          <div className={styles.condition}>
            <p className={styles.conditionLabel}>Tipo di ricarica</p>
            <p className={styles.fixedCondition}>Colonnina rapida (DC)</p>
          </div>

          <div className={styles.condition}>
            <p id="station-label" className={styles.conditionLabel}>
              Potenza della colonnina
            </p>
            <RadioGroup
              aria-labelledby="station-label"
              className={styles.options}
              value={scenario.stationMaxPowerKw}
              onValueChange={(value) => {
                if (typeof value === "number" && isDcStationPowerKw(value)) {
                  const search = window.location.search;
                  const current =
                    search === urlSearch
                      ? scenario
                      : readSimulatorUrl(search).committed.scenario;
                  commit({ ...current, stationMaxPowerKw: value });
                }
              }}
            >
              {DC_STATION_POWERS_KW.map((kw) => (
                <Radio.Root key={kw} value={kw} className={styles.option}>
                  {formatPowerKw(kw)}
                </Radio.Root>
              ))}
            </RadioGroup>
          </div>

          <Slider.Root
            className={`${styles.condition} ${styles.socCondition}`}
            value={[scenario.initialSocPercent, scenario.targetSocPercent]}
            min={MIN_SOC_PERCENT}
            max={MAX_SOC_PERCENT}
            step={SOC_STEP_PERCENT}
            // The thumbs meet but never cross ("none"). When they already coincide, the thumb
            // under the pointer is the final one; "swap" then hands the drag to the initial thumb
            // if the pointer moves left, so an empty range can be widened in either direction.
            // The values stay ordered in both cases.
            thumbCollisionBehavior={
              committed.scenario.initialSocPercent ===
              committed.scenario.targetSocPercent
                ? "swap"
                : "none"
            }
            onValueChange={(value, details) => {
              if (isObsoleteDrag(details.event)) {
                details.cancel();
                setPending(null);
                return;
              }
              const next = withRange(value);
              if (next !== undefined) show(next);
            }}
            onValueCommitted={(value, details) => {
              if (isObsoleteDrag(details.event)) {
                setPending(null);
                return;
              }
              const next = withRange(value);
              if (next !== undefined) commit(next);
            }}
          >
            <div className={styles.socHeader}>
              <Slider.Label className={styles.conditionLabel}>
                Livello di carica
              </Slider.Label>
              <span className={styles.socValue} aria-hidden="true">
                {formatSocPercent(scenario.initialSocPercent)} →{" "}
                {formatSocPercent(scenario.targetSocPercent)}
              </span>
            </div>
            <Slider.Control
              className={styles.sliderControl}
              onPointerDownCapture={() => {
                drag.current = startDrag(window.location.search);
              }}
            >
              <Slider.Track className={styles.sliderTrack}>
                <Slider.Indicator className={styles.sliderIndicator} />
                <Slider.Thumb
                  index={0}
                  aria-label="Livello di carica iniziale"
                  getAriaValueText={(_, value) => formatSocPercent(value)}
                  className={styles.sliderThumb}
                />
                <Slider.Thumb
                  index={1}
                  aria-label="Livello di carica finale"
                  getAriaValueText={(_, value) => formatSocPercent(value)}
                  className={styles.sliderThumb}
                />
              </Slider.Track>
            </Slider.Control>
          </Slider.Root>
        </div>
      </section>

      {!result.ok ? (
        <SignalNotice kind="critical" title="Calcolo non riuscito">
          <p>{dcSimulationErrorMessage(result.error)}</p>
        </SignalNotice>
      ) : result.value.kind === "available" ? (
        <div className={styles.body}>
          <section className={styles.result} aria-labelledby="result-title">
            <div className={styles.cardHeader}>
              <h2 id="result-title" className={styles.kicker}>
                Risultato
              </h2>
              <DataProvenanceTag kind="calcolo" />
            </div>
            <dl
              className={styles.resultValues}
              aria-live="polite"
              aria-atomic="true"
            >
              <div className={styles.time}>
                <dt className="visually-hidden">Tempo di ricarica</dt>
                <dd>
                  {formatDurationHours(
                    result.value.simulation.chargingTimeHours,
                  )}
                </dd>
              </div>
              <div className={styles.energy}>
                <dt className="visually-hidden">
                  Energia immagazzinata nella batteria
                </dt>
                <dd>
                  +{formatEnergyKwh(result.value.simulation.deliveredEnergyKwh)}{" "}
                  nella batteria
                </dd>
              </div>
              <div className={styles.resultConditions}>
                <dt className="visually-hidden">Intervallo e colonnina</dt>
                <dd>
                  da{" "}
                  {formatSocPercent(result.value.simulation.initialSocPercent)}{" "}
                  a {formatSocPercent(result.value.simulation.finalSocPercent)}{" "}
                  · colonnina {formatPowerKw(scenario.stationMaxPowerKw)}
                </dd>
              </div>
            </dl>
          </section>

          <section className={styles.chart} aria-labelledby="chart-title">
            <h2 id="chart-title" className={styles.cardTitle}>
              Potenza per livello di carica
            </h2>
            <DcPowerChart
              series={result.value.chart}
              vehicleName={vehicleName}
              inspectable
            />
          </section>

          <section
            className={styles.assumptions}
            aria-labelledby="assumptions-title"
          >
            <h2 id="assumptions-title" className={styles.cardTitle}>
              Ipotesi
            </h2>
            <ul className={styles.assumptionList}>
              <li>Curva di ricarica del costruttore (illustrativa)</li>
              <li>
                Energia immagazzinata nella batteria: quella prelevata dalla
                rete è maggiore
              </li>
              <li>Nessun effetto di temperatura o preriscaldamento</li>
              <li>Potenza della colonnina non condivisa con altri veicoli</li>
            </ul>
          </section>
        </div>
      ) : null}
    </>
  );
}
