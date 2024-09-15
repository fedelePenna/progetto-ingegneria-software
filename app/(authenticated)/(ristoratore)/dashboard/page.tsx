"use client";

import ProtectedRoute from "@/components/protected-route";
import { Ruolo } from "@prisma/client";
import { useSession } from "next-auth/react";
import PrenotazioneCRUD from "@/app/(authenticated)/(ristoratore)/dashboard/bookings/PrenotazioneCRUD";

export default function Page() {


  return (
    <div className="container mx-auto px-4 py-8">
      <PrenotazioneCRUD/>
    </div>
  );
}
