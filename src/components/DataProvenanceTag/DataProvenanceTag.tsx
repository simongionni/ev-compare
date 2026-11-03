import type { ProvenanceKind } from "@/data/provenance";
import styles from "./DataProvenanceTag.module.css";

/** Provenance tag: the glyph of the kind (■ costruttore, ○ stima, ◆ calcolo) and its word. */
export function DataProvenanceTag({ kind }: { kind: ProvenanceKind }) {
  return (
    <span className={styles.tag}>
      <span className={styles.glyph} data-kind={kind} aria-hidden="true" />
      <span className="visually-hidden">Provenienza: </span>
      {kind}
    </span>
  );
}
