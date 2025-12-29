import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key-change-me');

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('client_session');

    if (!token) {
        return NextResponse.json({ user: null });
    }

    try {
        const { payload } = await jwtVerify(token.value, SECRET_KEY);

        // Opcional: Buscar datos frescos en DB
        const user = await prisma.cliente.findUnique({
            where: { id: payload.id as string },
            select: { id: true, nombre: true, email: true, telefono: true }
        });

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ user: null });
    }
}
