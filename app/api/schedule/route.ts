import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Fetch valid schedules
        // Since we might have multiple barbers in future, currently we just fetch all ACTIVE rules
        // For simplicity now, we grab the first barber's schedule or all schedules.
        // Assuming single shop model for now based on current app structure.

        const schedules = await prisma.horario.findMany({
            select: {
                diaSemana: true,
                activo: true,
                horaInicio: true,
                horaFin: true
            }
        });

        // We need to merge this into a simple 0-6 map.
        // If there are duplicates (multiple barbers), logic might need adjustment,
        // but for now we assume the system sets schedule globally or per main barber.
        // The admin page sets a specific session barber's schedule. 
        // Let's assume we want to know if *any* barber is working, or just the main logic.
        // Given the requirement "cerrar un dia", it implies the shop is closed.

        return NextResponse.json(schedules);
    } catch (error) {
        console.error('Schedule Public API Error:', error);
        return NextResponse.json({ error: 'Error fetching schedule' }, { status: 500 });
    }
}
