"use client"

import { useSearchParams } from "next/navigation"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {TriangleAlert} from "lucide-react";
import {Button} from "@/components/ui/button";
import Link from "next/link";


enum Error {
    Configuration = "Configuration",
    AccessDenied = "AccessDenied"
}

const errorMap = {
    [Error.Configuration]: (
        <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>
                There was a problem when trying to authenticate. Please contact us if this
                error persists. Unique error code:{" "}
                <code className="rounded-sm bg-destructive-foreground/10 p-1 text-xs font-mono">
                    Configuration
                </code>
            </AlertDescription>
        </Alert>
    ),
    [Error.AccessDenied]: (
        <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Accesso non consentito</AlertTitle>
            <AlertDescription>
                Il tuo account risulta bloccato.
                Contatta l&apos;admin per sapere cosa è successo.
                <br/><br/>Unique error code:{" "}
                <code className="rounded-sm bg-destructive-foreground/10 p-1 text-xs font-mono">
                    AccessDenied
                </code>
            </AlertDescription>
        </Alert>
    ),
}

export default function AuthErrorPage() {
    const search = useSearchParams()
    const error = search.get("error") as Error

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Qualcosa è andato storto</CardTitle>
                    <CardDescription className="text-center">
                        Abbiamo incontrato un errore durante l&apos;accesso
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {errorMap[error] || (
                        <Alert>
                            <AlertTitle>Errore sconosciuto</AlertTitle>
                            <AlertDescription>
                                Contattaci se il problema persiste
                            </AlertDescription>
                        </Alert>
                    )}

                </CardContent>
                <CardFooter className="justify-center">
                    <Link href='/signin'>
                        <Button variant='outline'>Torna al login</Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}