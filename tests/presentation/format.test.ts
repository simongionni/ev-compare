import { expect, test } from "vitest";
import {
  formatBodyAndSeats,
  formatPowerKw,
  formatPriceEur,
  formatVehicleCount,
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
