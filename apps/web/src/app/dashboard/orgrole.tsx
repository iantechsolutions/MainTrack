'use client'

import { useRef } from "react";
import { api } from "~/trpc/react";

export default function OrgRole() {
    const refId = useRef<HTMLInputElement>(null);
    const refUserId = useRef<HTMLInputElement>(null);
    const refRole = useRef<HTMLInputElement>(null);
    const mut = api.org.setRole.useMutation();

    return <form onSubmit={(e) => {
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
    }}>
        <label>Org Id:</label><br></br>
        <input ref={refId} type="text" id="id" name="id"></input><br></br>
        <label>User Id:</label><br></br>
        <input ref={refUserId} type="text" id="uid" name="iud"></input><br></br>
        <label>Rol:</label><br></br>
        <input ref={refRole} type="text" id="r" name="r"></input><br></br>
        <button type="submit">Submit</button>
    </form>;
}