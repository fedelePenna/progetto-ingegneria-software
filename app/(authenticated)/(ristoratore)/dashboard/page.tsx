"use client";

import {auth} from "@/auth";
import ProtectedRoute from "@/components/protected-route";
import { Ruolo } from "@prisma/client";
import { useSession } from "next-auth/react";

export default function Page() {

    const session = useSession();


    if (!session.data?.user || session.data?.user.role!==Ruolo.RISTORATORE) {
        return <ProtectedRoute />;
    }

    return(
        <>
            <div>PAgina ristoratore</div>
        </>
    );
}
