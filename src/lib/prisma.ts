import { PrismaClient } from '@prisma/client'
import path from 'path'

// In Next.js, use an absolute path for SQLite to avoid "unable to open database file" errors during build
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbPath}`
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
