"use client";
import { api } from "~/trpc/react";

export default function OrgSel({
  orgSel,
  orgs,
}: {
  orgSel: string | null;
  orgs: {
    Id: string;
    nombre: string | null;
  }[];
}) {
  const mut = api.org.select.useMutation();
  console.log(orgSel);
  return (
    <div>
      <select
        defaultValue={orgSel ?? undefined}
        onChange={async (v) => {
          const res = await mut.mutateAsync({
            orgId: v.target.value,
          });
          console.log(res);
        }}
      >
        {orgs.map((o) => (
          <option key={`opt-${o.Id}`} value={o.Id}>
            {o.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
