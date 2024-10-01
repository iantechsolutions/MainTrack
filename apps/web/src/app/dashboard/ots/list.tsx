"use client";

import React from "react";
import { InferSelectModel } from "drizzle-orm";
import { schema } from "~/server/db";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { OtTypeText } from "~/server/utils/ot_types";

export default function OtsList({ ots }: { ots: InferSelectModel<typeof schema.ots>[] }) {
  return (
    <>
      {ots.map((u) => (
        <div key={`ou-${u.Id}`}>
          <p> Id: {u.Id}</p>
          <p> Nombre: {u.name}</p>
          <p> Es Template: {u.isTemplate ? `Sí, categoría ${u.tipoEquipoId}` : "No"}</p>
          <p> Fecha: {u.date.toLocaleDateString()}</p>
          <p> Límite días: {u.daysLimit}</p>
          <p> Período días: {u.daysPeriod}</p>
          <p> Tipo: {OtTypeText[u.otType]}</p>
          <p> Equipo ID: {u.equipoId ?? "null"}</p>
          <p> Template ID: {(u.templateId as { Id?: string })?.Id ?? "null"}</p>
          <p> Fecha último uso template: {u.templateLastUsed?.toLocaleDateString() ?? "null"}</p>
          <Link href={`/dashboard/ots/${u.Id}`}>
            <Button>Detalle</Button>
          </Link>
        </div>
      ))}
    </>
  );
}
