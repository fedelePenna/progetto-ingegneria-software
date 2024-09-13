import { NextRequest, NextResponse } from 'next/server'
import {auth, prisma} from "@/auth";
import {logEvent} from "@/lib/utils";


export async function POST(req: NextRequest) {
    try {

        const session = await auth();
        if (!session?.user || session?.user?.role !== "RISTORATORE") {
            await logEvent(`[API] ${ req.method +' '+ req.url}`, { details: 'not auth', ip: req.headers.get('X-Forwarded-For') });
            return NextResponse.json({ status: 403, message: "No auth" }, { status: 403 });
        }
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
