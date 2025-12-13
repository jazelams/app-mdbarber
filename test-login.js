const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function testLogin() {
    try {
        console.log('🔍 Buscando barbero con email: admin@barberia.com');

        const barber = await prisma.barbero.findUnique({
            where: { email: 'admin@barberia.com' }
        });

        if (!barber) {
            console.log('❌ No se encontró el barbero');
            return;
        }

        console.log('✅ Barbero encontrado:', {
            id: barber.id,
            email: barber.email,
            nombre: barber.nombre
        });

        console.log('\n🔐 Probando contraseña...');
        const password = 'admin';
        const isValid = await bcrypt.compare(password, barber.passwordHash);

        if (isValid) {
            console.log('✅ Contraseña correcta!');
        } else {
            console.log('❌ Contraseña incorrecta');
        }

        console.log('\n🔑 JWT_SECRET configurado:', process.env.JWT_SECRET ? 'SÍ' : 'NO');
        console.log('🗄️  DATABASE_URL configurado:', process.env.DATABASE_URL ? 'SÍ' : 'NO');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

testLogin();
