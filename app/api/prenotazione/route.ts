import { NextRequest, NextResponse } from 'next/server';
import {prisma} from "@/auth";
import { startOfDay, addMinutes, isBefore, format } from "date-fns";

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
        const { copertiAdulti, copertiBambini, data, allergie, numeroPasseggini, numeroSeggiolini, occasioneVisita, clienteId } = body;



        if (
            typeof copertiAdulti !== 'number' ||
            typeof copertiBambini !== 'number' ||
            !data ||
            !clienteId
        ) {
            return NextResponse.json({ status: 400, error: "Dati mancanti o non validi." });
        }

        const totalPeople = copertiAdulti + copertiBambini;
        const reservationDate = new Date(data);
        console.log(reservationDate)

        // Recupera tutti i tavoli che possono ospitare il numero di persone richiesto
        const tavoliDisponibili = await prisma.tavolo.findMany({
            where: {
                ristoranteId: 1, // Cambia l'ID del ristorante se necessario
                capienza: {
                    gte: totalPeople, // Solo tavoli con capienza sufficiente
                },
            },
        });

        if (tavoliDisponibili.length === 0) {
            return NextResponse.json({ status: 404, message: "Nessun tavolo disponibile per il numero di persone richiesto" });
        }

        // Recupera gli orari di apertura del ristorante per il giorno della prenotazione
        const orariApertura = await prisma.orarioDiApertura.findMany({
            where: {
                ristoranteId: 1, // Cambia l'ID del ristorante se necessario
            },
        });

        // Funzione per generare gli slot di 15 minuti
        const getTimeSlots = (startTime: Date, endTime: Date) => {
            const slots = [];
            let currentSlot = startTime;
            while (isBefore(currentSlot, endTime)) {
                slots.push(format(currentSlot, "HH:mm"));
                currentSlot = addMinutes(currentSlot, 15);
            }
            return slots;
        };

        // Verifica se il tavolo è disponibile alla data e ora richiesta
        let tavoloDisponibile = null;

        for (const orario of orariApertura) {
            const { orario: orari } = orario;

            // Estraiamo solo l'orario dai DateTime nel DB e applichiamo alla data della prenotazione
            const startHour = orari[0]; // Orario di apertura
            const endHour = orari[1]; // Orario di chiusura

            const startTime = new Date(
                reservationDate.getFullYear(),
                reservationDate.getMonth(),
                reservationDate.getDate(),
                startHour.getHours(),
                startHour.getMinutes()
            );

            const endTime = new Date(
                reservationDate.getFullYear(),
                reservationDate.getMonth(),
                reservationDate.getDate(),
                endHour.getHours(),
                endHour.getMinutes()
            );

            const slots = getTimeSlots(startTime, endTime);
            console.log(format(reservationDate, "HH:mm"))
            // Verifica la disponibilità del tavolo
            if (slots.includes(format(reservationDate, "HH:mm"))) {
                tavoloDisponibile = tavoliDisponibili[0]; // Scegli il primo tavolo disponibile
                break;
            }
            console.log('\n')
        }

        if (!tavoloDisponibile) {
            return NextResponse.json({ status: 404, message: "Nessun tavolo disponibile alla data e ora selezionata" });
        }

        // Crea la prenotazione con il tavolo disponibile
        const nuovaPrenotazione = await prisma.prenotazione.create({
            data: {
                copertiAdulti,
                copertiBambini,
                data: reservationDate,
                allergie,
                numeroPasseggini,
                numeroSeggiolini,
                occasioneVisita,
                clienteId,
                tavoloId: tavoloDisponibile.id, // Usa il tavolo disponibile trovato
            },
        });

        console.log(nuovaPrenotazione)

        return NextResponse.json({ status: 200, data: nuovaPrenotazione });
    } catch (error) {
        console.error("Errore durante la creazione della prenotazione:", error);
        return NextResponse.json({ status: 500, error: "Errore durante la creazione della prenotazione" });
    }
}