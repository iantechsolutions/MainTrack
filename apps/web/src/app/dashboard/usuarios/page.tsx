import React from "react";
import { getApi } from "~/trpc/server";
import UserList from "./list";
import { DashScreen } from "~/components/screen";

export default async function Usuarios() {
  const api = await getApi();
  const profile = await api.user.get();
  if (!profile.orgSel) {
    return <h1>Org no seleccionada</h1>;
  }

  const users = await api.org.listUsers({ orgId: profile.orgSel });

  return (
    <DashScreen>
      <UserList users={users} />
    </DashScreen>
  );
}
