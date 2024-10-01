"use client";

import React from "react";
import { InferSelectModel } from "drizzle-orm";
import { schema } from "~/server/db";
import { UserPublic } from "~/server/utils/other";
import { IntStatusText } from "~/server/utils/intervention_status";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function IntsList({
  ints,
  asignados,
}: {
  ints: InferSelectModel<typeof schema.interventions>[];
  asignados: Map<string, UserPublic>;
}) {
  return (
    <>
      {ints.map((u) => (
        <div key={`ou-${u.Id}`}>
          <p> Intervención ID: {u.Id}</p>
          <p> Intervención Status: {IntStatusText[u.status]}</p>
          <p> Intervención Limit Date: {u.limitDate.toLocaleDateString()}</p>
          <p> Intervención OT ID: {u.otId}</p>
          <p>
            {" "}
            Intervención Asignado: {asignados.get(u.userId)?.username} ({u.userId})
          </p>
          <Link href={`/dashboard/intervenciones/${u.Id}`}>
            <Button>Detalle</Button>
          </Link>
        </div>
      ))}
    </>
  );
}
