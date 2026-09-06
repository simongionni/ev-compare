import type * as CalculationResult from "@/calculations/result";
import type { ChargingCalculationError } from "@/calculations/charging/error";

const validOkResult: CalculationResult.CalculationResult<number, string> = {
    ok: true,
    value: 42
};

const validErrorResult: CalculationResult.CalculationResult<number, ChargingCalculationError> = {
    ok: false,
    error: {
        type: "invalidBatteryCapacity",
        value: -75
    }
};


const invalidOkResult: CalculationResult.CalculationResult<number, string> = {
    ok: true,
    // @ts-expect-error error: error not assignable to ok result
    error: "This should not be here"
};

const invalidErrorResult: CalculationResult.CalculationResult<number, ChargingCalculationError> = {
    ok: false,
    // @ts-expect-error error: value not assignable to error result
    value: 42
};

// @ts-expect-error error: missing required property 'ok'
const missingOkProperty: CalculationResult.CalculationResult<number, string> = {
    value: 42
};

//@ts-expect-error error: missing required property 'ok'
const missingErrorProperty: CalculationResult.CalculationResult<number, ChargingCalculationError> = {
    error: {
        type: "invalidBatteryCapacity",
        value: -75
    }
};


// @ts-expect-error error: missing required property 'value'
const missingValueProperty: CalculationResult.CalculationResult<number, string> = {
    ok: true
};

// @ts-expect-error error: missing required property 'error'
const missingErrorProperty2: CalculationResult.CalculationResult<number, ChargingCalculationError> = {
    ok: false
};

function checkCalculationResultNarrowing(result: CalculationResult.CalculationResult<number, ChargingCalculationError>) {
    if (result.ok) {
        // In this branch, TypeScript knows that 'value' is available
        console.log(result.value);

        // @ts-expect-error error: 'error' is not available in this branch
        console.log(result.error);
    } else {
        // In this branch, TypeScript knows that 'error' is available
        console.log(result.error);

        // @ts-expect-error error: 'value' is not available in this branch
        console.log(result.value);
    }
}