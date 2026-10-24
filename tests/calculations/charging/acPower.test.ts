import {describe, expect, it} from "vitest";
import {resolveEffectiveAcPower} from "@/calculations/charging/acPower";
import {createACChargingCapability, createACChargingStation} from "@/domain/chargingFactories";

describe("resolveEffectiveAcPower", () => {
    it("calculates effective AC power correctly for valid inputs", () => {
        const vehicle = createACChargingCapability({
            maxPowerKw: 11,
            phases: 1
        });
        const station = createACChargingStation({
            maxPowerKw: 22,
            phases: 3
        });

        const result = station.ok && vehicle.ok ? resolveEffectiveAcPower({ vehicle: vehicle.value, station: station.value }) : null;
        
        expect(result).toBeCloseTo(7.33, 2); // 11 kW / 1 phase = 11 kW per phase, 22 kW / 3 phases = 7.33 kW per phase, effective power = min(11, 7.33) * min(1, 3) = 7.33 kW
    });
    it("limits a single-phase vehicle on a three-phase station", () => {
        const vehicle = createACChargingCapability({
            maxPowerKw: 7.4,
            phases: 1,
        });

        const station = createACChargingStation({
            maxPowerKw: 11,
            phases: 3,
        });

        if (!vehicle.ok || !station.ok) {
            throw new Error("Test setup produced invalid charging data");
        }

        const result = resolveEffectiveAcPower({
            vehicle: vehicle.value,
            station: station.value,
        });

        expect(result).toBeCloseTo(11 / 3, 2);
        });

        it("uses the station limit when both vehicle and station are three-phase", () => {
        const vehicle = createACChargingCapability({
            maxPowerKw: 22,
            phases: 3,
        });

        const station = createACChargingStation({
            maxPowerKw: 11,
            phases: 3,
        });

        if (!vehicle.ok || !station.ok) {
            throw new Error("Test setup produced invalid charging data");
        }

        const result = resolveEffectiveAcPower({
            vehicle: vehicle.value,
            station: station.value,
        });

        expect(result).toBeCloseTo(11, 2);
        });

        it("does not exceed the total power of a single-phase station", () => {
        const vehicle = createACChargingCapability({
            maxPowerKw: 22,
            phases: 3,
        });

        const station = createACChargingStation({
            maxPowerKw: 2,
            phases: 1,
        });

        if (!vehicle.ok || !station.ok) {
            throw new Error("Test setup produced invalid charging data");
        }

        const result = resolveEffectiveAcPower({
            vehicle: vehicle.value,
            station: station.value,
        });

        expect(result).toBeCloseTo(2, 2);
        });

    
});