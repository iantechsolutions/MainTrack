'use client'

import { useRef } from "react";
import { api } from "~/trpc/react";

export default function OrgInv() {
    const refEmail = useRef<HTMLInputElement>(null);
    const refId = useRef<HTMLInputElement>(null);
    const mut = api.org.inviteUser.useMutation();

    return <form onSubmit={(e) => {
        e.preventDefault();
        (async () => {
            if (!refEmail.current || !refId.current) {
                throw "!refEmail.current || !refId.current";
            }
            const res = await mut.mutateAsync({
                orgId: refId.current.value,
                userEmail: refEmail.current.value
            });
            console.log(res);
        })();
    }}>
        <label>Id Org:</label><br></br>
        <input ref={refId} type="text" id="id" name="id"></input><br></br>
        <label>Email:</label><br></br>
        <input ref={refEmail} type="text" id="name" name="name"></input><br></br>
        <button type="submit">Submit</button>
    </form>;
}