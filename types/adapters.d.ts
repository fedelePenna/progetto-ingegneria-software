import type { AdapterUser as BaseAdapterUser } from "next-auth/adapters";
import {Ruolo} from "@prisma/client";
declare module "@auth/core/adapters" {
    interface AdapterUser extends BaseAdapterUser {
        role: Ruolo;
    }
}
