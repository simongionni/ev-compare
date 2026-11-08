import Link from "next/link";
import type { OriginContext } from "@/scenarios/originContext";
import { contextBarLink } from "@/presentation/routes";
import styles from "./ContextBar.module.css";

/**
 * Context bar of Vehicle Analysis (wireframes): "‹ Risultati" back to the search the page was
 * opened from, "‹ Cerca" when it was opened directly. Only the parts in the first slice are
 * shown (no criteria summary, no position in the results).
 */
export function ContextBar({ origin }: { origin: OriginContext }) {
  const link = contextBarLink(origin);
  const query = origin.kind === "search" ? origin.search.query : "";

  return (
    <nav className={styles.bar} aria-label="Contesto">
      <div className={styles.inner}>
        <Link href={link.href} className={styles.back}>
          <span aria-hidden="true">‹ </span>
          {link.label}
        </Link>
        {query !== "" ? (
          <span className={styles.context}>Ricerca “{query}”</span>
        ) : null}
      </div>
    </nav>
  );
}
