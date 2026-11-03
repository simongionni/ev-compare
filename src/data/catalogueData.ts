import type { RawCatalogueVehicle } from "@/data/catalogue";

/**
 * Illustrative vehicle catalogue of the M0.2 first vertical slice.
 *
 * Nature: every vehicle and every value is ILLUSTRATIVE. The vehicles are fictional, invented
 * for the prototype; no manufacturer declared any of these values. The UI states this once,
 * globally ("Dati e veicoli illustrativi").
 *
 * Every value comes from the consolidated wireframes; none was invented for this catalogue:
 * - Body type, seats, list price and peak DC power: Discovery wireframe, Initial State
 *   (docs/ux/wireframes/consolidated-iteration-1/).
 * - Usable capacity, AC capability and DC curve of Nordis E4 and Aurora Vela: comparison
 *   wireframe README, "Charging data (illustrative)" (docs/ux/wireframes/vehicle-comparison/).
 *
 * Vehicles without documented charging data carry only their peak DC power. Nordis E2 is not
 * included: the wireframes document no price, seats or DC power for it.
 */
export const RAW_CATALOGUE: readonly RawCatalogueVehicle[] = [
  {
    id: "aurora-vela",
    make: "Aurora",
    model: "Vela",
    bodyType: "compact",
    seats: 5,
    listPriceEur: 32_900,
    charging: {
      kind: "complete",
      usableBatteryCapacityKwh: 58,
      ac: { maxPowerKw: 11, phases: 3 },
      dc: {
        maxPowerKw: 135,
        chargingCurve: [
          { socPercent: 0, powerKw: 100 },
          { socPercent: 10, powerKw: 120 },
          { socPercent: 25, powerKw: 135 },
          { socPercent: 40, powerKw: 120 },
          { socPercent: 60, powerKw: 80 },
          { socPercent: 80, powerKw: 40 },
          { socPercent: 90, powerKw: 30 },
          { socPercent: 100, powerKw: 20 },
        ],
      },
    },
  },
  {
    id: "nordis-e4",
    make: "Nordis",
    model: "E4",
    bodyType: "midSizeSuv",
    seats: 5,
    listPriceEur: 41_500,
    charging: {
      kind: "complete",
      usableBatteryCapacityKwh: 77,
      ac: { maxPowerKw: 11, phases: 3 },
      dc: {
        maxPowerKw: 175,
        chargingCurve: [
          { socPercent: 0, powerKw: 140 },
          { socPercent: 10, powerKw: 165 },
          { socPercent: 55, powerKw: 175 },
          { socPercent: 65, powerKw: 155 },
          { socPercent: 80, powerKw: 110 },
          { socPercent: 90, powerKw: 70 },
          { socPercent: 100, powerKw: 35 },
        ],
      },
    },
  },
  {
    id: "brisa-family",
    make: "Brisa",
    model: "Family",
    bodyType: "mpv",
    seats: 7,
    listPriceEur: 44_200,
    charging: { kind: "peakDcOnly", dcMaxPowerKw: 130 },
  },
  {
    id: "talon-s",
    make: "Talon",
    model: "S",
    bodyType: "sportsSedan",
    seats: 5,
    listPriceEur: 44_900,
    charging: { kind: "peakDcOnly", dcMaxPowerKw: 250 },
  },
  {
    id: "meridian-tour",
    make: "Meridian",
    model: "Tour",
    bodyType: "estate",
    seats: 5,
    listPriceEur: 46_800,
    charging: { kind: "peakDcOnly", dcMaxPowerKw: 230 },
  },
];
