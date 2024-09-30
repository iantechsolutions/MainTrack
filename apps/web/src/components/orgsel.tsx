"use client";
import { api } from "~/trpc/react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "~/components/ui/select";

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
  return (
    <Select onValueChange={async (v) => {
      const res = await mut.mutateAsync({
        orgId: v,
      });
      console.log(res);
      window.location.reload();
    }} defaultValue={orgSel ?? undefined}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Organización" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Organización</SelectLabel>
          <>
            {orgs.map((o) => (
            <SelectItem key={`opt-${o.Id}`} value={o.Id}>
              {o.nombre}
            </SelectItem>
          ))}
          </>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
  /* return (
    <div>
      <select
        defaultValue={orgSel ?? undefined}
        onChange={async (v) => {
          const res = await mut.mutateAsync({
            orgId: v.target.value,
          });
          console.log(res);
          window.location.reload();
        }}
      >
        {orgs.map((o) => (
          <option key={`opt-${o.Id}`} value={o.Id}>
            {o.nombre}
          </option>
        ))}
      </select>
    </div>
  ); */
}
