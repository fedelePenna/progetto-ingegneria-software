import { NextRequest, NextResponse } from 'next/server';
import {prisma} from "@/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string }}){
    const id = parseInt(params.id);

    if (isNaN(id)) {
        return NextResponse.json({status: 400, message: 'Not valid ID'});
    }

    try{
        const cliente = await prisma.cliente.findUnique({
            where: { id:id },
        });

        if (!cliente) {
            return NextResponse.json({ status: 404, message: "Client not found" });
        }

        return NextResponse.json( { status: 200, data: cliente })
    } catch(error){
        console.error('GET Error:', error);
        return NextResponse.json({ status: 500, message: "Error fetching client" });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const id = parseInt(params.id);
  
    if (isNaN(id)) {
        return NextResponse.json({status: 400, message: 'Not valid ID'});
    }
  
    try {
        const body = await req.json();
        const { nome, cognome, telefono, email, dataNascita, consenso, ristoranteId } = body;

        // Validazione dei dati
        if (!nome || !cognome || !telefono || !email || !consenso) {
            return NextResponse.json({ status: 400, error: "Missing required fields" });
        }

        const updatedCliente = await prisma.cliente.update({
            where: {id:id},
            data: {
                nome,
                cognome,
                telefono: parseInt(telefono),
                email,
                dataNascita: new Date(dataNascita),
                consenso,
                ristoranteId: 1,
            },
        });

        const clienteSerialized = {
            ...updatedCliente,
            telefono: updatedCliente.telefono.toString(),  // Converti BigInt a stringa
        };

  
        return NextResponse.json({status: 200, data: clienteSerialized});
    } catch (error) {
        console.error('PUT Error:', error);
        return NextResponse.json({ status: 500, message: "Error updating client" });
    }
  }

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const id = parseInt(params.id);

    if (isNaN(id)) {
        return NextResponse.json({status: 400, message: 'Not valid ID'});
    }

    try {
        await prisma.cliente.delete({
            where: { id: id },
        });

        return NextResponse.json({ status: 200, message: "Client deleted successfully" });
    } catch (error) {
        console.error('DELETE Error:', error);
        return NextResponse.json({ status: 500, message: "Error deleting client" });
    }
}