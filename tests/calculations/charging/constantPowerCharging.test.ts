import {describe, expect, it} from "vitest";
import {constantPowerChargingTime} from "@/calculations/charging/constantPowerCharging";

describe("constantPowerChargingTime", () => {
    it("calculates charging time correctly for valid inputs", () => {
        const batteryCapacityKwh = 75; // Example battery capacity in kWh
        const fromSocPercent = 20; // Starting SOC percentage
        const toSocPercent = 80; // Ending SOC percentage
        const powerKw = 25; // Example charging power in kW
        const result = constantPowerChargingTime({batteryCapacityKwh, fromSocPercent, toSocPercent, powerKw });
        expect(result.ok).toBe(true);
        result.ok && expect(result.value).toBeCloseTo(1.8, 1);
    });

    it("returns an error for invalid battery capacity", () => {
        const batteryCapacityKwh = -10; // Invalid battery capacity
        const fromSocPercent = 20; // Starting SOC percentage
        const toSocPercent = 80; // Ending SOC percentage           
        const powerKw = 25; // Example charging power in kW
        const result = constantPowerChargingTime({batteryCapacityKwh, fromSocPercent, toSocPercent, powerKw });
        expect(result).toEqual({
            ok: false,
            error: {
                type: "invalidBatteryCapacity",
                value: batteryCapacityKwh
            }
        });
    });

    it("returns an error for invalid SOC percentages", () => {
        const batteryCapacityKwh = 75; // Example battery capacity in kWh
        const fromSocPercent = -10; // Invalid starting SOC percentage
        const toSocPercent = 80; // Ending SOC percentage
        const powerKw = 25; // Example charging power in kW
        const result = constantPowerChargingTime({batteryCapacityKwh, fromSocPercent, toSocPercent, powerKw });
        expect(result).toEqual({
            ok: false,
            error: {
                type: "invalidSoc",
                field: "fromSocPercent",
                value: fromSocPercent
            }
        });
    });

    it("returns an error for invalid ending SOC percentage", () => {
        const batteryCapacityKwh = 75; // Example battery capacity in kWh
        const fromSocPercent = 20; // Starting SOC percentage
        const toSocPercent = 110; // Invalid ending SOC percentage
        const powerKw = 25; // Example charging power in kW
        const result = constantPowerChargingTime({batteryCapacityKwh, fromSocPercent, toSocPercent, powerKw });
        expect(result).toEqual({
            ok: false,
            error: {
                type: "invalidSoc",
                field: "toSocPercent",
                value: toSocPercent
            }
        });
    });

    it("returns an error for invalid SOC range", () => {
        const batteryCapacityKwh = 75; // Example battery capacity in kWh
        const fromSocPercent = 80; // Starting SOC percentage
        const toSocPercent = 20; // Ending SOC percentage
        const powerKw = 25; // Example charging power in kW
        const result = constantPowerChargingTime({batteryCapacityKwh, fromSocPercent, toSocPercent, powerKw });
        expect(result).toEqual({
            ok: false,
            error: {
                type: "invalidSocRange",
                message: "The starting SoC percentage must be less than the ending SoC percentage.",
                fromSocPercent: fromSocPercent,
                toSocPercent: toSocPercent
            }
        });
    });

    it("returns an error for invalid charging power", () => {
        const batteryCapacityKwh = 75; // Example battery capacity in kWh
        const fromSocPercent = 20; // Starting SOC percentage
        const toSocPercent = 80; // Ending SOC percentage
        const powerKw = -25; // Invalid charging power in kW
        const result = constantPowerChargingTime({batteryCapacityKwh, fromSocPercent, toSocPercent, powerKw });
        expect(result).toEqual({
            ok: false,
            error: {
                type: "invalidPower",
                value: powerKw
            }
        });
    });
});