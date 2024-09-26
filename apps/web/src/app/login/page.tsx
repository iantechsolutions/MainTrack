"use client";
import React from "react";
import { useSession, signIn } from "next-auth/react";

export default function LogIn() {
  const { data: session } = useSession();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
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
    </div>
  );
}
