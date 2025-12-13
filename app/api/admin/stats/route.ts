import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';
import { startOfWeek, startOfMonth, startOfToday, endOfToday } from 'date-fns';

export async function GET(request: Request) {
    const session = await verifySession();
    if (!session) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const startParam = searchParams.get('startDate');
        const endParam = searchParams.get('endDate');

        const today = new Date();
        // Default to starts of periods if no params, BUT if params are meant for specific report, we use them.
        // However, the Dashboard cards currently show "Daily", "Weekly", "Monthly" side-by-side. 
        // If the user wants a report for a specific period, does he want to replace ALL cards with that period's stats?
        // Likely yes: "see his report of that period of time".

        // Logic:
        // If params provided, return stats SPECIFIC to that range.
        // If not, keep returning the default quick-view stats (Day, Week, Month).

        if (startParam && endParam) {
            const startDate = new Date(startParam);
            const endDate = new Date(endParam);

            // Adjust end date to cover the full day if it's just a date string
            if (endParam.length === 10) {
                endDate.setHours(23, 59, 59, 999);
            }

            const [periodIncome, periodAppointments, completedCount, cancelledCount] = await Promise.all([
                prisma.cita.aggregate({
                    _sum: { precio: true },
                    where: {
                        fechaInicio: { gte: startDate, lte: endDate },
                        estado: 'COMPLETADA'
                    }
                }),
                prisma.cita.count({
                    where: {
                        fechaInicio: { gte: startDate, lte: endDate },
                    }
                }),
                prisma.cita.count({
                    where: {
                        fechaInicio: { gte: startDate, lte: endDate },
                        estado: 'COMPLETADA'
                    }
                }),
                prisma.cita.count({
                    where: {
                        fechaInicio: { gte: startDate, lte: endDate },
                        estado: 'CANCELADA'
                    }
                })
            ]);

            return NextResponse.json({
                periodIncome: periodIncome._sum.precio || 0,
                totalAppointments: periodAppointments,
                completed: completedCount,
                cancelled: cancelledCount
            });
        }

        // Default Behavior (No params) - Dashboard Overview
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const monthStart = startOfMonth(today);
        const dayStart = startOfToday();

        const [weekIncome, monthIncome, dayIncome, totalAppointments] = await Promise.all([
            prisma.cita.aggregate({
                _sum: { precio: true },
                where: { fechaInicio: { gte: weekStart }, estado: 'COMPLETADA' }
            }),
            prisma.cita.aggregate({
                _sum: { precio: true },
                where: { fechaInicio: { gte: monthStart }, estado: 'COMPLETADA' }
            }),
            prisma.cita.aggregate({
                _sum: { precio: true },
                where: { fechaInicio: { gte: dayStart }, estado: 'COMPLETADA' }
            }),
            prisma.cita.count({
                where: {
                    fechaInicio: { gte: today },
                    estado: { in: ['PENDIENTE', 'CONFIRMADA'] }
                }
            })
        ]);

        return NextResponse.json({
            weekIncome: weekIncome._sum.precio || 0,
            monthIncome: monthIncome._sum.precio || 0,
            dayIncome: dayIncome._sum.precio || 0,
            activeAppointments: totalAppointments
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
