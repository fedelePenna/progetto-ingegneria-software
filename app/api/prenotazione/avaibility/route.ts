import { NextRequest, NextResponse } from 'next/server'

import { addMinutes, addDays, isAfter, isBefore, format, startOfToday, nextDay, eachDayOfInterval } from 'date-fns'
import { prisma } from '@/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { adults, children } = body
    const totalPeople = adults + children

    // Otteniamo la data di oggi
    const today = startOfToday()

    // Intervallo di due settimane da oggi
    const twoWeeksFromNow = addDays(today, 14)

    // Recuperiamo gli orari di apertura del ristorante
    const orariApertura = await prisma.orarioDiApertura.findMany({
      where: {
        ristoranteId: 1, // Cambia l'ID del ristorante se necessario
      },
    })

    const tavoliDisponibili = await prisma.tavolo.findMany({
      where: {
        ristoranteId: 1, // Cambia l'ID del ristorante se necessario
        capienza: {
          gte: totalPeople, // Solo tavoli con capienza sufficiente
        },
      },
    })

    if (tavoliDisponibili.length === 0) {
      return NextResponse.json({ status: 404, message: "Nessun tavolo disponibile per il numero di persone richiesto" })
    }

    const availableDates = []

    // Funzione per generare gli slot di 15 minuti
    const getTimeSlots = (startTime: Date, endTime: Date) => {
      const slots = []
      let currentSlot = startTime
      while (isBefore(currentSlot, endTime)) {
        slots.push(format(currentSlot, 'HH:mm'))
        currentSlot = addMinutes(currentSlot, 15)
      }
      return slots
    }

    // Iteriamo sugli orari di apertura per generare le date e gli orari disponibili
    for (const orario of orariApertura) {
      const { giorno, orario: orari } = orario

      // Per ogni giorno della settimana, generiamo tutte le date effettive nelle prossime 2 settimane
      const giorniSettimana = {
        LUN: 1,
        MAR: 2,
        MER: 3,
        GIO: 4,
        VEN: 5,
        SAB: 6,
        DOM: 0,
      }

      // Troviamo tutte le date future per il giorno specifico
      const giorniDisponibili = eachDayOfInterval({
        start: today,
        end: twoWeeksFromNow,
      }).filter((day) => day.getDay() === giorniSettimana[giorno])

      for (const giornoDisponibile of giorniDisponibili) {
        // Estraiamo solo l'orario dai DateTime nel DB e applichiamo alle date disponibili
        const startHour = orari[0] // orario di apertura
        const endHour = orari[1] // orario di chiusura

        const startTime = new Date(
          giornoDisponibile.getFullYear(),
          giornoDisponibile.getMonth(),
          giornoDisponibile.getDate(),
          startHour.getHours(),
          startHour.getMinutes()
        )

        const endTime = new Date(
          giornoDisponibile.getFullYear(),
          giornoDisponibile.getMonth(),
          giornoDisponibile.getDate(),
          endHour.getHours(),
          endHour.getMinutes()
        )

        // Verifichiamo la disponibilità per ogni slot di 15 minuti
        const slots = getTimeSlots(startTime, endTime)

        availableDates.push({
          date: format(giornoDisponibile, 'yyyy-MM-dd'),
          times: slots,
        })
      }
    }

    return NextResponse.json({
      status: 200,
      availableDates,
    })
  } catch (error) {
    console.error('Errore nel recuperare la disponibilità:', error)
    return NextResponse.json({ status: 500, message: 'Errore interno del server' })
  }
}
