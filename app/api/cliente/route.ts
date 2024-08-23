import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/auth";

// Handler per la richiesta GET per ottenere tutti i clienti
export async function GET(req: NextRequest){
    try {
        const clienti = await prisma.cliente.findMany({
            orderBy: {
                nome: 'asc' // Ordina i clienti per nome in ordine ascendente
            }
        });
        console.log('GET Clienti:', clienti);
        if(clienti.length === 0){
            return NextResponse.json({ status: 404, message: "No clients found" })
        }

        return NextResponse.json({ data: clienti, status: 200 })
    } catch (error) {
        console.error('GET Error:', error);
        return NextResponse.json({  message: "Error fetching clients", status: 500 });
    }
}

// Handler per la richiesta POST per creare un nuovo cliente
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { nome, cognome, telefono, email, dataNascita, consenso, ristoranteId } = body;
        console.log('POST Body:', body);

        // Validazione dei dati
        if (!nome || !cognome || !telefono || !email || !dataNascita || !consenso || !ristoranteId) {
            return NextResponse.json({ status: 400, error: "Missing required fields" });
        }

        const nuovoCliente = await prisma.cliente.create({
            data: {
                nome,
                cognome,
                telefono,
                email,
                dataNascita,
                consenso,
                ristoranteId,
            },
        });
        console.log('POST New Client:', nuovoCliente);

        return NextResponse.json({ status: 201, data: nuovoCliente });
    } catch (error) {
        console.error('POST Error:', error);
        return NextResponse.json({  message: "Error creating new client", status: 500 });
    }
}