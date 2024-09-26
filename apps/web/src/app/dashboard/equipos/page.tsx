import React from "react";
import { getApi } from "~/trpc/server";
import EquipmentList from "./list";
import EquipmentNew from "./new";

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
    <div
      style={{
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <EquipmentNew orgId={profile.orgSel} categories={eqTypes} />
      <EquipmentList categories={eqTypesMap} equipment={equips} />
    </div>
  );
}
