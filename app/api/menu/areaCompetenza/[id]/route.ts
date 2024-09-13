import { NextRequest, NextResponse } from "next/server";
import {auth, prisma} from "@/auth";
import {logEvent} from "@/lib/utils";



export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id, 10);

        const areaCompentenza = await prisma.areaCompentenza.findUnique({
            where: { id },
            include: {
                CateogorieOnAree: {
                    include: {
                        categoria: {
                            include: {
                                Pietanza: true,
                            },
                        },
                    },
                },
            },
        });

        if (!areaCompentenza) {
            return NextResponse.json({ status: 404, message: "Area of expertise not found" });
        }

        return NextResponse.json({ status: 200, data: areaCompentenza });
    } catch (e) {
        console.error('GET Error:', e);
        return NextResponse.json({ status: 500, message: "Error fetching area of expertise" });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session?.user || session?.user?.role !== "RISTORATORE") {
            await logEvent(`[API] ${ req.method +' '+ req.url}`, { details: 'not auth', ip: req.headers.get('X-Forwarded-For') });
            return NextResponse.json({ status: 403, message: "No auth" }, { status: 403 });
        }
        const id = parseInt(params.id, 10);
        const body = await req.json();
        const { nome, ristoranteId } = body;

        // Validazione dei dati
        if (!nome || !ristoranteId) {
            return NextResponse.json({ status: 400, error: "Missing required fields" });
        }

        const areaCompentenza = await prisma.areaCompentenza.update({
            where: { id },
            data: { nome, ristoranteId },
        });

        return NextResponse.json({ status: 200, data: areaCompentenza });
    } catch (e) {
        console.error('PUT Error:', e);
        return NextResponse.json({ status: 500, message: "Error updating area of expertise" });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session?.user || session?.user?.role !== "RISTORATORE") {
            await logEvent(`[API] ${ req.method +' '+ req.url}`, { details: 'not auth', ip: req.headers.get('X-Forwarded-For') });
            return NextResponse.json({ status: 403, message: "No auth" }, { status: 403 });
        }

        const id = parseInt(params.id, 10);

        await prisma.areaCompentenza.delete({
            where: { id },
        });

        return NextResponse.json({ status: 200, message: "Area of expertise deleted successfully" }, { status: 200 });
    } catch (e) {
        console.error('DELETE Error:', e);
        return NextResponse.json({ status: 500, message: "Error deleting area of expertise" }, { status: 500 });
    }
}
