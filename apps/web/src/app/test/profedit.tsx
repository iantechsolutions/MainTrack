'use client'

import { useRef } from "react";
import { api } from "~/trpc/react";

export default function ProfEdit() {
    const refEPfname = useRef<HTMLInputElement>(null);
    const refEPlname = useRef<HTMLInputElement>(null);
    const refEPuname = useRef<HTMLInputElement>(null);

    const mut = api.user.editSelf.useMutation();

    return <form onSubmit={(e) => {
        e.preventDefault();
        
        (async () => {
            const res = await mut.mutateAsync({
                firstName: refEPfname.current?.value,
                lastName: refEPlname.current?.value,
                username: refEPuname.current?.value,
            });
            console.log(res);
        })();
    }}>
        <label>First name:</label><br></br>
        <input ref={refEPfname} type="text" id="fname" name="fname"></input><br></br>
        <label>Last name:</label><br></br>
        <input ref={refEPlname} type="text" id="lname" name="lname"></input><br></br>
        <label>Username:</label><br></br>
        <input ref={refEPuname} type="text" id="uname" name="uname"></input><br></br>
        <button type="submit">Submit</button>
    </form>;
}