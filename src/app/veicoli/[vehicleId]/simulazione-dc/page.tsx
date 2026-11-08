import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findVehicle, vehicleName } from "@/data/catalogue";
import { catalogue } from "@/data/vehicles";
import {
  DIRECT_ORIGIN,
  parseOriginContext,
  searchParamsFromRecord,
} from "@/scenarios/originContext";
import { vehicleHref } from "@/presentation/routes";
import { PageNotice } from "@/components/PageNotice/PageNotice";

/*
 * PROVISIONAL destination of "Apri nel simulatore →". The dedicated DC simulation is the next
 * increment of the first vertical slice; this page simulates nothing. It only proves that the
 * link resolves to the same vehicle and that the origin context survives the round trip back to
 * the analysis. The copy of its return link is M0.2 open question 7.
 */

export const metadata: Metadata = { title: "Simulazione ricarica DC" };

export default async function DcSimulationPage({
  params,
  searchParams,
}: PageProps<"/veicoli/[vehicleId]/simulazione-dc">) {
  const { vehicleId } = await params;
  const vehicle = findVehicle(catalogue, vehicleId);

  if (vehicle === undefined) {
    notFound();
  }

  const origin = parseOriginContext(searchParamsFromRecord(await searchParams));
  const name = vehicleName(vehicle);

  return (
    <PageNotice
      title="Simulazione ricarica DC"
      provisional
      back={{
        label: name,
        href: vehicleHref(vehicle.id, origin.ok ? origin.value : DIRECT_ORIGIN),
      }}
    >
      <p>{name}</p>
      <p>Simulatore non ancora implementato.</p>
    </PageNotice>
  );
}
