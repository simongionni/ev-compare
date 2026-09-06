import type * as Charging from "@/domain/charging";

const validPoint : Charging.ChargingCurvePoint = {
  socPercent: 0,
  powerKw: 0,
} 

// @ts-expect-error - powerKw is missing
const invalidPoint1 : Charging.ChargingCurvePoint = {
  socPercent: 0
}
 // @ts-expect-error - socPercent is missing
const invalidPoint2 : Charging.ChargingCurvePoint = {
  powerKw: 0
}

// @ts-expect-error - socPercent and powerKw are missing
const invalidPoint3 : Charging.ChargingCurvePoint = {}


const invalidPoint4 : Charging.ChargingCurvePoint = {
  // @ts-expect-error - socPercent is a string
    socPercent: "0",
    powerKw: 0
}

const invalidPoint5 : Charging.ChargingCurvePoint = {  
    socPercent: 0,
    // @ts-expect-error - powerKw is a string
    powerKw: "0"
}

const validACChargingCapability : Charging.ACChargingCapability = {
  maxPowerKw: 0,
  phases: 1,
  maxCurrentA: 0
}

// @ts-expect-error - phases is missing
const invalidACChargingCapability1 : Charging.ACChargingCapability = {
  maxPowerKw: 0,
  maxCurrentA: 0
}

// @ts-expect-error - maxPowerKw is missing
const invalidACChargingCapability2 : Charging.ACChargingCapability = {
  phases: 1,
  maxCurrentA: 0
}

const invalidACChargingCapability3 : Charging.ACChargingCapability = {
  // @ts-expect-error - maxPowerKw is a string
  maxPowerKw: "0",
  phases: 1,
  maxCurrentA: 0
}

const invalidACChargingCapability4 : Charging.ACChargingCapability = {
  maxPowerKw: 0,
  // @ts-expect-error - phases is a string
  phases: "1",
  maxCurrentA: 0
}

const invalidACChargingCapability5 : Charging.ACChargingCapability = {
    maxPowerKw: 0,
    phases: 1,
    // @ts-expect-error - maxCurrentA is a string
    maxCurrentA: "0"
}

const validDCChargingCapability : Charging.DCChargingCapability = {
  maxPowerKw: 0,
  chargingCurve: [validPoint]
}

// @ts-expect-error - chargingCurve is missing
const invalidDCChargingCapability1 : Charging.DCChargingCapability = {
  maxPowerKw: 0
}

// @ts-expect-error - maxPowerKw is missing
const invalidDCChargingCapability2 : Charging.DCChargingCapability = {
  chargingCurve: [validPoint]
}

const invalidDCChargingCapability3 : Charging.DCChargingCapability = {
  // @ts-expect-error - maxPowerKw is a string
  maxPowerKw: "0",
  chargingCurve: [validPoint]
}

const invalidDCChargingCapability4 : Charging.DCChargingCapability = {
  maxPowerKw: 0,
  // @ts-expect-error - chargingCurve is a string
  chargingCurve: "invalid"
}

const invalidDCChargingCapability5 : Charging.DCChargingCapability = {
  maxPowerKw: 0,
  // @ts-expect-error - chargingCurve is an array of strings
  chargingCurve: ["invalid"]
}

const invalidDCChargingCapability6 : Charging.DCChargingCapability = {
  maxPowerKw: 0,
  // @ts-expect-error - chargingCurve is an array of objects with missing properties
  chargingCurve: [{}]
}

const invalidDCChargingCapability7 : Charging.DCChargingCapability = {
  maxPowerKw: 0,
  // @ts-expect-error - chargingCurve is an array of objects with invalid properties
  chargingCurve: [{socPercent: "0", powerKw: "0"}]
}

const validVehicleChargingSpec : Charging.VehicleChargingSpec = {
  usableBatteryCapacityKwh: 0,
  ac: validACChargingCapability,
  dc: validDCChargingCapability
}

