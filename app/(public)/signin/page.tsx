"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthError } from "next-auth";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter(); // Use router for client-side navigation

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const username = formData.get("username") as string;
        const password = formData.get("password") as string;
        const isAdmin = formData.get("isAdmin") === "true";

        try {
            const result = await signIn("credentials", {
                username,
                password,
                redirect: false, // Disable auto-redirect
            });

            if (result?.error) {
                console.log(result.error)
                throw new Error(result.error);
            }

            // Redirect to the appropriate page after a successful login
            router.push(isAdmin ? "/admin" : "/dashboard");
        } catch (error) {
            if (error ) {
                router.push(`/error?error=${error.message}`);
            }
            console.error("Sign in error:", error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex h-screen items-center justify-center">
            <Tabs defaultValue="user" className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="user">User Login</TabsTrigger>
                    <TabsTrigger value="admin">Admin Login</TabsTrigger>
                </TabsList>
                <TabsContent value="user">
                    <LoginForm isAdmin={false} onSubmit={onSubmit} isLoading={isLoading} />
                </TabsContent>
                <TabsContent value="admin">
                    <LoginForm isAdmin={true} onSubmit={onSubmit} isLoading={isLoading} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

interface LoginFormProps {
    isAdmin: boolean;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
    isLoading: boolean;
}

function LoginForm({ isAdmin, onSubmit, isLoading }: LoginFormProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{isAdmin ? "Admin Login" : "User Login"}</CardTitle>
                <CardDescription>Accedi con le tue credenziali.</CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" name="username" type="text" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    <input type="hidden" name="isAdmin" value={isAdmin.toString()} />
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Attendi..." : "Accedi"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
