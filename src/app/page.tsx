import { redirect } from "next/navigation";
import { DISCOVERY_PATH } from "@/presentation/routes";

// The landing page is outside the first vertical slice: the root opens Discovery.
export default function Home() {
  redirect(DISCOVERY_PATH);
}
