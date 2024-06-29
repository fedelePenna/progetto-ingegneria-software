import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id, 10);
        const body = await req.json();
        const { nome, descrizione, prezzo, etichetta, categoriaId } = body;

        // Validazione dei dati
        if (!nome || !descrizione || !prezzo || !categoriaId) {
            return NextResponse.json({ status: 400, error: "Missing required fields" });
        }

        const pietanza = await prisma.pietanza.update({
            where: { id },
            data: {
                nome,
                descrizione,
                prezzo,
                etichetta,
                categoriaId,
            },
        });

        return NextResponse.json({ status: 200, data: pietanza });
    } catch (e) {
        console.error('PUT Error:', e);
        return NextResponse.json({ status: 500, message: "Error updating dish" });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id, 10);

        const pietanza = await prisma.pietanza.delete({
            where: { id },
        });

        return NextResponse.json({ status: 200, message: "Dish deleted successfully" });
    } catch (e) {
        console.error('DELETE Error:', e);
        return NextResponse.json({ status: 500, message: "Error deleting dish" });
    }
}
