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

        const client = await prisma.cliente.findUnique({
            where: { email }
        });

        if (!client || !await bcrypt.compare(password, client.password)) {
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        // Crear Token JWT para CLIENTE
        const token = await new SignJWT({
            id: client.id,
            email: client.email,
            name: client.nombre,
            role: 'client' // Diferenciar del barbero
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d') // Sesión más larga para clientes (mes)
            .sign(SECRET_KEY);

        // Crear respuesta con Cookie
        const response = NextResponse.json({ success: true, user: { name: client.nombre } }, { status: 200 });

        response.cookies.set({
            name: 'client_session', // Cookie DIFERENTE a la del barbero
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 días
        });

        return response;

    } catch (error) {
        console.error('Client Login error:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
