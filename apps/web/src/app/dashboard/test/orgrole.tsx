"use client";

import { useRef } from "react";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function OrgRole() {
  const refId = useRef<HTMLInputElement>(null);
  const refUserId = useRef<HTMLInputElement>(null);
  const refRole = useRef<HTMLInputElement>(null);
  const mut = api.org.setRole.useMutation();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        (async () => {
          if (!refUserId.current || !refId.current || !refRole.current) {
            throw "!refName.current || !refId.current || !refRole.current";
          }
          const res = await mut.mutateAsync({
            orgId: refId.current.value,
            userId: refUserId.current.value,
            role: refRole.current.value,
          });
          console.log(res);
        })();
      }}
    >
      <Label>Org Id:</Label>
      <br></br>
      <Input ref={refId} type="text" id="id" name="id"></Input>
      <br></br>
      <Label>User Id:</Label>
      <br></br>
      <Input ref={refUserId} type="text" id="uid" name="iud"></Input>
      <br></br>
      <Label>Rol:</Label>
      <br></br>
      <Input ref={refRole} type="text" id="r" name="r"></Input>
      <br></br>
      <button type="submit">Submit</button>
    </form>
  );
}
