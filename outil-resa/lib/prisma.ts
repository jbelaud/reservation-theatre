import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configuration optimisée du client Prisma
const prismaClientSingleton = () => {
  return new PrismaClient({
    // En dev, on peut activer les logs pour diagnostiquer (décommenter si besoin)
    // log: ['query', 'info', 'warn', 'error'],
  })
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

