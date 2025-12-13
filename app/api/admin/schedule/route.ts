import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

export async function GET() {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const schedules = await prisma.horario.findMany({
            where: { barberoId: session.id as string },
            orderBy: { diaSemana: 'asc' }
        });
        return NextResponse.json(schedules);
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { diaSemana, horaInicio, horaFin, activo } = body;

        const schedule = await prisma.horario.upsert({
            where: {
                barberoId_diaSemana: {
                    barberoId: session.id as string,
                    diaSemana: diaSemana
                }
            },
            update: { horaInicio, horaFin, activo },
            create: {
                barberoId: session.id as string,
                diaSemana,
                horaInicio,
                horaFin,
                activo
            }
        });

        return NextResponse.json(schedule);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
