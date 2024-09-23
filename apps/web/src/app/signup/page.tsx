'use client'
import React, { useRef } from 'react';
import { useSession, signIn } from "next-auth/react";
import { api } from '~/trpc/react';

export default function SignUp() {
    const { data: session } = useSession();
    const refName = useRef<HTMLInputElement>(null);
    const refEmail = useRef<HTMLInputElement>(null);
    const refPassword = useRef<HTMLInputElement>(null);
    const mut = api.auth.signUp.useMutation();

    return <div style={{
        'width': '100%',
        'height': '100%',
        'alignItems': 'center',
        'justifyContent': 'center'
    }}>
        {session ? <p>Ya logueado</p> : <>
            <form onSubmit={(e) => {
                e.preventDefault();
                (async () => {
                    if (!refName.current || !refEmail.current || !refPassword.current) {
                        throw "!refName.current || !refEmail.current || !refPassword.current";
                    }
                    const res = await mut.mutateAsync({
                        email: refEmail.current.value,
                        password: refPassword.current.value,
                        username: refName.current.value
                    });
                    console.log(res);
                })();
            }}>
                <label>Nombre:</label><br></br>
                <input ref={refName} type="text" id="name" name="name"></input><br></br>
                <label>Email:</label><br></br>
                <input ref={refEmail} type="text" id="email" name="email"></input><br></br>
                <label>Contraseña:</label><br></br>
                <input ref={refPassword} type="password" id="pswd" name="pswd"></input><br></br>
                <button type="submit">Submit</button>
            </form>
        </>}
    </div>;
}
