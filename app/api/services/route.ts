import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const services = await prisma.servicio.findMany({
            orderBy: {
                precio: 'asc'
            }
        });

        return NextResponse.json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        return NextResponse.json(
            { error: 'Error al obtener servicios' },
            { status: 500 }
        );
    }
}
