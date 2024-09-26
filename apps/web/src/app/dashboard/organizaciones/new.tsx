"use client";

import { useRef } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";

export default function OrgNew() {
  const refName = useRef<HTMLInputElement>(null);
  // const refSel = useRef<HTMLInputElement>(null);

  const mut = api.org.create.useMutation();

  return (
    <>
      <h1>Crear organización</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          (async () => {
            if (!refName.current) {
              throw "!refName.current";
            }

            await mut.mutateAsync({
              name: refName.current.value,
              // seleccionar: refName.current.checked
            });

            window.history.back();
          })();
        }}
      >
        <Label>Nombre:</Label>
        <br></br>
        <Input ref={refName} type="text" id="oname" name="oname" />
        <br></br>
        {/* <label>Seleccionar:</label><br></br>
            <input ref={refSel} type="checkbox" id="sel" name="sel"></input><br></br> */}
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
