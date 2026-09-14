export type ChargingCurvePointValidationError =
  | {
      type: "invalidSoc";
      value: number;
    }
  | {
      type: "invalidPower";
      value: number;
    };

export type ChargingCurveValidationError =
  | ChargingCurvePointValidationError
  | {
      type: "notEnoughPoints";
      value: number;
    }
  | {
      type: "duplicateSoc";
      index: number;
      value: number;
    }
  | {
      type: "invalidSocOrder";
      index: number;
      previousSocPercent: number;
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
  | ChargingCurveValidationError
  | ACChargingCapabilityValidationError
  | ACChargingStationValidationError;
