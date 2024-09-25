'use client'

import { useRef } from "react";
import { api } from "~/trpc/react";

export default function TipoEquipoNew({ orgId }: { orgId: string }) {
    const refName = useRef<HTMLInputElement>(null);
    const refDesc = useRef<HTMLInputElement>(null);

    const mut = api.eqType.create.useMutation();

    return <>
        <h1>Crear</h1>
        <form onSubmit={(e) => {
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
        }}>
            <label>Nombre:</label><br></br>
            <input ref={refName} type="text" id="oname" name="oname"></input><br></br>
            <label>Descripción:</label><br></br>
            <input ref={refDesc} type="text" id="desc" name="desc"></input><br></br>
            <button type="submit">Submit</button>
        </form>
    </>;
}
