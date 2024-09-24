import { TRPCReactProvider } from "~/trpc/react"
import OrgSel from "~/components/orgsel";
import { getApi } from "~/trpc/server";
import { getServerSession } from "next-auth";
import SessionBody from "./session";

export const metadata = {
  title: 'MainTrack',
  description: '',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let auth = await getServerSession();
  console.log(auth);
  let isLoggedIn = typeof auth?.user?.email === 'string';
  const api = await getApi();
  let userData = isLoggedIn ? {
    profile: await api.user.get(),
    orgs: await api.org.list(),
  } : null;

  return (
    <html lang='es'>
      <TRPCReactProvider>
        <body>
          <header style={{
            'left': 0,
            'top': 0,
            'width': '100%',
            'position': 'fixed',
            'height': '70px',
            'backgroundColor': '#dddddd',
          }}>
            <div style={{
              'display': 'flex',
              'justifyContent': 'space-between',
              'alignItems': 'center',
              'height': '100%',
              'paddingLeft': '10px',
              'paddingRight': '10px'
            }}>
              <div style={{
                'display': 'flex',
                'alignItems': 'center',
                'height': '100%',
              }}>
                <img src='/favicon.ico'></img>
                <h1 style={{
                  'paddingLeft': '10px'
                }}>MainTrack</h1>
              </div>
              <div>
                {userData !== null ? <>
                  <OrgSel orgSel={userData.profile.orgSel} orgs={userData.orgs}/>
                </> : <></>}
              </div>
            </div>
          </header>

          <aside style={{
            'left': 0,
            'top': '70px',
            'width': '20%',
            'maxWidth': '60%',
            'height': '100%',
            'position': 'fixed',
            'padding': '20px',
            'display': 'flex',
            'flexDirection': 'column',
            'backgroundColor': '#dddddd',
            'boxSizing': 'border-box'
          }}>
            <a href="/">Inicio</a>
            {userData !== null ? <>
              <a href="/dashboard/organizaciones">Organizaciones</a>
              <a href="/dashboard/usuarios">Usuarios</a>
              <a href="/dashboard/equipos">Equipos</a>
            </> : <>
              <a href="/login">Iniciar Sesión</a>
              <a href="/signup">Crear Cuenta</a>
            </>}
          </aside>

          <main style={{
            'top': '70px',
            'left': '20%',
            'position': 'fixed',
            'width': '80%',
            'height': '100%'
          }}>
            <SessionBody>
              {children}
            </SessionBody>
          </main>
        </body>
      </TRPCReactProvider>
    </html>
  )
}