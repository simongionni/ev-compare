import {describe, expect, it} from "vitest";
import {createACChargingCapability, createACChargingStation, createChargingCurve, createChargingCurvePoint, createDCChargingCapability, createDCChargingStation} from "@/domain/chargingFactories";

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

    it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])("returns an error for a SoC of %s", (socPercent) => {
        expect(createChargingCurvePoint({ socPercent, powerKw: 100 })).toEqual({
            ok: false,
            error: { type: "invalidSoc", value: socPercent },
        });
    });

    it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])("returns an error for a power of %s", (powerKw) => {
        expect(createChargingCurvePoint({ socPercent: 50, powerKw })).toEqual({
            ok: false,
            error: { type: "invalidPower", value: powerKw },
        });
    });

    it("accepts the 0% and 100% SoC bounds", () => {
        expect(createChargingCurvePoint({ socPercent: 0, powerKw: 100 }).ok).toBe(true);
        expect(createChargingCurvePoint({ socPercent: 100, powerKw: 100 }).ok).toBe(true);
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

    it.each([0, Number.NaN, Number.POSITIVE_INFINITY])("returns an error for a maxPowerKw of %s", (maxPowerKw) => {
        expect(createACChargingCapability({ maxPowerKw, phases: 3 })).toEqual({
            ok: false,
            error: { type: "invalidMaxPower", value: maxPowerKw },
        });
    });

    it.each([0, 1.5, Number.NaN])("returns an error for %s phases", (phases) => {
        expect(createACChargingCapability({ maxPowerKw: 11, phases })).toEqual({
            ok: false,
            error: { type: "invalidPhases", value: phases },
        });
    });

    it.each([0, Number.NaN, Number.POSITIVE_INFINITY])("returns an error for a maxCurrentA of %s", (maxCurrentA) => {
        expect(createACChargingCapability({ maxPowerKw: 11, phases: 3, maxCurrentA })).toEqual({
            ok: false,
            error: { type: "invalidMaxCurrent", value: maxCurrentA },
        });
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

    it.each([0, Number.NaN, Number.POSITIVE_INFINITY])("returns an error for a maxPowerKw of %s", (maxPowerKw) => {
        expect(createACChargingStation({ maxPowerKw, phases: 3 })).toEqual({
            ok: false,
            error: { type: "invalidMaxPower", value: maxPowerKw },
        });
    });

    it.each([0, 1.5, Number.NaN])("returns an error for %s phases", (phases) => {
        expect(createACChargingStation({ maxPowerKw: 22, phases })).toEqual({
            ok: false,
            error: { type: "invalidPhases", value: phases },
        });
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


describe("createDCChargingCapability", () => {
    const chargingCurve = [
        { socPercent: 0, powerKw: 200 },
        { socPercent: 80, powerKw: 50 },
    ];

    it("returns a valid DCChargingCapability for valid input", () => {
        expect(createDCChargingCapability({ maxPowerKw: 150, chargingCurve })).toEqual({
            ok: true,
            value: { maxPowerKw: 150, chargingCurve },
        });
    });

    it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])("returns an error for a maxPowerKw of %s", (maxPowerKw) => {
        expect(createDCChargingCapability({ maxPowerKw, chargingCurve })).toEqual({
            ok: false,
            error: { type: "invalidMaxPower", value: maxPowerKw },
        });
    });

    it("propagates a charging curve with too few points", () => {
        expect(createDCChargingCapability({
            maxPowerKw: 150,
            chargingCurve: [{ socPercent: 0, powerKw: 200 }],
        })).toEqual({
            ok: false,
            error: { type: "notEnoughPoints", value: 1 },
        });
    });

    it("propagates an invalid charging curve point", () => {
        expect(createDCChargingCapability({
            maxPowerKw: 150,
            chargingCurve: [
                { socPercent: 0, powerKw: 200 },
                { socPercent: 80, powerKw: Number.POSITIVE_INFINITY },
            ],
        })).toEqual({
            ok: false,
            error: { type: "invalidPower", value: Number.POSITIVE_INFINITY },
        });
    });

    it("propagates an unordered charging curve", () => {
        expect(createDCChargingCapability({
            maxPowerKw: 150,
            chargingCurve: [
                { socPercent: 80, powerKw: 50 },
                { socPercent: 0, powerKw: 200 },
            ],
        })).toEqual({
            ok: false,
            error: { type: "invalidSocOrder", index: 1, previousSocPercent: 80, value: 0 },
        });
    });

    it("reports an invalid maxPowerKw before an invalid charging curve", () => {
        expect(createDCChargingCapability({ maxPowerKw: 0, chargingCurve: [] })).toEqual({
            ok: false,
            error: { type: "invalidMaxPower", value: 0 },
        });
    });

    it("does not mutate or share its input", () => {
        const raw = {
            maxPowerKw: 150,
            chargingCurve: [
                { socPercent: 0, powerKw: 200 },
                { socPercent: 80, powerKw: 50 },
            ],
        };
        const snapshot = structuredClone(raw);
        const result = createDCChargingCapability(raw);

        if (!result.ok) {
            throw new Error("Expected a valid DCChargingCapability");
        }

        expect(raw).toEqual(snapshot);
        expect(result.value.chargingCurve).not.toBe(raw.chargingCurve);
        expect(result.value.chargingCurve[0]).not.toBe(raw.chargingCurve[0]);
    });
});

describe("createDCChargingStation", () => {
    it("returns a valid DCChargingStation for valid input", () => {
        expect(createDCChargingStation({ maxPowerKw: 350 })).toEqual({
            ok: true,
            value: { type: "DC", maxPowerKw: 350 },
        });
    });

    it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])("returns an error for a maxPowerKw of %s", (maxPowerKw) => {
        expect(createDCChargingStation({ maxPowerKw })).toEqual({
            ok: false,
            error: { type: "invalidMaxPower", value: maxPowerKw },
        });
    });

    it("does not mutate or share its input", () => {
        const raw = { maxPowerKw: 350 };
        const result = createDCChargingStation(raw);

        expect(raw).toEqual({ maxPowerKw: 350 });
        expect(result.ok && result.value).not.toBe(raw);
    });
});
