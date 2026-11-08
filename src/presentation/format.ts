import type { BodyType, Drivetrain, VehicleVersion } from "@/data/catalogue";
import type { ACChargingCapability } from "@/domain/charging";

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

const oneDecimalFormat = new Intl.NumberFormat("it-IT", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  useGrouping: "always",
});

const upToOneDecimalFormat = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 1,
  useGrouping: "always",
});

/** Battery capacity as a specification: "77 kWh", "58,5 kWh". */
export function formatCapacityKwh(value: number): string {
  return `${upToOneDecimalFormat.format(value)} kWh`;
}

/** Calculated energy, rounded to 0.1 kWh (M0.2 acceptance 4.2): "53,9 kWh". */
export function formatEnergyKwh(value: number): string {
  return `${oneDecimalFormat.format(value)} kWh`;
}

/**
 * Calculated duration, rounded to the minute (M0.2 acceptance 4.2), without "~": "22 min",
 * "5 h 36", "2 h".
 */
export function formatDurationHours(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0
    ? `${wholeHours} h`
    : `${wholeHours} h ${String(minutes).padStart(2, "0")}`;
}

/** State of charge: "10%". */
export function formatSocPercent(value: number): string {
  return `${upToOneDecimalFormat.format(value)}%`;
}

const PHASE_LABELS: Record<number, string> = {
  1: "monofase",
  2: "bifase",
  3: "trifase",
};

/** AC charging capability as in the specification sheet: "11 kW, trifase". */
export function formatAcCapability(ac: ACChargingCapability): string {
  const phases = PHASE_LABELS[ac.phases];
  const power = `${upToOneDecimalFormat.format(ac.maxPowerKw)} kW`;
  return phases === undefined ? power : `${power}, ${phases}`;
}

const DRIVETRAIN_LABELS: Record<Drivetrain, string> = {
  front: "trazione anteriore",
  rear: "trazione posteriore",
  allWheel: "trazione integrale",
};

/** Version line of the Vehicle Analysis wireframes: "Long Range · 77 kWh · trazione posteriore". */
export function formatVersion(
  version: VehicleVersion,
  usableCapacityKwh: number | undefined,
): string {
  return [
    version.name,
    usableCapacityKwh === undefined
      ? undefined
      : formatCapacityKwh(usableCapacityKwh),
    DRIVETRAIN_LABELS[version.drivetrain],
  ]
    .filter((part) => part !== undefined)
    .join(" · ");
}
