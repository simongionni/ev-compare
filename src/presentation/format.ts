import type { BodyType } from "@/data/catalogue";

const integerFormat = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 0,
  useGrouping: "always",
});

/** List price as drawn in the wireframes: "€41.500". */
export function formatPriceEur(value: number): string {
  return `€${integerFormat.format(value)}`;
}

/** Power in kilowatts, rounded to the kilowatt: "175 kW". */
export function formatPowerKw(value: number): string {
  return `${integerFormat.format(value)} kW`;
}

const BODY_TYPE_LABELS: Record<BodyType, string> = {
  compact: "Compatta",
  midSizeSuv: "SUV medio",
  mpv: "Monovolume",
  sportsSedan: "Berlina sportiva",
  estate: "Station wagon",
};

export function bodyTypeLabel(bodyType: BodyType): string {
  return BODY_TYPE_LABELS[bodyType];
}

/** "SUV medio · 5 posti" */
export function formatBodyAndSeats(bodyType: BodyType, seats: number): string {
  return `${bodyTypeLabel(bodyType)} · ${seats} ${seats === 1 ? "posto" : "posti"}`;
}

/** "5 veicoli", "1 veicolo" */
export function formatVehicleCount(count: number): string {
  return `${count} ${count === 1 ? "veicolo" : "veicoli"}`;
}
