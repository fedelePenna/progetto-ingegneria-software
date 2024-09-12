import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import Log from "@/lib/Log"; // Assumendo che tu abbia già il modello Log configurato
import {connectToMongoDB} from "@/lib/mongodb"; // Assumendo che tu abbia una funzione per connetterti al database

export async function GET(request: NextRequest) {
    try {
        await connectToMongoDB();

        // Ottieni i parametri di query dall'URL
        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '10';
        const sort = searchParams.get('sort') || 'desc';

        // Converti i parametri in numeri interi
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        // Trova e ordina i log per timestamp
        const logs = await Log.find()
            .sort({ timestamp: sort === "asc" ? 1 : -1 }) // Ordinamento per timestamp
            .skip((pageNumber - 1) * limitNumber)         // Skippa i documenti in base alla pagina
            .limit(limitNumber);                          // Limita il numero di documenti

        const totalLogs = await Log.countDocuments();   // Conta il numero totale di log

        return NextResponse.json({
            logs,
            total: totalLogs,          // Numero totale di log
            page: pageNumber,          // Pagina corrente
            limit: limitNumber,        // Limite per pagina
        });
    } catch (error) {
        console.error("Errore nel recupero dei log:", error);
        return NextResponse.json({ status: 500, message: "Errore interno del server" });
    }
}
