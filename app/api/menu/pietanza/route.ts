
import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/auth";
import {Pietanza} from "@prisma/client";

export async function GET(req: NextRequest, res: NextResponse){
    try{
        const res: Pietanza[] = await prisma.pietanza.findMany({
            orderBy: {
                nome: 'asc'
            }
        });
        if(res.length===0){
            return NextResponse.json({status: 404})
        }
        return NextResponse.json( {status: 200, data: res})
    }catch(e){
        return NextResponse.json({status: 500})
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { nome, descrizione, prezzo, etichetta, categoriaId } = body;

        if (!nome || !descrizione || !prezzo || !categoriaId) {
            return NextResponse.json({ status: 400, error: "Missing required fields" });
        }

        const nuovaPietanza = await prisma.pietanza.create({
            data: {
                nome,
                descrizione,
                prezzo,
                etichetta,
                categoriaId,
            },
        });

        return NextResponse.json({ status: 201, data: nuovaPietanza });
    } catch (e) {
        return NextResponse.json({ status: 500, error: "Error creating Pietanza" });
    }
}

