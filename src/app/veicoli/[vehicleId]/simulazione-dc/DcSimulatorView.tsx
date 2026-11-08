"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Slider } from "@base-ui/react/slider";
import { simulateDcCharging } from "@/application/dcSimulation";
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
  resolveDcSimulationScenario,
  serializeDcSimulationScenario,
  SOC_STEP_PERCENT,
  type DcSimulationScenario,
} from "@/scenarios/dcSimulationScenario";
import type { OriginContext } from "@/scenarios/originContext";
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

type DcSimulatorViewProps = {
  vehicle: CatalogueVehicle;
  origin: OriginContext;
};

/**
 * The dedicated DC simulation of one vehicle (M0.2 slice, DC simulation): station power and SoC
 * range, M0.1 results and the inspectable power-by-SoC chart. Composition from the Ricarica
 * section of the Vehicle Analysis wireframe, Comparison — Technical Exploration and Livrea
 * Consolidated 04-charging.svg, adapted to a single, neutral vehicle.
 */
export function DcSimulatorView({ vehicle, origin }: DcSimulatorViewProps) {
  const name = vehicleName(vehicle);
  const capacity = usableCapacityKwh(vehicle);

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
          <Simulator vehicle={vehicle} origin={origin} vehicleName={name} />
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

/** A scenario shown ahead of the URL, valid only while the URL still holds `base`. */
type PendingScenario = {
  readonly scenario: DcSimulationScenario;
  readonly base: string;
};

function Simulator({
  vehicle,
  origin,
  vehicleName,
}: DcSimulatorViewProps & { vehicleName: string }) {
  // Committed scenario: owned by the URL (ADR 0001, Decision 1).
  const committed = resolveDcSimulationScenario(useSearchParams());
  const committedKey = serializeDcSimulationScenario(
    committed.scenario,
  ).toString();

  // Temporary interaction state (a thumb being dragged, or a commit the URL does not reflect
  // yet). It is tied to the committed scenario it started from: once the URL changes, for
  // instance on commit or with Back/Forward, the URL wins again.
  const [pending, setPending] = useState<PendingScenario | null>(null);
  const scenario =
    pending !== null && pending.base === committedKey
      ? pending.scenario
      : committed.scenario;

  // Results and chart are derived from the scenario on every render, never stored.
  const result = simulateDcCharging(vehicle, scenario);

  function show(next: DcSimulationScenario) {
    setPending({ scenario: next, base: committedKey });
  }

  /** Commits a scenario: the URL is rewritten in place, with no new history entry. */
  function commit(next: DcSimulationScenario) {
    show(next);
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
                  commit({ ...scenario, stationMaxPowerKw: value });
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
            onValueChange={(value) => {
              const next = withRange(value);
              if (next !== undefined) show(next);
            }}
            onValueCommitted={(value) => {
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
            <Slider.Control className={styles.sliderControl}>
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
