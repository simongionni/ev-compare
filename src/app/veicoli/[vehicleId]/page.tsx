import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveVehicleAnalysis } from "@/application/vehicleAnalysis";
import { findVehicle, vehicleName } from "@/data/catalogue";
import { catalogue } from "@/data/vehicles";
import { searchParamsFromRecord } from "@/scenarios/originContext";
import { VehicleAnalysisView } from "./VehicleAnalysisView";

export async function generateMetadata({
  params,
}: PageProps<"/veicoli/[vehicleId]">): Promise<Metadata> {
  const { vehicleId } = await params;
  const vehicle = findVehicle(catalogue, vehicleId);
  return { title: vehicle ? vehicleName(vehicle) : "Veicolo non trovato" };
}

/**
 * Vehicle Analysis. Rendered per request: the origin context ("‹ Risultati" or "‹ Cerca") comes
 * from the URL of each request; results and chart series are derived from the vehicle each time.
 */
export default async function VehiclePage({
  params,
  searchParams,
}: PageProps<"/veicoli/[vehicleId]">) {
  const { vehicleId } = await params;
  const analysis = resolveVehicleAnalysis(
    catalogue,
    vehicleId,
    searchParamsFromRecord(await searchParams),
  );

  if (analysis === undefined) {
    notFound();
  }

  return <VehicleAnalysisView analysis={analysis} />;
}
