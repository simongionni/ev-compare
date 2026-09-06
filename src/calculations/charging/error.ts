export type ChargingCalculationError =
  | {
      type: "invalidBatteryCapacity";
      value: number;
    }
  | {
      type: "invalidSoc";
      field: "fromSocPercent" | "toSocPercent";
      value: number;
    };