import { NextRequest, NextResponse } from 'next/server';
import {prisma} from "@/auth";
import bcrypt from "bcryptjs";
import {Ruolo} from "@prisma/client";

// GET - Recupera la lista di utenti
export async function GET(request: NextRequest) {
    try {
        const users = await prisma.user.findMany({
            where: {ruolo: "RISTORATORE"}
        });
        return NextResponse.json({ status: 200, data: users });
    } catch (error) {
        console.error('GET /api/users error:', error);
        return NextResponse.json({ status: 500, message: "Error fetching users" });
    }
}

// POST - Crea un nuovo utente
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password, ruolo, statoAttivo, nome, cognome } = body;

        // Validazione dei dati
        if (!username || !password || !ruolo) {
            return NextResponse.json({ status: 400, message: "Missing required fields" });
        }

        const newUser = await prisma.user.create({
            data: {
                username,
                password: await bcrypt.hash(password, 10),
                ruolo: "RISTORATORE",
                statoAttivo: statoAttivo ?? true,
                nome,
                cognome,
            },
        });

        return NextResponse.json({ status: 201, data: newUser });
    } catch (error) {
        console.error('POST /api/users error:', error);
        return NextResponse.json({ status: 500, message: "Error creating user" });
    }
}
