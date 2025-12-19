
import { prisma } from '../lib/prisma';

async function main() {
    const horarios = await prisma.horario.findMany();
    console.log('Horarios found:', horarios.length);
    horarios.forEach(h => {
        console.log(`Day: ${h.diaSemana}, Active: ${h.activo}, Start: ${h.horaInicio}, End: ${h.horaFin}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
