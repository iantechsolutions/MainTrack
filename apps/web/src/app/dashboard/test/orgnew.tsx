'use client'

import { useRef } from "react";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { Label } from '~/components/ui/label';

export default function OrgNew() {
    const refName = useRef<HTMLInputElement>(null);
    const refSel = useRef<HTMLInputElement>(null);

    const mut = api.org.create.useMutation();

    return <form onSubmit={(e) => {
        e.preventDefault();
        (async () => {
            if (!refName.current) {
                throw "!refName.current";
            }
            const res = await mut.mutateAsync({
                name: refName.current.value,
                // seleccionar: refName.current.checked
            });
            console.log(res);
        })();
    }}>
        <Label>Nombre:</Label><br></br>
        <Input ref={refName} type="text" id="oname" name="oname"></Input><br></br>
        <Label>Seleccionar:</Label><br></br>
        <input ref={refSel} type="checkbox" id="sel" name="sel"></input><br></br>
        <button type="submit">Submit</button>
    </form>;
}