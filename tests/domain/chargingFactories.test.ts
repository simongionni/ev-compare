import {describe, expect, it} from "vitest";
import {createACChargingCapability, createACChargingStation} from "@/domain/chargingFactories";

describe("createACChargingCapability", () => {
    it("returns an error for invalid maxPowerKw", () => {
        const raw = {
            maxPowerKw: -1,
            phases: 1,
            maxCurrentA: 0
        };
        const result = createACChargingCapability(raw);
        expect(result.ok).toBe(false);
        !result.ok && result.error ? expect(result.error.type).toBe("invalidMaxPower") : null;
    });

    it("returns an error for invalid phases", () => {
        const raw = {
            maxPowerKw: 1,
            phases: 4,
            maxCurrentA: 0
        };
        const result = createACChargingCapability(raw);
        expect(result.ok).toBe(false);
        !result.ok && result.error ? expect(result.error.type).toBe("invalidPhases") : null;
    });

    it("returns an error for invalid maxCurrentA", () => {
        const raw = {
            maxPowerKw: 1,
            phases: 1,
            maxCurrentA: -1
        };
        const result = createACChargingCapability(raw);
        expect(result.ok).toBe(false);
        !result.ok && result.error ? expect(result.error.type).toBe("invalidMaxCurrent") : null;
    });

    it("returns a valid ACChargingCapability for valid input", () => {
        const raw = {
            maxPowerKw: 1,
            phases: 1,
            maxCurrentA: 10
        };
        const result = createACChargingCapability(raw);
        expect(result.ok).toBe(true);
        result.ok && result.value ? expect(result.value).toEqual(raw) : null;
    });
});

describe("createACChargingStation", () => {
    it("returns an error for invalid maxPowerKw", () => {
        const raw = {
            maxPowerKw: -1,
            phases: 1
        };
        const result = createACChargingStation(raw);
        expect(result.ok).toBe(false);
        !result.ok && result.error ? expect(result.error.type).toBe("invalidMaxPower") : null;
    });

    it("returns an error for invalid phases", () => {
        const raw = {
            maxPowerKw: 1,
            phases: 4
        };
        const result = createACChargingStation(raw);
        expect(result.ok).toBe(false);
        !result.ok && result.error ? expect(result.error.type).toBe("invalidPhases") : null;
    });

    it("returns a valid ACChargingStation for valid input", () => {
        const raw = {
            maxPowerKw: 1,
            phases: 1
        };
        const result = createACChargingStation(raw);
        expect(result.ok).toBe(true);
        result.ok && result.value ? expect(result.value).toEqual({ ...raw, type: "AC" }) : null;
    });
});