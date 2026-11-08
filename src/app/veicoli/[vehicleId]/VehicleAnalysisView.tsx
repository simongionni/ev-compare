import type { VehicleAnalysis } from "@/application/vehicleAnalysis";
import {
  acCapability,
  CATALOGUE_SPECIFICATION_PROVENANCE,
  peakDcPowerKw,
  usableCapacityKwh,
  vehicleName,
} from "@/data/catalogue";
import {
  formatAcCapability,
  formatBodyAndSeats,
  formatCapacityKwh,
  formatPowerKw,
  formatPriceEur,
  formatVersion,
} from "@/presentation/format";
import { ContextBar } from "@/components/ContextBar/ContextBar";
import { DataProvenanceTag } from "@/components/DataProvenanceTag/DataProvenanceTag";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder/PhotoPlaceholder";
import { RicaricaPreview } from "./RicaricaPreview";
import styles from "./VehicleAnalysisView.module.css";

type KeyFact = { label: string; value: string | undefined };

/**
 * Vehicle Analysis in the first vertical slice: context bar, identity, main data and the
 * Ricarica preview. The other sections of the wireframes are outside the slice and absent.
 */
export function VehicleAnalysisView({
  analysis,
}: {
  analysis: VehicleAnalysis;
}) {
  const { vehicle, origin, charging } = analysis;
  const name = vehicleName(vehicle);
  const capacity = usableCapacityKwh(vehicle);
  const ac = acCapability(vehicle);
  const provenance = CATALOGUE_SPECIFICATION_PROVENANCE;

  const facts: KeyFact[] = [
    {
      label: "Capacità utilizzabile",
      value: capacity === undefined ? undefined : formatCapacityKwh(capacity),
    },
    {
      label: "Potenza AC massima",
      value: ac === undefined ? undefined : formatAcCapability(ac),
    },
    {
      label: "Potenza DC massima",
      value: formatPowerKw(peakDcPowerKw(vehicle)),
    },
  ];

  return (
    <>
      <ContextBar origin={origin} />
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="vehicle-title">
          <PhotoPlaceholder model={name} className={styles.photo} />

          <div className={styles.identity}>
            <h1 id="vehicle-title" className={styles.name}>
              {name}
            </h1>
            <p className={styles.kind}>
              {formatBodyAndSeats(vehicle.bodyType, vehicle.seats)}
            </p>
            {vehicle.version !== undefined ? (
              <p className={styles.version}>
                <span className="visually-hidden">Versione: </span>
                {formatVersion(vehicle.version, capacity)}
              </p>
            ) : null}

            <dl className={styles.data}>
              <div className={styles.priceRow}>
                <dt className="visually-hidden">Prezzo di listino</dt>
                <dd className={styles.price}>
                  {formatPriceEur(vehicle.listPriceEur)}
                  <span className={styles.priceNote} aria-hidden="true">
                    prezzo di listino
                  </span>
                </dd>
                <dd>
                  <DataProvenanceTag kind={provenance} />
                </dd>
              </div>

              <div className={styles.facts}>
                {facts.map((fact) => (
                  <div key={fact.label} className={styles.fact}>
                    <dt className={styles.factLabel}>{fact.label}</dt>
                    {fact.value !== undefined ? (
                      <>
                        <dd className={styles.factValue}>{fact.value}</dd>
                        <dd className={styles.factTag}>
                          <DataProvenanceTag kind={provenance} />
                        </dd>
                      </>
                    ) : (
                      <dd className={styles.factMissing}>Non disponibile</dd>
                    )}
                  </div>
                ))}
              </div>
            </dl>
          </div>
        </section>

        <RicaricaPreview
          vehicleId={vehicle.id}
          vehicleName={name}
          origin={origin}
          charging={charging}
        />

        <p className={styles.notice}>Dati e veicoli illustrativi.</p>
      </main>
    </>
  );
}
