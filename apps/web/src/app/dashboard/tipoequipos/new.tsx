"use client";

import { useRef } from "react";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function TipoEquipoNew({ orgId }: { orgId: string }) {
  const refName = useRef<HTMLInputElement>(null);
  const refDesc = useRef<HTMLInputElement>(null);

  const mut = api.eqType.create.useMutation();

  return (
    <>
      <h1>Crear</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          (async () => {
            if (!refName.current || !refDesc.current) {
              throw "!refName.current || !refDesc.current";
            }
            const res = await mut.mutateAsync({
              name: refName.current.value,
              description: refDesc.current.value,
              orgId,
            });
            console.log(res);
          })();
        }}
      >
        <Label>Nombre:</Label>
        <br></br>
        <Input ref={refName} type="text" id="oname" name="oname"></Input>
        <br></br>
        <Label>Descripción:</Label>
        <br></br>
        <Input ref={refDesc} type="text" id="desc" name="desc"></Input>
        <br></br>
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
