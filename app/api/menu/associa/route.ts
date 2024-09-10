import { NextRequest, NextResponse } from 'next/server'
import {prisma} from "@/auth";


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { categoriaId, areaCompentenzaIds } = body;

        // Validazione dei dati
        if (!categoriaId || !Array.isArray(areaCompentenzaIds)) {
            return NextResponse.json({ status: 400, error: "Categoria o Aree di competenza mancanti" });
        }

        await prisma.cateogorieOnAree.deleteMany({
            where: {
                categoriaId: categoriaId,
            },
        });

        const newAssociations = await prisma.cateogorieOnAree.createMany({
            data: areaCompentenzaIds.map((areaId: number) => ({
                categoriaId: categoriaId,
                areaCompentenzaId: areaId,
            })),
        });

        return NextResponse.json({ status: 201, message: "Associazioni create con successo", data: newAssociations });
    } catch (error) {
        console.error('POST Error:', error);
        return NextResponse.json({ status: 500, message: "Errore durante l'associazione delle aree" });
    }
}
