import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

export async function GET() {
    try {
        const services = await prisma.servicio.findMany({
            orderBy: { nombre: 'asc' }
        });
        return NextResponse.json(services);
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { nombre, precio, duracion, imagenUrl } = body;

        if (!nombre || !precio || !duracion) {
            return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
        }

        const service = await prisma.servicio.create({
            data: {
                nombre,
                precio: parseFloat(precio),
                duracion: parseInt(duracion),
                imagenUrl
            }
        });

        return NextResponse.json(service, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
