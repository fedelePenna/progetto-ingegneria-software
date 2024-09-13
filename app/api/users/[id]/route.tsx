import { NextRequest, NextResponse } from 'next/server';

import bcrypt from "bcryptjs";
import {prisma} from "@/auth"; // Assicurati di aver configurato prisma

// PUT - Aggiorna un utente esistente
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = parseInt(params.id, 10);
        const body = await request.json();
        const { username, password, statoAttivo, nome, cognome } = body;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                username,
                password: await bcrypt.hash(password, 10),
                statoAttivo,
                nome,
                cognome,
            },
        });

        return NextResponse.json({ status: 200, data: updatedUser });
    } catch (error) {
        console.error('PUT /api/users/:id error:', error);
        return NextResponse.json({ status: 500, message: "Error updating user" });
    }
}

// DELETE - Elimina un utente esistente
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = parseInt(params.id, 10);

        await prisma.user.delete({
            where: { id: userId },
        });

        return NextResponse.json({ status: 200, message: "User deleted successfully" });
    } catch (error) {
        console.error('DELETE /api/users/:id error:', error);
        return NextResponse.json({ status: 500, message: "Error deleting user" });
    }
}
