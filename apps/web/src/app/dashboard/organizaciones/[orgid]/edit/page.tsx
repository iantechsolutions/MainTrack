"use client";

import { useRef } from "react";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function OrgEdit({ params }: { params: { orgid: string } }) {
  const refName = useRef<HTMLInputElement>(null);
  const mut = api.org.edit.useMutation();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        (async () => {
          if (!refName.current) {
            throw "!refName.current";
          }

          await mut.mutateAsync({
            name: refName.current.value,
            orgId: params.orgid,
          });

          window.history.back();
        })();
      }}
    >
      <Label>Nombre:</Label>
      <br></br>
      <Input ref={refName} type="text" id="name" name="name"></Input>
      <br></br>
      <button type="submit">Submit</button>
    </form>
  );
}