// @ts-expect-error - usableBatteryCapacityKwh is missing
const invalidVehicleChargingSpec1 : Charging.VehicleChargingSpec = {
  ac: validACChargingCapability,
  dc: validDCChargingCapability
}

// @ts-expect-error - ac is missing
const invalidVehicleChargingSpec2 : Charging.VehicleChargingSpec = {
  usableBatteryCapacityKwh: 0,
  dc: validDCChargingCapability
}

const invalidVehicleChargingSpec3 : Charging.VehicleChargingSpec = {
  // @ts-expect-error - usableBatteryCapacityKwh is a string
  usableBatteryCapacityKwh: "0",
  ac: validACChargingCapability,
  dc: validDCChargingCapability
}

const invalidVehicleChargingSpec4 : Charging.VehicleChargingSpec = {
  usableBatteryCapacityKwh: 0,
  // @ts-expect-error - ac is a string
  ac: "invalid",
  dc: validDCChargingCapability
}

const invalidVehicleChargingSpec5 : Charging.VehicleChargingSpec = {
  usableBatteryCapacityKwh: 0,
  ac: validACChargingCapability,
    // @ts-expect-error - dc is a string
    dc: "invalid"
}

const invalidVehicleChargingSpec6 : Charging.VehicleChargingSpec = {
  usableBatteryCapacityKwh: 0,
  ac: validACChargingCapability,
    // @ts-expect-error - dc is an object with missing properties
    dc: {}
}

const invalidVehicleChargingSpec7 : Charging.VehicleChargingSpec = {
  usableBatteryCapacityKwh: 0,
  ac: validACChargingCapability,
    // @ts-expect-error - dc is an object with invalid properties
    dc: {maxPowerKw: "0", chargingCurve: ["invalid"]}
}

const invalidVehicleChargingSpec8 : Charging.VehicleChargingSpec = {
  usableBatteryCapacityKwh: 0,
 // @ts-expect-error - ac is an object with missing properties
  ac: {}
}

const invalidVehicleChargingSpec9 : Charging.VehicleChargingSpec = {
  usableBatteryCapacityKwh: 0,
 // @ts-expect-error - ac is an object with invalid properties
  ac: {maxPowerKw: "0", phases: "1", maxCurrentA: "0"}
}

const validACChargingStation : Charging.ACChargingStation = {
  type: "AC",
  maxPowerKw: 0,
  phases: 1
}

// @ts-expect-error - phases is missing
const invalidACChargingStation1 : Charging.ACChargingStation = {
  type: "AC",
  maxPowerKw: 0
}

// @ts-expect-error - maxPowerKw is missing
const invalidACChargingStation2 : Charging.ACChargingStation = {
  type: "AC",
  phases: 1
}

// @ts-expect-error - type is missing
const invalidACChargingStation3 : Charging.ACChargingStation = {
  maxPowerKw: 0,
  phases: 1
}

const invalidACChargingStation4 : Charging.ACChargingStation = {
    // @ts-expect-error - type is a string  
    type: "invalid",
    maxPowerKw: 0,
    phases: 1
}

const invalidACChargingStation5 : Charging.ACChargingStation = {
    type: "AC",
    // @ts-expect-error - maxPowerKw is a string
    maxPowerKw: "0",
    phases: 1
}

const invalidACChargingStation6 : Charging.ACChargingStation = {
    type: "AC",
    maxPowerKw: 0,
    // @ts-expect-error - phases is a string
    phases: "1"
}

const validDCChargingStation : Charging.DCChargingStation = {
  type: "DC",
  maxPowerKw: 0
}

// @ts-expect-error - maxPowerKw is missing
const invalidDCChargingStation1 : Charging.DCChargingStation = {
  type: "DC"
}

// @ts-expect-error - type is missing
const invalidDCChargingStation2 : Charging.DCChargingStation = {
  maxPowerKw: 0
}   

const invalidDCChargingStation3 : Charging.DCChargingStation = {
    // @ts-expect-error - type is a string
    type: "invalid",
    maxPowerKw: 0
}

