import type { Metadata } from "next";
import { connection } from "next/server";
import { catalogue } from "@/data/vehicles";
import { DiscoveryView } from "./DiscoveryView";

export const metadata: Metadata = { title: "Cerca" };

export default async function DiscoveryPage() {
  // Rendered per request: the search scenario comes from the URL of each request.
  await connection();
  return <DiscoveryView catalogue={catalogue} />;
}
