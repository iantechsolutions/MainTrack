'use client'

import { useRef } from "react";
import { api } from "~/trpc/react";

export default function OrgEdit() {
    const refName = useRef<HTMLInputElement>(null);
    const refId = useRef<HTMLInputElement>(null);
    const mut = api.org.edit.useMutation();

    return <form onSubmit={(e) => {
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
    }}>
        <label>Id:</label><br></br>
        <input ref={refId} type="text" id="id" name="id"></input><br></br>
        <label>Nombre:</label><br></br>
        <input ref={refName} type="text" id="name" name="name"></input><br></br>
        <button type="submit">Submit</button>
    </form>;
}
