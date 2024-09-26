'use client'
import { Input } from "~/components/ui/input";
import { useRef } from "react";
import { api } from "~/trpc/react";
import { Label } from '~/components/ui/label';

export default function ProfEdit() {
    const refEPfname = useRef<HTMLInputElement>(null);
    const refEPlname = useRef<HTMLInputElement>(null);
    const refEPuname = useRef<HTMLInputElement>(null);

    const mut = api.user.editSelf.useMutation();

    return <form onSubmit={(e) => {
        e.preventDefault();
        
        (async () => {
            const res = await mut.mutateAsync({
                // firstName: refEPfname.current?.value ?? "",
                // lastName: refEPlname.current?.value ?? "",
                username: refEPuname.current?.value ?? "",
            });
            console.log(res);
        })();
    }}>
        {/* <Label>First name:</Label><br></br>
        <Input ref={refEPfname} type="text" id="fname" name="fname"></Input><br></br>
        <Label>Last name:</Label><br></br>
        <Input ref={refEPlname} type="text" id="lname" name="lname"></Input><br></br> */}
        <Label>Username:</Label><br></br>
        <Input ref={refEPuname} type="text" id="uname" name="uname"></Input><br></br>
        <button type="submit">Submit</button>
    </form>;
}