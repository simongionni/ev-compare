import {ChargingCalculationError} from "@/calculations/charging/error";

const validCalculationError: ChargingCalculationError = {
  type: "invalidBatteryCapacity",
  value: -75
};

const validSocCalculationError: ChargingCalculationError = {
  type: "invalidSoc",
  field: "fromSocPercent",
  value: -10
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

