import {describe, expect, it} from "vitest";
import {createACChargingCapability, createACChargingStation, createChargingCurve, createChargingCurvePoint} from "@/domain/chargingFactories";

describe("createChargingCurvePoint", () => {
    it("returns an error for an invalid SoC", () => {
        const result = createChargingCurvePoint({ socPercent: 101, powerKw: 100 });

        expect(result).toEqual({
            ok: false,
            error: { type: "invalidSoc", value: 101 },
        });
    });

    it("returns an error for an invalid power", () => {
        const result = createChargingCurvePoint({ socPercent: 50, powerKw: 0 });

        expect(result).toEqual({
            ok: false,
            error: { type: "invalidPower", value: 0 },
        });
    });

    it("returns a charging curve point for valid input", () => {
        const raw = { socPercent: 50, powerKw: 100 };

        expect(createChargingCurvePoint(raw)).toEqual({ ok: true, value: raw });
    });
});

describe("createChargingCurve", () => {
    it("returns an error when there are fewer than two points", () => {
        expect(createChargingCurve([{ socPercent: 0, powerKw: 200 }])).toEqual({
            ok: false,
            error: { type: "notEnoughPoints", value: 1 },
        });
    });

    it("returns the point validation error when a point is invalid", () => {
        expect(createChargingCurve([
            { socPercent: 0, powerKw: 200 },
            { socPercent: 101, powerKw: 100 },
        ])).toEqual({
            ok: false,
            error: { type: "invalidSoc", value: 101 },
        });
    });

    it("returns an error when a SoC value is duplicated", () => {
        expect(createChargingCurve([
            { socPercent: 0, powerKw: 200 },
            { socPercent: 20, powerKw: 150 },
            { socPercent: 20, powerKw: 100 },
            { socPercent: 80, powerKw: 50 },
        ])).toEqual({
            ok: false,
            error: { type: "duplicateSoc", index: 2, value: 20 },
        });
    });

    it("returns an error when unique SoC values are decreasing", () => {
        expect(createChargingCurve([
            { socPercent: 20, powerKw: 200 },
            { socPercent: 10, powerKw: 150 },
        ])).toEqual({
            ok: false,
            error: {
                type: "invalidSocOrder",
                index: 1,
                previousSocPercent: 20,
                value: 10,
            },
        });
    });

    it("returns a valid charging curve", () => {
        const raw = [
            { socPercent: 0, powerKw: 200 },
            { socPercent: 80, powerKw: 50 },
        ];

        expect(createChargingCurve(raw)).toEqual({ ok: true, value: raw });
    });
});

describe("createACChargingCapability", () => {
    it("returns an error for invalid maxPowerKw", () => {
        const raw = {
            maxPowerKw: -1,
            phases: 1,
            maxCurrentA: 10
        };
        const result = createACChargingCapability(raw);
        expect(result.ok).toBe(false);
        !result.ok && result.error ? expect(result.error.type).toBe("invalidMaxPower") : null;
    });

    it("returns an error for invalid phases", () => {
        const raw = {
            maxPowerKw: 1,
            phases: 4,
            maxCurrentA: 10
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
