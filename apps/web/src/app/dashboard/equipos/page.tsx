import React from "react";
import { getApi } from "~/trpc/server";
import EquipmentList from "./list";
import EquipmentNew from "./new";
import { DashScreen } from "~/components/screen";

export default async function Equipos() {
  const api = await getApi();
  const profile = await api.user.get();
  if (!profile.orgSel) {
    return <h1>Org no seleccionada</h1>;
  }

  const equips = await api.equip.list({ orgId: profile.orgSel });
  const eqTypes = await api.eqType.list({ orgId: profile.orgSel });
  const eqTypesMap = new Map<string, (typeof eqTypes)[0]>();

  for (const eqType of eqTypes) {
    eqTypesMap.set(eqType.Id, eqType);
  }

  return (
    <DashScreen>
      <EquipmentNew orgId={profile.orgSel} categories={eqTypes} />
      <EquipmentList categories={eqTypesMap} equipment={equips} />
    </DashScreen>
  );
}
