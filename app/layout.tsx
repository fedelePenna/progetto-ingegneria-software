import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "../styles/globals.css";
import { cn } from "@/lib/utils"
import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";
import NextTopLoader from 'nextjs-toploader';
import { AppProps } from "next/app";
import NavBarPublic from "@/components/public/navbar";


const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})
export const metadata: Metadata = {
  title: "Prenotazione",
  description: "Progetto di ingegneria del software unibo",
};



export default function RootLayout({
  children,
  params: { session, ...params },
}: AppProps) {
  return (
    <>
      <SessionProvider session={session}>
        <html lang="it" suppressHydrationWarning>
          <head />
          <body
            className={cn(
              "min-h-screen bg-background font-sans antialiased",
              fontSans.variable
            )}
          >
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <NextTopLoader />
              <div className="relative flex min-h-screen flex-col">
                
                <div className="flex-1">{children}</div>

                
              </div>

            </ThemeProvider>
          </body>
        </html>
      </SessionProvider>
    </>
  )
}
