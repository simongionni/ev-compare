//tests calculations/charging/energy.test.ts

import {describe, expect, it} from "vitest";
import {energyBetweenSoc} from "@/calculations/charging/energy";

describe("energyBetweenSoc", () => {
  it("calculates energy between SOC percentages correctly", () => {
    const batteryCapacityKwh = 75; // Example battery capacity in kWh
    const fromSocPercent = 20; // Starting SOC percentage
    const toSocPercent = 80; // Ending SOC percentage

    const result = energyBetweenSoc({ batteryCapacityKwh, fromSocPercent, toSocPercent });

    expect(result).toBe(45); // Adjust the expected value based on your implementation
  });
});
