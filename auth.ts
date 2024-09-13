
import NextAuth, { type DefaultSession} from "next-auth"
import { JWT } from "next-auth/jwt"

import Credentials from "next-auth/providers/credentials"
import {PrismaClient, Ruolo} from "@prisma/client";
import bcrypt from 'bcryptjs'
import {logEvent} from "@/lib/utils";


declare module "next-auth" {
    /**
     * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
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
    interface User {
        role: Ruolo
    }
}
declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
    interface JWT {
        /** OpenID ID Token */
        role: Ruolo
    }
}

export const prisma = new PrismaClient();

 
export const { handlers, signIn, signOut, auth } = NextAuth({
    session: {
        strategy: "jwt",
    },
    providers: [
        Credentials({
            name: "credenziali",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "m.pat" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                let user = null;

                if (!credentials?.username || !credentials.password) {
                    return null;
                }

                user = await prisma.user.findUnique({
                    where: {
                        username: credentials.username
                    }
                });
                console.log(await bcrypt.hash(credentials.password, 10))
                if (!user || !(await bcrypt.compare(credentials.password, user.password!))) {
                    await logEvent('[LOGIN]: error', {
                        user: user ? user.username : 'user inesistente',
                        details: user ? 'Tentativo con password errata' : ''
                    })
                    return null;
                }
                await logEvent('[LOGIN]: success', {
                    user: user.username,
                    role: user.ruolo
                })
                return {
                    ...user,
                    role: user.ruolo
                }

            }
        })
    ],
    pages: {
        error: "/error",
        signIn: "/signin",
    },

    callbacks:{
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role; // Assuming your user model has a role field
            }
            return token;
        },
        async session({ session, token }) {
            if (token.role) {
                session.user.role = token.role;
            }
            return session;
        },
        async signIn({user}){
            if(user.role==='ADMIN'){
                return true;
            }
            else{
                const utente = await prisma.user.findUnique({
                    where: {id: parseInt(user.id)}
                })
                console.log(utente)
                if(utente.statoAttivo) return true;
                else return false;
            }
        }
    }
})
