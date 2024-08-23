import { NextRequest, NextResponse } from 'next/server';
import {prisma} from "@/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string }}){
    const id = parseInt(params.id);

    if (isNaN(id)) {
        return NextResponse.json({status: 400, message: 'Not valid ID'});
    }

    try{
        const prenotazioni = await prisma.prenotazione.findMany({
            where: { clienteId:id },
        });

        if (!prenotazioni) {
            return NextResponse.json({ status: 404, message: "Reservations not found" });
        }

        return NextResponse.json( { status: 200, data: prenotazioni })
    } catch(error){
        console.error('GET Error:', error);
        return NextResponse.json({ status: 500, message: "Error fetching reservations" });
    }
}