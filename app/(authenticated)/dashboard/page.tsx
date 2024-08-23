"use client";

import {auth} from "@/auth";
import ProtectedRoute from "@/components/protected-route";

export default  async function Page() {

    const session = await auth();


    if (!session || !session.user) {
        return <ProtectedRoute />;
    }

    const { user } = session;



    if (user.role === "RISTORATORE") {
        console.log(user)

        return <div>

Sei nella dashboard del ristoratore

        </div>;
    }

    return <ProtectedRoute/>;
}
