import {describe, expect, it} from "vitest";
import {timeForEnergyAtConstantPower} from "@/calculations/charging/time";

describe("timeForEnergyAtConstantPower", () => {
  it("calculates time correctly for valid inputs", () => {
    const energyKwh = 50; // Example energy in kWh
    const powerKw = 25; // Example power in kW
    const result = timeForEnergyAtConstantPower({ energyKwh, powerKw });

    expect(result).toEqual({ ok: true, value: 2 }); // 50 kWh / 25 kW = 2 hours
  });

  it("returns an error for invalid power", () => {
    const energyKwh = 50; // Example energy in kWh
    const powerKw = -10; // Invalid power in kW
    const result = timeForEnergyAtConstantPower({ energyKwh, powerKw });

    expect(result).toEqual({ ok: false, error: { type: "invalidPower", value: -10 } });
  });

    it("returns an error for invalid energy", () => {
    const energyKwh = -100; // Invalid energy in kWh
    const powerKw = 25; // Example power in kW
    const result = timeForEnergyAtConstantPower({ energyKwh, powerKw });

    expect(result).toEqual({ ok: false, error: { type: "invalidEnergy", value: -100 } });
  });
});