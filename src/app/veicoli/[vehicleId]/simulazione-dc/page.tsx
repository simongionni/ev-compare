import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findVehicle, vehicleName } from "@/data/catalogue";
import { catalogue } from "@/data/vehicles";
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
 * Dedicated DC simulation of a vehicle. Rendered per request: the view reads the origin context
 * and the simulation scenario from the URL, on the server and then on the client, where the
 * controls rewrite it in place (ADR 0001, Decision 2). A shared URL rebuilds the page with no
 * previous navigation.
 */
export default async function DcSimulationPage({
  params,
}: PageProps<"/veicoli/[vehicleId]/simulazione-dc">) {
  const { vehicleId } = await params;
  const vehicle = findVehicle(catalogue, vehicleId);

  if (vehicle === undefined) {
    notFound();
  }

  return <DcSimulatorView vehicle={vehicle} />;
}
