const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Hardcode connection string for this script to avoid .env loading issues in simple node script
// if dotenv fails. But we will try dotenv first.
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@barberia.com';
    const password = 'admin'; // Cambiar en producción
    const name = 'Barbero Principal';

    const hashedPassword = await bcrypt.hash(password, 10);

    const barber = await prisma.barbero.upsert({
        where: { email },
        update: {},
        create: {
            email,
            passwordHash: hashedPassword,
            nombre: name,
        },
    });

    console.log('Barbero creado/encontrado:', barber);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
