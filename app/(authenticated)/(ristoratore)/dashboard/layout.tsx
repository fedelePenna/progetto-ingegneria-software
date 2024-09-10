"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Book,
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package2,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { signOut, useSession } from "next-auth/react";
import ProtectedRoute from "@/components/protected-route";
import { Ruolo } from "@prisma/client";

export default function RistoratoreLayout({
                                            children,
                                          }: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname(); // Ottieni l'URL corrente

  if (status === "loading") {
    return (
        <div className="flex items-center justify-center h-screen">
          <div>Loading...</div>
        </div>
    );
  }

  if (!session?.user && status === "unauthenticated") {
    return <ProtectedRoute />;
  }

  if (status === "authenticated" && session?.user.role !== Ruolo.RISTORATORE) {
    return <ProtectedRoute />;
  }

  // Funzione per determinare se un link è attivo
  const isActive = (link: string) => pathname.startsWith(link);

  return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Book className="h-6 w-6" />
                <span className="">BookEat</span>
              </Link>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <Link
                    href="/dashboard"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                        isActive("/dashboard")
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:text-primary"
                    }`}
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                    href="/dashboard/bookings"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                        isActive("/dashboard/bookings")
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:text-primary"
                    }`}
                >
                  <Book className="h-4 w-4" />
                  Prenotazioni
                </Link>
                <Link
                    href="/dashboard/clienti"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                        isActive("/dashboard/clienti")
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:text-primary"
                    }`}
                >
                  <Users className="h-4 w-4" />
                  Clienti
                </Link>
                <Link
                    href="/dashboard/menu"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                        isActive("/dashboard/menu")
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:text-primary"
                    }`}
                >
                  <LineChart className="h-4 w-4" />
                  Menu
                </Link>
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 md:hidden"
                    onClick={() => console.log("clicked")}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                  <Link
                      href="/dashboard"
                      className="flex items-center gap-2 text-lg font-semibold"
                  >
                    <Package2 className="h-6 w-6" />
                    <span className="">BookEat</span>
                  </Link>
                  <Link
                      href="/dashboard"
                      className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 transition-all ${
                          isActive("/dashboard")
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <Home className="h-5 w-5" />
                    Dashboard
                  </Link>
                  <Link
                      href="/dashboard/bookings"
                      className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 transition-all ${
                          isActive("/dashboard/bookings")
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <Book className="h-5 w-5" />
                    Prenotazioni
                  </Link>
                  <Link
                      href="/dashboard/clienti"
                      className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 transition-all ${
                          isActive("/dashboard/clienti")
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <Users className="h-5 w-5" />
                    Clienti
                  </Link>
                  <Link
                      href="/dashboard/menu"
                      className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 transition-all ${
                          isActive("/dashboard/menu")
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <LineChart className="h-5 w-5" />
                    Menu
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <div className="ml-auto flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full">
                    <CircleUser className="h-5 w-5" />
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Il mio account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Impostazioni</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <button onClick={() => signOut({ callbackUrl: "/", redirect: true })}>
                      Esci
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4">{children}</main>
        </div>
      </div>
  );
}
