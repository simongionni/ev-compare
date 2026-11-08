import Link from "next/link";
import styles from "./ContextBar.module.css";

type ContextBarProps = {
  /** The return link: visible copy without the chevron, and its destination. */
  back: { readonly label: string; readonly href: string };
  /** What the page is in the context of, beside the link (for example the search query). */
  context?: string;
};

/**
 * Context bar of the Livrea Consolidated screens: a return link with a chevron and, optionally,
 * the context it returns to. Vehicle Analysis shows "‹ Risultati" or "‹ Cerca" (wireframes); the
 * DC simulation shows "‹ <vehicle name>".
 */
export function ContextBar({ back, context }: ContextBarProps) {
  return (
    <nav className={styles.bar} aria-label="Contesto">
      <div className={styles.inner}>
        <Link href={back.href} className={styles.back}>
          <span aria-hidden="true">‹ </span>
          {back.label}
        </Link>
        {context !== undefined ? (
          <span className={styles.context}>{context}</span>
        ) : null}
      </div>
    </nav>
  );
}