const invalidDCChargingStation4 : Charging.DCChargingStation = {
    type: "DC",
    // @ts-expect-error - maxPowerKw is a string
    maxPowerKw: "0"
}

const validChargingStation1 : Charging.ChargingStation = validACChargingStation
const validChargingStation2 : Charging.ChargingStation = validDCChargingStation

const invalidChargingStation1 : Charging.ChargingStation = {
    // @ts-expect-error - type is invalid
    type: "invalid",
    maxPowerKw: 0,
    phases: 1
}

// @ts-expect-error - type is missing
const invalidChargingStation2 : Charging.ChargingStation = {
  maxPowerKw: 0,
  phases: 1
} 

const invalidChargingStation3 : Charging.ChargingStation = {
    type: "AC",
    // @ts-expect-error - maxPowerKw is a string
    maxPowerKw: "0",
    phases: 1
}

const invalidChargingStation4 : Charging.ChargingStation = {
    type: "AC",
    maxPowerKw: 0,
    // @ts-expect-error - phases is a string
    phases: "1"
}

const invalidChargingStation5 : Charging.ChargingStation = {
    type: "DC",
    // @ts-expect-error - maxPowerKw is a string
    maxPowerKw: "0"
}   

const invalidChargingStation6 : Charging.ChargingStation = {
    // @ts-expect-error - type is invalid
    type: "invalid",
    maxPowerKw: 0
}

const validTerminationCondition1 : Charging.TerminationCondition = {
  type: "targetSoc",
  targetSocPercent: 0
}

// @ts-expect-error - targetSocPercent is missing
const invalidTerminationCondition1 : Charging.TerminationCondition = {
  type: "targetSoc"
}

// @ts-expect-error - type is missing
const invalidTerminationCondition2 : Charging.TerminationCondition = {
  targetSocPercent: 0
}

const invalidTerminationCondition3 : Charging.TerminationCondition = {
    // @ts-expect-error - type is invalid
    type: "invalid",
    targetSocPercent: 0
}

const validTerminationCondition2 : Charging.TerminationCondition = {
  type: "duration",
  durationMinutes: 0
} 

// @ts-expect-error - durationMinutes is missing
const invalidTerminationCondition4 : Charging.TerminationCondition = {
  type: "duration"
}

// @ts-expect-error - type is missing
const invalidTerminationCondition5 : Charging.TerminationCondition = {
  durationMinutes: 0
}

const invalidTerminationCondition6 : Charging.TerminationCondition = {
    // @ts-expect-error - type is invalid
    type: "invalid",
    durationMinutes: 0
}

const validChargingSession : Charging.ChargingSession = {
  initialSocPercent: 0,
  termination: validTerminationCondition1
}

const invalidChargingSession1 : Charging.ChargingSession = {
  // @ts-expect-error - initialSocPercent is a string
  initialSocPercent: "0",
  termination: validTerminationCondition1
}

const invalidChargingSession2 : Charging.ChargingSession = {
  initialSocPercent: 0,
  // @ts-expect-error - termination is a string
  termination: "invalid"
}

const invalidChargingSession3 : Charging.ChargingSession = {
  initialSocPercent: 0,
  // @ts-expect-error - termination is an object with missing properties
  termination: {}
}

const invalidChargingSession4 : Charging.ChargingSession = {
  initialSocPercent: 0,
  // @ts-expect-error - termination is an object with invalid properties
  termination: {type: "invalid", targetSocPercent: 0}
}

const invalidChargingSession5 : Charging.ChargingSession = {
  initialSocPercent: 0,
  // @ts-expect-error - termination is an object with invalid properties
  termination: {type: "invalid", durationMinutes: 0}
}

 // @ts-expect-error - initialSocPercent is missing
const invalidChargingSession6 : Charging.ChargingSession = {
  termination: validTerminationCondition1
}

// @ts-expect-error - termination is missing
const invalidChargingSession7 : Charging.ChargingSession = {
  initialSocPercent: 0
}
