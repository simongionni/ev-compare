import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findVehicle, vehicleName } from "@/data/catalogue";
import { catalogue } from "@/data/vehicles";
import {
  DIRECT_ORIGIN,
  parseOriginContext,
  searchParamsFromRecord,
} from "@/scenarios/originContext";
import { DcSimulatorView } from "./DcSimulatorView";

export async function generateMetadata({
  params,
}: PageProps<"/veicoli/[vehicleId]/simulazione-dc">): Promise<Metadata> {
  const { vehicleId } = await params;
  const vehicle = findVehicle(catalogue, vehicleId);
  return {
    title: vehicle
      ? `Simulazione ricarica DC · ${vehicleName(vehicle)}`
      : "Veicolo non trovato",
  };
}

/**
 * Dedicated DC simulation of a vehicle. Rendered per request: the origin context and the
 * simulation scenario come from the URL of each request, so a shared URL rebuilds the page with
 * no previous navigation. The scenario is then followed on the client, where the controls
 * rewrite it in place (ADR 0001, Decision 2).
 */
export default async function DcSimulationPage({
  params,
  searchParams,
}: PageProps<"/veicoli/[vehicleId]/simulazione-dc">) {
  const { vehicleId } = await params;
  const vehicle = findVehicle(catalogue, vehicleId);

  if (vehicle === undefined) {
    notFound();
  }

  // Origin parameters that are not a valid origin open the page as a direct visit, as in
  // Vehicle Analysis: the return link then leads to the canonical vehicle URL ("‹ Cerca" there).
  const origin = parseOriginContext(searchParamsFromRecord(await searchParams));

  return (
    <DcSimulatorView
      vehicle={vehicle}
      origin={origin.ok ? origin.value : DIRECT_ORIGIN}
    />
  );
}
