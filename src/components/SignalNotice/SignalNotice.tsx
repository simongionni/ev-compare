import type { ReactNode } from "react";
import styles from "./SignalNotice.module.css";

export type SignalKind = "information" | "critical";

const ICON_LABELS: Record<SignalKind, string> = {
  information: "Informazione",
  critical: "Errore",
};

/**
 * A state reported with the signals family of Livrea Consolidated: always an icon and words,
 * never colour alone. Information is neutral (ink on Velo); critical is Critico on its tint.
 */
export function SignalNotice({
  kind,
  title,
  children,
}: {
  kind: SignalKind;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className={styles.notice} data-kind={kind}>
      <span className={styles.icon} role="img" aria-label={ICON_LABELS[kind]}>
        {kind === "information" ? "i" : "!"}
      </span>
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        {children}
      </div>
    </div>
  );
}
