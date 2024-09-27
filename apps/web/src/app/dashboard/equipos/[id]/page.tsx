// import { getApi } from "~/trpc/server";
// import OrgEdit from "./edit";

import { DashScreen } from "~/components/screen";
import { getApi } from "~/trpc/server";
import { EquipmentStatusText } from "~/server/utils/equipment_status";
import EquipoQr from "./qr";

export default async function Page({ params }: { params: { id: string } }) {
  const api = await getApi();
  const user = await api.user.get();
  if (!user.orgSel) {
    // esto nunca debería pasar
    return <h1>No hay org seleccionada</h1>;
  }

  const equipo = await api.equip.get({ equipId: params.id });
  const category = await api.eqType.get({ id: equipo.categoryId });

  return (
    <DashScreen>
      <p>Id: {equipo.Id}</p>
      <p>Name: {equipo.name}</p>
      <p>Modelo: {equipo.model}</p>
      <p>Fabricante: {equipo.manufacturer}</p>
      <p>Numero de serie: {equipo.serial}</p>
      <p>
        Location (TODO mapa): ({equipo.locationLat}, {equipo.locationLon})
      </p>
      <p>Status: {EquipmentStatusText[equipo.status]}</p>
      <p>Fecha de compra: {equipo.purchaseDate?.toLocaleDateString()}</p>
      <p>Fecha de expiración de garantía: {equipo.warrantyExpiration?.toLocaleDateString()}</p>
      <p>
        Categoría: {category.Id} ({category.name})
      </p>
      <EquipoQr />
    </DashScreen>
  );
}
