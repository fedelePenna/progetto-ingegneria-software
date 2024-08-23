"use client";

import LogComponent from "@/components/logComponent";
import {auth} from "@/auth";
import ProtectedRoute from "@/components/protected-route";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { $Enums, Ruolo } from "@prisma/client";

export default function Page() {
    const session = useSession();
    

    if(!session.data?.user || session.data.user.role!==Ruolo.ADMIN){
        return <><ProtectedRoute/></>
    }



    return <LogComponent/>
}
