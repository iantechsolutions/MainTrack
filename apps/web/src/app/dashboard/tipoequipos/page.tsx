import React from "react";
import { getApi } from "~/trpc/server";
import TipoEquipoNew from "./new";
import { DashScreen } from "~/components/screen";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default async function TipoEquipos() {
  const api = await getApi();
  const self = await api.user.get();

  // no debería pasar por el layout
  if (!self.orgSel) {
    return <h2>org no seleccionada</h2>;
  }

  const tipos = await api.eqType.list({ orgId: self.orgSel });
  console.log(self.orgSel);
  console.log(tipos);

  return (
    <DashScreen>
      <h2>Tipos de Equipo</h2>
      <TipoEquipoNew orgId={self.orgSel} />
      {tipos.map((v) => (
        <div key={v.Id}>
          <p>Tipo de equipo: {v.name}</p>
          <p>Descripción: {v.description}</p>
          <Link href={`/dashboard/tipoequipos/${v.Id}`}>
            <Button>Ver</Button>
          </Link>
        </div>
      ))}
    </DashScreen>
  );
}
