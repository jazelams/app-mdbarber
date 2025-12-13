import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const email = 'admin@barberia.com';
        const password = 'admin';
        const name = 'Barbero Principal';

        const hashedPassword = await bcrypt.hash(password, 10);

        const barber = await prisma.barbero.upsert({
            where: { email },
            update: { passwordHash: hashedPassword }, // Update password just in case
            create: {
                email,
                passwordHash: hashedPassword,
                nombre: name,
            },
        });

        return NextResponse.json({ success: true, barber: { email: barber.email, id: barber.id } });
    } catch (error) {
        console.error('Setup error details:', error);
        return NextResponse.json({ error: String(error), stack: (error as Error).stack }, { status: 500 });
    }
}
