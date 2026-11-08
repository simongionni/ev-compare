import type { ChargingPreviewError } from "@/application/chargingPreview";
import type { DcSimulationError } from "@/application/dcSimulation";
import type { ChargingSessionError } from "@/calculations/charging/error";

function engineErrorMessage(error: ChargingSessionError): string {
  switch (error.type) {
    case "dcChargingNotSupported":
      return "Il veicolo non supporta la ricarica in corrente continua.";
    case "invalidBatteryCapacity":
      return "La capacità della batteria non è valida.";
    case "invalidSoc":
    case "invalidSocRange":
      return "Il livello di carica non è valido.";
    case "invalidPower":
      return "Una potenza di ricarica non è valida.";
    case "invalidEnergy":
      return "L’energia da caricare non è valida.";
    case "invalidPhases":
      return "Il numero di fasi non è valido.";
    case "invalidDuration":
      return "La durata della ricarica non è valida.";
  }
}

/**
 * A message for each error of the Ricarica preview, by error type (M0.2 acceptance 4.4): never a
 * raw object.
 */
export function chargingPreviewErrorMessage(
  error: ChargingPreviewError,
): string {
  switch (error.type) {
    case "invalidStation":
      return "La potenza della colonnina di riferimento non è valida.";
    case "simulation":
    case "chart":
      return engineErrorMessage(error.error);
  }
}

/**
 * A message for each error of the dedicated DC simulation, by error type (M0.2 acceptance 4.4):
 * never a raw object.
 */
export function dcSimulationErrorMessage(error: DcSimulationError): string {
  switch (error.type) {
    case "invalidStation":
      return "La potenza della colonnina non è valida.";
    case "simulation":
    case "chart":
      return engineErrorMessage(error.error);
  }
}
