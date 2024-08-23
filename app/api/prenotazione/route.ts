import { NextRequest, NextResponse } from 'next/server';
import {prisma} from "@/auth";

export async function GET(req: NextRequest){
    try {
        const prenotazioni = await prisma.prenotazione.findMany({
            orderBy: {
                data: 'asc'
            }
        });
        if(prenotazioni.length===0){
            return NextResponse.json({status: 404})
        }

        return NextResponse.json( {status: 200, data: prenotazioni})
    } catch (error) {
        return NextResponse.json({ status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
      const body = await req.json();
      const {copertiAdulti, copertiBambini, data, allergie, numeroPasseggini, numeroSeggiolini, occasioneVisita, clienteId, tavoloId} = body;

      // Validazione dei dati
      if (!copertiAdulti || !copertiBambini || !data || !clienteId || !tavoloId) {
        return NextResponse.json({ status: 400, error: "Missing required fields" });
        }

        const nuovaPrenotazione = await prisma.prenotazione.create({
            data: {
                copertiAdulti,
                copertiBambini,
                data,
                allergie,
                numeroPasseggini,
                numeroSeggiolini,
                occasioneVisita,
                clienteId,
                tavoloId,
            },
        });

      return NextResponse.json({status: 200, data: nuovaPrenotazione});
    } catch (error) {
      return NextResponse.json({ status: 500, error: "Error creating Prenotazione" });
    }
}