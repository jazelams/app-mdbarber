import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key-change-me');

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 });
        }

        const barber = await prisma.barbero.findUnique({
            where: { email }
        });

        if (!barber || !await bcrypt.compare(password, barber.passwordHash)) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        // Crear Token JWT
        const token = await new SignJWT({
            id: barber.id,
            email: barber.email,
            name: barber.nombre
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(SECRET_KEY);

        // Crear respuesta con Cookie
        const response = NextResponse.json({ success: true }, { status: 200 });

        response.cookies.set({
            name: 'barber_session',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24, // 1 día
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
