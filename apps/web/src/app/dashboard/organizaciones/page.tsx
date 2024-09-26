import React from "react";
import OrgsInfo from "./info";
import { getApi } from "~/trpc/server";
import OrgNew from "./new";
import { getAuthId } from "~/lib/utils";
import { DashScreen } from "~/components/screen";

export default async function Organizaciones() {
  const api = await getApi();
  const orgs = await api.org.list();
  const selfId = await getAuthId();

  return (
    <DashScreen>
      {/* esto probablemente no vaya acá */}
      <OrgNew />
      <OrgsInfo orgs={orgs} selfId={selfId ?? ""} />
    </DashScreen>
  );
}
