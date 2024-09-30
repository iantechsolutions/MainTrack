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
import { Button } from "~/components/ui/button";
import { Computer, FileSliders, KeyRound, Users, BriefcaseBusiness, LayoutGrid, UserPlus } from 'lucide-react';
import Link from "next/link";

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
          <header className="fixed left-0 top-0 h-16 w-full">
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

          <aside className="fixed left-0 top-16 box-border flex h-full w-1/4 flex-col p-5">
            <Button asChild className="h-12 text-1xl">
              <Link href="/">
                <LayoutGrid className="mr-2 h-4 w-4" /> Inicio
              </Link>
            </Button>
            {userData !== null ? (
              <>
                <Button asChild className="h-12 text-1xl">
                  <Link href="/dashboard/organizaciones">
                    <BriefcaseBusiness className="mr-2 h-4 w-4" /> Organizaciones
                  </Link>
                </Button>
                {userData.profile.orgSel !== null ? (
                  <>
                    <Button asChild className="h-12 text-1xl">
                      <Link href="/dashboard/usuarios">
                        <Users className="mr-2 h-4 w-4" /> Usuarios
                      </Link>
                    </Button>
                    <Button asChild className="h-12 text-1xl">
                      <Link href="/dashboard/tipoequipos">
                        <FileSliders className="mr-2 h-4 w-4" /> Tipos de equipos
                      </Link>
                    </Button>
                    <Button asChild className="h-12 text-1xl">
                      <Link href="/dashboard/equipos">
                        <Computer className="mr-2 h-4 w-4" /> Equipos
                      </Link>
                    </Button>
                  </>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <>
                <Button asChild className="h-12 text-1xl">
                  <Link href="/login">
                    <KeyRound className="mr-2 h-4 w-4" /> Iniciar Sesión
                  </Link>
                </Button>
                <Button asChild className="h-12 text-1xl">
                  <Link href="/signup">
                    <UserPlus className="mr-2 h-4 w-4" /> Crear Cuenta
                  </Link>
                </Button>
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
