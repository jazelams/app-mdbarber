// PrismaClient es auto-generado según nuestro schema.prisma
import { PrismaClient } from '@prisma/client';

// Evitar múltiples instancias de Prisma Client en desarrollo (debido a Hot Reload)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query'], // Loguear queries en consola para depuración
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
