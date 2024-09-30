// import { getApi } from "~/trpc/server";
// import OrgEdit from "./edit";

import { DashScreen } from "~/components/screen";
import { OtTypeText } from "~/server/utils/ot_types";
import { getApi } from "~/trpc/server";

export default async function Page({ params }: { params: { id: string } }) {
  const api = await getApi();
  const user = await api.user.get();
  if (!user.orgSel) {
    // esto nunca debería pasar
    return <h1>No hay org seleccionada</h1>;
  }

  const { ot: u } = await api.ots.get({ Id: params.id });

  return (
    <DashScreen>
      <p> Id: {u.Id}</p>
      <p> Nombre: {u.name}</p>
      <p> Es Template: {u.isTemplate ? `Sí, categoría ${u.tipoEquipoId}` : "No"}</p>
      <p> Fecha: {u.date.toLocaleDateString()}</p>
      <p> Límite días: {u.daysLimit}</p>
      <p> Período días: {u.daysPeriod}</p>
      <p> Tipo: {OtTypeText[u.otType]}</p>
      <p> Equipo ID: {u.equipoId ?? "null"}</p>
      <p> Template ID: {u.templateId ?? "null"}</p>
      <p> Fecha último uso template: {u.templateLastUsed?.toLocaleDateString() ?? "null"}</p>
    </DashScreen>
  );
}
