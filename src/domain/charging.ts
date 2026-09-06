type ChargingCurvePoint = {
  socPercent: number;
  powerKw: number;
};

type ACChargingCapability = {
  maxPowerKw: number;
  phases: number;
  maxCurrentA?: number;
};

type DCChargingCapability = {
  maxPowerKw: number;
  chargingCurve: ChargingCurvePoint[];
};

type VehicleChargingSpec = {
  usableBatteryCapacityKwh: number;
  ac: ACChargingCapability;
  dc?: DCChargingCapability;
};

type ACChargingStation = {
  type: "AC";
  maxPowerKw: number;
  phases: number;
};

type DCChargingStation = {
  type: "DC";
  maxPowerKw: number;
};

type ChargingStation = ACChargingStation | DCChargingStation;

type TerminationCondition =
  | {
      type: "targetSoc";
      targetSocPercent: number;
    }
  | {
      type: "duration";
      durationMinutes: number;
    };

type ChargingSession = {
  initialSocPercent: number;
  termination: TerminationCondition;
};


