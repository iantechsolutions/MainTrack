import "~/styles/globals.css";
import { TRPCReactProvider } from "~/trpc/react";
import OrgSel from "~/components/orgsel";
import { getApi } from "~/trpc/server";
import SessionBody from "./session";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "~/app/api/uploadthing/core";
import { getAuthId } from "~/lib/utils";
import Image from "next/image";

export const metadata = {
  title: "MainTrack",
  description: "",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthId();
  const isLoggedIn = typeof auth === "string";
  const api = await getApi();
  const userData = isLoggedIn
    ? {
        profile: await api.user.get(),
        orgs: await api.org.list(),
      }
    : null;

  return (
    <html lang="es">
      <TRPCReactProvider>
        <body>
          <NextSSRPlugin
            /**
             * The `extractRouterConfig` will extract **only** the route configs
             * from the router to prevent additional information from being
             * leaked to the client. The data passed to the client is the same
             * as if you were to fetch `/api/uploadthing` directly.
             */
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          <header className="fixed left-0 top-0 h-16 w-full bg-slate-200">
            <div className="flex h-full items-center justify-between pl-2.5 pr-2.5">
              <div className="flex h-full items-center">
                <Image src="/favicon.ico" alt="logo" width={32} height={32} />
                <h1 className="pl-2.5">MainTrack</h1>
              </div>
              <div>
                {userData !== null ? (
                  <>
                    <OrgSel orgSel={userData.profile.orgSel} orgs={userData.orgs} />
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </header>

          <aside className="fixed left-0 top-16 box-border flex h-full w-1/4 flex-col bg-slate-200 p-5">
            <a href="/" className="text-red-800">
              Inicio
            </a>
            {userData !== null ? (
              <>
                <a href="/dashboard/organizaciones">Organizaciones</a>
                {userData.profile.orgSel !== null ? (
                  <>
                    <a href="/dashboard/usuarios">Usuarios</a>
                    <a href="/dashboard/tipoequipos">Tipos de Equipos</a>
                    <a href="/dashboard/equipos">Equipos</a>
                  </>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <>
                <a href="/login">Iniciar Sesión</a>
                <a href="/signup">Crear Cuenta</a>
              </>
            )}
          </aside>

          <main className="fixed left-1/4 top-16 h-full w-3/4">
            <SessionBody>{children}</SessionBody>
          </main>
        </body>
      </TRPCReactProvider>
    </html>
  );
}
