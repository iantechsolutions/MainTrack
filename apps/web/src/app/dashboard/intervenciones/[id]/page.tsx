// import { getApi } from "~/trpc/server";
// import OrgEdit from "./edit";

import { DashScreen } from "~/components/screen";
import { IntStatusText } from "~/server/utils/intervention_status";
import { getApi } from "~/trpc/server";

export default async function Page({ params }: { params: { id: string } }) {
  const api = await getApi();
  const user = await api.user.get();
  if (!user.orgSel) {
    // esto nunca debería pasar
    return <h1>No hay org seleccionada</h1>;
  }

  const interv = await api.interventions.get({ intId: params.id });
  if (!interv) {
    return <h1>No existe</h1>;
  }

  const ot = await api.ots.get({ Id: interv.otId });
  if (!ot) {
    return <h1>No existe OT de intervención</h1>;
  }

  const asignado = await api.org.getUser({ orgId: interv.orgId, userId: interv.userId });
  if (!asignado) {
    return <h1>No existe usuario asignado de intervención</h1>;
  }

  return (
    <DashScreen>
      <p> Intervención ID: {interv.Id}</p>
      <p> Intervención Status: {IntStatusText[interv.status]}</p>
      <p> Intervención Limit Date: {interv.limitDate.toLocaleDateString()}</p>
      <p> Intervención OT: {ot.name} ({interv.otId})</p>
      <p> Intervención Asignado: {asignado.profile.username} ({interv.userId})</p>
    </DashScreen>
  );
}
