import { NextRequest, NextResponse } from 'next/server';
import {prisma} from "@/auth";

export async function GET(req: NextRequest, { params }: { params: {id: string}}){
    const id = parseInt(params.id);

    if (isNaN(id)) {
        return NextResponse.json({status: 400, message: 'ID non valido'});
      }

    try{
        const prenotazione = await prisma.prenotazione.findUnique({
            where: {id:id},
        });

        if (!prenotazione) {
            return NextResponse.json({ message: 'Prenotazione non trovata' }, { status: 404 });
          }

        return NextResponse.json( {status: 200, data: prenotazione})
    } catch(error){
        return NextResponse.json({ status: 500, error: "Error searching Prenotazione"});
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const id = parseInt(params.id);
  
    if (isNaN(id)) {
        return NextResponse.json({status: 400, message: 'ID non valido'});
    }
  
    try {
        const body = await req.json();
        const {copertiAdulti, copertiBambini, data, allergie, numeroPasseggini, numeroSeggiolini, occasioneVisita, clienteId, tavoloId} = body;

        // Validazione dei dati
        if (!copertiAdulti || !copertiBambini || !data || !clienteId || !tavoloId) {
         return NextResponse.json({ status: 400, error: "Missing required fields" });
        }

        const updatedPrenotazione = await prisma.prenotazione.update({
            where: {id:id},
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

  
      return NextResponse.json({status: 200, data: updatedPrenotazione});
    } catch (error) {
      return NextResponse.json({ status: 500, error: "Error updating Prenotazione"});
    }
  }

  export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const id = parseInt(params.id);

    if (isNaN(id)) {
        return NextResponse.json({status: 400, message: 'ID non valido'});
    }

    try {
        await prisma.prenotazione.delete({
        where: { id: id },
        });

        return NextResponse.json({status: 204, message: 'Prenotazione eliminata con successo'});
    } catch (error) {
        return NextResponse.json({status: 500, message: 'Errore durante l\'eliminazione della prenotazione' });
    }
  }