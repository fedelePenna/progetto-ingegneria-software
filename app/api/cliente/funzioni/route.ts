import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/auth";

// Handler per la richiesta GET per ottenere tutti i clienti il cui consenso è TRUE
export async function GET(req: NextRequest){
    try {
        const clienti = await prisma.cliente.findMany({
            select: {
                consenso: true,
            },
            orderBy: {
                nome: 'asc' // Ordina i clienti per nome in ordine ascendente
            },
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