import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parse } from 'date-fns';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nombreCliente, telefonoCliente, date, time, serviceId } = body;

        // Validación básica
        if (!nombreCliente || !telefonoCliente || !date || !time || !serviceId) {
            return NextResponse.json(
                { error: 'Faltan datos requeridos' },
                { status: 400 }
            );
        }

        // Combinar fecha y hora para crear DateTime objects
        // date: "YYYY-MM-DD", time: "HH:mm AA" (ej: 05:00 PM)
        const startDateTime = parse(`${date} ${time}`, 'yyyy-MM-dd hh:mm a', new Date());

        // Obtener duración del servicio para calcular hora fin
        const service = await prisma.servicio.findUnique({
            where: { id: serviceId }
        });

        if (!service) {
            return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 });
        }

        const endDateTime = new Date(startDateTime.getTime() + service.duracion * 60000);

        // Verificar si el horario está dentro de la jornada laboral
        const dayOfWeek = startDateTime.getDay();
        const schedule = await prisma.horario.findFirst({
            where: { diaSemana: dayOfWeek, activo: true }
        });

        if (!schedule) {
            return NextResponse.json({ error: 'La barbería está cerrada este día.' }, { status: 409 });
        }

        // Convertir strings de horario a Date para comparar
        // Usamos una fecha base arbitraria o la misma fecha de la cita para comparar horas
        const openTime = new Date(`${date}T${schedule.horaInicio}:00`);
        const closeTime = new Date(`${date}T${schedule.horaFin}:00`);

        if (startDateTime < openTime || endDateTime > closeTime) {
            return NextResponse.json({ error: 'La cita está fuera del horario laboral.' }, { status: 409 });
        }

        // Verificar disponibilidad (Lógica anti-duplicados)
        const conflict = await prisma.cita.findFirst({
            where: {
                fechaInicio: {
                    lt: endDateTime,
                },
                fechaFin: {
                    gt: startDateTime,
                },
                estado: {
                    not: 'CANCELADA'
                }
            }
        });

        if (conflict) {
            return NextResponse.json(
                { error: 'El horario seleccionado ya no está disponible.' },
                { status: 409 }
            );
        }

        // Crear la cita
        const appointment = await prisma.cita.create({
            data: {
                nombreCliente,
                telefonoCliente,
                fechaInicio: startDateTime,
                fechaFin: endDateTime,
                servicioId: serviceId,
                precio: service.precio,
                estado: 'PENDIENTE'
            }
        });

        return NextResponse.json(appointment, { status: 201 });

    } catch (error) {
        console.error('Error creating appointment:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
