import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "../../styles/globals.css";
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
      <NavBarPublic />
      <div className="relative flex min-h-screen flex-col">
        <div className="flex-1">{children}</div>
      </div>

    </>
  )
}
