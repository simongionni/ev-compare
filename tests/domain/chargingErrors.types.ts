import type * as ChargingErrors from "@/domain/chargingErrors";

const validACChargingCapabilityError: ChargingErrors.ACChargingCapabilityValidationError = {
  type: "invalidMaxPower",
  value: -1,
};

//@ts-expect-error missing type property
const invalidACChargingCapabilityError: ChargingErrors.ACChargingCapabilityValidationError = {
  value: -1,
};

//@ts-expect-error missing value property
const invalidACChargingCapabilityError2: ChargingErrors.ACChargingCapabilityValidationError = {
  type: "invalidMaxPower",
};

const invalidACChargingCapabilityError3: ChargingErrors.ACChargingCapabilityValidationError = {
  //@ts-expect-error invalid type property
    type: "invalid",
  value: -1,
};

const validACChargingStationError: ChargingErrors.ACChargingStationValidationError = {
  type: "invalidMaxPower",
  value: -1,
};

//@ts-expect-error missing type property
const invalidACChargingStationError1: ChargingErrors.ACChargingStationValidationError = {
  value: -1,
};

//@ts-expect-error missing value property
const invalidACChargingStationError2: ChargingErrors.ACChargingStationValidationError = {
  type: "invalidMaxPower",
};

const invalidACChargingStationError3: ChargingErrors.ACChargingStationValidationError = {
  //@ts-expect-error invalid type property
  type: "invalid",
  value: -1,
};