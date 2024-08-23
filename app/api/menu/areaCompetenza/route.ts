import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/auth";
import { AreaCompentenza } from "@prisma/client";

// Handler per la richiesta GET per ottenere tutte le aree di competenza
export async function GET(req: NextRequest) {
    try {
        const areeCompetenze: AreaCompentenza[] = await prisma.areaCompentenza.findMany({
            orderBy: {
                nome: 'asc' // Ordina le aree di competenza per nome in ordine ascendente
            }
        });
        console.log('GET Aree Competenze:', areeCompetenze);
        if (areeCompetenze.length === 0) {
            return NextResponse.json({ status: 404, message: "No areas of expertise found" });
        }
        return NextResponse.json({  data: areeCompetenze, status: 200 });
    } catch (e) {
        console.error('GET Error:', e);
        return NextResponse.json({  message: "Error fetching areas of expertise", status: 500 });
    }
}

// Handler per la richiesta POST per creare una nuova area di competenza
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { nome, ristoranteId } = body;
        console.log('POST Body:', body);

        // Validazione dei dati
        if (!nome || !ristoranteId) {
            return NextResponse.json({ status: 400, error: "Missing required fields" });
        }

        const nuovaAreaCompentenza = await prisma.areaCompentenza.create({
            data: {
                nome,
                ristoranteId,
            },
        });
        console.log('POST New Area of Expertise:', nuovaAreaCompentenza);

        return NextResponse.json({ status: 201, data: nuovaAreaCompentenza });
    } catch (e) {
        console.error('POST Error:', e);
        return NextResponse.json({  message: "Error creating area of expertise", status: 500 });
    }
}
