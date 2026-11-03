import Link from "next/link";
import type { ReactNode } from "react";
import { DISCOVERY_PATH } from "@/presentation/routes";
import styles from "./PageNotice.module.css";

type PageNoticeProps = {
  title: string;
  children?: ReactNode;
  /** Marks a destination that exists only as a provisional stand-in. */
  provisional?: boolean;
};

/** A page that only states its situation (not found, not implemented yet) and leads back to search. */
export function PageNotice({ title, children, provisional }: PageNoticeProps) {
  return (
    <main className={styles.page}>
      <Link href={DISCOVERY_PATH} className={styles.back}>
        ‹ Cerca
      </Link>
      <div className={styles.box} data-provisional={provisional || undefined}>
        <h1 className={styles.title}>{title}</h1>
        {children}
      </div>
    </main>
  );
}
