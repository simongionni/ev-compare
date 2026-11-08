import Link from "next/link";
import type { ReactNode } from "react";
import { DISCOVERY_PATH } from "@/presentation/routes";
import styles from "./PageNotice.module.css";

type PageNoticeProps = {
  title: string;
  children?: ReactNode;
  /** Marks a destination that exists only as a provisional stand-in. */
  provisional?: boolean;
  /** Where the return link leads; Discovery ("‹ Cerca") by default. */
  back?: { label: string; href: string };
};

const BACK_TO_DISCOVERY = { label: "Cerca", href: DISCOVERY_PATH };

/** A page that only states its situation (not found, not implemented yet) and leads back. */
export function PageNotice({
  title,
  children,
  provisional,
  back = BACK_TO_DISCOVERY,
}: PageNoticeProps) {
  return (
    <main className={styles.page}>
      <Link href={back.href} className={styles.back}>
        <span aria-hidden="true">‹ </span>
        {back.label}
      </Link>
      <div className={styles.box} data-provisional={provisional || undefined}>
        <h1 className={styles.title}>{title}</h1>
        {children}
      </div>
    </main>
  );
}
