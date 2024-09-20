'use client'

import { useRef } from "react";
import { api } from "~/trpc/react";

export default function OrgInvA() {
    const refToken = useRef<HTMLInputElement>(null);
    const mut = api.org.join.useMutation();

    return <form onSubmit={(e) => {
        e.preventDefault();
        (async () => {
            if (!refToken.current) {
                throw "!refToken.current";
            }
            const res = await mut.mutateAsync({
                token: refToken.current.value
            });
            console.log(res);
        })();
    }}>
        <label>Token:</label><br></br>
        <input ref={refToken} type="text" id="id" name="id"></input><br></br>
        <button type="submit">Submit</button>
    </form>;
}
