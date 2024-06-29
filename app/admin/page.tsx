
import { useSession } from "next-auth/react";
import Log from "@/lib/Log";
import LogComponent from "@/components/logComponent";
import {auth} from "@/auth";

export default  async function Page() {

    const {user} = await auth();



    if (user.role === "ADMIN") {
        console.log(user)

            return <div>

                    <LogComponent/>

            </div>;
    }

    return <p>Please log in to view this page.</p>;
}
