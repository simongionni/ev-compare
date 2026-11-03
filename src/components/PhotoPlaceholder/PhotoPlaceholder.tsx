import styles from "./PhotoPlaceholder.module.css";

type PhotoPlaceholderProps = {
  /** Model name shown on the label, for example "Nordis E4". */
  model: string;
  /** Intended view of the future photograph. */
  view?: string;
  className?: string;
};

/**
 * Labelled photographic placeholder (Livrea Consolidated, photography decision): the set a real
 * photo will use, with crop marks and the label "FOTO SEGNAPOSTO · model · view". No vehicle is
 * drawn and no real photograph is used.
 */
export function PhotoPlaceholder({
  model,
  view = "vista ¾ anteriore",
  className,
}: PhotoPlaceholderProps) {
  return (
    <div
      className={[styles.photo, className].filter(Boolean).join(" ")}
      role="img"
      aria-label={`Foto segnaposto: ${model}, ${view}`}
    >
      <span className={styles.shadow} aria-hidden="true" />
      <span className={styles.crop} aria-hidden="true" />
      <span className={styles.label} aria-hidden="true">
        <span className={styles.labelKind}>FOTO SEGNAPOSTO</span>
        {` · ${model} · ${view}`}
      </span>
    </div>
  );
}
