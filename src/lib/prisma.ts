import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma_new_v2?: PrismaClient
}

export const prisma =
  globalForPrisma.prisma_new_v2 ??
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma_new_v2 = prisma
}