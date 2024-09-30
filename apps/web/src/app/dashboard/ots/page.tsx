import React from "react";
import { getApi } from "~/trpc/server";
import { DashScreen } from "~/components/screen";
import OtsList from "./list";
import OtNew from "./new";

export default async function Ots() {
  const api = await getApi();
  const profile = await api.user.get();
  if (!profile.orgSel) {
    return <h1>Org no seleccionada</h1>;
  }

  const users = await api.org.listUsers({ orgId: profile.orgSel });
  const eqTypes = await api.eqType.list({ orgId: profile.orgSel });
  const ots = await api.ots.listOrg({ orgId: profile.orgSel });
  const equipos = await api.equip.list({ orgId: profile.orgSel });

  return (
    <DashScreen>
      <OtNew
        orgId={profile.orgSel}
        equipos={equipos.map((e) => {
          return {
            Id: e.Id,
            name: e.name,
          };
        })}
        templates={ots
          .filter((e) => e.isTemplate)
          .map((e) => {
            return {
              Id: e.Id,
              name: e.name,
            };
          })}
        usersAsignables={users
          .filter((u) => u !== null)
          .map((u) => {
            return {
              Id: u.orgUser.userId,
              name: u.profile.username,
            };
          })}
        eqTypes={eqTypes.map((e) => {
          return {
            Id: e.Id,
            name: e.name,
          };
        })}
      />
      <OtsList ots={ots} />
    </DashScreen>
  );
}
