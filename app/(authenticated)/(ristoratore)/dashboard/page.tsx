"use client";

import ProtectedRoute from "@/components/protected-route";
import { Ruolo } from "@prisma/client";
import { useSession } from "next-auth/react";

export default function Page() {


  return (
    <div>
      <div>Pagina ristoratore</div>
    </div>
  );
}
