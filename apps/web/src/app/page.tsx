import { redirect } from "next/navigation";
import React from "react";
import NoOrgPage from "~/components/noorg";
import { DashScreen } from "~/components/screen";
import { getAuthId } from "~/lib/utils";
import { getApi } from "~/trpc/server";

export default async function Home() {
  const auth = await getAuthId();
  const isLoggedIn = typeof auth === "string";
  const api = await getApi();
  const userData = isLoggedIn
    ? {
        profile: await api.user.get(),
      }
    : null;
  
  if (typeof userData?.profile.orgSel !== 'string') {
    return <NoOrgPage />
  }

  return (
    <DashScreen>
      <p>Hola</p>
    </DashScreen>
  );
}
