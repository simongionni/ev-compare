//tests calculations/charging/energy.test.ts

import {describe, expect, it} from "vitest";
import {energyDeltaForSocChange} from "@/calculations/charging/energy";

describe("energyDeltaForSocChange", () => {
  it("calculates energy delta for SOC change correctly", () => {
    const batteryCapacityKwh = 75; // Example battery capacity in kWh
    const fromSocPercent = 20; // Starting SOC percentage
    const toSocPercent = 80; // Ending SOC percentage

    const result = energyDeltaForSocChange({ batteryCapacityKwh, fromSocPercent, toSocPercent });

    expect(result).toEqual({ ok: true, value: 45 }); // Adjust the expected value based on your implementation
  });

    it("returns an error for invalid battery capacity", () => {
      const batteryCapacityKwh = -10; // Invalid battery capacity
      const fromSocPercent = 20; // Starting SOC percentage
      const toSocPercent = 80; // Ending SOC percentage

      const result = energyDeltaForSocChange({ batteryCapacityKwh, fromSocPercent, toSocPercent });

      expect(result).toEqual({
        ok: false,
        error: {
          type: "invalidBatteryCapacity",
          value: batteryCapacityKwh
        }
      });
    });

    it("returns an error for invalid SOC percentages", () => {
      const batteryCapacityKwh = 75; // Valid battery capacity
      const fromSocPercent = -10; // Invalid starting SOC percentage
      const toSocPercent = 80; // Valid ending SOC percentage

      const result = energyDeltaForSocChange({ batteryCapacityKwh, fromSocPercent, toSocPercent });

      expect(result).toEqual({
        ok: false,
        error: {
          type: "invalidSoc",
          field: "fromSocPercent",
          value: fromSocPercent
        }
      });
    });

    it("returns an error for invalid SOC percentages (toSocPercent)", () => {
      const batteryCapacityKwh = 75; // Valid battery capacity
      const fromSocPercent = 20; // Valid starting SOC percentage
      const toSocPercent = 120; // Invalid ending SOC percentage

      const result = energyDeltaForSocChange({ batteryCapacityKwh, fromSocPercent, toSocPercent });

      expect(result).toEqual({
        ok: false,
        error: {
          type: "invalidSoc",
          field: "toSocPercent",
          value: toSocPercent
        }
      });
    });
});
