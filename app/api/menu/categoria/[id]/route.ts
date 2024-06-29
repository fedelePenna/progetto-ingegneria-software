import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id, 10);
        const body = await req.json();
        const { nome } = body;

        // Validazione dei dati
        if (!nome) {
            return NextResponse.json({ status: 400, error: "Missing required fields" });
        }

        const categoria = await prisma.categoria.update({
            where: { id },
            data: { nome },
        });

        return NextResponse.json({ status: 200, data: categoria });
    } catch (e) {
        console.error('PUT Error:', e);
        return NextResponse.json({ status: 500, message: "Error updating category" });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);

        const categoria = await prisma.categoria.delete({
            where: { id },
        });

        return NextResponse.json({ status: 200, message: "Category deleted successfully" });
    } catch (e) {
        console.error('DELETE Error:', e);
        return NextResponse.json({ status: 500, message: "Error deleting category" });
    }
}
