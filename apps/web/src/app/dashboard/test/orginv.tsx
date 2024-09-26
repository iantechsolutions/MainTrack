"use client";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import { useRef } from "react";
import { api } from "~/trpc/react";

export default function OrgInv() {
  const refEmail = useRef<HTMLInputElement>(null);
  const refId = useRef<HTMLInputElement>(null);
  const mut = api.org.inviteUser.useMutation();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        (async () => {
          if (!refEmail.current || !refId.current) {
            throw "!refEmail.current || !refId.current";
          }
          const res = await mut.mutateAsync({
            orgId: refId.current.value,
            userEmail: refEmail.current.value,
          });
          console.log(res);
        })();
      }}
    >
      <Label>Id Org:</Label>
      <br></br>
      <Input ref={refId} type="text" id="id" name="id"></Input>
      <br></br>
      <Label>Email:</Label>
      <br></br>
      <Input ref={refEmail} type="text" id="name" name="name"></Input>
      <br></br>
      <button type="submit">Submit</button>
    </form>
  );
}
