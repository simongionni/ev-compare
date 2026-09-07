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

    
});