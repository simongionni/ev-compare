"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DISCOVERY_PATH } from "@/presentation/routes";
import { BrandMark } from "./BrandMark";
import styles from "./AppHeader.module.css";

/**
 * Global header. Only the sections that exist are listed: Confronta, Strumenti tecnici and
 * Fonti e metodo are outside the first vertical slice and are absent, not disabled.
 */
export function AppHeader() {
  const pathname = usePathname();
  const onDiscovery = pathname === DISCOVERY_PATH;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href={DISCOVERY_PATH} className={styles.brand}>
          <BrandMark />
          EV Compare
        </Link>
        <nav aria-label="Principale" className={styles.nav}>
          <ul className={styles.navList}>
            <li>
              <Link
                href={DISCOVERY_PATH}
                className={styles.navLink}
                data-active={onDiscovery || undefined}
                aria-current={onDiscovery ? "page" : undefined}
              >
                Cerca
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
