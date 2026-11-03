import Link from "next/link";
import {
  CATALOGUE_SPECIFICATION_PROVENANCE,
  peakDcPowerKw,
  vehicleName,
  type CatalogueVehicle,
} from "@/data/catalogue";
import {
  formatBodyAndSeats,
  formatPowerKw,
  formatPriceEur,
} from "@/presentation/format";
import { vehiclePath } from "@/presentation/routes";
import { DataProvenanceTag } from "@/components/DataProvenanceTag/DataProvenanceTag";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder/PhotoPlaceholder";
import styles from "./VehicleCard.module.css";

/**
 * Discovery result card of a vehicle outside the comparison (neutral: no slot colour).
 * Shows the data of the Initial State wireframe that the first slice covers.
 */
export function VehicleCard({ vehicle }: { vehicle: CatalogueVehicle }) {
  const name = vehicleName(vehicle);
  const titleId = `vehicle-${vehicle.id}`;
  const provenance = CATALOGUE_SPECIFICATION_PROVENANCE;

  return (
    <article className={styles.card} aria-labelledby={titleId}>
      <PhotoPlaceholder model={name} className={styles.photo} />
      <div className={styles.body}>
        <h3 id={titleId} className={styles.name}>
          {name}
        </h3>
        <p className={styles.kind}>
          {formatBodyAndSeats(vehicle.bodyType, vehicle.seats)}
        </p>

        <dl className={styles.specs}>
          <div className={styles.priceRow}>
            <dt className="visually-hidden">Prezzo di listino</dt>
            <dd className={styles.price}>
              {formatPriceEur(vehicle.listPriceEur)}
              <span className={styles.priceNote} aria-hidden="true">
                listino
              </span>
            </dd>
            <dd className={styles.tag}>
              <DataProvenanceTag kind={provenance} />
            </dd>
          </div>
          <div className={styles.specRow}>
            <dt className={styles.specLabel}>Potenza DC massima</dt>
            <dd className={styles.specValue}>
              {formatPowerKw(peakDcPowerKw(vehicle))}
            </dd>
            <dd className={styles.tag}>
              <DataProvenanceTag kind={provenance} />
            </dd>
          </div>
        </dl>

        <Link href={vehiclePath(vehicle.id)} className={styles.open}>
          Apri scheda<span className="visually-hidden"> di {name}</span>
        </Link>
      </div>
    </article>
  );
}
