import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    const session = await verifySession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
        }

        // Obtener barbero actual
        const barber = await prisma.barbero.findUnique({
            where: { id: session.id as string }
        });

        if (!barber) {
            return NextResponse.json({ error: 'Barbero no encontrado' }, { status: 404 });
        }

        // Verificar contraseña actual
        const isValid = await bcrypt.compare(currentPassword, barber.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 401 });
        }

        // Hashear nueva contraseña
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña
        await prisma.barbero.update({
            where: { id: session.id as string },
            data: { passwordHash: newPasswordHash }
        });

        return NextResponse.json({ success: true, message: 'Contraseña actualizada correctamente' });

    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
