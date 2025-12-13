import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Crear o Actualizar usuario Admin (Barbero)
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin', 10);

    // Usamos upsert para garantizar que la contraseña sea la correcta
    const barbero = await prisma.barbero.upsert({
        where: { email: 'admin@barberia.com' },
        update: { passwordHash: hashedPassword },
        create: {
            nombre: 'Barbero Principal',
            email: 'admin@barberia.com',
            passwordHash: hashedPassword
        }
    });
    console.log('Usuario Admin actualizado/creado con clave "admin".');

    // 2. Crear Servicios
    const serviciosData = [
        { nombre: 'Corte Clásico', precio: 150.00, duracion: 30, imagenUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800' },
        { nombre: 'Barba y Perfilado', precio: 100.00, duracion: 20, imagenUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800' },
        { nombre: 'Servicio Completo', precio: 250.00, duracion: 50, imagenUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800' },
        { nombre: 'Corte Infantil', precio: 120.00, duracion: 30, imagenUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800' },
    ];

    const createdServices = [];
    for (const s of serviciosData) {
        // Upsert para no duplicar si se corre varias veces
        const servicio = await prisma.servicio.create({
            data: s
        });
        createdServices.push(servicio);
    }
    console.log('Servicios creados.');

    // 3. Crear Citas de Prueba
    const today = new Date();
    const citasData = [
        {
            nombreCliente: 'Carlos Cliente',
            telefonoCliente: '9991234567',
            servicioId: createdServices[0].id,
            barberoId: barbero.id,
            fechaInicio: new Date(today.setHours(10, 0, 0, 0)),
            fechaFin: new Date(today.setHours(10, 30, 0, 0)),
            precio: createdServices[0].precio,
            estado: 'COMPLETADA'
        },
        {
            nombreCliente: 'Ana Test',
            telefonoCliente: '9999876543',
            servicioId: createdServices[2].id,
            barberoId: barbero.id,
            fechaInicio: new Date(today.setHours(12, 0, 0, 0)),
            fechaFin: new Date(today.setHours(12, 50, 0, 0)),
            precio: createdServices[2].precio,
            estado: 'CONFIRMADA'
        }
    ];

    for (const c of citasData) {
        // @ts-ignore
        await prisma.cita.create({ data: c });
    }

    console.log('Citas de prueba creadas.');
    console.log('Servicios iniciales creados correctamente.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
