"use client";

import { useRef } from "react";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function OrgEdit() {
  const refName = useRef<HTMLInputElement>(null);
  const refId = useRef<HTMLInputElement>(null);
  const mut = api.org.edit.useMutation();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        (async () => {
          if (!refName.current || !refId.current) {
            throw "!refName.current || !refId.current";
          }
          const res = await mut.mutateAsync({
            name: refName.current.value,
            orgId: refId.current.value,
          });
          console.log(res);
        })();
      }}
    >
      <Label>Id:</Label>
      <br></br>
      <Input ref={refId} type="text" id="id" name="id"></Input>
      <br></br>
      <Label>Nombre:</Label>
      <br></br>
      <Input ref={refName} type="text" id="name" name="name"></Input>
      <br></br>
      <button type="submit">Submit</button>
    </form>
  );
}
