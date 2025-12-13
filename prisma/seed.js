const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
    const servicios = [
        {
            name: 'Corte Clásico',
            price: 15.00,
            duration: 30, // minutos
        },
        {
            name: 'Barba y Perfilado',
            price: 10.00,
            duration: 20,
        },
        {
            name: 'Servicio Completo',
            price: 25.00,
            duration: 50,
        },
        {
            name: 'Corte Infantil',
            price: 12.00,
            duration: 30,
        },
    ];

    for (const s of servicios) {
        // Upsert to avoid duplicates if run multiple times
        const existing = await prisma.service.findFirst({ where: { name: s.name } });
        if (!existing) {
            await prisma.service.create({ data: s });
            console.log(`Creado servicio: ${s.name}`);
        } else {
            console.log(`Servicio ya existe: ${s.name}`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
