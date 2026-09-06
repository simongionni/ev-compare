export type EnergyDeltaCalculationError =
  | {
      type: "invalidBatteryCapacity";
      value: number;
    }
  | {
      type: "invalidSoc";
      field: "fromSocPercent" | "toSocPercent";
      value: number;
    };

export type TimeCalculationError =
  | {
      type: "invalidPower";
      value: number;
    }
  | {
      type: "invalidEnergy";
      value: number;
    }

export type ChargingCalculationError = EnergyDeltaCalculationError | TimeCalculationError;