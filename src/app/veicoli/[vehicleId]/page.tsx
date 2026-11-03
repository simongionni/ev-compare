import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findVehicle, vehicleName } from "@/data/catalogue";
import { catalogue } from "@/data/vehicles";
import { formatBodyAndSeats } from "@/presentation/format";
import { PageNotice } from "@/components/PageNotice/PageNotice";

/*
 * PROVISIONAL destination of "Apri scheda". Vehicle Analysis is the next increment of the first
 * vertical slice; this page only proves that the stable identifier resolves to the vehicle and
 * that unknown identifiers end in a not-found state. Its content is not the analysis.
 */

export async function generateMetadata({
  params,
}: PageProps<"/veicoli/[vehicleId]">): Promise<Metadata> {
  const { vehicleId } = await params;
  const vehicle = findVehicle(catalogue, vehicleId);
  return { title: vehicle ? vehicleName(vehicle) : "Veicolo non trovato" };
}

export default async function VehiclePage({
  params,
}: PageProps<"/veicoli/[vehicleId]">) {
  const { vehicleId } = await params;
  const vehicle = findVehicle(catalogue, vehicleId);

  if (vehicle === undefined) {
    notFound();
  }

  return (
    <PageNotice title={vehicleName(vehicle)} provisional>
      <p>{formatBodyAndSeats(vehicle.bodyType, vehicle.seats)}</p>
      <p>Scheda del veicolo non ancora implementata.</p>
    </PageNotice>
  );
}
