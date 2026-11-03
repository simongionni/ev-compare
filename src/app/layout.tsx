import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { AppHeader } from "@/components/AppHeader/AppHeader";
import "@/styles/globals.css";

// Schibsted Grotesk (SIL OFL 1.1, licence in ./fonts), self-hosted: the variable subset already
// used by the Livrea Consolidated SVGs (Latin-1 plus the punctuation, € and arrows of the copy).
const schibstedGrotesk = localFont({
  src: "./fonts/SchibstedGrotesk-subset.woff2",
  weight: "400 900",
  style: "normal",
  display: "swap",
  variable: "--font-schibsted-grotesk",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: { default: "EV Compare", template: "%s · EV Compare" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it" className={schibstedGrotesk.variable}>
      <body>
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
