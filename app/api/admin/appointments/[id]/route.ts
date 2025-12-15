import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { status, newDate } = body;

        // Caso 1: Actualizar Estado
        if (status) {
            if (!['CONFIRMADA', 'COMPLETADA', 'CANCELADA'].includes(status)) {
                return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
            }
            const updated = await prisma.cita.update({
                where: { id },
                data: { estado: status },
                include: { servicio: true }
            });
            return NextResponse.json(updated);
        }

        // Caso 2: Re-agendar (Nueva Fecha)
        if (newDate) {
            // Obtener cita actual para saber duracion del servicio
            const currentCita = await prisma.cita.findUnique({
                where: { id },
                include: { servicio: true }
            });

            if (!currentCita) return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });

            const duracion = currentCita.servicio.duracion; // en minutos
            const fechaInicio = new Date(newDate);
            const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);

            const updated = await prisma.cita.update({
                where: { id },
                data: {
                    fechaInicio,
                    fechaFin,
                    estado: 'CONFIRMADA' // Al reagendar, confirmamos automáticamente
                },
                include: { servicio: true }
            });
            return NextResponse.json(updated);
        }

        return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });

    } catch (error) {
        console.error('Error updating appointment:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const { id } = await params;
        await prisma.cita.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
