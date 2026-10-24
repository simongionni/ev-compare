import type {
  ChargingSession,
  ChargingStation,
  VehicleChargingSpec,
} from "@/domain/charging";
import type { CalculationResult } from "@/calculations/result";
import type {
  ChargingCalculationError,
  ChargingSessionError,
} from "@/calculations/charging/error";
import { acChargingTime } from "@/calculations/charging/acChargingTime";
import { dcChargingTime } from "@/calculations/charging/dcChargingTime";
import { energyDeltaForSocChange } from "@/calculations/charging/energy";

const MINUTES_PER_HOUR = 60;

const FULL_SOC_PERCENT = 100;

/**
 * Width, in SoC percentage points, below which the bisection that inverts the charging time
 * into a final SoC stops. 1e-6 points is about 1 mWh on a 100 kWh battery, and is reached after
 * at most 27 halvings of a 100-point span.
 */
const SOC_TOLERANCE_PERCENT = 1e-6;

/**
 * Upper bound on the bisection steps, as a safeguard; the tolerance is normally reached first.
 */
const SOC_BISECTION_MAX_ITERATIONS = 50;

export type SimulateChargingSessionInput = {
  vehicle: VehicleChargingSpec;
  station: ChargingStation;
  session: ChargingSession;
};

export type ChargingSessionTerminationReason =
  "targetReached" | "durationElapsed" | "batteryFull";

export type ChargingSessionSimulation = {
  initialSocPercent: number;
  finalSocPercent: number;
  chargingTimeHours: number;
  deliveredEnergyKwh: number;
  terminationReason: ChargingSessionTerminationReason;
};

/**
 * Time in hours to charge from one SoC percentage to another with a fixed vehicle and station.
 */
type ChargingTimeFn = (
  fromSocPercent: number,
  toSocPercent: number,
) => CalculationResult<number, ChargingCalculationError>;

/**
 * Simulates a charging session of a vehicle at a charging station.
 *
 * The station type selects the forward calculation (acChargingTime or dcChargingTime). A
 * target-SoC session returns the time needed to reach the target; a target at or below the
 * initial SoC is already reached. A duration session returns the SoC reached when the duration
 * elapses, found by bisection on the forward calculation so that it is consistent with it; if
 * the battery is full earlier, the session stops at 100% and the charging time is shorter than
 * the requested duration.
 *
 * Delivered energy is the energy stored in the battery; charging losses are not modelled.
 *
 * @param input - The vehicle charging specification, the charging station and the session.
 * @returns The simulation outcome with times in hours and energy in kWh, or an error if the
 * input is invalid or the vehicle cannot charge at the station.
 */
export function simulateChargingSession({
  vehicle,
  station,
  session,
}: SimulateChargingSessionInput): CalculationResult<
  ChargingSessionSimulation,
  ChargingSessionError
> {
  const chargingTime = resolveChargingTime(vehicle, station);

  if (!chargingTime.ok) {
    return chargingTime;
  }

  const { initialSocPercent, termination } = session;

  switch (termination.type) {
    case "targetSoc":
      return simulateToTargetSoc(
        chargingTime.value,
        vehicle.usableBatteryCapacityKwh,
        initialSocPercent,
        termination.targetSocPercent,
      );
    case "duration":
      return simulateForDuration(
        chargingTime.value,
        vehicle.usableBatteryCapacityKwh,
        initialSocPercent,
        termination.durationMinutes,
      );
  }
}

function resolveChargingTime(
  vehicle: VehicleChargingSpec,
  station: ChargingStation,
): CalculationResult<ChargingTimeFn, ChargingSessionError> {
  const batteryCapacityKwh = vehicle.usableBatteryCapacityKwh;

  switch (station.type) {
    case "AC":
      return {
        ok: true,
        value: (fromSocPercent, toSocPercent) =>
          acChargingTime({
            batteryCapacityKwh,
            fromSocPercent,
            toSocPercent,
            vehicle: vehicle.ac,
            station,
          }),
      };
    case "DC": {
      const dc = vehicle.dc;

      if (dc === undefined) {
        return { ok: false, error: { type: "dcChargingNotSupported" } };
      }

      return {
        ok: true,
        value: (fromSocPercent, toSocPercent) =>
          dcChargingTime({
            batteryCapacityKwh,
            fromSocPercent,
            toSocPercent,
            vehicle: dc,
            station,
          }),
      };
    }
  }
}

