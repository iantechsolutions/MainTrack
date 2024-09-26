"use client";
import React from "react";
import { useSession, signIn } from "next-auth/react";
import { DashScreen } from "~/components/screen";

export default function LogIn() {
  const { data: session } = useSession();

  return (
    <DashScreen>
      {session ? (
        <p>Ya logueado</p>
      ) : (
        <button
          onClick={() => {
            signIn();
          }}
        >
          Iniciar sesión
        </button>
      )}
    </DashScreen>
  );
}
