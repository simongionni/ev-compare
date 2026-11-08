import { expect, test } from "vitest";
import {
  formatAcCapability,
  formatBodyAndSeats,
  formatCapacityKwh,
  formatDurationHours,
  formatEnergyKwh,
  formatPowerKw,
  formatPriceEur,
  formatSocPercent,
  formatVehicleCount,
  formatVersion,
} from "@/presentation/format";

test("prices use the wireframe format", () => {
  expect(formatPriceEur(41_500)).toBe("€41.500");
  expect(formatPriceEur(4_500)).toBe("€4.500");
});

test("power is rounded to the kilowatt", () => {
  expect(formatPowerKw(175)).toBe("175 kW");
});

test("body type and seats", () => {
  expect(formatBodyAndSeats("midSizeSuv", 5)).toBe("SUV medio · 5 posti");
  expect(formatBodyAndSeats("mpv", 7)).toBe("Monovolume · 7 posti");
});

test("vehicle count agrees in number", () => {
  expect(formatVehicleCount(1)).toBe("1 veicolo");
  expect(formatVehicleCount(5)).toBe("5 veicoli");
});

test("calculated durations are rounded to the minute, without ~", () => {
  expect(formatDurationHours(0)).toBe("0 min");
  expect(formatDurationHours(22.2 / 60)).toBe("22 min");
  expect(formatDurationHours(27.3 / 60)).toBe("27 min");
  expect(formatDurationHours(59.6 / 60)).toBe("1 h");
  expect(formatDurationHours(5 + 36 / 60)).toBe("5 h 36");
  expect(formatDurationHours(1 + 5 / 60)).toBe("1 h 05");
});

test("calculated energy is rounded to 0.1 kWh with an Italian decimal comma", () => {
  expect(formatEnergyKwh(53.9000001)).toBe("53,9 kWh");
  expect(formatEnergyKwh(40.63)).toBe("40,6 kWh");
  expect(formatEnergyKwh(0)).toBe("0,0 kWh");
});

test("capacity, SoC and AC capability", () => {
  expect(formatCapacityKwh(77)).toBe("77 kWh");
  expect(formatCapacityKwh(58.5)).toBe("58,5 kWh");
  expect(formatSocPercent(10)).toBe("10%");
  expect(formatAcCapability({ maxPowerKw: 11, phases: 3 })).toBe(
    "11 kW, trifase",
  );
  expect(formatAcCapability({ maxPowerKw: 7.4, phases: 1 })).toBe(
    "7,4 kW, monofase",
  );
});

test("version line of the wireframes", () => {
  expect(formatVersion({ name: "Long Range", drivetrain: "rear" }, 77)).toBe(
    "Long Range · 77 kWh · trazione posteriore",
  );
  expect(formatVersion({ name: "Base", drivetrain: "front" }, undefined)).toBe(
    "Base · trazione anteriore",
  );
});
