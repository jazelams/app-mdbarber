import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await params;
        const body = await request.json();
        const { nombre, precio, duracion, imagenUrl } = body;

        const service = await prisma.servicio.update({
            where: { id },
            data: {
                nombre,
                precio: parseFloat(precio),
                duracion: parseInt(duracion),
                imagenUrl
            }
        });

        return NextResponse.json(service);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating service' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { id } = await params;
        // Check for existing appointments first? Or cascade?
        // For safety, let's warn or fail if appointments exist, mostly for production.
        // For now, simple delete.
        await prisma.servicio.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting service' }, { status: 500 });
    }
}
