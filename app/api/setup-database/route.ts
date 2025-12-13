import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: Request) {
    try {
        // Verificar que solo se ejecute en producción y con una clave secreta
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (secret !== 'setup-database-2024') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const results = [];

        // Ejecutar migraciones
        results.push('Ejecutando migraciones...');
        const { stdout: migrateOutput, stderr: migrateError } = await execAsync('npx prisma migrate deploy');
        results.push('Migraciones:', migrateOutput || migrateError);

        // Crear barbero
        results.push('\nCreando barbero...');
        const { stdout: barberOutput, stderr: barberError } = await execAsync('node scripts/create-barber.js');
        results.push('Barbero:', barberOutput || barberError);

        return NextResponse.json({
            success: true,
            message: 'Database setup completed',
            details: results
        });

    } catch (error: any) {
        console.error('Setup error:', error);
        return NextResponse.json({
            error: 'Setup failed',
            details: error.message
        }, { status: 500 });
    }
}
