import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/auth";
import { Categoria } from "@prisma/client";

// Handler per la richiesta GET per ottenere tutte le categorie
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const includeAssociazione = searchParams.get('associazione') === 'true';

        const categorie = await prisma.categoria.findMany({
            orderBy: {
                nome: 'asc', // Ordina le categorie per nome in ordine ascendente
            },
            ...(includeAssociazione && {
                include: {
                    CateogorieOnAree: {
                        include: {
                            area: true, // Include i dati delle aree
                        },
                    },
                },
            }),
        });

        if (categorie.length === 0) {
            return NextResponse.json({ status: 404, message: "No categories found" });
        }

        const categorieWithAreas = categorie.map(categoria => ({
            ...categoria,
            areas: includeAssociazione
                ? categoria.CateogorieOnAree.map(assoc => assoc.area.id) // Mapping degli ID delle aree
                : undefined,
        }));

        return NextResponse.json({ status: 200, data: categorieWithAreas });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ status: 500, message: "Error fetching categories" });
    }
}



// Handler per la richiesta POST per creare una nuova categoria
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { nome } = body;

        // Validazione dei dati
        if (!nome) {
            return NextResponse.json({ status: 400, error: "Missing required fields" });
        }

        const nuovaCategoria = await prisma.categoria.create({
            data: {
                nome,
            },
        });

        return NextResponse.json({ status: 201, data: nuovaCategoria });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ status: 500, message: "Error creating category" });
    }
}
