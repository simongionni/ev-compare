export type RawChargingCurvePoint = {
  socPercent: number;
  powerKw: number;
};

export type ChargingCurvePoint = RawChargingCurvePoint;

export type RawChargingCurve = RawChargingCurvePoint[];

export type ChargingCurve = [
  ChargingCurvePoint,
  ChargingCurvePoint,
  ...ChargingCurvePoint[],
];

export type RawACChargingCapability = {
  maxPowerKw: number;
  phases: number;
  maxCurrentA?: number;
};

export type ACChargingCapability = {
  maxPowerKw: number;
  phases: number;
  maxCurrentA?: number;
};

export type DCChargingCapability = {
  maxPowerKw: number;
  chargingCurve: ChargingCurve;
};

export type VehicleChargingSpec = {
  usableBatteryCapacityKwh: number;
  ac: ACChargingCapability;
  dc?: DCChargingCapability;
};

export type RawACChargingStation = {
  maxPowerKw: number;
  phases: number;
};

export type ACChargingStation = {
  type: "AC";
  maxPowerKw: number;
  phases: number;
};

export type DCChargingStation = {
  type: "DC";
  maxPowerKw: number;
};

export type ChargingStation = ACChargingStation | DCChargingStation;

export type TerminationCondition =
  | {
      type: "targetSoc";
      targetSocPercent: number;
    }
  | {
      type: "duration";
      durationMinutes: number;
    };

export type ChargingSession = {
  initialSocPercent: number;
  termination: TerminationCondition;
};


