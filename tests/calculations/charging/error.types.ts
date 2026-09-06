import type {ChargingCalculationError, TimeCalculationError} from "@/calculations/charging/error";

const validCalculationError: ChargingCalculationError = {
  type: "invalidBatteryCapacity",
  value: -75
};

const validSocCalculationError: ChargingCalculationError = {
  type: "invalidSoc",
  field: "fromSocPercent",
  value: -10
};

const validSocRangeCalculationError: ChargingCalculationError = {
  type: "invalidSocRange",
  message: "The starting SoC percentage must be less than the ending SoC percentage.",
  fromSocPercent: 80,
  toSocPercent: 20
};

const validTimeCalculationError: TimeCalculationError = {
  type: "invalidPower",
  value: -50
};

// @ts-expect-error error: missing required property 'type'
const invalidCalculationError1: ChargingCalculationError = {
  value: -75
};

// @ts-expect-error error: missing required property 'value'
const invalidCalculationError2: ChargingCalculationError = {
  type: "invalidBatteryCapacity"
};

const invalidCalculationError3: ChargingCalculationError = {
  //@ts-expect-error error: invalid type value for 'type' property
  type: "invalidType",
  value: -75
};

// @ts-expect-error error: missing required property 'field' for 'invalidSoc' type
const invalidSocCalculationError1: ChargingCalculationError = {
  type: "invalidSoc",
  value: -10
};

const invalidSocCalculationError2: ChargingCalculationError = {
  
  type: "invalidSoc",
  //@ts-expect-error error: invalid field value for 'field' property
  field: "banana",
  value: -10
};

//@ts-expect-error error: missing required property 'message' for 'invalidSocRange' type
const invalidSocRangeCalculationError1: ChargingCalculationError = {
  type: "invalidSocRange",
  fromSocPercent: 80,
  toSocPercent: 20
};

//@ts-expect-error error: missing required property 'fromSocPercent' for 'invalidSocRange' type
const invalidSocRangeCalculationError2: ChargingCalculationError = {
  type: "invalidSocRange",
  message: "The starting SoC percentage must be less than the ending SoC percentage.",
  toSocPercent: 20
};

//@ts-expect-error error: missing required property 'toSocPercent' for 'invalidSocRange' type
const invalidSocRangeCalculationError3: ChargingCalculationError = {
  type: "invalidSocRange",
  message: "The starting SoC percentage must be less than the ending SoC percentage.",
  fromSocPercent: 80
};

const invalidSocRangeCalculationError4: ChargingCalculationError = {
  type: "invalidSocRange",
  //@ts-expect-error error: invalid type for 'message' property
  message: -1,
  fromSocPercent: 80,
  toSocPercent: 20
};

//@ts-expect-error error: missing required property 'value' for 'invalidPower' type
const invalidTimeCalculationError1: TimeCalculationError = {
  type: "invalidPower"
};

const invalidTimeCalculationError2: TimeCalculationError = {
  //@ts-expect-error error: invalid type value for 'type' property
  type: "invalidType",
  value: -50
};

