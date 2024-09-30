"use client";
import React from "react";
import { useSession, signIn } from "next-auth/react";
import { DashScreen } from "~/components/screen";
import { Button } from "~/components/ui/button";

export default function LogIn() {
  const { data: session } = useSession();

  return (
    <DashScreen>
      {session ? (
        <p>Ya logueado</p>
      ) : (
        <Button
          onClick={() => {
            signIn();
          }}
        >
          Iniciar sesión
        </Button>
      )}
    </DashScreen>
  );
}
