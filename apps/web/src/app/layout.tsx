import { TRPCReactProvider } from "~/trpc/react"
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  title: 'MainTrack',
  description: '',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // const userInfo = useUserInfo()
  return (
    <ClerkProvider signInFallbackRedirectUrl={"/dashboard"}>
      <html lang='es'>
        <TRPCReactProvider>
          <body>
            <h1>TITULO</h1>
            <h1>SIDENAV</h1>
            {children}
          </body>
        </TRPCReactProvider>
      </html>
    </ClerkProvider>
  )
}