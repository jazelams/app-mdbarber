import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Obtener todas las configuraciones de horarios
        // Nota: En un sistema multi-barbero, aquí filtraríamos por barbero.
        // Lógica actual: Si *algún* horario para un día está activo, el día está ABIERTO.
        // Si todos los horarios para un día están inactivos (o no existen), el día está CERRADO.

        const schedules = await prisma.horario.findMany();

        // Días 0-6 (Domingo-Sábado)
        const closedDays: number[] = [];

        for (let i = 0; i < 7; i++) {
            // Filtrar horarios para el día 'i'
            const dailySchedules = schedules.filter(s => s.diaSemana === i);

            // Si existen horarios configurados para este día...
            if (dailySchedules.length > 0) {
                // Verificar si al menos uno está "activo"
                const isOpen = dailySchedules.some(s => s.activo);
                // Si ninguno está activo, añadimos el día a la lista de cerrados
                if (!isOpen) {
                    closedDays.push(i);
                }
            } else {
                // Si no hay configuración para este día, asumimos CERRADO por seguridad
                closedDays.push(i);
            }
        }

        // También obtenemos bloqueos específicos (Vacaciones, días festivos, etc.)
        const bloqueos = await prisma.bloqueo.findMany({
            where: {
                fechaFin: { gte: new Date() } // Solo futuros
            }
        });

        // Formatear bloqueos para el frontend
        const formattedBloqueos = bloqueos.map(b => ({
            start: b.fechaInicio,
            end: b.fechaFin,
            motivo: b.motivo
        }));

        return NextResponse.json({
            closedDays, // Array of day indices [0, 6] etc.
            bloqueos: formattedBloqueos
        });

    } catch (error) {
        console.error('Error fetching schedule rules:', error);
        return NextResponse.json({ error: 'Error fetching rules' }, { status: 500 });
    }
}
