export type ChargingCurvePointValidationError =
  | {
      type: "invalidSoc";
      value: number;
    }
  | {
      type: "invalidPower";
      value: number;
    };

export type ACChargingCapabilityValidationError =
  | {
      type: "invalidMaxPower";
      value: number;
    }
  | {
      type: "invalidPhases";
      value: number;
    }
  | {
      type: "invalidMaxCurrent";
      value: number;
    };

export type ACChargingStationValidationError =
  | {
      type: "invalidMaxPower";
      value: number;
    }
  | {
      type: "invalidPhases";
      value: number;
    };

export type ChargingFactoryError =
  | ChargingCurvePointValidationError
  | ACChargingCapabilityValidationError
  | ACChargingStationValidationError;
