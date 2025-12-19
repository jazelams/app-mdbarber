
import { prisma } from '../lib/prisma';

async function main() {
    const days = await prisma.horario.findMany({
        where: { diaSemana: { in: [0, 6, 7, 1] } }
    });
    console.log('--- DB REPORT ---');
    days.forEach(h => {
        console.log(`Day Index: ${h.diaSemana}, Active: ${h.activo}, Start: ${h.horaInicio}, End: ${h.horaFin}`);
    });
    console.log('--- END REPORT ---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
