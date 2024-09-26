"use client";
import React, { useRef } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { DashScreen } from "~/components/screen";

export default function SignUp() {
  const { data: session } = useSession();
  const refName = useRef<HTMLInputElement>(null);
  const refEmail = useRef<HTMLInputElement>(null);
  const refPassword = useRef<HTMLInputElement>(null);
  const mut = api.auth.signUp.useMutation();

  return (
    <DashScreen>
      {session ? (
        <p>Ya logueado</p>
      ) : (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              (async () => {
                if (!refName.current || !refEmail.current || !refPassword.current) {
                  throw "!refName.current || !refEmail.current || !refPassword.current";
                }
                const res = await mut.mutateAsync({
                  email: refEmail.current.value,
                  password: refPassword.current.value,
                  username: refName.current.value,
                });
                console.log(res);
              })();
            }}
          >
            <Label>Nombre:</Label>
            <br></br>
            <Input ref={refName} type="text" id="name" name="name"></Input>
            <br></br>
            <Label>Email:</Label>
            <br></br>
            <Input ref={refEmail} type="text" id="email" name="email"></Input>
            <br></br>
            <Label>Contraseña:</Label>
            <br></br>
            <Input ref={refPassword} type="password" id="pswd" name="pswd"></Input>
            <br></br>
            <button type="submit">Submit</button>
          </form>
        </>
      )}
    </DashScreen>
  );
}
