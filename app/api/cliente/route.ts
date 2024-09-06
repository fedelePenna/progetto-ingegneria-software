import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/auth";

// Handler per la richiesta GET per ottenere tutti i clienti
export async function GET(req: NextRequest) {
    try {
        const clienti = await prisma.cliente.findMany({
            orderBy: {
                nome: 'asc' // Ordina i clienti per nome in ordine ascendente
            }
        });

        // Converti i campi BigInt in stringa
        const clientiSerializzati = clienti.map(cliente => ({
            ...cliente,
            telefono: cliente.telefono?.toString(), // Converte il BigInt in stringa
        }));

        console.log('GET Clienti:', clientiSerializzati);

        if (clientiSerializzati.length === 0) {
            return NextResponse.json({ status: 404, message: "No clients found" });
        }

        return NextResponse.json({ data: clientiSerializzati, status: 200 });
    } catch (error) {
        console.error('GET Error:', error);
        return NextResponse.json({ message: "Error fetching clients", status: 500 });
    }
}


// Handler per la richiesta POST per creare o aggiornare un cliente
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        let { nome, cognome, telefono, email, dataNascita, consenso, ristoranteId } = body;

        console.log('POST Body:', body);

        // Validazione dei dati
        if (!nome || !cognome || !telefono || !email || !ristoranteId) {
            return NextResponse.json({ status: 400, error: "Missing required fields" });
        }

        if (!consenso) {
            consenso = false;
        }

        if (!dataNascita) {
            dataNascita = null;
        }

        // Upsert del cliente, gestione del telefono come intero
        const cliente = await prisma.cliente.upsert({
            where: {
                telefono: parseInt(telefono), // Cerca il cliente in base al numero di telefono
            },
            update: {
                nome,
                cognome,
                email,
                dataNascita,
                consenso,
                ristoranteId: parseInt(ristoranteId),
            },
            create: {
                nome,
                cognome,
                telefono: parseInt(telefono),
                email,
                dataNascita,
                consenso,
                ristoranteId: parseInt(ristoranteId),
            },
        });

        // Conversione di BigInt in String prima della risposta
        const responseCliente = {
            ...cliente,
            telefono: cliente.telefono.toString(), // Converte BigInt in stringa
        };

        console.log('POST Upsert Client:', responseCliente);

        return NextResponse.json({ status: 201, data: responseCliente });
    } catch (error) {
        console.error('POST Error:', error);
        return NextResponse.json({ message: "Error creating or updating client", status: 500 });
    }
}

