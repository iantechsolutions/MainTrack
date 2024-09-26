// import { getApi } from "~/trpc/server";
// import OrgEdit from "./edit";

import { DashScreen } from "~/components/screen";
import { getApi } from "~/trpc/server";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default async function Page({ params }: { params: { orgid: string } }) {
  const api = await getApi();
  const user = await api.user.get();
  if (!user.orgSel) {
    // esto nunca debería pasar
    return <h1>No hay org seleccionada</h1>;
  }

  const orgData = {
    org: await api.org.get({ orgId: params.orgid }),
    users: await api.org.listUsers({ orgId: user.orgSel }),
  };

  return (
    <DashScreen>
      <p>Id: {orgData.org.Id}</p>
      <p>Name: {orgData.org.nombre}</p>
      <p>Users length: {orgData.users.length}</p>
      <h3>Users:</h3>
      {orgData.users.map((u) => (
        <div key={`ou-${u?.profile.Id}`}>
          <p> Id: {u?.profile.Id}</p>
          <p> Nombre: {u?.profile.username}</p>
          {typeof u?.profile.imageUrl === "string" && u?.profile.imageUrl.length > 0 ? (
            <Image src={u.profile.imageUrl} width={32} height={32} alt="img" />
          ) : (
            <></>
          )}
          <p> rol: {u?.orgUser.rol}</p>
        </div>
      ))}
      <Link href={`/dashboard/organizaciones/${params.orgid}/edit`}>
        <Button>Editar</Button>
      </Link>
    </DashScreen>
  );
}
