import {NextApiRequest, NextApiResponse} from "next";
import {connectToMongoDB} from "@/lib/mongodb";
import Log from "@/lib/Log";
import {NextResponse} from "next/server";

export async function GET(request: Request) {
    try {
        await connectToMongoDB();

        // Estrai i parametri di query dalla richiesta
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const eventType = searchParams.get('eventType') || '';
        const details = searchParams.get('details') || '';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        const sortDirection = sortOrder === 'asc' ? 1 : -1;

        const query: any = {
            eventType: { $regex: new RegExp(eventType, 'i') },
        };

// Se il filtro `details` è specificato, puoi cercare su campi noti dentro `details`
        if (details) {
            query['details.user'] = { $regex: new RegExp(details, 'i') }; // Ad esempio, cerchiamo dentro 'details.user'
        }

        console.log(query);

// Recupera i log con paginazione e ordinamento
        const logs = await Log.find(query)
            .sort({ timestamp: sortDirection })
            .skip((page - 1) * limit)
            .limit(limit);


        // Conta il numero totale di documenti per la paginazione
        const totalLogs = await Log.countDocuments(query);

        return NextResponse.json({ logs, total: totalLogs }, { status: 200 });
    } catch (error) {
        console.error('Errore nel recupero dei log:', error);
        return NextResponse.json({ error: 'Errore nel recupero dei log' }, { status: 500 });
    }
}