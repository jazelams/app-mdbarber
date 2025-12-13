import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay, addMinutes, format, parse, isBefore, isAfter } from 'date-fns';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date'); // YYYY-MM-DD
    const serviceId = searchParams.get('serviceId');

    if (!dateStr || !serviceId) {
        return NextResponse.json({ error: 'Faltan parámetros date o serviceId' }, { status: 400 });
    }

    try {
        // Parsear la fecha consultada (asegurando que sea medianoche local o consistente)
        // Para simplificar, creamos un objeto Date basado en el string YYYY-MM-DDT00:00:00
        const queryDate = new Date(`${dateStr}T00:00:00`);
        const dayOfWeek = queryDate.getDay(); // 0 (Dom) - 6 (Sab)

        // 1. Obtener datos del servicio (duración)
        const service = await prisma.servicio.findUnique({ where: { id: serviceId } });
        if (!service) return NextResponse.json({ error: 'Servicio inválido' }, { status: 404 });
        const duration = service.duracion;

        // 2. Obtener horario del barbero para ese día
        // Asumimos un solo barbero o el primero que encontremos activo por ahora
        const schedule = await prisma.horario.findFirst({
            where: { diaSemana: dayOfWeek, activo: true }
        });

        if (!schedule) {
            return NextResponse.json([]); // Cerrado este día
        }

        // 3. Generar todos los slots posibles según horario de apertura/cierre
        const slots: string[] = [];

        // Usamos fecha base queryDate para construir los objetos Date comparables
        const openTime = parse(schedule.horaInicio, 'HH:mm', queryDate);
        const closeTime = parse(schedule.horaFin, 'HH:mm', queryDate);

        let currentTime = openTime;
        // Iterar cada 30 minutos
        while (isBefore(addMinutes(currentTime, duration), closeTime) || addMinutes(currentTime, duration).getTime() === closeTime.getTime()) {
            slots.push(format(currentTime, 'hh:mm a'));
            currentTime = addMinutes(currentTime, 60);
        }

        // 4. Obtener citas existentes para ese día (Conflictos)
        const appointments = await prisma.cita.findMany({
            where: {
                fechaInicio: {
                    gte: startOfDay(queryDate),
                    lte: endOfDay(queryDate)
                },
                estado: { not: 'CANCELADA' }
            }
        });

        // 5. Filtrar slots que colisionen
        const availableSlots = slots.filter(slotTime => {
            const slotStart = parse(slotTime, 'hh:mm a', queryDate);
            const slotEnd = addMinutes(slotStart, duration);

            // Verificar si este slot choca con ALGUNA cita existente
            return !appointments.some((apt: { fechaInicio: Date; fechaFin: Date }) => {
                // Lógica de solapamiento: (StartA < EndB) y (EndA > StartB)
                return isBefore(slotStart, apt.fechaFin) && isAfter(slotEnd, apt.fechaInicio);
            });
        });

        return NextResponse.json(availableSlots);

    } catch (error) {
        console.error('Availability Error:', error);
        return NextResponse.json({ error: 'Error calculando disponibilidad' }, { status: 500 });
    }
}
