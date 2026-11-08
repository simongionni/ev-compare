import Link from "next/link";
import {
  REFERENCE_DC_SCENARIO,
  type ChargingPreview,
  type ChargingPreviewError,
} from "@/application/chargingPreview";
import type { CalculationResult } from "@/calculations/result";
import type { VehicleId } from "@/data/catalogue";
import type { OriginContext } from "@/scenarios/originContext";
import { chargingPreviewErrorMessage } from "@/presentation/chargingErrors";
import {
  formatDurationHours,
  formatEnergyKwh,
  formatPowerKw,
  formatSocPercent,
} from "@/presentation/format";
import { dcSimulationHref } from "@/presentation/routes";
import { DataProvenanceTag } from "@/components/DataProvenanceTag/DataProvenanceTag";
import { DcPowerChart } from "@/components/DcPowerChart/DcPowerChart";
import { SignalNotice } from "@/components/SignalNotice/SignalNotice";
import styles from "./RicaricaPreview.module.css";

type RicaricaPreviewProps = {
  vehicleId: VehicleId;
  vehicleName: string;
  origin: OriginContext;
  charging: CalculationResult<ChargingPreview, ChargingPreviewError>;
};

/**
 * The Ricarica section as a non-configurable preview (M0.2 slice, Vehicle Analysis): the
 * reference DC scenario, its M0.1 results and a compact power-by-SoC chart. It has no control
 * that changes the scenario; configuring it is the dedicated simulator's job.
 */
export function RicaricaPreview({
  vehicleId,
  vehicleName,
  origin,
  charging,
}: RicaricaPreviewProps) {
  const available = charging.ok && charging.value.kind === "available";

  return (
    <section className={styles.section} aria-labelledby="ricarica-title">
      <div className={styles.header}>
        <h2 id="ricarica-title" className={styles.title}>
          Ricarica
        </h2>
        {available ? (
          <Link
            href={dcSimulationHref(vehicleId, origin)}
            className={styles.simulatorLink}
          >
            Apri nel simulatore
            <span className="visually-hidden">
              {" "}
              della ricarica DC di {vehicleName}
            </span>{" "}
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>

      {!charging.ok ? (
        <SignalNotice kind="critical" title="Calcolo non riuscito">
          <p>{chargingPreviewErrorMessage(charging.error)}</p>
        </SignalNotice>
      ) : charging.value.kind === "missingChargingData" ? (
        <SignalNotice
          kind="information"
          title="Dati di ricarica non disponibili"
        >
          <p>
            Il catalogo non riporta la curva di ricarica DC e la capacità
            utilizzabile di questo veicolo: il tempo di ricarica non è
            calcolato.
          </p>
        </SignalNotice>
      ) : (
        <AvailablePreview preview={charging.value} vehicleName={vehicleName} />
      )}
    </section>
  );
}

function AvailablePreview({
  preview,
  vehicleName,
}: {
  preview: Extract<ChargingPreview, { kind: "available" }>;
  vehicleName: string;
}) {
  const { simulation, chart } = preview;
  const { stationMaxPowerKw, initialSocPercent, targetSocPercent } =
    REFERENCE_DC_SCENARIO;

  return (
    <>
      <div className={styles.panel}>
        <div className={styles.conditions}>
          <h3 className={styles.kicker}>Condizioni</h3>
          <dl className={styles.conditionList}>
            <div>
              <dt>Tipo di ricarica</dt>
              <dd>Colonnina rapida (DC)</dd>
            </div>
            <div>
              <dt>Potenza della colonnina</dt>
              <dd>{formatPowerKw(stationMaxPowerKw)}</dd>
            </div>
            <div>
              <dt>Livello di carica</dt>
              <dd>
                {formatSocPercent(initialSocPercent)} →{" "}
                {formatSocPercent(targetSocPercent)}
              </dd>
            </div>
          </dl>

          <h3 className={`${styles.kicker} ${styles.assumptionsTitle}`}>
            Ipotesi
          </h3>
          <ul className={styles.assumptions}>
            <li>Curva di ricarica del costruttore (illustrativa)</li>
            <li>
              Energia immagazzinata nella batteria: quella prelevata dalla rete
              è maggiore
            </li>
            <li>Nessun effetto di temperatura o preriscaldamento</li>
          </ul>
        </div>

        <div className={styles.output}>
          <div className={styles.resultRow}>
            <dl className={styles.result}>
              <div className={styles.time}>
                <dt className="visually-hidden">Tempo di ricarica</dt>
                <dd>{formatDurationHours(simulation.chargingTimeHours)}</dd>
              </div>
              <div className={styles.interval}>
                <dt className="visually-hidden">Intervallo</dt>
                <dd>
                  da {formatSocPercent(simulation.initialSocPercent)} a{" "}
                  {formatSocPercent(simulation.finalSocPercent)}
                </dd>
              </div>
              <div className={styles.energy}>
                <dt className="visually-hidden">
                  Energia immagazzinata nella batteria
                </dt>
                <dd>
                  +{formatEnergyKwh(simulation.deliveredEnergyKwh)} nella
                  batteria
                </dd>
              </div>
            </dl>
            <div className={styles.resultTag}>
              <DataProvenanceTag kind="calcolo" />
            </div>
          </div>

          <h3 className={styles.chartTitle}>Potenza durante la ricarica</h3>
          <DcPowerChart series={chart} vehicleName={vehicleName} />
        </div>
      </div>
    </>
  );
}
