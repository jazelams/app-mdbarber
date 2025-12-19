
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: [] }); // No logs

async function main() {
    const days = await prisma.horario.findMany({
        orderBy: { diaSemana: 'asc' }
    });
    console.log(JSON.stringify(days, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
