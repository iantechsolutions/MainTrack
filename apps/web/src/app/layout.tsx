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
            {children}
          </body>
        </TRPCReactProvider>
      </html>
    </ClerkProvider>
  )
}