import {DefaultSession, Session} from "next-auth";
import { JWT } from "next-auth/jwt";
import {Ruolo} from "@prisma/client";

declare module "next-auth" {
    interface Session {
        user: {
            /** The user's postal address. */
            role: Ruolo
            /**
             * By default, TypeScript merges new interface properties and overwrites existing ones.
             * In this case, the default session user properties will be overwritten,
             * with the new ones defined above. To keep the default session user properties,
             * you need to add them back into the newly declared interface.
             */
        } & DefaultSession["user"]
    }
    interface User{
        role: Ruolo
    }
}
declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: number;
    }
}
