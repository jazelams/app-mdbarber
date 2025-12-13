import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

export async function GET(request: Request) {
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const startParam = searchParams.get('startDate');
        const endParam = searchParams.get('endDate');

        const where: any = {};

        if (startParam && endParam) {
            const startDate = new Date(startParam);
            const endDate = new Date(endParam);
            // Full day coverage
            if (endParam.length === 10) endDate.setHours(23, 59, 59, 999);

            where.fechaInicio = {
                gte: startDate,
                lte: endDate
            };
        }

        // Obtener todas las citas ordenadas por fecha reciente
        const appointments = await prisma.cita.findMany({
            where,
            orderBy: {
                fechaInicio: 'desc',
            },
            include: {
                servicio: true, // Incluir detalles del servicio
            }
        });

        return NextResponse.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
