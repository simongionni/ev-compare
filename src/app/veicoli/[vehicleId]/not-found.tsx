import { PageNotice } from "@/components/PageNotice/PageNotice";

export default function VehicleNotFound() {
  return (
    <PageNotice title="Veicolo non trovato">
      <p>Nel catalogo non c’è un veicolo con questo indirizzo.</p>
    </PageNotice>
  );
}
