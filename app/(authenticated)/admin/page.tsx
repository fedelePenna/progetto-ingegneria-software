"use client";

import LogComponent from "@/components/logComponent";
import {auth} from "@/auth";
import ProtectedRoute from "@/components/protected-route";

export default  async function Page() {

    const {user} = await auth();



    if (user.role === "ADMIN") {
        console.log(user)

            return <div>

                    <LogComponent/>

            </div>;
    }

    return <>no auth</>;
}