function simulateToTargetSoc(
  chargingTime: ChargingTimeFn,
  batteryCapacityKwh: number,
  initialSocPercent: number,
  targetSocPercent: number,
): CalculationResult<ChargingSessionSimulation, ChargingSessionError> {
  const energyDeltaKwh = energyDeltaForSocChange({
    batteryCapacityKwh,
    fromSocPercent: initialSocPercent,
    toSocPercent: targetSocPercent,
  });

  if (!energyDeltaKwh.ok) {
    return energyDeltaKwh;
  }

  if (targetSocPercent <= initialSocPercent) {
    return {
      ok: true,
      value: {
        initialSocPercent,
        finalSocPercent: initialSocPercent,
        chargingTimeHours: 0,
        deliveredEnergyKwh: 0,
        terminationReason: "targetReached",
      },
    };
  }

  const chargingTimeHours = chargingTime(initialSocPercent, targetSocPercent);

  if (!chargingTimeHours.ok) {
    return chargingTimeHours;
  }

  return {
    ok: true,
    value: {
      initialSocPercent,
      finalSocPercent: targetSocPercent,
      chargingTimeHours: chargingTimeHours.value,
      deliveredEnergyKwh: energyDeltaKwh.value,
      terminationReason: "targetReached",
    },
  };
}

function simulateForDuration(
  chargingTime: ChargingTimeFn,
  batteryCapacityKwh: number,
  initialSocPercent: number,
  durationMinutes: number,
): CalculationResult<ChargingSessionSimulation, ChargingSessionError> {
  if (durationMinutes < 0 || !Number.isFinite(durationMinutes)) {
    return {
      ok: false,
      error: { type: "invalidDuration", value: durationMinutes },
    };
  }

  const durationHours = durationMinutes / MINUTES_PER_HOUR;

  // Computed for every duration, including zero, so the inputs are always validated.
  const hoursToFull = chargingTime(initialSocPercent, FULL_SOC_PERCENT);

  if (!hoursToFull.ok) {
    return hoursToFull;
  }

  const batteryFull = hoursToFull.value <= durationHours;
  let finalSocPercent = FULL_SOC_PERCENT;

  if (!batteryFull) {
    const reachedSocPercent = socReachedAfter(
      chargingTime,
      initialSocPercent,
      durationHours,
    );

    if (!reachedSocPercent.ok) {
      return reachedSocPercent;
    }

    finalSocPercent = reachedSocPercent.value;
  }

  const deliveredEnergyKwh = energyDeltaForSocChange({
    batteryCapacityKwh,
    fromSocPercent: initialSocPercent,
    toSocPercent: finalSocPercent,
  });

  if (!deliveredEnergyKwh.ok) {
    return deliveredEnergyKwh;
  }

  return {
    ok: true,
    value: {
      initialSocPercent,
      finalSocPercent,
      chargingTimeHours: batteryFull ? hoursToFull.value : durationHours,
      deliveredEnergyKwh: deliveredEnergyKwh.value,
      terminationReason: batteryFull ? "batteryFull" : "durationElapsed",
    },
  };
}

/**
 * Finds the SoC reached after charging for the given time, by bisection on the forward
 * charging time (which increases with the target SoC). Stops once the bracket is narrower than
 * SOC_TOLERANCE_PERCENT. Returns the lower bound, so the charging time to the returned SoC never
 * exceeds the given duration.
 *
 * Assumes the battery is not full within the duration.
 */
function socReachedAfter(
  chargingTime: ChargingTimeFn,
  initialSocPercent: number,
  durationHours: number,
): CalculationResult<number, ChargingCalculationError> {
  let lowerSocPercent = initialSocPercent;
  let upperSocPercent = FULL_SOC_PERCENT;

  for (
    let iteration = 0;
    iteration < SOC_BISECTION_MAX_ITERATIONS &&
    upperSocPercent - lowerSocPercent > SOC_TOLERANCE_PERCENT;
    iteration++
  ) {
    const midSocPercent = (lowerSocPercent + upperSocPercent) / 2;
    const hours = chargingTime(initialSocPercent, midSocPercent);

    if (!hours.ok) {
      return hours;
    }

    if (hours.value <= durationHours) {
      lowerSocPercent = midSocPercent;
    } else {
      upperSocPercent = midSocPercent;
    }
  }

  return { ok: true, value: lowerSocPercent };
}
