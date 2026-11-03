import styles from "./AppHeader.module.css";

/**
 * The brand mark: the four comparison slot colours. It is the documented exception to the rule
 * that a slot colour appears only with its number or marker (Livrea Consolidated, provisional).
 */
export function BrandMark() {
  return (
    <span className={styles.mark} aria-hidden="true">
      <span className={styles.bar} data-slot="1" />
      <span className={styles.bar} data-slot="2" />
      <span className={styles.bar} data-slot="3" />
      <span className={styles.bar} data-slot="4" />
    </span>
  );
}
