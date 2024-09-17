import { TRPCReactProvider } from "~/trpc/react"
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  title: 'tRacc',
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
            {children}
        </TRPCReactProvider>
      </html>
    </ClerkProvider>
  )
}