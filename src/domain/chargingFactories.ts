import type { CalculationResult } from "@/calculations/result";
import type {
  ACChargingCapability,
  RawACChargingCapability,
  ACChargingStation,
  RawACChargingStation,
  ChargingCurvePoint,
  RawChargingCurvePoint,
  ChargingCurve,
  RawChargingCurve,
} from "@/domain/charging";
import type {
  ACChargingCapabilityValidationError,
  ACChargingStationValidationError,
  ChargingCurvePointValidationError,
  ChargingCurveValidationError,
} from "@/domain/chargingErrors";

export function createChargingCurvePoint(
  raw: RawChargingCurvePoint,
): CalculationResult<ChargingCurvePoint, ChargingCurvePointValidationError> {
  if (
    raw.socPercent < 0 ||
    raw.socPercent > 100 ||
    !Number.isFinite(raw.socPercent)
  ) {
    return {
      ok: false,
      error: {
        type: "invalidSoc",
        value: raw.socPercent,
      },
    };
  }

  if (raw.powerKw <= 0 || !Number.isFinite(raw.powerKw)) {
    return {
      ok: false,
      error: {
        type: "invalidPower",
        value: raw.powerKw,
      },
    };
  }

  return {
    ok: true,
    value: {
      socPercent: raw.socPercent,
      powerKw: raw.powerKw,
    },
  };
}

export function createChargingCurve(
  raw: RawChargingCurve,
): CalculationResult<ChargingCurve, ChargingCurveValidationError> {
  if (raw.length < 2) {
    return {
      ok: false,
      error: {
        type: "notEnoughPoints",
        value: raw.length,
      },
    };
  }

  const curve: ChargingCurvePoint[] = [];
  const seenSocPercentages = new Set<number>();

  for (const [index, rawPoint] of raw.entries()) {
    const pointResult = createChargingCurvePoint(rawPoint);

    if (!pointResult.ok) {
      return pointResult;
    }

    if (seenSocPercentages.has(pointResult.value.socPercent)) {
      return {
        ok: false,
        error: {
          type: "duplicateSoc",
          index,
          value: pointResult.value.socPercent,
        },
      };
    }

    const previousPoint = curve[curve.length - 1];

    if (
      previousPoint !== undefined &&
      pointResult.value.socPercent < previousPoint.socPercent
    ) {
      return {
        ok: false,
        error: {
          type: "invalidSocOrder",
          index,
          previousSocPercent: previousPoint.socPercent,
          value: pointResult.value.socPercent,
        },
      };
    }

    seenSocPercentages.add(pointResult.value.socPercent);
    curve.push(pointResult.value);
  }

  return {
    ok: true,
    value: [curve[0], curve[1], ...curve.slice(2)],
  };
}

export function createACChargingCapability(
  raw: RawACChargingCapability,
): CalculationResult<
  ACChargingCapability,
  ACChargingCapabilityValidationError
> {
  if (raw.maxPowerKw <= 0 || !Number.isFinite(raw.maxPowerKw)) {
    return {
      ok: false,
      error: {
        type: "invalidMaxPower",
        value: raw.maxPowerKw,
      },
    };
  }

  if (raw.phases < 1 || raw.phases > 3 || !Number.isInteger(raw.phases)) {
    return {
      ok: false,
      error: {
        type: "invalidPhases",
        value: raw.phases,
      },
    };
  }

  if (raw.maxCurrentA !== undefined && (raw.maxCurrentA <= 0 || !Number.isFinite(raw.maxCurrentA))) { //condizione in più perche maxCurrentA è opzionale, quindi se non è definito non deve generare errore
    return {
      ok: false,
      error: {
        type: "invalidMaxCurrent",
        value: raw.maxCurrentA,
      },
    };
  }

  return {
    ok: true,
    value: {
      maxPowerKw: raw.maxPowerKw,
      phases: raw.phases,
      maxCurrentA: raw.maxCurrentA,
    },
  };
}

export function createACChargingStation(
  raw: RawACChargingStation,
): CalculationResult<ACChargingStation, ACChargingStationValidationError> {
    if (raw.maxPowerKw <= 0 || !Number.isFinite(raw.maxPowerKw)) {
        return {
            ok: false,
            error: {
                type: "invalidMaxPower",
                value: raw.maxPowerKw,
            },
        };
    }

    if (raw.phases < 1 || raw.phases > 3 || !Number.isInteger(raw.phases)) {
        return {
            ok: false,
            error: {
                type: "invalidPhases",
                value: raw.phases,
            },
        };
    }

    return {
        ok: true,
        value: {
            type: "AC",
            maxPowerKw: raw.maxPowerKw,
            phases: raw.phases,
        },
    };
}
