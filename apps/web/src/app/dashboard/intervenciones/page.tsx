import React from "react";
import { getApi } from "~/trpc/server";
import { DashScreen } from "~/components/screen";
import IntsList from "./list";
import { UserPublic } from "~/server/utils/other";

export default async function Ints() {
  const api = await getApi();
  const profile = await api.user.get();
  if (!profile.orgSel) {
    return <h1>Org no seleccionada</h1>;
  }

  const users = await api.org.listUsers({ orgId: profile.orgSel });
  const ints = await api.interventions.list({ orgId: profile.orgSel });
  const userMap = new Map<string, UserPublic>();

  for (const user of users) {
    if (user !== null) {
      userMap.set(user.orgUser.userId, user.profile);
    }
  }

  return (
    <DashScreen>
      <IntsList ints={ints} asignados={userMap} />
    </DashScreen>
  );
}
