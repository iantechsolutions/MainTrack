"use client";
import { api } from "~/trpc/react";

export default function Orgs({
  orgs,
  selfId,
}: {
  selfId: string;
  orgs: {
    Id: string;
    nombre: string | null;
    usuariosOrganizaciones: {
      userId: string;
      rol: string | null;
      orgId: string;
      user: {
        Id: string;
        orgSel: string | null;
      };
    }[];
  }[];
}) {
  const mutSel = api.org.select.useMutation();
  const mutRem = api.org.removeUser.useMutation();
  const mutDel = api.org.delete.useMutation();

  return orgs.map((v) => (
    <div key={v.Id}>
      <p>Org Id: {v.Id}</p>
      <p>Org Name: {v.nombre}</p>
      <p>Usuarios totales: {v.usuariosOrganizaciones.length}</p>
      {v.usuariosOrganizaciones.map((k) => (
        <div key={`${v.Id}-${k.userId}`}>
          <p> Integrante Id: {k.userId}</p>
          <p> Integrante Rol: {k.rol}</p>
        </div>
      ))}
      <button
        onClick={async () => {
          const res = await mutSel.mutateAsync({
            orgId: v.Id,
          });
          console.log(res);
        }}
      >
        Seleccionar
      </button>
      <button
        onClick={async () => {
          const res = await mutRem.mutateAsync({
            orgId: v.Id,
            userId: selfId,
          });
          console.log(res);
        }}
      >
        Salir/Expulsar
      </button>
      <button
        onClick={async () => {
          const res = await mutDel.mutateAsync({
            orgId: v.Id,
          });
          console.log(res);
        }}
      >
        Eliminar
      </button>
    </div>
  ));
}
