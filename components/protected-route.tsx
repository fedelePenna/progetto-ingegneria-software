import React from 'react';
import { useRouter } from 'next/navigation'
import {auth} from "@/auth";
import {Button} from "@/components/ui/button";

const ProtectedRoute: React.FC = () => {
    const router = useRouter();

    const { user } = auth();

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
                <h1 className="text-3xl font-bold mb-4">Accesso negato</h1>
                <p className="text-lg mb-6">Non hai i permessi necessari per accedere a questa pagina.</p>
                <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => router.back()}>Indietro</Button>
                    <Button variant="default" onClick={() => router.push("/login")}>Login</Button>
                </div>
            </div>
        );
    }

    if (user.role !== 'ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
                <h1 className="text-3xl font-bold mb-4">Accesso negato</h1>
                <p className="text-lg mb-6">Non hai i permessi necessari per accedere a questa pagina.</p>
                <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => router.back()}>Indietro</Button>
                </div>
            </div>
        );
    }

    return <></>;
};

export default ProtectedRoute;
