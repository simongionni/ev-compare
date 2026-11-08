import { expect, test } from "vitest";
import type { ChargingPreviewError } from "@/application/chargingPreview";
import { chargingPreviewErrorMessage } from "@/presentation/chargingErrors";

test.each<[ChargingPreviewError, string]>([
  [
    { type: "invalidStation", error: { type: "invalidMaxPower", value: 0 } },
    "La potenza della colonnina di riferimento non è valida.",
  ],
  [
    { type: "simulation", error: { type: "dcChargingNotSupported" } },
    "Il veicolo non supporta la ricarica in corrente continua.",
  ],
  [
    { type: "simulation", error: { type: "invalidBatteryCapacity", value: 0 } },
    "La capacità della batteria non è valida.",
  ],
  [
    { type: "chart", error: { type: "invalidPower", value: -1 } },
    "Una potenza di ricarica non è valida.",
  ],
  [
    {
      type: "chart",
      error: { type: "invalidSoc", field: "socPercent", value: 120 },
    },
    "Il livello di carica non è valido.",
  ],
])(
  "a message for each error type, never a raw object: %j",
  (error, message) => {
    expect(chargingPreviewErrorMessage(error)).toBe(message);
  },
);
