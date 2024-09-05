"use client";

import ProtectedRoute from "@/components/protected-route";
import { useSession } from "next-auth/react";

export default function Page() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div> {/* Puoi aggiungere un indicatore di caricamento qui */}
      </div>
    );
  }

  if (!session?.user || session.user.role !== "RISTORATORE") {
    return <ProtectedRoute />;
  }

  return (
    <div>
      <div>Pagina ristoratore</div>
    </div>
  );
}
